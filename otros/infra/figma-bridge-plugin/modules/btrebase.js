// btrebase — REBASE(frameId, baseId, keep): cambia la pantalla base de un estado conservando su id
// (así no hay que remapear reacciones ni flujos). Borra los hijos que no están en `keep`
// (por defecto Velo / Modal / Toast), clona los hijos de la base y ajusta tamaño y velo.
async function REBASE(frameId, baseId, keep){
  keep = keep || ['Velo','Modal','Toast'];
  const f = await figma.getNodeByIdAsync(frameId); const base = await figma.getNodeByIdAsync(baseId);
  const isKeep = c => keep.some(k=>c.name===k || c.name.startsWith(k+' ') || c.name.startsWith(k+' ·'));
  const kept = f.children.filter(isKeep);
  for (const c of f.children.slice()) if(!kept.includes(c)) c.remove();
  f.resize(base.width, base.height);
  f.fills = JSON.parse(JSON.stringify(base.fills)); f.clipsContent = base.clipsContent;
  let i=0; for (const c of base.children){ const cl=c.clone(); f.insertChild(i++, cl); cl.x=c.x; cl.y=c.y; }
  const v = f.children.find(c=>c.name==='Velo'); if(v){ v.resize(f.width,f.height); v.x=0; v.y=0; }
  return {h:f.height, kept: kept.map(k=>k.name), n:f.children.length};
}
module.exports = {REBASE};
