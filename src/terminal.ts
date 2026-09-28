import type {State,Entry,TerminalRecord} from './data';
export const normalizeCode=(code:string)=>code.trim().toUpperCase();
export function terminalEntry(t:TerminalRecord):Entry{return {id:'terminal-note-'+t.id,type:'terminal',title:t.title,summary:'Document déverrouillé au terminal',body:t.body,tags:['Terminal'],visible:true,status:'Déverrouillé'}}
export function unlockLocal(state:State,code:string){const matches=(state.terminals||[]).filter(t=>t.enabled&&t.code===normalizeCode(code));if(matches.length!==1)throw Error('Code incorrect ou désactivé.');const entry=terminalEntry(matches[0]);return {entry,state:{...state,entries:[...state.entries.filter(e=>e.id!==entry.id),entry]}}}
