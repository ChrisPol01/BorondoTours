// btregen — regenerar las copias Claro / Oscuro desde el canónico Colorido.
// ONE(canonId, tema): clona el canónico en el tablero del tema, en la misma x/y (los tres tableros
//   comparten geometría), copia opacidades (COPYOP), cambia variables al tema (APPLY), re-vincula
//   gradientes y efectos (btmx2.GRAD/FX), escribe el color resuelto (SYNC) y borra la copia vieja.
//   Si falta el pie de foto en el tablero del tema, lo clona del Colorido (sin APPLY: en textos
//   sueltos falla con "not a function"; copia el color de otro texto del tablero).
// BATCH(n): versión simple sin manejo de errores. Usar btregen2.RUN.
// Plan guardado en bridge.store 'regenPlan' = {plan:{Claro:[{canon,…}],Oscuro:[…]}, done:{…}, err:{…}}.
async function ONE(canonId, theme){
  const T = await bridge.require('btt'); const X = await bridge.require('btmx2');
  const G = await bridge.store.get('geo2'); const sec = await figma.getNodeByIdAsync(G.secs[theme]); const colS = await figma.getNodeByIdAsync(G.secs.Colorido);
  const canon = await figma.getNodeByIdAsync(canonId);
  const olds = sec.children.filter(f=>f.type==='FRAME' && f.getPluginData('src')===canonId);
  const c = canon.clone(); sec.appendChild(c); T.COPYOP(canon,c); c.x=canon.x; c.y=canon.y; c.name = canon.name+' · '+theme;
  for (const k of ['row','dev','cell']) c.setPluginData(k, canon.getPluginData(k));
  c.setPluginData('canon',''); c.setPluginData('src',canon.id); c.setPluginData('theme',theme);
  T.APPLY(c,theme); c.setPluginData('theme',theme); X.GRAD(c); X.FX(c); T.SYNC(c);
  for (const o of olds) o.remove();
  const cap = colS.children.find(t=>t.type==='TEXT' && Math.abs(t.x-canon.x)<2 && t.y<canon.y && canon.y-t.y<70);
  if (cap && !sec.children.some(t=>t.type==='TEXT' && Math.abs(t.x-cap.x)<2 && Math.abs(t.y-cap.y)<2)){
    const cc=cap.clone(); sec.appendChild(cc); cc.x=cap.x; cc.y=cap.y;
    const refT=sec.children.find(t=>t.type==='TEXT' && t!==cc); if(refT) cc.fills=JSON.parse(JSON.stringify(refT.fills));
  } else if (cap){
    const ex = sec.children.find(t=>t.type==='TEXT' && Math.abs(t.x-cap.x)<2 && Math.abs(t.y-cap.y)<2);
    if(ex && ex.characters!==cap.characters){ for(const fn of ex.getRangeAllFontNames(0,ex.characters.length)) await figma.loadFontAsync(fn); ex.characters=cap.characters; }
  }
  return c.id;
}
module.exports = {ONE};
