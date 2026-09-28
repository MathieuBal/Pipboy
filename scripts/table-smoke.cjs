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
   const context=await browser.newContext(name==='webkit'?{...devices['iPhone 13']}:{viewport:{width:1440,height:1050}});
   const gm=await context.newPage();const errors=[];gm.on('pageerror',e=>errors.push(e.message));
   const state=()=>gm.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')||'{}'));
   await gm.goto('http://127.0.0.1:4173/#/gm');
   await gm.getByRole('button',{name:'Table de jeu',exact:true}).click();
   await gm.getByRole('button',{name:'Deer Park · Station-service',exact:true}).click();
   await gm.getByRole('img',{name:'Plateau : Deer Park · Station-service',exact:true}).evaluate(i=>i.decode());
   await gm.getByRole('button',{name:'Ajouter Mouche mutante',exact:true}).click();
   await gm.getByRole('button',{name:'Dupliquer en secret',exact:true}).click();
   await gm.waitForFunction(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.length===2);
   await gm.getByRole('button',{name:'Dupliquer en secret',exact:true}).click();
   await gm.waitForFunction(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.length===3);
   let s=await state();assert.equal(s.tokens.every(t=>!t.visible),true);assert.equal(s.mapImage,'','Preparing a scene must not publish it');
   const movingId=s.tokens[2].id,priorX=s.tokens[2].x;
   const piece=gm.locator('.table-token').last();await piece.focus();await gm.keyboard.press('ArrowRight');
   await gm.waitForFunction(({id,x})=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.find(t=>t.id===id).x>x,{id:movingId,x:priorX});
   if(name==='chromium'){
    await piece.scrollIntoViewIfNeeded();const box=await piece.boundingBox();const prior=(await state()).tokens[2].x;
    await gm.mouse.move(box.x+box.width/2,box.y+box.height/2);await gm.mouse.down();await gm.mouse.move(box.x+box.width/2+35,box.y+box.height/2-20,{steps:6});await gm.mouse.up();
    await gm.waitForFunction(({id,x})=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.find(t=>t.id===id).x>x,{id:movingId,x:prior});
   }
   await gm.getByRole('button',{name:'Révéler le pion',exact:true}).click();
   await gm.getByRole('button',{name:'Masquer le pion',exact:true}).waitFor();
   const player=await context.newPage();player.on('pageerror',e=>errors.push(e.message));await player.goto('http://127.0.0.1:4173/');await player.getByRole('heading',{name:'En attente du MJ',exact:true}).waitFor();
   assert.equal(await player.locator('.table-token').count(),0,'No prepared scene token on player map');
   await gm.getByRole('button',{name:'Afficher cette scène',exact:true}).click();
   await player.getByRole('heading',{name:'Deer Park · Station-service',exact:false}).waitFor();
   await player.locator('.table-token').waitFor();assert.equal(await player.locator('.table-token').count(),1);
   assert.equal(await player.getByRole('button',{name:'Table de jeu',exact:true}).count(),0);
   assert.equal(await player.locator('.table-token.editable').count(),0);
   const saved=(await state()).tokens;
   await gm.reload();await gm.getByRole('button',{name:'Table de jeu',exact:true}).click();assert.deepEqual((await state()).tokens,saved);
   await gm.getByRole('button',{name:'Smoky Waters · Station météo',exact:true}).click();assert.equal(await gm.locator('.table-token').count(),0);
   assert.equal(await player.locator('.table-token').count(),1);
   await gm.getByRole('button',{name:'Deer Park · Station-service • En jeu',exact:true}).click();
   await gm.locator('.scene-token-list button').last().click();
   await gm.getByRole('button',{name:'Masquer le pion',exact:true}).click();
   await player.waitForFunction(()=>document.querySelectorAll('.table-token').length===0);
   await gm.getByRole('button',{name:'Retirer le pion',exact:true}).click();await gm.getByRole('button',{name:'Annuler la suppression',exact:true}).click();
   await gm.waitForFunction(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.length===3);
   if(name==='chromium'){
    // Desktop drag-and-drop from the library, using a real DataTransfer payload.
    const data=await gm.evaluateHandle(()=>{const d=new DataTransfer();d.setData('application/pipboy-illustration','smoky-portrait-evie');return d});
    const bounds=await gm.locator('.table-canvas').boundingBox();await gm.locator('.table-canvas').dispatchEvent('drop',{dataTransfer:data,clientX:bounds.x+bounds.width*.3,clientY:bounds.y+bounds.height*.3});
    await gm.waitForFunction(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).tokens.length===4);assert.equal((await state()).tokens.at(-1).visible,false);
    await gm.screenshot({path:'test-results/table-desktop.png',fullPage:true});
   }
   for(const width of [390,320]){await gm.setViewportSize({width,height:844});assert.ok(await gm.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Table overflow '+width);await gm.screenshot({path:`test-results/table-${name}-${width}.png`,fullPage:true})}
   assert.deepEqual(errors,[]);await context.close();console.log('PASS table '+name+': private scene, add/duplicate, movement, reveal/revoke, persistence, player projection, mobile layout');
  }finally{await browser.close()}
 }
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
