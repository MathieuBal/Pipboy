-- Run once in the SQL Editor of your existing Supabase project. Safe to run again.
-- Prepared texts/codes stay in private state.terminals, omitted by get_session for players.
create table if not exists public.terminal_attempts (
 session_id uuid references public.campaign_sessions(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 window_at timestamptz not null default now(),
 attempts integer not null default 0,
 primary key(session_id,user_id)
);
alter table public.terminal_attempts enable row level security;
revoke all on public.terminal_attempts from public,anon,authenticated;
create or replace function public.terminal_status(p_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not public.can_read_session(p_id) then raise exception 'Accès refusé'; end if;
 return true;
end $$;
create or replace function public.unlock_terminal(p_id uuid,p_code text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.campaign_sessions; t jsonb; matches integer; note jsonb; updated_entries jsonb; throttle public.terminal_attempts; normalized text;
begin
 if not public.can_read_session(p_id) then raise exception 'Accès refusé'; end if;
 -- Serialize against other unlocks and GM saves, which use the same campaign row.
 select * into s from public.campaign_sessions where id=p_id for update;
 insert into public.terminal_attempts(session_id,user_id) values(p_id,auth.uid()) on conflict do nothing;
 select * into throttle from public.terminal_attempts where session_id=p_id and user_id=auth.uid() for update;
 if throttle.window_at<=now()-interval '30 seconds' then
  update public.terminal_attempts set attempts=0,window_at=now() where session_id=p_id and user_id=auth.uid();
  throttle.attempts=0;
 end if;
 if throttle.attempts>=5 then return jsonb_build_object('error','Trop de tentatives. Réessayez dans 30 secondes.'); end if;
 update public.terminal_attempts set attempts=attempts+1 where session_id=p_id and user_id=auth.uid();
 normalized=upper(trim(p_code));
 if normalized is null or normalized !~ '^[A-Z0-9-]{4,32}$' then return jsonb_build_object('error','Code incorrect ou désactivé.'); end if;
 select count(*) into matches from jsonb_array_elements(case when jsonb_typeof(s.state->'terminals')='array' then s.state->'terminals' else '[]'::jsonb end) e where e->>'code'=normalized and e->>'enabled'='true';
 if matches<>1 then return jsonb_build_object('error','Code incorrect ou désactivé.'); end if;
 select e into t from jsonb_array_elements(s.state->'terminals') e where e->>'code'=normalized and e->>'enabled'='true';
 note=jsonb_build_object('id','terminal-note-'||(t->>'id'),'type','terminal','title',t->>'title','summary','Document déverrouillé au terminal','body',t->>'body','tags',jsonb_build_array('Terminal'),'visible',true,'status','Déverrouillé');
 select coalesce(jsonb_agg(e),'[]'::jsonb) into updated_entries from jsonb_array_elements(s.state->'entries') e where e->>'id'<>note->>'id';
 update public.campaign_sessions set state=jsonb_set(s.state,'{entries}',updated_entries||jsonb_build_array(note)),revision=revision+1 where id=p_id;
 update public.session_signals set revision=s.revision+1 where id=p_id;
 return jsonb_build_object('entry',note,'revision',s.revision+1);
end $$;
revoke execute on function public.terminal_status(uuid),public.unlock_terminal(uuid,text) from public,anon;
grant execute on function public.terminal_status(uuid),public.unlock_terminal(uuid,text) to authenticated;
