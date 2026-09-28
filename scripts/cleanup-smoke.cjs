const {chromium,webkit,devices}=require('playwright');
const {spawn}=require('node:child_process');const fs=require('node:fs/promises');const assert=require('node:assert/strict');
const ts=require('typescript');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
async function main(){
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 const js=ts.transpileModule(await fs.readFile('tests/legacy-demo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;const {initial}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch();try{
 const context=await browser.newContext({...devices['iPhone 13']});await context.addInitScript(old=>{if(!localStorage.getItem('pipboy-demo-v1'))localStorage.setItem('pipboy-demo-v1',JSON.stringify({...old,entries:[...old.entries,{id:'mine',type:'document',title:'Mon indice',body:'Préparation à conserver',summary:'Test',tags:[],status:'Préparé',visible:true}]}))},initial);
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');await page.getByRole('heading',{name:'En attente du MJ',exact:true}).waitFor();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')));assert.equal(state.entries.length,1);assert.equal(state.entries[0].visible,false);assert.ok(await page.evaluate(()=>localStorage.getItem('pipboy-before-cleanup-v1')));
 await page.getByRole('button',{name:'Console MJ',exact:true}).click();await page.getByRole('button',{name:'Scénario Smoky Waters',exact:true}).click();await page.getByRole('button',{name:'Ajouter les 3 fiches en secret',exact:true}).click();await page.getByRole('button',{name:'Fiches déjà préparées',exact:true}).waitFor();
 await page.getByRole('button',{name:'Vue joueur',exact:true}).click();await page.getByRole('button',{name:'PERSONNES',exact:true}).click();assert.equal(await page.locator('article').count(),0);
 await page.getByRole('button',{name:'Console MJ',exact:true}).click();await page.getByRole('button',{name:'Catalogue',exact:false}).click();await page.locator('article').filter({hasText:'Erine Wallace'}).getByRole('button',{name:'Envoyer',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Vue joueur',exact:true}).click();await page.getByRole('button',{name:'PERSONNES',exact:true}).click();await page.getByRole('heading',{name:'Erine Wallace',exact:true}).waitFor();assert.equal(await page.locator('article').count(),1);
 await page.getByRole('button',{name:'Console MJ',exact:true}).click();await page.getByRole('button',{name:'Bibliothèque de cartes',exact:true}).click();await page.locator('article').filter({hasText:'Missouri · Carte fournie du scénario'}).getByRole('button',{name:'Afficher sur le Pip-Boy',exact:true}).click();await page.getByRole('button',{name:'Vue joueur',exact:true}).click();await page.getByRole('heading',{name:'Missouri · Carte fournie du scénario',exact:false}).waitFor();await page.locator('.map-canvas img').first().evaluate(img=>img.decode());const box=await page.locator('.map-canvas').boundingBox();assert.ok(Math.abs(box.width/box.height-16/9)<.02);assert.equal(await page.locator('.regional-label').count(),0);await page.screenshot({path:`test-results/source-map-${name}.png`,fullPage:true});
 console.log('PASS cleanup '+name+': legacy migration, private sheets, explicit reveal, original map ratio');await context.close();
 }finally{await browser.close()}}
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
