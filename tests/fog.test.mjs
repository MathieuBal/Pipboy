import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
async function load(file){const s=await readFile(new URL('../src/'+file,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))}
const {paintFog,coveredCells,obscured,brushCells,isFog}=await load('fog.ts');
const {makeBackup,parseBackup}=await load('campaignBackup.ts');
const {initial}=await load('data.ts');
test('fog is scene scoped, idempotent, and preserves normal tokens',()=>{
 const normal={id:'real',name:'Pion',image:'',mapImage:'',x:.5,y:.5,size:.06,color:'#ffffff',visible:true};
 const all=paintFog([normal],'',Array.from({length:64},(_,i)=>i),true);
 assert.equal(coveredCells(all,'').size,64);assert.equal(coveredCells(all,'other').size,0);assert.equal(all[0],normal);
 assert.equal(paintFog(all,'',[0,1,1,-1,64,1.5],true).length,65);
 const revealed=paintFog(all,'',[36],false);assert.equal(obscured(revealed,'',.5,.5),false);assert.equal(obscured(revealed,'',0,0),true);
 assert.equal(paintFog([],'',[36],false).length,0);assert.equal(isFog(normal),false);
 assert.equal(parseBackup(JSON.stringify(makeBackup({...initial,tokens:revealed}))).state.tokens.length,65);
});
test('large brush clips corners without wrapping rows',()=>{assert.deepEqual(brushCells(0,true),[0,1,8,9]);assert.deepEqual(brushCells(63,true),[54,55,62,63]);assert.equal(brushCells(27,true).length,9);assert.deepEqual(brushCells(27,false),[27])});
