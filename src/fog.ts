import type {Token} from './data';
export const FOG_GRID=8;
export function fogIndex(t:{id:string}){const m=/^pipboy-fog-(\d+)-/.exec(t.id);return m&&Number(m[1])<64?Number(m[1]):-1}
export const isFog=(t:{id:string})=>fogIndex(t)>=0;
export function coveredCells(tokens:Token[],scene:string){return new Set(tokens.filter(t=>isFog(t)&&t.mapImage===scene&&t.visible).map(fogIndex))}
export function obscured(tokens:Token[],scene:string,x:number,y:number){const index=Math.min(7,Math.max(0,Math.floor(y*8)))*8+Math.min(7,Math.max(0,Math.floor(x*8)));return coveredCells(tokens,scene).has(index)}
export function paintFog(tokens:Token[],scene:string,cells:number[],covered:boolean):Token[]{
 const indices=new Set(cells.filter(i=>Number.isInteger(i)&&i>=0&&i<64));const existing=new Set<number>();
 const result=tokens.map(t=>{if(t.mapImage!==scene||!isFog(t))return t;const i=fogIndex(t);existing.add(i);return indices.has(i)?{...t,visible:covered}:t});
 for(const i of indices){if(existing.has(i)||!covered)continue;result.push({id:'pipboy-fog-'+i+'-'+crypto.randomUUID(),name:'Zone masquée',image:'',mapImage:scene,x:(i%8+.5)/8,y:(Math.floor(i/8)+.5)/8,size:.06,color:'#070e0a',visible:true})}
 return result;
}
export function brushCells(index:number,wide:boolean){const x=index%8,y=Math.floor(index/8),cells:number[]=[];for(let dy=wide?-1:0;dy<=(wide?1:0);dy++)for(let dx=wide?-1:0;dx<=(wide?1:0);dx++)if(x+dx>=0&&x+dx<8&&y+dy>=0&&y+dy<8)cells.push((y+dy)*8+x+dx);return cells}
