import {useEffect,useRef,useState} from 'react';
import {Map,Eye,Send,Check} from 'lucide-react';
import {campaignMaps,mapUrl,findMap,type CampaignMap} from './maps';
export default function MapLibrary({activeImage,busy,onDisplay}:{activeImage:string;busy:boolean;onDisplay:(map:CampaignMap|null)=>Promise<boolean>}){
 const [preview,setPreview]=useState<CampaignMap|null>(null);
 const [imageError,setImageError]=useState(false);
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{setImageError(false);if(preview){panel.current?.scrollIntoView({block:'start',behavior:'instant'});panel.current?.focus({preventScroll:true})}},[preview]);
 const active=findMap(activeImage);
 return <main className="catalog-page map-library"><div className="section-title"><div><span className="eyebrow">CARTES / RÉSERVE DU MJ</span><h1>Bibliothèque de cartes<span>_</span></h1></div><span className="counter">5 CARTES · MISSION SMOKY WATERS</span></div>
 <p className="library-intro">Prévisualisez un lieu, puis affichez-le dans le module MAP du joueur. Le choix et le marqueur sont enregistrés. Ces plans interprètent le scénario ; ils ne sont pas les cartes officielles. La carte régionale est un schéma sans échelle.</p>
 <p className="info">Carte affichée : {active?.title||(activeImage?'Carte personnalisée':'Commonwealth · Fallout 4')}</p>
 {preview&&<section ref={panel} tabIndex={-1} className="map-preview" aria-label="Prévisualisation de carte"><h2>{preview.title}</h2><p>{preview.description}</p><img key={preview.id} src={mapUrl(preview)} alt={'Prévisualisation : '+preview.title} onError={()=>setImageError(true)}/>{imageError&&<p role="alert">L’image n’a pas pu être chargée. Fermez puis rouvrez la prévisualisation pour réessayer.</p>}<div className="preview-actions"><button className="primary" disabled={busy||imageError||active?.id===preview.id} onClick={()=>void onDisplay(preview)}><Send size={17}/>Afficher sur le Pip-Boy</button><button onClick={()=>setPreview(null)}>Fermer la prévisualisation</button></div></section>}
 <div className="cards map-cards">{campaignMaps.map(map=><article key={map.id} className="card"><img loading="lazy" decoding="async" src={mapUrl(map)} alt={map.title}/><div className="card-top"><Map size={19}/><span>{map.kind==='region'?'TRAJET RÉGIONAL':'PLAN LOCAL'}</span>{active?.id===map.id&&<span className="badge"><Check size={14}/>Affichée</span>}</div><h2>{map.title}</h2><p>{map.description}</p><div className="tape-actions"><button onClick={()=>setPreview(map)}><Eye size={16}/>Prévisualiser</button><button disabled={busy||active?.id===map.id} onClick={()=>void onDisplay(map)}><Send size={16}/>{active?.id===map.id?'Affichée':'Afficher sur le Pip-Boy'}</button></div></article>)}</div>
 <div className="preview-actions"><button disabled={busy||!activeImage} onClick={()=>void onDisplay(null)}>Revenir au Commonwealth</button></div><p className="library-credit">Illustrations créées pour cette campagne avec une IA. Versions joueuse sans indications secrètes. Les images sont publiques ; n’y inscrivez pas de secrets de campagne.</p>
 </main>
}
