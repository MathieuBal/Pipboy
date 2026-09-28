import {useEffect,useState} from 'react';
import type {Token} from './data';
import {isPointer} from './campaignBackup';
export function newPointer(mapImage:string,x:number,y:number):Token{return {id:'pipboy-pointer-'+Date.now()+'-'+crypto.randomUUID(),name:'Repère du MJ',mapImage,image:'',x,y,size:.04,color:'#ffe38b',visible:true}}
export default function MapPing({tokens,scene}:{tokens:Token[];scene:string}){
 const [now,setNow]=useState(Date.now());useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(timer)},[tokens]);
 const latest=tokens.filter(t=>isPointer(t)&&t.visible&&t.mapImage===scene&&now-Number(t.id.split('-')[2])<20000&&now>=Number(t.id.split('-')[2])-3000).at(-1);
 if(!latest)return null;
 return <span className="map-ping" role="status" aria-label="Repère du MJ sur la carte" style={{left:latest.x*100+'%',top:latest.y*100+'%'}}><span className="ping-ring"/><span className="ping-label">Regarde ici</span></span>;
}
