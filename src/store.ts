import {createClient} from '@supabase/supabase-js';
import {initial,type State} from './data';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase=url&&key?createClient(url,key):null;
const STORAGE='pipboy-demo-v1';
export function readDemo():State{try{return JSON.parse(localStorage.getItem(STORAGE)||'null')||structuredClone(initial)}catch{return structuredClone(initial)}}
export function writeDemo(s:State){localStorage.setItem(STORAGE,JSON.stringify(s));window.dispatchEvent(new Event('pipboy-update'))}
export type Snapshot={state:State;role:'gm'|'player';revision:number;name:string;invite_code?:string;members:number};
export async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{if(!supabase)throw Error('Supabase n’est pas configuré.');const {data,error}=await supabase.rpc(name,args);if(error)throw Error(error.message);return data as T}

export function readPreference(key:string){try{return localStorage.getItem(key)}catch{return null}}
