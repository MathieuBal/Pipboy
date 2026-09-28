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
   const context=await browser.newContext({...devices['iPhone 13'],acceptDownloads:true});const gm=await context.newPage();const errors=[];gm.on('pageerror',e=>errors.push(e.message));
   await gm.goto('http://127.0.0.1:4173/#/gm');await gm.getByRole('button',{name:'Table de jeu',exact:true}).click();
   await gm.getByRole('button',{name:'Deer Park · Station-service',exact:true}).click();assert.equal(await gm.getByRole('button',{name:'Montrer un endroit',exact:true}).isDisabled(),true);
   await gm.getByRole('button',{name:'Afficher cette scène',exact:true}).click();await gm.getByRole('button',{name:'Affichée sur le Pip-Boy',exact:true}).waitFor();
   const player=await context.newPage();await player.goto('http://127.0.0.1:4173/');await player.getByRole('heading',{name:'Deer Park · Station-service',exact:false}).waitFor();
   await gm.getByRole('button',{name:'Table plein écran',exact:true}).click();assert.equal(await gm.evaluate(()=>document.body.style.overflow),'hidden');
   const viewport=await gm.locator('.focus-table').boundingBox();assert.ok(viewport.width<=390&&viewport.height<=845);await gm.getByRole('button',{name:'Réserve de pions',exact:true}).click();await gm.getByRole('button',{name:'Ajouter un pion joueur',exact:true}).click();
   await gm.getByRole('button',{name:'Réserve de pions',exact:true}).click();await gm.getByRole('button',{name:'Montrer un endroit',exact:true}).click();
   const canvas=gm.locator('.table-canvas');const box=await canvas.boundingBox();await canvas.tap({position:{x:box.width*.35,y:box.height*.35}});
   await player.getByRole('status',{name:'Repère du MJ sur la carte',exact:true}).waitFor();assert.equal(await player.locator('.table-token').count(),0,'Secret token stays hidden when sending a pointer');
   assert.ok(await gm.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await gm.screenshot({path:`test-results/fullscreen-${name}.png`,fullPage:true});
   // Expiry is driven by the timestamp, including on a fresh mount.
   await gm.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pipboy-demo-v1'));s.tokens=s.tokens.map(t=>t.id.startsWith('pipboy-pointer-')?{...t,id:'pipboy-pointer-1-old'}:t);localStorage.setItem('pipboy-demo-v1',JSON.stringify(s));window.dispatchEvent(new Event('pipboy-update'))});
   await player.waitForFunction(()=>!document.querySelector('.map-ping'));
   await gm.getByRole('button',{name:'Quitter le plein écran',exact:true}).click();assert.notEqual(await gm.evaluate(()=>document.body.style.overflow),'hidden');
   await gm.getByRole('button',{name:'Réglages',exact:true}).click();await gm.getByRole('button',{name:'Sauvegardes de campagne',exact:true}).click();
   const download=gm.waitForEvent('download');await gm.getByRole('button',{name:'Télécharger ma campagne',exact:true}).click();const file=await download;await file.saveAs(`test-results/campaign-${name}.json`);const backup=JSON.parse(await fs.readFile(`test-results/campaign-${name}.json`,'utf8'));
   assert.equal(backup.scope,'gm');assert.equal(backup.state.tokens.some(t=>t.id.startsWith('pipboy-pointer-')),false);assert.equal(backup.state.tokens[0].visible,false);
   const originalName=backup.state.name;
   await gm.locator('input[type=file]').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{broken')});await gm.getByRole('alert').waitFor();assert.equal(await gm.getByRole('button',{name:'Confirmer la restauration',exact:true}).count(),0);
   backup.state.name='Campagne restaurée pour test';await gm.locator('input[type=file]').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
   await gm.getByRole('region',{name:'Aperçu de restauration',exact:true}).waitFor();assert.equal(await gm.getByRole('button',{name:'Confirmer la restauration',exact:true}).isDisabled(),true);
   assert.equal(await gm.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).name),originalName);
   await gm.getByRole('checkbox',{name:'Je confirme le remplacement de la campagne active.',exact:true}).check();await gm.getByRole('button',{name:'Confirmer la restauration',exact:true}).click();
   await gm.waitForFunction(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).name==='Campagne restaurée pour test');
   await gm.getByRole('button',{name:'Revenir à l’état précédent',exact:true}).click();await gm.getByRole('checkbox',{name:'Je confirme le remplacement de la campagne active.',exact:true}).check();await gm.getByRole('button',{name:'Confirmer la restauration',exact:true}).click();
   await gm.waitForFunction(name=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).name===name,originalName);
   await gm.screenshot({path:`test-results/backup-${name}.png`,fullPage:true});assert.deepEqual(errors,[]);await context.close();console.log('PASS comfort '+name+': full screen, panels, private scene guard, shared pointer/expiry, export, validation, confirmed restore and rollback');
  }finally{await browser.close()}
 }
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
