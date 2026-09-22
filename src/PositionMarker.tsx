import {useRef,useState} from 'react';
import {Crosshair} from 'lucide-react';
type Point={x:number;y:number};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export default function PositionMarker({position,editable,busy,onCommit}:{position:Point;editable:boolean;busy:boolean;onCommit:(point:Point)=>Promise<boolean>}){
 const [preview,setPreview]=useState<Point|null>(null);
 const drag=useRef<{x:number;y:number;moved:boolean}|null>(null);
 const current=preview||position;
 const point=(e:React.PointerEvent<HTMLButtonElement>)=>{const r=e.currentTarget.parentElement!.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height)}};
 async function commit(p:Point){setPreview(p);try{await onCommit(p)}finally{setPreview(null)}}
 return <button aria-label={editable?'Position du joueur, déplaçable par le MJ':'Position actuelle du joueur'} aria-description={editable?'Glissez le marqueur ou utilisez les flèches du clavier.':undefined} tabIndex={editable?0:-1} className={'player-marker '+(editable?'draggable':'')} style={{left:current.x*100+'%',top:current.y*100+'%'}} onClick={e=>e.stopPropagation()} onPointerDown={e=>{if(!editable||busy||e.button!==0)return;e.stopPropagation();drag.current={x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current)return;e.stopPropagation();if(Math.hypot(e.clientX-drag.current.x,e.clientY-drag.current.y)>4)drag.current.moved=true;if(drag.current.moved)setPreview(point(e))}} onPointerCancel={()=>{drag.current=null;setPreview(null)}} onPointerUp={e=>{if(!drag.current)return;e.stopPropagation();const moved=drag.current.moved;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(moved)void commit(point(e));else setPreview(null)}} onKeyDown={e=>{if(!editable||busy)return;const direction:Record<string,Point>={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};const d=direction[e.key];if(!d)return;e.preventDefault();const step=e.shiftKey?.05:.01;void commit({x:clamp(position.x+d.x*step),y:clamp(position.y+d.y*step)})}}><Crosshair size={24}/></button>
}
