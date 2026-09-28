const {chromium,webkit,devices}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
async function count(page,n){await page.waitForFunction(n=>document.querySelectorAll('.fog-tile').length===n,n)}
async function main(){
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 await fs.mkdir('test-results',{recursive:true});
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch();try{
 const context=await browser.newContext({...devices['iPhone 13']});const gm=await context.newPage();const errors=[];gm.on('pageerror',e=>errors.push(e.message));
 await gm.goto('http://127.0.0.1:4173/#/gm');await gm.getByRole('button',{name:'Table de jeu',exact:true}).click();
 await gm.getByRole('button',{name:'Deer Park · Station-service',exact:true}).click();
 await gm.getByRole('button',{name:'Ajouter un pion joueur',exact:true}).click();await gm.getByRole('button',{name:'Révéler le pion',exact:true}).click();
 await gm.getByRole('button',{name:'Brouillard de guerre',exact:true}).click();await gm.getByRole('button',{name:'Masquer toute la carte',exact:true}).click();await count(gm,64);
 assert.equal(await gm.locator('.table-token').count(),1);
 const player=await context.newPage();await player.goto('http://127.0.0.1:4173/');await player.getByRole('button',{name:'Réglages',exact:true}).waitFor();assert.equal(await player.locator('.fog-tile').count(),0);
 await gm.getByRole('button',{name:'Afficher cette scène',exact:true}).click();await player.getByRole('heading',{name:'Deer Park · Station-service',exact:false}).waitFor();await count(player,64);assert.equal(await player.locator('.table-token').count(),0);
 await gm.getByRole('button',{name:'Dévoiler zone 37',exact:true}).tap();await count(player,63);await player.locator('.table-token').waitFor();
 await gm.getByRole('button',{name:'Remasquer des zones',exact:true}).click();await gm.getByRole('button',{name:'Masquer zone 37',exact:true}).tap();await count(player,64);
 await gm.getByRole('button',{name:'Annuler le dernier tracé',exact:true}).click();await count(player,63);
 await gm.getByRole('button',{name:'Table plein écran',exact:true}).click();assert.ok(await gm.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.ok((await gm.locator('.table-viewport').boundingBox()).height>=180,'Fog editing keeps a usable map viewport');
 await gm.screenshot({path:`test-results/fog-gm-${name}.png`,fullPage:true});await player.screenshot({path:`test-results/fog-player-${name}.png`,fullPage:true});
 await gm.getByRole('button',{name:'Tout dévoiler',exact:true}).click();await count(player,0);await gm.getByRole('button',{name:'Annuler le dernier tracé',exact:true}).click();await count(player,63);
 await gm.reload();await gm.getByRole('button',{name:'Table de jeu',exact:true}).click();await count(gm,63);
 await gm.getByRole('button',{name:'Commonwealth',exact:true}).click();await count(gm,0);await count(player,63);
 await gm.getByRole('button',{name:'Deer Park · Station-service • En jeu',exact:true}).click();await count(gm,63);
 assert.deepEqual(errors,[]);console.log('PASS fog '+name+': private preparation, sync, token occlusion, touch, undo, persistence');await context.close();
 }finally{await browser.close()}}
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
