const {chromium,webkit,devices}=require('playwright');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
async function main(){
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch();
  try{
   const context=await browser.newContext({...devices['iPhone 13']});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4173');await page.getByRole('heading',{name:'En attente du MJ',exact:true}).waitFor();
   await page.waitForFunction(()=>document.getElementById('startup').hidden);
   await page.getByRole('button',{name:'Console MJ',exact:true}).click();
   await page.getByRole('button',{name:'Bibliothèque audio',exact:true}).click();
   await page.getByRole('button',{name:'Eddie Winter',exact:true}).click();
   assert.equal(await page.locator('article').count(),10);
   await page.getByRole('button',{name:'Bibliothèque de cartes',exact:true}).click();
   await page.locator('.map-cards article').filter({hasText:'Smoky Waters · Station météo'}).getByRole('button',{name:'Afficher sur le Pip-Boy',exact:true}).click();
   await page.getByRole('heading',{name:'Smoky Waters · Station météo',exact:false}).waitFor();
   await page.getByRole('img',{name:'Smoky Waters · Station météo',exact:true}).evaluate(img=>img.decode());
   await page.getByRole('button',{name:'Vue joueur',exact:true}).click();
   await page.getByRole('heading',{name:'Smoky Waters · Station météo',exact:false}).waitFor();
   await page.getByRole('button',{name:'Console MJ',exact:true}).click();
   await page.getByRole('button',{name:'Illustrations',exact:true}).click();
   await page.getByRole('textbox',{name:'Rechercher une illustration'}).fill('Roy');
   await page.locator('.illustration-cards article').getByRole('button',{name:'Prévisualiser',exact:true}).click();
   await page.locator('.picture-viewer img').evaluate(img=>img.decode());
   await page.getByRole('button',{name:'Fermer l’illustration',exact:true}).click();
   await page.locator('.illustration-cards article').getByRole('button',{name:'Révéler au joueur',exact:true}).click();
   await page.locator('.illustration-cards article').getByRole('button',{name:'Masquer',exact:true}).waitFor();
   await page.getByRole('button',{name:'Vue joueur',exact:true}).click();
   await page.getByRole('button',{name:'PERSONNES',exact:true}).click();
   await page.getByRole('heading',{name:'Roy Miller',exact:true}).waitFor();
   assert.deepEqual(errors,[]);await context.close();
   const partial=await browser.newContext();await partial.addInitScript(()=>localStorage.setItem('pipboy-demo-v1',JSON.stringify({name:'Campagne conservée',entries:[{id:'old',type:'location',title:'Mon lieu',visible:true}]})));
   const partialPage=await partial.newPage();await partialPage.goto('http://127.0.0.1:4173');await partialPage.getByRole('heading',{name:'En attente du MJ',exact:true}).waitFor();await partialPage.getByText('Campagne conservée',{exact:true}).waitFor();
   assert.equal(await partialPage.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).entries[0].title),'Mon lieu');await partial.close();
   const damaged=await browser.newContext();await damaged.addInitScript(()=>localStorage.setItem('pipboy-demo-v1','{broken'));
   const damagedPage=await damaged.newPage();await damagedPage.goto('http://127.0.0.1:4173');await damagedPage.getByRole('button',{name:'Sauvegarder mes données locales'}).waitFor();
   assert.equal(await damagedPage.evaluate(()=>localStorage.getItem('pipboy-demo-v1')),'{broken');await damaged.close();
   const failed=await browser.newContext();await failed.route('**/assets/*.js',r=>r.abort());
   const failedPage=await failed.newPage();await failedPage.goto('http://127.0.0.1:4173');await failedPage.getByRole('button',{name:'Réessayer le chargement'}).waitFor();
   await failed.unroute('**/assets/*.js');await failedPage.getByRole('button',{name:'Réessayer le chargement'}).click();await failedPage.getByRole('heading',{name:'En attente du MJ',exact:true}).waitFor();
   await failed.close();console.log('PASS startup '+name+': iPhone viewport, legacy storage, damaged storage, missing bundle recovery');
  }finally{await browser.close()}
 }
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
