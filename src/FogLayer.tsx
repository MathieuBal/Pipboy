import type {Token} from './data';
import {coveredCells} from './fog';
export default function FogLayer({tokens,scene,gm=false,editing=false,mode='reveal',busy=false,onPaint}:{tokens:Token[];scene:string;gm?:boolean;editing?:boolean;mode?:'reveal'|'hide';busy?:boolean;onPaint?:(index:number)=>void}){
 const covered=coveredCells(tokens,scene);
 return <>{covered.size>0&&<div className={'fog-cover '+(gm?'gm-fog':'')} aria-label={gm?'Zones masquées au joueur':'Zones inexplorées'}>{[...covered].map(i=><span className="fog-tile" key={i} style={{left:(i%8)*12.5+'%',top:Math.floor(i/8)*12.5+'%'}}/>)}</div>}{editing&&gm&&<div className="fog-editor" aria-label="Édition du brouillard">{Array.from({length:64},(_,i)=><button key={i} disabled={busy} aria-label={(mode==='reveal'?'Dévoiler':'Masquer')+' zone '+(i+1)} className={covered.has(i)?'covered':''} onClick={e=>{e.stopPropagation();onPaint?.(i)}}>{i+1}</button>)}</div>}</>;
}
