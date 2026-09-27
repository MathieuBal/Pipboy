import type {State,Entry,Token} from './data';
// Never overwrite a prepared or already revealed record when installing again.
export function mergeScenario(state:State,entries:Entry[],tokens:Token[]):State{
 const existing=new Set(state.entries.map(e=>e.id));const tokenIds=new Set((state.tokens||[]).map(t=>t.id));
 const enriched=state.entries.map(e=>{const template=entries.find(p=>p.id===e.id);if(!template)return e;return {...e,body:e.body||template.body,summary:['Portrait de personnage','Illustration de créature'].includes(e.summary)?template.summary:e.summary}});
 return {...state,entries:[...enriched,...entries.filter(e=>!existing.has(e.id)).map(e=>({...e,visible:false}))],tokens:[...(state.tokens||[]),...tokens.filter(t=>!tokenIds.has(t.id)).map(t=>({...t,visible:false}))],scenario:{...state.scenario,installed:true,completed:state.scenario?.completed||[],round:state.scenario?.round||1,effort:state.scenario?.effort??20,notes:state.scenario?.notes||''}};
}
