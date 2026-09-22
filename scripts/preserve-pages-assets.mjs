// Keep the immediately previous entry bundle for browsers with a cached HTML page.
import {mkdir,writeFile,access} from 'node:fs/promises';
const base='https://mathieubal.github.io/Pipboy/';
try{
 const response=await fetch(base+'?deployment='+Date.now(),{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Previous page HTTP '+response.status);
 const html=await response.text();
 const assets=[...html.matchAll(/(?:src|href)=["'](?:\.\/|\/Pipboy\/)?assets\/([a-zA-Z0-9._-]+\.(?:js|css))["']/g)].map(m=>m[1]);
 await mkdir('dist/assets',{recursive:true});
 for(const name of new Set(assets)){
  const path='dist/assets/'+name;
  try{await access(path);continue}catch{}
  const file=await fetch(base+'assets/'+name,{signal:AbortSignal.timeout(15000)});
  if(!file.ok)throw Error('Previous asset HTTP '+file.status);
  const bytes=new Uint8Array(await file.arrayBuffer());
  await writeFile(path,bytes);console.log('Preserved previous bundle: '+name);
 }
}catch(error){console.warn('Previous assets unavailable; startup recovery remains available: '+error.message)}
