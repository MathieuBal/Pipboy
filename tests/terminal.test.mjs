import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import ts from 'typescript';
async function load(file){const s=await readFile(new URL('../src/'+file,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))}
const {unlockLocal}=await load('terminal.ts');const {makeBackup,parseBackup}=await load('campaignBackup.ts');
const state={cleanupVersion:1,name:'Test',position:{x:.5,y:.5},mapImage:'',entries:[],tokens:[],log:[],terminals:[{id:'one',title:'Journal préparé',body:'SECRET CONTENT',code:'ABRI-50',enabled:true},{id:'two',title:'Autre',body:'OTHER SECRET',code:'AUTRE',enabled:false}]};
test('local unlock persists one archive, normalization, backup preservation and invalid duplicate codes',()=>{assert.throws(()=>unlockLocal(state,'WRONG'));const a=unlockLocal(state,' abri-50 ');assert.equal(a.entry.body,'SECRET CONTENT');assert.equal(unlockLocal(a.state,'ABRI-50').state.entries.length,1);assert.equal(state.entries.length,0);assert.deepEqual(parseBackup(JSON.stringify(makeBackup(state))).state.terminals,state.terminals);assert.throws(()=>makeBackup({...state,terminals:[state.terminals[0],{...state.terminals[1],code:'ABRI-50'}]}));});
test('server validates membership/code, never projects prepared secrets, rate limits, serializes unlocks, persists and revokes',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql as $$select '{"is_anonymous":false}'::jsonb$$;grant usage on schema auth to authenticated;grant execute on all functions in schema auth to authenticated;`);
 await db.exec((await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8')).replace('alter publication supabase_realtime add table public.session_signals;',''));
 const migration=await readFile(new URL('../supabase/migrations/20260928_terminals.sql',import.meta.url),'utf8');await db.exec(migration);await db.exec(migration);
 const owner='00000000-0000-0000-0000-000000000001',player='00000000-0000-0000-0000-000000000002',stranger='00000000-0000-0000-0000-000000000003';await db.query('insert into auth.users values ($1),($2),($3)',[owner,player,stranger]);
 const as=async id=>{await db.exec('reset role');await db.query("select set_config('test.uid',$1,false)",[id]);await db.exec('set role authenticated')};await as(owner);
 const id=(await db.query('select public.create_session($1,$2) as id',['Test',state])).rows[0].id;
 const get=async()=> (await db.query('select public.get_session($1) as data',[id])).rows[0].data;
 const unlock=async code=>(await db.query('select public.unlock_terminal($1,$2) as data',[id,code])).rows[0].data;
 const gm=await get();await as(stranger);await assert.rejects(unlock('ABRI-50'),/Accès refusé/);await as(player);await db.query('select public.join_session($1)',[gm.invite_code]);
 const before=await get();assert.equal(before.state.terminals,undefined);assert.ok(!JSON.stringify(before).includes('SECRET'));assert.ok(!JSON.stringify(before).includes('ABRI-50'));await assert.rejects(db.query('select * from public.terminal_attempts'),/permission denied/);
 assert.match((await unlock('NOPE')).error,/incorrect/);assert.equal((await get()).state.entries.length,0);
 const result=await unlock(' abri-50 ');assert.equal(result.entry.body,'SECRET CONTENT');assert.equal(result.entry.code,undefined);assert.equal((await get()).state.entries.length,1);assert.ok(!JSON.stringify(await get()).includes('OTHER SECRET'));
 await unlock('ABRI-50');assert.equal((await get()).state.entries.length,1);
 await unlock('NOPE');await unlock('NOPE');assert.match((await unlock('ABRI-50')).error,/30 secondes/);
 await as(owner);await assert.rejects(db.query('select public.save_session($1,$2,$3)',[id,state,1]),/changé/);
 const current=await get();current.state.terminals[0].enabled=false;current.state.entries[0].visible=false;await db.query('select public.save_session($1,$2,$3)',[id,current.state,current.revision]);
 await db.exec('reset role');await db.query("update public.terminal_attempts set window_at=now()-interval '31 seconds'");await as(player);assert.match((await unlock('ABRI-50')).error,/incorrect/);assert.equal((await get()).state.entries.length,0);
 }finally{await db.close()}
});
