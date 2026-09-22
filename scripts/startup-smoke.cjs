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
   await page.goto('http://127.0.0.1:4173');await page.getByRole('heading',{name:'Le Commonwealth',exact:false}).waitFor();
   await page.waitForFunction(()=>document.getElementById('startup').hidden);
   await page.getByRole('button',{name:'Console MJ',exact:true}).click();
   await page.getByRole('button',{name:'Bibliothèque audio',exact:true}).click();
   await page.getByRole('button',{name:'Eddie Winter',exact:true}).click();
   assert.equal(await page.locator('article').count(),10);
   assert.deepEqual(errors,[]);await context.close();
   const partial=await browser.newContext();await partial.addInitScript(()=>localStorage.setItem('pipboy-demo-v1',JSON.stringify({name:'Campagne conservée',entries:[{id:'old',type:'location',title:'Mon lieu',visible:true}]})));
   const partialPage=await partial.newPage();await partialPage.goto('http://127.0.0.1:4173');await partialPage.getByRole('heading',{name:'Le Commonwealth',exact:false}).waitFor();await partialPage.getByText('Campagne conservée',{exact:true}).waitFor();
   assert.equal(await partialPage.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).entries[0].title),'Mon lieu');await partial.close();
   const damaged=await browser.newContext();await damaged.addInitScript(()=>localStorage.setItem('pipboy-demo-v1','{broken'));
   const damagedPage=await damaged.newPage();await damagedPage.goto('http://127.0.0.1:4173');await damagedPage.getByRole('button',{name:'Sauvegarder mes données locales'}).waitFor();
   assert.equal(await damagedPage.evaluate(()=>localStorage.getItem('pipboy-demo-v1')),'{broken');await damaged.close();
   const failed=await browser.newContext();await failed.route('**/assets/*.js',r=>r.abort());
   const failedPage=await failed.newPage();await failedPage.goto('http://127.0.0.1:4173');await failedPage.getByRole('button',{name:'Réessayer le chargement'}).waitFor();
   await failed.unroute('**/assets/*.js');await failedPage.getByRole('button',{name:'Réessayer le chargement'}).click();await failedPage.getByRole('heading',{name:'Le Commonwealth',exact:false}).waitFor();
   await failed.close();console.log('PASS startup '+name+': iPhone viewport, legacy storage, damaged storage, missing bundle recovery');
  }finally{await browser.close()}
 }
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
