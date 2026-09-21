const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
let browser;
async function main(){
 for(let n=0;n<60;n++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');
 await page.getByRole('button',{name:'Console MJ',exact:true}).click();
 await page.getByRole('button',{name:'Bibliothèque audio',exact:true}).click();
 await page.getByRole('heading',{name:'Bibliothèque d’holobandes',exact:false}).waitFor();
 await page.getByRole('textbox',{name:'Rechercher une holobande'}).fill('Keller');
 const card=page.locator('article').filter({hasText:'Transcription de la famille Keller 1-5'});
 await card.getByRole('button',{name:'Préécouter',exact:true}).click();
 await page.getByRole('region',{name:'Préécoute MJ'}).waitFor();
 assert.equal(await page.locator('audio').evaluate(a=>a.autoplay),false);
 assert.match(await page.locator('audio').getAttribute('src'),/fallout-wiki.com\/images/);
 await card.getByRole('button',{name:'Ajouter',exact:true}).click();
 await card.getByRole('button',{name:'Ajoutée',exact:true}).waitFor();
 await card.getByRole('button',{name:'Envoyer',exact:true}).click();
 await card.getByRole('button',{name:'Transmise',exact:true}).waitFor();
 await page.getByRole('button',{name:'Vue joueur',exact:true}).click();
 await page.getByRole('button',{name:'HOLOBANDES',exact:true}).click();
 await page.getByRole('heading',{name:'Transcription de la famille Keller 1-5',exact:true}).waitFor();
 await page.reload();await page.getByRole('button',{name:'HOLOBANDES',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'Transcription de la famille Keller 1-5',exact:true}).count(),1);
 await page.getByRole('button',{name:'Console MJ',exact:true}).click();
 await page.getByRole('button',{name:'Catalogue',exact:false}).click();
 await page.locator('article').filter({hasText:'Transcription de la famille Keller 1-5'}).getByRole('button',{name:'Masquer',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Masquer',exact:true}).click();
 await page.getByRole('button',{name:'Vue joueur',exact:true}).click();await page.getByRole('button',{name:'HOLOBANDES',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'Transcription de la famille Keller 1-5',exact:true}).count(),0);

 // Search accepts unaccented input; preview stays reachable after opening a low card.
 await page.getByRole('button',{name:'Console MJ',exact:true}).click();
 await page.getByRole('button',{name:'Bibliothèque audio',exact:true}).click();
 await page.getByRole('textbox',{name:'Rechercher une holobande'}).fill('brule');
 await page.getByRole('heading',{name:'Brûle cette satanée combinaison',exact:true}).waitFor();
 await page.getByRole('button',{name:'Préécouter',exact:true}).click();
 assert.ok(await page.getByRole('region',{name:'Préécoute MJ'}).evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<innerHeight}),'Preview must be in viewport');
 // Unsaved content can be kept when dismissing, and tag editing deduplicates on save.
 await page.getByRole('button',{name:'Nouvelle fiche',exact:true}).click();
 await page.getByRole('textbox',{name:'Titre',exact:true}).fill('Fiche de contrôle');
 page.once('dialog',d=>d.dismiss());
 await page.getByRole('dialog').getByRole('button',{name:'Annuler',exact:true}).click();
 assert.equal(await page.getByRole('textbox',{name:'Titre',exact:true}).inputValue(),'Fiche de contrôle');
 await page.getByRole('textbox',{name:'Résumé',exact:true}).fill('Vérification de sauvegarde');
 await page.getByRole('textbox',{name:'Tags (séparés par des virgules)',exact:true}).fill('test, test, , utile');
 await page.getByRole('dialog').getByRole('button',{name:'Enregistrer',exact:true}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pipboy-demo-v1')).entries.find(e=>e.title==='Fiche de contrôle'));
 assert.deepEqual(saved.tags,['test','utile']);
 // A failed settings save must retain the modal and its draft.
 await page.getByRole('button',{name:'Réglages',exact:true}).click();
 await page.getByRole('textbox',{name:'Nom de la campagne',exact:true}).fill('Nom conservé après erreur');
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='pipboy-demo-v1')throw new DOMException('Quota dépassé','QuotaExceededError');return window.originalSetItem.call(this,k,v)}});
 await page.getByRole('dialog').getByRole('button',{name:'Enregistrer',exact:true}).click();
 assert.equal(await page.getByRole('textbox',{name:'Nom de la campagne',exact:true}).inputValue(),'Nom conservé après erreur');
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem});
 await page.getByRole('dialog').getByRole('button',{name:'Fermer',exact:true}).click();
 await page.getByRole('button',{name:'Vue joueur',exact:true}).click();
 await page.getByRole('button',{name:'DATA',exact:true}).click();
 await page.getByLabel('Type de donnée').selectOption('quest');
 assert.equal(await page.locator('article').count(),1);
 await page.getByLabel('Type de donnée').selectOption('document');
 assert.equal(await page.getByRole('heading',{name:'Une voix dans les ruines',exact:true}).count(),0);
 await fs.mkdir('test-results',{recursive:true});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:950});await page.getByRole('button',{name:'MAP',exact:true}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Map overflow at '+width);
  await page.screenshot({path:'test-results/map-'+width+'.png',fullPage:true});
  await page.getByRole('button',{name:'Console MJ',exact:true}).click();await page.getByRole('button',{name:'Bibliothèque audio',exact:true}).click();
  await page.getByRole('textbox',{name:'Rechercher une holobande'}).fill('Keller');
  await page.locator('article').first().waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Library overflow at '+width);
  await page.screenshot({path:'test-results/library-'+width+'.png',fullPage:true});
  await page.getByRole('button',{name:'Vue joueur',exact:true}).click();
 }
 assert.deepEqual(errors,[]);console.log('PASS: library, manual audio, import, send, persistence, revoke, responsive 320/390/1440');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.kill()});
