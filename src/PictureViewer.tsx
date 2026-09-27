import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
export default function PictureViewer({title,image,onClose}:{title:string;image:string;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [failed,setFailed]=useState(false);
 useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close()},[]);
 return <dialog className="picture-viewer" ref={dialog} aria-label={title} onCancel={e=>{e.preventDefault();onClose()}}><header><h2>{title}</h2><button aria-label="Fermer l’illustration" onClick={onClose}><X/></button></header><div className="picture-body"><img src={image} alt={title} onError={()=>setFailed(true)}/>{failed&&<p role="alert">L’image n’a pas pu être chargée. Fermez puis rouvrez cette illustration pour réessayer.</p>}<a href={image} target="_blank" rel="noreferrer">Ouvrir l’image seule</a></div></dialog>
}
