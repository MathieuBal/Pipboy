export type Kind = 'location'|'person'|'creature'|'item'|'document'|'quest'|'holotape'|'terminal';
export type Entry = {id:string;type:Kind;title:string;summary:string;body:string;tags:string[];visible:boolean;status:string;x?:number;y?:number;audio?:string;image?:string;source?:string;sourceUrl?:string;links?:string[];mapId?:string};
export type Token = {id:string;name:string;image:string;mapImage:string;x:number;y:number;size:number;color:string;visible:boolean};
export type State = {name:string;cleanupVersion?:number;entries:Entry[];scenario?:{installed:boolean;completed:string[];round:number;effort:number;notes:string};tokens?:Token[];position:{x:number;y:number};mapImage:string;mapPositions?:Record<string,{x:number;y:number}>;log:{id:string;text:string;date:string}[]};
export const labels:Record<Kind,string>={location:'Lieux',person:'Personnes',creature:'Faune',item:'Objets',document:'Documents',quest:'Quêtes',holotape:'Holobandes',terminal:'Terminaux'};
export const initial:State={name:'Mission Smoky Waters',cleanupVersion:1,position:{x:.5,y:.5},mapImage:'',tokens:[],log:[],entries:[]};
export function newId(){return crypto.randomUUID()}
export function safeUrl(value:string){try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.href:''}catch{return ''}}

export function searchText(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim()}
