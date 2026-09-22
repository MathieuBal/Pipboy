import {createClient} from '@supabase/supabase-js';
import {initial,labels,type State} from './data';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase=url&&key?createClient(url,key):null;
const STORAGE='pipboy-demo-v1';
const cloneInitial=():State=>JSON.parse(JSON.stringify(initial));
export function readDemo():State{
 let raw:string|null;
 try{raw=localStorage.getItem(STORAGE)}catch{return cloneInitial()}
 if(!raw)return cloneInitial();
 let saved:unknown;
 try{saved=JSON.parse(raw)}catch{throw Error('La sauvegarde locale est illisible. Utilisez « Sauvegarder mes données locales » pour la conserver.')}
 if(saved===null)return cloneInitial();
 if(typeof saved!=='object'||Array.isArray(saved))throw Error('Format de sauvegarde locale non reconnu. Vos données n’ont pas été effacées.');
 const value=saved as Partial<State>;
 if(value.entries!==undefined&&!Array.isArray(value.entries))throw Error('La liste des fiches sauvegardées est invalide. Vos données n’ont pas été effacées.');
 const fallback=cloneInitial();
 const entries=(value.entries??fallback.entries).map(e=>{
  if(!e||typeof e.id!=='string'||!Object.hasOwn(labels,e.type))throw Error('Une fiche sauvegardée est invalide. Vos données n’ont pas été effacées.');
  return {...e,title:typeof e.title==='string'?e.title:'Sans titre',summary:typeof e.summary==='string'?e.summary:'',body:typeof e.body==='string'?e.body:'',tags:Array.isArray(e.tags)?e.tags.filter(t=>typeof t==='string'):[],visible:e.visible===true,status:typeof e.status==='string'?e.status:'Inconnu'};
 });
 const coordinate=(v:unknown,f:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):f;
 return {...value,name:typeof value.name==='string'?value.name:fallback.name,mapImage:typeof value.mapImage==='string'?value.mapImage:'',entries,position:{x:coordinate(value.position?.x,fallback.position.x),y:coordinate(value.position?.y,fallback.position.y)},log:Array.isArray(value.log)?value.log.filter(l=>l&&typeof l.id==='string'&&typeof l.text==='string'&&typeof l.date==='string'):[]};
}
export function writeDemo(s:State){localStorage.setItem(STORAGE,JSON.stringify(s));window.dispatchEvent(new Event('pipboy-update'))}
export type Snapshot={state:State;role:'gm'|'player';revision:number;name:string;invite_code?:string;members:number};
export async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{if(!supabase)throw Error('Supabase n’est pas configuré.');const {data,error}=await supabase.rpc(name,args);if(error)throw Error(error.message);return data as T}

export function readPreference(key:string){try{return localStorage.getItem(key)}catch{return null}}
