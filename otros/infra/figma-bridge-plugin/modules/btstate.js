// btstate — colocar estados nuevos en el tablero Colorido y estado "fecha agotada" del Detalle.
// PLACE(node, fila, celda, 'D'|'M', nombre): mueve el frame a su celda (geo2), escribe pluginData
//   (theme, row, dev, cell, canon=1) y crea el pie de foto (24 px desktop / 18 px móvil).
// setLayout(fila, placeholder 'N:…', id): reemplaza el placeholder en bridge.store 'layout2'.
// AGOTADO(f): tarjeta de reserva del Detalle con la fecha sáb 17 oct agotada, aviso y
//   "Avísame si se abre un cupo" / "Ver otras fechas" (piezas clonadas del estado móvil 124:19122).
async function PLACE(node, rowKey, cell, dev, name){
  const B = await bridge.require('btboard'); await B.fonts();
  const geo = await bridge.store.get('geo2'); const g = geo.geo.find(r=>r.key===rowKey);
  const sec = await figma.getNodeByIdAsync('132:33618');
  const x = dev==='D' ? geo.PAD+geo.LABEL+cell*geo.DX : geo.PAD+geo.LABEL+cell*geo.MX;
  const y = dev==='D' ? g.dY : g.mY;
  node.name = name;
  B.place(sec, node, x, y, {theme:'Colorido', row:rowKey, dev, cell, canon:1});
  node.setPluginData('src','');
  const t = B.txt(sec, name, x, y-(dev==='D'?44:38), dev==='D'?24:18, 'Semi Bold');
  if(dev==='M'){ t.textAutoResize='HEIGHT'; t.resize(380,t.height); }
  return [x,y];
}
async function setLayout(rowKey, placeholder, id){
  const lay = await bridge.store.get('layout2'); const r = lay.find(x=>x[0]===rowKey);
  const i = r[2].indexOf(placeholder); if(i>=0) r[2][i]=id; await bridge.store.set('layout2', lay); return i;
}
async function AGOTADO(f){
  const card = f.findOne(n=>n.name==='Reserva (fija al hacer scroll)');
  const cal = card.findOne(n=>n.name==='Calendario semáforo');
  const grid = cal.children[1];
  const d10 = grid.children.find(n=>n.name==='Día 10'); const d17 = grid.children.find(n=>n.name==='Día 17');
  d17.fills = JSON.parse(JSON.stringify(d10.fills));
  const t10 = d10.findOne(n=>n.type==='TEXT'), t17 = d17.findOne(n=>n.type==='TEXT'); t17.fills = JSON.parse(JSON.stringify(t10.fills));
  const vs = await figma.variables.getLocalVariablesAsync('COLOR'); const vP = vs.find(v=>v.name==='text/primary');
  const st = figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',vP); d17.strokes=[st]; d17.strokeWeight=2; d17.strokeAlign='INSIDE';
  const dl = card.findAllWithCriteria({types:['TEXT']}).find(t=>/^Sáb 17 oct · Salida/.test(t.characters));
  for (const fn of dl.getRangeAllFontNames(0,dl.characters.length)) await figma.loadFontAsync(fn);
  dl.characters = 'Sáb 17 oct · Salida 6:00 a. m. · Agotado'; dl.name = dl.characters;
  const dateRow = dl.parent;
  const kill = card.children.filter(c=> c.name==='Viajeros' || c.name==='Adicionales' || c.name.startsWith('Button/cta') || (c.type==='FRAME' && c.height<=2 && c.name==='frame') || (c.findOne && c.findOne(k=>k.type==='TEXT' && (/^Total$/.test(k.characters) || /^Reserva con un abono/.test(k.characters)))) );
  for (const k of kill) k.remove();
  let idx = card.children.indexOf(dateRow)+1;
  for (const sid of ['124:19144','124:19150','124:19155']){ const c=(await figma.getNodeByIdAsync(sid)).clone(); card.insertChild(idx++, c); c.layoutSizingHorizontal='FILL'; }
  const Q = await bridge.require('btpat2'); Q.fixCristals(card);
  const cr = card.children.find(c=>c.name==='Cristal'); if(cr){ cr.x=0; cr.y=0; cr.resize(card.width, card.height); }
  return {killed: kill.length, h: card.height};
}
module.exports = {PLACE, setLayout, AGOTADO};
