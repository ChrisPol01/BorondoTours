// btmsheet — estados móviles de interrupción (design.md §8f).
// SHEET(frameId, baseId, opacidad, blur): monta la "Hoja inferior" existente sobre la pantalla de
//   origen (baseId). Borra todo menos Velo / Hoja inferior / Toast, clona los hijos de la base que
//   caben en el alto del frame, aplica el velo (#0F1A2B al `opacidad`, blur de fondo `blur`) y pega
//   la hoja al borde inferior. Diálogos: (0.3, 20). Menús ligeros: (0.2, 0) — sin desenfoque.
// FULL(frameId): convierte la hoja en pantalla completa (panel lateral / notificaciones en móvil):
//   quita velo y asa, radio 0, alto = frame, y la renombra "Pantalla completa".
//   Después se agrega la "Barra volver" (chevron-left + etiqueta) como primer hijo.
async function SHEET(fid, baseId, op, blur){
  const P = await bridge.require('btpat');
  const f = await figma.getNodeByIdAsync(fid); const base = await figma.getNodeByIdAsync(baseId);
  const H = f.height, W = f.width;
  const keep = f.children.filter(c=>c.name==='Velo'||c.name==='Hoja inferior'||c.name.startsWith('Toast'));
  for (const c of f.children.slice()) if(!keep.includes(c)) c.remove();
  f.fills = JSON.parse(JSON.stringify(base.fills)); f.clipsContent = true;
  let i=0; for (const c of base.children){ if(c.y > H) continue; const cl=c.clone(); f.insertChild(i++, cl); cl.x=c.x; cl.y=c.y; }
  const amb = f.children.find(c=>c.name==='Fondo ambiental'); if(amb) amb.resize(W, H);
  P.setVelo(f, op, blur);
  const v = f.children.find(c=>c.name==='Velo'); const h = f.children.find(c=>c.name==='Hoja inferior');
  if(h){ f.appendChild(v); f.appendChild(h); h.y = H - h.height; }
  f.setPluginData('sheetBase', baseId);
  return {n:f.children.length, top:f.children.map(c=>c.name.slice(0,20))};
}
async function FULL(fid){
  const f = await figma.getNodeByIdAsync(fid); const h = f.children.find(c=>c.name==='Hoja inferior');
  const v = f.children.find(c=>c.name==='Velo'); if(v) v.remove();
  const asa = h.children.find(c=>c.name==='Asa'); if(asa) asa.remove();
  h.y = 0; h.x = 0; h.cornerRadius = 0;
  if(h.layoutMode!=='NONE'){ h.primaryAxisSizingMode='FIXED'; h.paddingTop = Math.max(h.paddingTop, 56); }
  h.resize(f.width, f.height);
  const cr = h.children.find(c=>c.name==='Cristal'); if(cr){ cr.x=0; cr.y=0; cr.resize(h.width,h.height); cr.cornerRadius=0; }
  h.name = 'Pantalla completa'; f.setPluginData('fullscreen','1');
  return {h:h.height};
}
module.exports = {SHEET, FULL};
