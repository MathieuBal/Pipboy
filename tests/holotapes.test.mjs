import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tapesFromHtml} from '../scripts/holotape-metadata.mjs';
test('category fallback extracts only wiki audio and deduplicates tracks',()=>{
 const html=`<audio controls src="https://fallout-wiki.com/images/b/b8/Holobande_d%27Eddie_Winter_00.ogg"></audio><audio src="https://fallout-wiki.com/images/b/b8/Holobande_d%27Eddie_Winter_00.ogg"></audio><audio src="https://other.example/test.ogg"></audio>`;
 const items=tapesFromHtml(html,'Fallout 4');
 assert.equal(items.length,1);assert.equal(items[0].series,'Eddie Winter');assert.equal(items[0].title,"Holobande d'Eddie Winter 00");
});
test('Fallout 4 seed collection is complete for Eddie Winter and has measured durations',async()=>{
 const index=JSON.parse(await readFile(new URL('../public/holotapes.json',import.meta.url),'utf8'));
 assert.equal(new Set(index.items.map(t=>t.id)).size,index.items.length);
 const series=index.items.filter(t=>t.game==='Fallout 4'&&t.series==='Eddie Winter').sort((a,b)=>a.title.localeCompare(b.title));
 assert.equal(series.length,10);
 for(let n=0;n<10;n++){assert.ok(series[n].title.endsWith(String(n).padStart(2,'0')));assert.ok(series[n].duration>0);}
});
