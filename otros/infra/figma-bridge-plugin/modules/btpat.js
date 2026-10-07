// btpat — patrones de interrupción (decisión 2026-09-29).
// DIALOG(f): diálogo bloqueante 480 px + velo con desenfoque (fill #0F1A2B 30 %, Background Blur 20), centrado en el viewport (900).
// PANEL(f): panel lateral derecho 480 px, alto = viewport − 32, velo leve (20 %, blur 8).
// POPOVER(f, x, y, W): popover anclado (menú de cuenta, notificaciones) sin velo.
// El frame debe tener un hijo "Modal · …" (auto-layout vertical con "Cristal" como primer hijo).
const VIEW = 900;
function veloFill(op){ return [{type:'SOLID',color:{r:0.06,g:0.10,b:0.17},opacity:op}]; }
function setVelo(f, op, blur){
  let v = f.children.find(c=>c.name==='Velo');
  if(!v){ v = figma.createRectangle(); v.name='Velo'; f.appendChild(v); }
  v.resize(f.width, f.height); v.x=0; v.y=0;
  v.fills = veloFill(op);
  v.effects = blur ? [{type:'BACKGROUND_BLUR',radius:blur,visible:true}] : [];
  return v;
}
function widen(m, W, pad){
  m.layoutMode='VERTICAL'; m.primaryAxisSizingMode='AUTO'; m.counterAxisSizingMode='FIXED';
  m.paddingTop=m.paddingBottom=m.paddingLeft=m.paddingRight=pad;
  m.resize(W, m.height);
  for (const c of m.children){ if(c.name==='Cristal') continue; if(c.layoutPositioning==='ABSOLUTE') continue; try{ c.layoutSizingHorizontal='FILL'; }catch(e){} }
  // descendientes que conservaban el ancho fijo del modal viejo (390 − 2·32) → FILL
  for (const d of m.findAll(n=>n.parent && n.parent.layoutMode && n.layoutPositioning!=='ABSOLUTE')){
    try{ if (d.parent.layoutMode==='VERTICAL' && d.layoutSizingHorizontal==='FIXED' && Math.abs(d.width-(390-2*32))<3) d.layoutSizingHorizontal='FILL'; }catch(e){}
  }
  fitCristal(m);
}
function fitCristal(m){ const cr=m.children.find(c=>c.name==='Cristal'); if(cr){ cr.x=0; cr.y=0; cr.resize(m.width,m.height); } }
function modalOf(f){ return f.children.find(c=>c.name && c.name.startsWith('Modal')); }
function DIALOG(f){
  const m = modalOf(f); setVelo(f, 0.30, 20);
  widen(m, 480, 32); m.itemSpacing = Math.max(m.itemSpacing||0, 20); m.cornerRadius=24;
  const vh = Math.min(f.height, VIEW);
  m.x = Math.round((f.width-480)/2); m.y = Math.max(40, Math.round((vh - m.height)/2));
  fitCristal(m);
  f.setPluginData('pattern','dialog');
  return [m.width, m.height, m.y];
}
function PANEL(f){
  const m = modalOf(f); setVelo(f, 0.20, 8);
  widen(m, 480, 28); m.cornerRadius=24;
  const vh = Math.min(f.height, VIEW);
  m.primaryAxisSizingMode='FIXED'; m.resize(480, vh-32);
  m.x = f.width-480-16; m.y = 16; fitCristal(m);
  f.setPluginData('pattern','panel');
  return [m.width, m.height];
}
function POPOVER(f, x, y, W){
  const m = modalOf(f); const v=f.children.find(c=>c.name==='Velo'); if(v) v.remove();
  widen(m, W, 16); m.cornerRadius=20; m.x=x; m.y=y; fitCristal(m);
  f.setPluginData('pattern','popover');
  return [m.width, m.height];
}
module.exports = {DIALOG, PANEL, POPOVER, setVelo, widen, fitCristal, modalOf, VIEW};
