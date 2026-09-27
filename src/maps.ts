export type CampaignMap={id:string;title:string;description:string;file:string;kind:'region'|'local';start:{x:number;y:number}};
export const campaignMaps:CampaignMap[]=[
 {id:'smoky-region',title:'Missouri · Mission Smoky Waters',description:'Schéma de trajet : Abri 50, Deer Park, Jefferson et Smoky Waters. Disposition narrative, sans échelle géographique.',file:'maps/smoky/region.webp',kind:'region',start:{x:.19,y:.14}},
 {id:'smoky-abri',title:'Abri 50 · Secteur de départ',description:'Bureau du superviseur, archives, infirmerie, cuisine, sécurité et sas. Plan interprété à partir du scénario.',file:'maps/smoky/abri-50.webp',kind:'local',start:{x:.46,y:.38}},
 {id:'smoky-deer',title:'Deer Park · Station-service',description:'Route, ruines et garage des marchands. Bâtiments en coupe, sans personnages ni ennemis.',file:'maps/smoky/deer-park.webp',kind:'local',start:{x:.4,y:.94}},
 {id:'smoky-jefferson',title:'Jefferson · Centre du village',description:'Place, mairie, auberge et marché. Plan de jeu interprété, sans personnages ni secrets MJ.',file:'maps/smoky/jefferson.webp',kind:'local',start:{x:.47,y:.92}},
 {id:'smoky-station',title:'Smoky Waters · Station météo',description:'Approche du marais et station en coupe. Version joueuse, sans ennemis ni points d’apparition indiqués.',file:'maps/smoky/station.webp',kind:'local',start:{x:.13,y:.92}}
];
export function mapUrl(map:CampaignMap){return new URL(import.meta.env.BASE_URL+map.file,window.location.href).href}
export function findMap(url:string){return campaignMaps.find(map=>url===mapUrl(map))}
export function mapKey(url:string){return findMap(url)?.id||url||'commonwealth'}
export const regionalLabels=[{title:'Abri 50',x:.19,y:.14},{title:'Deer Park',x:.33,y:.34},{title:'Jefferson',x:.46,y:.66},{title:'Smoky Waters',x:.83,y:.73}];
