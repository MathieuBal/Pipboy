import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const pack=JSON.parse(await readFile(new URL('../src/smoky-pack.json',import.meta.url),'utf8'));
const source=await readFile(new URL('../src/scenario.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {mergeScenario}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('scenario has complete references, distinct clues, private setup, and valid positions',()=>{
 assert.equal(pack.entries.length,59);assert.equal(pack.notes.length,12);assert.equal(pack.tokens.length,30);
 const ids=new Set(pack.entries.map(e=>e.id));assert.equal(ids.size,pack.entries.length);
 assert.equal(new Set(pack.tokens.map(t=>t.id)).size,pack.tokens.length);
 for(const e of pack.entries){assert.equal(e.visible,false);for(const link of e.links||[])assert.ok(ids.has(link));}
 for(const n of pack.notes){assert.ok(n.readAloud&&n.gm&&n.tests);for(const id of n.reveals)assert.ok(ids.has(id),id);}
 for(const t of pack.tokens){assert.equal(t.visible,false);assert.ok(t.x>0&&t.x<1&&t.y>0&&t.y<1);}
 assert.equal(pack.tokens.filter(t=>t.id.includes('emergence')).length,6);
 assert.equal(pack.tokens.filter(t=>t.id.includes('mouche')).length,3);
 assert.match(pack.notes.find(n=>n.id==='balise').gm,/Progrès.*vide/);
 assert.doesNotMatch(pack.entries.find(e=>e.id==='smoky-doc-lumieres').body,/fausse piste/);
});
test('repeated preparation preserves custom content, revealed state, active map, progress and tokens',()=>{
 const existing={...pack.entries[0],body:'Mes notes conservées',visible:true};
 const token={...pack.tokens[0],x:.81,visible:true};
 const state={name:'Ma campagne',mapImage:'active',position:{x:.2,y:.3},entries:[existing,{id:'custom',body:'perso'}],tokens:[token],log:[],scenario:{installed:true,completed:['briefing'],round:3,effort:12,notes:'Privé'}};
 const once=mergeScenario(state,pack.entries,pack.tokens),twice=mergeScenario(once,pack.entries,pack.tokens);
 assert.deepEqual(twice,once);assert.deepEqual(once.entries[0],existing);assert.deepEqual(once.tokens[0],token);assert.equal(once.entries.length,60);assert.equal(once.tokens.length,30);assert.equal(once.mapImage,'active');assert.equal(once.name,'Ma campagne');assert.deepEqual(once.scenario,state.scenario);
 assert.ok(once.entries.filter(e=>e.id!=='custom'&&e.id!==existing.id).every(e=>!e.visible));
});
