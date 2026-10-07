// btstate2 — utilidades para estados inline.
// SKELETON(card): convierte una TourCard en skeleton (imagen y 4 líneas en glass/surface).
// line(w,h): barra de skeleton. setText(t,s): cambia texto cargando sus fuentes. bindFill(n, var, op).
async function V(name){ const vs = await figma.variables.getLocalVariablesAsync('COLOR'); return vs.find(v=>v.name===name); }
function bp(v,op){ return {...figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',v), opacity:op}; }
async function line(w,h){ const r = figma.createFrame(); r.name='línea'; r.resize(w,h); r.cornerRadius=Math.min(8,h/2); r.fills=[bp(await V('glass/surface'),1)]; return r; }
async function SKELETON(card){
  const surf = await V('glass/surface');
  const img = card.children.find(c=>c.name.startsWith('img'));
  if(img){ for (const k of img.children.slice()) k.remove(); img.fills=[bp(surf,1)]; img.name='img (skeleton)'; }
  const body = card.children.find(c=>c.name==='body');
  if(body){ for (const k of body.children.slice()) k.remove(); body.layoutMode='VERTICAL'; body.itemSpacing=10;
    const W = body.width - body.paddingLeft - body.paddingRight;
    for (const [p,h] of [[0.75,18],[0.45,12],[0.9,12],[0.35,22]]){ const l=await line(Math.round(W*p),h); body.appendChild(l); } }
  for (const k of card.children.filter(c=>!['Cristal','body'].includes(c.name) && !c.name.startsWith('img'))) k.remove();
  card.name='TourCard/Skeleton';
  return card.height;
}
async function setText(t, s){ for (const fn of t.getRangeAllFontNames(0,t.characters.length)) await figma.loadFontAsync(fn); t.characters=s; t.name=s.slice(0,60); }
async function bindFill(n, name, op){ n.fills=[bp(await V(name), op==null?1:op)]; }
module.exports = {SKELETON, line, setText, bindFill, V, bp};
