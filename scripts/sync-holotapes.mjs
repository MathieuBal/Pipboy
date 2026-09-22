import {tapesFromHtml} from './holotape-metadata.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const output=new URL('../public/holotapes.json',import.meta.url);
const seeds=JSON.parse(await readFile(output,'utf8'));
const roots=[
 ["Catégorie:Enregistrement d'holodisque de Fallout 3","Fallout 3"],
 ["Catégorie:Enregistrement d'holodisque de Fallout 4","Fallout 4"],
 ["Catégorie:Enregistrement d'holobande de Fallout 76","Fallout 76"],
 ["Catégorie:Enregistrement d'holodisque de Fallout: New Vegas","Fallout: New Vegas"]
];
async function api(params){
 const url=new URL('https://fallout-wiki.com/api.php');
 url.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',...params});
 const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'PipboyJDR/0.2 (https://github.com/MathieuBal/Pipboy; audio metadata index)'}});
 if(!r.ok)throw Error('Wiki HTTP '+r.status);
 const data=await r.json();if(data.error)throw Error(data.error.info);return data;
}
const found=new Map(seeds.items.map(t=>[t.audio,t]));
let complete=true;
try{
 const queue=[...roots],visited=new Set(),files=new Map();
 while(queue.length){
  if(visited.size>=40)throw Error('Limite de catégories atteinte');
  const [category,game]=queue.shift();if(visited.has(category))continue;visited.add(category);
  let continuation;
  do{
   const data=await api({list:'categorymembers',cmtitle:category,cmtype:'file|subcat',cmlimit:'500',...(continuation?{cmcontinue:continuation}:{})});
   for(const item of data.query.categorymembers){
    if(item.ns===14&&!visited.has(item.title))queue.push([item.title,game]);
    if(item.ns===6&&/\.ogg$/i.test(item.title))files.set(item.title,{game,category});
   }
   continuation=data.continue?.cmcontinue;
  }while(continuation);
 }
 const titles=[...files.keys()];
 for(let offset=0;offset<titles.length;offset+=40){
  const data=await api({prop:'imageinfo',titles:titles.slice(offset,offset+40).join('|'),iiprop:'url|mime'});
  for(const page of data.query.pages||[]){
   const info=page.imageinfo?.[0],meta=files.get(page.title);
   if(!info?.url||!meta||!['audio/ogg','application/ogg'].includes(info.mime))continue;
   const raw=page.title.replace(/^[^:]+:/,'').replaceAll(' ','_');
   const title=raw.replace(/^(FO3|FO4|FO76|FNV|FONV)_/i,'').replace(/\.ogg$/i,'').replaceAll('_',' ');
   const series=/Keller/i.test(title)?'Famille Keller':/Carrie Delaney/i.test(title)?'Carrie Delaney':/Jason Grant/i.test(title)?'Jason Grant':/superviseur/i.test(title)?'Superviseur':meta.game;
   found.set(info.url,{...found.get(info.url),id:'wiki-fr-'+raw.replace(/\.ogg$/i,''),title,game:meta.game,series:found.get(info.url)?.series||series,language:'Wiki FR',audio:info.url,sourceUrl:info.descriptionurl||'https://fallout-wiki.com/'+encodeURIComponent(page.title)});
  }
 }
 if(titles.length===0)throw Error('Aucun fichier renvoyé');
 console.log('Wiki: '+files.size+' fichiers référencés, '+found.size+' liens audio disponibles.');
}catch(error){
 complete=false;console.warn('API wiki indisponible : '+error.message);
 try{
  const url='https://fallout-wiki.com/'+encodeURIComponent(roots[1][0].replaceAll(' ','_'));
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error('Wiki HTTP '+response.status);
  const items=tapesFromHtml(await response.text(),'Fallout 4');
  if(!items.length)throw Error('Aucun audio trouvé dans la catégorie');
  for(const item of items)found.set(item.audio,{...item,...found.get(item.audio)});
  console.log('Catégorie publique Fallout 4 : '+items.length+' pistes indexées.');
 }catch(fallback){console.warn('Sélection vérifiée conservée : '+fallback.message)}
}
const items=[...found.values()].sort((a,b)=>a.game.localeCompare(b.game)||a.title.localeCompare(b.title,'fr',{numeric:true}));
await writeFile(output,JSON.stringify({updatedAt:new Date().toISOString(),source:'https://fallout-wiki.com',complete,items},null,2)+'\n');
console.log('Bibliothèque publiée : '+items.length+' holobandes. Complète : '+complete);
