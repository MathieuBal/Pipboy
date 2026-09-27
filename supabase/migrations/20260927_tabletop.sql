-- Existing installations: run this once in SQL Editor. Safe to repeat.
create or replace function public.get_session(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.campaign_sessions; filtered jsonb; player_tokens jsonb; players integer;
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
 select coalesce(jsonb_agg(jsonb_build_object('id',t->'id','name',t->'name','image',t->'image','mapImage',t->'mapImage','x',t->'x','y',t->'y','size',t->'size','color',t->'color','visible',true)),'[]'::jsonb) into player_tokens from jsonb_array_elements(case when jsonb_typeof(s.state->'tokens')='array' then s.state->'tokens' else '[]'::jsonb end) t where t->'visible'='true'::jsonb and coalesce(t->>'mapImage','')=coalesce(s.state->>'mapImage','');
 return jsonb_build_object('state',jsonb_build_object('name',s.name,'position',s.state->'position','mapImage',s.state->'mapImage','entries',filtered,'tokens',player_tokens,'log','[]'::jsonb),'role','player','revision',s.revision,'name',s.name,'members',players);
end $$;
