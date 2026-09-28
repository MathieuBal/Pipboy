import type {State,Entry} from './data';
// Match both legacy identity and title; preserve user-created records with reused IDs.
const examples:Record<string,string>={abri:'Abri 17',relais:'Station relais',halte:'La Halte',station:'Complexe Hélios',quete:'Une voix dans les ruines',note:'À celle qui sortira',mara:'Mara Voss',daniel:'Daniel Keller',faune:'Chien des friches',cle:'Clé du sas extérieur',soin:'Trousse de secours',bande:'01 — Le dernier matin',terminal:'Registre de l’abri'};
export function isLegacyExample(e:Entry){return examples[e.id]===e.title}
export function cleanCampaign(state:State):State{
 if((state.cleanupVersion||0)>=1)return state;
 const removed=new Set(state.entries.filter(isLegacyExample).map(e=>e.id));
 return {...state,cleanupVersion:1,name:state.name==='Les échos du silence'?'Mission Smoky Waters':state.name,mapImage:'',position:{x:.5,y:.5},log:[],entries:state.entries.filter(e=>!removed.has(e.id)).map(e=>({...e,visible:false,links:e.links?.filter(id=>!removed.has(id))})),tokens:(state.tokens||[]).filter(t=>!t.id.startsWith('pipboy-pointer-')).map(t=>({...t,visible:false}))};
}
