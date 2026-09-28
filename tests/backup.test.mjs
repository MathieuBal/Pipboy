import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
async function load(file){const text=await readFile(new URL('../src/'+file,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))}
const {parseBackup,makeBackup,saveRollback,rollbackKey}=await load('campaignBackup.ts');
const {initial}=await load('data.ts');
test('backup round-trip preserves campaign and secrets but not credentials or transient pointers',()=>{
 const s={...initial,tokens:[{id:'real',name:'PNJ secret',mapImage:'',image:'',x:.2,y:.8,size:.06,color:'#ffffff',visible:false},{id:'pipboy-pointer-123-test',name:'Ping',mapImage:'',image:'',x:.3,y:.4,size:.04,color:'#ffffff',visible:true}],scenario:{installed:true,completed:['briefing'],round:3,effort:12,notes:'Notes privées'},access_token:'NEVER',session:'NEVER',mapPositions:{abri:{x:.1,y:.2}}};
 const backup=makeBackup(s),roundtrip=parseBackup(JSON.stringify(backup));assert.equal(roundtrip.legacy,false);assert.equal(roundtrip.state.scenario.notes,'Notes privées');assert.equal(roundtrip.state.entries.length,s.entries.length);assert.equal(roundtrip.state.entries.find(e=>e.id==='station').visible,false);assert.equal(roundtrip.state.tokens.length,1);assert.equal(roundtrip.state.tokens[0].visible,false);assert.equal(roundtrip.state.access_token,undefined);assert.equal(roundtrip.state.session,undefined);assert.ok(!JSON.stringify(backup).includes('NEVER'));assert.equal(parseBackup(JSON.stringify(initial)).legacy,true);
});
test('invalid and oversized backups are rejected before any state replacement',()=>{
 for(const text of ['{broken','[]',JSON.stringify({...makeBackup(initial),version:2}),JSON.stringify({...makeBackup(initial),scope:'player'}),JSON.stringify({...initial,position:{x:2,y:0}}),JSON.stringify({...initial,entries:[initial.entries[0],initial.entries[0]]}),JSON.stringify({...initial,entries:[{...initial.entries[0],image:'javascript:alert(1)'}]}),JSON.stringify({...initial,entries:[{...initial.entries[0],type:'unknown'}]}),' '.repeat(1800001)])assert.throws(()=>parseBackup(text));
});
test('rollback is scoped and must be written successfully before restore can proceed',()=>{
 const values=new Map();globalThis.localStorage={setItem:(k,v)=>values.set(k,v)};saveRollback(initial,'session-one');assert.equal(parseBackup(values.get(rollbackKey('session-one'))).state.name,initial.name);assert.equal(values.has(rollbackKey('session-two')),false);globalThis.localStorage={setItem:()=>{throw Error('Quota exceeded')}};assert.throws(()=>saveRollback(initial,'session-one'),/Quota/);delete globalThis.localStorage;
});
