export function collection(title,game){
 const groups=[['Keller','Famille Keller'],['Carrie Delaney','Carrie Delaney'],['Jason Grant','Jason Grant'],['Eddie Winter','Eddie Winter'],['Cher détective','Cher détective'],['Abri de Boston','Abri de Boston'],['A. 114','Abri 114'],['Dunwich','Dunwich'],['Station Randolph','Station Randolph'],['Sujet 12','Sujet 12'],['sujet de référence','Sujet de référence'],['Atom Cats','Poésie des Atom Cats'],["Annonces de l'école",'École'],['Veille féminine','Veille féminine auxiliaire'],['VEC','Recherche sur le VEC']];
 return groups.find(([word])=>title.toLocaleLowerCase('fr').includes(word.toLocaleLowerCase('fr')))?.[1]||(game==='Fallout 4'?'Commonwealth · Divers':game);
}
// Public category pages expose direct audio URLs even when the API is unavailable.
export function tapesFromHtml(html,game){
 const items=new Map();
 for(const match of html.matchAll(/<audio\b[^>]*\bsrc=["']([^"']+)["']/gi)){
  const url=new URL(match[1].replaceAll('&amp;','&'),'https://fallout-wiki.com');
  if(url.origin!=='https://fallout-wiki.com'||!url.pathname.startsWith('/images/')||!url.pathname.endsWith('.ogg'))continue;
  const raw=decodeURIComponent(url.pathname.split('/').at(-1));
  const title=raw.replace(/^(FO3|FO4|FO76|FNV|FONV)_/i,'').replace(/\.ogg$/i,'').replaceAll('_',' ');
  items.set(url.href,{id:'wiki-fr-'+raw.replace(/\.ogg$/i,''),title,game,series:collection(title,game),language:'Wiki FR',audio:url.href,sourceUrl:'https://fallout-wiki.com/Fichier:'+encodeURIComponent(raw)});
 }
 return [...items.values()];
}
