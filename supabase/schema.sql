-- Run once in Supabase SQL Editor. The browser uses only the publishable/anon key.
create table public.campaign_sessions (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade unique,
 name text not null,
 invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
 state jsonb not null,
 revision integer not null default 1,
 created_at timestamptz not null default now()
);
create table public.session_members (
 session_id uuid references public.campaign_sessions(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 seen_at timestamptz not null default now(),
 primary key(session_id,user_id)
);
create table public.session_signals (
 id uuid primary key references public.campaign_sessions(id) on delete cascade,
 revision integer not null default 1
);
alter table public.campaign_sessions enable row level security;
alter table public.session_members enable row level security;
alter table public.session_signals enable row level security;
-- No direct access to campaign state or membership: all access through checked RPCs.
revoke all on public.campaign_sessions,public.session_members from anon,authenticated;
revoke all on public.session_signals from anon,authenticated;
grant select on public.session_signals to authenticated;
create function public.can_read_session(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
 exists(select 1 from public.campaign_sessions where id=p_id and owner_id=auth.uid()) or
 exists(select 1 from public.session_members where session_id=p_id and user_id=auth.uid()));
$$;
create policy signal_read on public.session_signals for select to authenticated using(public.can_read_session(id));
create function public.create_session(p_name text,p_state jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then raise exception 'Compte MJ requis'; end if;
 if length(trim(p_name)) not between 1 and 100 or jsonb_typeof(p_state->'entries') <> 'array' then raise exception 'Campagne invalide'; end if;
 select id into result from public.campaign_sessions where owner_id=auth.uid();
 if result is not null then return result; end if;
 insert into public.campaign_sessions(owner_id,name,state) values(auth.uid(),p_name,p_state) returning id into result;
 insert into public.session_signals(id) values(result);
 return result;
end $$;
create function public.join_session(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
 if auth.uid() is null then raise exception 'Connexion requise'; end if;
 select id into result from public.campaign_sessions where invite_code=upper(trim(p_code));
 if result is null then raise exception 'Code inconnu'; end if;
 insert into public.session_members(session_id,user_id) values(result,auth.uid()) on conflict(session_id,user_id) do update set seen_at=now();
 return result;
end $$;
create function public.get_session(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.campaign_sessions; filtered jsonb; players integer;
begin
 if not public.can_read_session(p_id) then raise exception 'Accès refusé'; end if;
 select * into s from public.campaign_sessions where id=p_id;
 update public.session_members set seen_at=now() where session_id=p_id and user_id=auth.uid();
 select count(*) into players from public.session_members where session_id=p_id and seen_at>now()-interval '35 seconds' and user_id<>s.owner_id;
 if s.owner_id=auth.uid() then
 return jsonb_build_object('state',s.state,'role','gm','revision',s.revision,'name',s.name,'invite_code',s.invite_code,'members',players);
 end if;
 -- Never send secret entries, private logs or invitation code to players.
 select coalesce(jsonb_agg(e),'[]'::jsonb) into filtered from jsonb_array_elements(s.state->'entries') e where e->>'visible'='true';
 return jsonb_build_object('state',jsonb_build_object('name',s.name,'position',s.state->'position','mapImage',s.state->'mapImage','entries',filtered,'log','[]'::jsonb),'role','player','revision',s.revision,'name',s.name,'members',players);
end $$;
create function public.save_session(p_id uuid,p_state jsonb,p_revision integer) returns integer
language plpgsql security definer set search_path = '' as $$
declare result integer;
begin
 if auth.uid() is null or not exists(select 1 from public.campaign_sessions where id=p_id and owner_id=auth.uid()) then raise exception 'Action réservée au MJ'; end if;
 if jsonb_typeof(p_state->'entries') is distinct from 'array' or length(p_state::text)>2000000 then raise exception 'Données invalides ou trop volumineuses'; end if;
 if jsonb_typeof(p_state->'position') is distinct from 'object' or (p_state->'position'->>'x')::numeric not between 0 and 1 or (p_state->'position'->>'y')::numeric not between 0 and 1 then raise exception 'Position invalide'; end if;
 update public.campaign_sessions set state=p_state,name=left(p_state->>'name',100),revision=revision+1 where id=p_id and owner_id=auth.uid() and revision=p_revision returning revision into result;
 if result is null then raise exception 'La session a changé. Attendez sa synchronisation et recommencez.'; end if;
 update public.session_signals set revision=result where id=p_id;
 return result;
end $$;
revoke execute on function public.can_read_session(uuid), public.create_session(text,jsonb), public.join_session(text), public.get_session(uuid), public.save_session(uuid,jsonb,integer) from public,anon;
grant execute on function public.can_read_session(uuid), public.create_session(text,jsonb), public.join_session(text), public.get_session(uuid), public.save_session(uuid,jsonb,integer) to authenticated;
alter publication supabase_realtime add table public.session_signals;
