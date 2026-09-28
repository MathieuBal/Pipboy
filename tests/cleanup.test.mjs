import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
async function load(path){const s=await readFile(new URL(path,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))}
const {initial:old}=await load('./legacy-demo.ts'),{initial}=await load('../src/data.ts'),{cleanCampaign}=await load('../src/campaignCleanup.ts');
test('new campaigns are empty; cleanup preserves preparation, hides it once and removes only demo identities',()=>{
 assert.deepEqual(initial.entries,[]);assert.equal(initial.mapImage,'');
 const custom={...old.entries[0],id:'my-note',title:'Mon contenu',links:['note'],visible:true};
 const source={...old,entries:[...old.entries,custom],scenario:{installed:true,notes:'Secret MJ'},tokens:[{id:'real',visible:true,x:.4},{id:'pipboy-pointer-123-test',visible:true}],mapImage:'https://example.com/map.png'};
 const cleaned=cleanCampaign(source);assert.deepEqual(cleaned.entries.map(e=>e.id),['my-note']);assert.equal(cleaned.entries[0].visible,false);assert.deepEqual(cleaned.entries[0].links,[]);assert.equal(cleaned.tokens[0].visible,false);assert.equal(cleaned.tokens.length,1);assert.equal(cleaned.scenario.notes,'Secret MJ');assert.equal(cleaned.mapImage,'');assert.equal(source.entries.length,14);
 cleaned.entries[0].visible=true;assert.equal(cleanCampaign(cleaned),cleaned);assert.equal(cleanCampaign(cleaned).entries[0].visible,true);
 const reused=cleanCampaign({...old,entries:[{...custom,id:'abri'}]});assert.equal(reused.entries.length,1);
});
