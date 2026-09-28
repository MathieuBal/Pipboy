import type {State,Entry,Token} from './data';
const kinds=['location','person','creature','item','document','quest','holotape','terminal'];
const maxBytes=1800000;
export const isPointer=(token:{id:string})=>/^pipboy-pointer-\d+-/.test(token.id);
function fail(message:string):never{throw Error('Sauvegarde invalide : '+message)}
function object(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))fail('objet attendu.');return value as Record<string,unknown>}
function str(value:unknown,label:string,max=20000){if(typeof value!=='string'||value.length>max)fail(label+' incorrect.');return value as string}
function num(value:unknown,min:number,max:number){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)fail('coordonnée ou compteur hors limites.');return value as number}
function bool(value:unknown){if(typeof value!=='boolean')fail('visibilité incorrecte.');return value as boolean}
function url(value:unknown){const s=str(value,'URL',4000);if(s){try{if(!['https:','http:'].includes(new URL(s).protocol))fail('URL non autorisée.')}catch{fail('URL non autorisée.')}}return s}
function strings(v:unknown,max=100){if(!Array.isArray(v)||v.length>max)fail('liste incorrecte.');return v.map(x=>str(x,'élément de liste',1000))}
function point(v:unknown){const p=object(v);return {x:num(p.x,0,1),y:num(p.y,0,1)}}
function unique(items:{id:string}[]){if(new Set(items.map(e=>e.id)).size!==items.length)fail('identifiants en double.')}
export function validateCampaign(value:unknown):State{
 const v=object(value);const name=str(v.name,'nom',100);if(!name.trim())fail('nom vide.');
 if(!Array.isArray(v.entries)||v.entries.length>5000)fail('liste de fiches incorrecte.');
 const entries:Entry[]=v.entries.map(raw=>{const e=object(raw);const type=str(e.type,'type');if(!kinds.includes(type))fail('type de fiche inconnu.');
 const item:Entry={id:str(e.id,'identifiant',200),type:type as Entry['type'],title:str(e.title,'titre',140),summary:str(e.summary,'résumé',1000),body:str(e.body,'contenu',100000),tags:strings(e.tags),visible:bool(e.visible),status:str(e.status,'statut',200)};
 if(!item.id||!item.title.trim())fail('fiche sans identifiant ou titre.');
 for(const k of ['audio','image','sourceUrl'] as const)if(e[k]!==undefined)item[k]=url(e[k]);
 for(const k of ['source','mapId'] as const)if(e[k]!==undefined)item[k]=str(e[k],k,4000);
 if(e.links!==undefined)item.links=strings(e.links,5000);if(e.x!==undefined)item.x=num(e.x,0,1);if(e.y!==undefined)item.y=num(e.y,0,1);return item;
 });unique(entries);
 if(v.tokens!==undefined&&!Array.isArray(v.tokens))fail('liste de pions incorrecte.');
 const rawTokens=(v.tokens||[]) as unknown[];if(rawTokens.length>5000)fail('trop de pions.');
 const tokens:Token[]=rawTokens.map(raw=>{const t=object(raw);const size=num(t.size,.01,.3);if(typeof t.color!=='string'||!/^#[0-9a-f]{6}$/i.test(t.color))fail('couleur de pion incorrecte.');return {id:str(t.id,'identifiant de pion',200),name:str(t.name,'nom de pion',140),image:url(t.image),mapImage:url(t.mapImage),...point(t),size,color:t.color,visible:bool(t.visible)}}).filter(t=>!isPointer(t));unique(tokens);
 if(tokens.some(t=>!t.id||!t.name.trim()))fail('pion sans nom ou identifiant.');
 const result:State={cleanupVersion:1,name,entries,tokens,position:point(v.position),mapImage:url(v.mapImage),log:[]};
 if(v.log!==undefined){if(!Array.isArray(v.log)||v.log.length>1000)fail('journal incorrect.');result.log=v.log.map(raw=>{const l=object(raw);return {id:str(l.id,'identifiant',200),text:str(l.text,'journal',20000),date:str(l.date,'date',100)}})}
 if(v.mapPositions!==undefined){const positions=object(v.mapPositions);if(Object.keys(positions).length>1000)fail('trop de cartes.');result.mapPositions=Object.fromEntries(Object.entries(positions).map(([key,value])=>{if(['__proto__','constructor','prototype'].includes(key)||key.length>4000)fail('identifiant de carte incorrect.');return [key,point(value)]}))}
 if(v.scenario!==undefined){const p=object(v.scenario);result.scenario={installed:bool(p.installed),completed:strings(p.completed,1000),round:num(p.round,1,99),effort:num(p.effort,0,20),notes:str(p.notes,'notes MJ',100000)}}
 return result;
}
export function makeBackup(state:State){return {format:'pipboy-campaign',version:1,scope:'gm',exportedAt:new Date().toISOString(),state:validateCampaign(state)}}
export function parseBackup(text:string){if(new TextEncoder().encode(text).byteLength>maxBytes)fail('fichier trop volumineux (1,8 Mo maximum).');let raw:unknown;try{raw=JSON.parse(text)}catch{fail('le fichier n’est pas un JSON lisible.')}const v=object(raw);const legacy=v.format===undefined;if(!legacy&&(v.format!=='pipboy-campaign'||v.version!==1||v.scope!=='gm'))fail('format, version ou portée non pris en charge.');return {state:validateCampaign(legacy?v:v.state),legacy,date:legacy?'':str(v.exportedAt,'date',100)}}
export function downloadBackup(state:State){const blob=new Blob([JSON.stringify(makeBackup(state),null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='pipboy-campagne-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)}
export function rollbackKey(scope:string){return 'pipboy-rollback-'+(scope||'local')}
export function saveRollback(state:State,scope:string){const text=JSON.stringify(makeBackup(state));localStorage.setItem(rollbackKey(scope),text);return text}
