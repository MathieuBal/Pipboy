const {chromium,webkit,devices}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
async function main(){
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 await fs.mkdir('test-results',{recursive:true});
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch();
  try{
   const context=await browser.newContext({...devices['iPhone 13']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4173/#/gm');await page.getByRole('button',{name:'Scénario Smoky Waters',exact:true}).click();
   await page.getByRole('button',{name:'Préparer dans ma session',exact:true}).click();await page.getByRole('button',{name:'Compléter la préparation',exact:true}).waitFor();
   const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')));
   let s=await state();assert.equal(s.entries.filter(e=>e.id.startsWith('smoky-')).length,59);assert.equal(s.tokens.length,30);assert.ok(s.entries.filter(e=>e.id.startsWith('smoky-')).every(e=>!e.visible));assert.ok(s.tokens.every(t=>!t.visible));assert.equal(s.mapImage,'');
   await page.getByRole('button',{name:'Compléter la préparation',exact:true}).click();assert.equal((await state()).tokens.length,30);
   await page.locator('.scenario-reveals>div').filter({hasText:'Ordre de mission — Équipe 23'}).getByRole('button',{name:'Révéler',exact:true}).click();
   await page.locator('.scenario-reveals>div').filter({hasText:'Ordre de mission — Équipe 23'}).getByRole('button',{name:'Masquer',exact:true}).waitFor();
   await page.getByRole('button',{name:'Marquer comme terminée',exact:true}).click();
   await page.getByRole('textbox',{name:'Notes privées de séance',exact:true}).fill('Secret de séance');await page.getByRole('button',{name:'Enregistrer mes notes MJ',exact:true}).click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).scenario.notes==='Secret de séance');
   await page.reload();await page.getByRole('button',{name:'Scénario Smoky Waters',exact:true}).click();await page.getByRole('button',{name:'Étape terminée',exact:true}).waitFor();
   await page.getByRole('button',{name:'4 · Deer Park : la carcasse',exact:true}).click();await page.getByRole('button',{name:'Préparer cette carte',exact:true}).click();
   await page.getByRole('img',{name:'Plateau : Deer Park · Station-service',exact:true}).evaluate(i=>i.decode());assert.equal((await state()).mapImage,'','Preview must stay private');
   await page.locator('.scene-token-list').getByRole('button',{name:'Mouche mutante 1',exact:true}).click();
   const id='smoky-token-mouche-1';const before=(await state()).tokens.find(t=>t.id===id);
   const piece=page.getByRole('button',{name:'Pion : Mouche mutante 1 (secret)',exact:true});await piece.tap();assert.deepEqual((await state()).tokens.find(t=>t.id===id),before,'A tap selects without moving');
   await page.getByRole('button',{name:'Agrandir la table',exact:true}).click();
   await page.getByRole('button',{name:'Placer au toucher',exact:true}).tap();
   const canvas=page.locator('.table-canvas');const box=await canvas.boundingBox();await canvas.tap({position:{x:box.width*.4,y:box.height*.4}});
   await page.waitForFunction(id=>Math.abs(JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.find(t=>t.id===id).x-.4)<.01,id);
   assert.ok(Math.abs((await state()).tokens.find(t=>t.id===id).y-.4)<.01);
   await page.getByRole('button',{name:'Déplacer le pion vers la droite',exact:true}).tap();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.find(t=>t.id===id).x>.405,id);
   await page.getByRole('button',{name:'Scénario Smoky Waters',exact:true}).click();await page.getByRole('button',{name:'8 · Ce que savent les habitants',exact:true}).click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`test-results/scenario-${name}.png`,fullPage:true});
   await page.getByRole('button',{name:'Vue joueur',exact:true}).click();await page.getByRole('button',{name:'DATA',exact:true}).click();await page.getByRole('heading',{name:'Ordre de mission — Équipe 23',exact:true}).waitFor();
   assert.equal(await page.getByRole('button',{name:'Scénario Smoky Waters',exact:true}).count(),0);assert.equal(await page.getByText('Secret de séance',{exact:true}).count(),0);assert.equal(await page.getByRole('heading',{name:'Les équipes précédentes',exact:true}).count(),0);
   assert.deepEqual(errors,[]);await context.close();console.log('PASS scenario '+name+': private import, idempotence, reveal, persistence, touch placement with zoom, private GM notes');
  }finally{await browser.close()}
 }
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
