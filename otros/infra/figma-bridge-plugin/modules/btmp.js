// btmp — estados móviles de pasaporte del Checkout Paso 2 sobre la pantalla completa (93:81527).
// PASS(frameId, subtítulo, deshabilitado): REBASE sobre el Paso 2 móvil, reemplaza la tarjeta
//   expandida de la viajera 2 por una tarjeta colapsada (clon de la del viajero 3) con `subtítulo`,
//   inserta debajo el panel de residencia (Pendiente / Cargado) sin su botón propio y reajusta
//   alto y "Barra fija inferior". El CTA de la barra queda al 50 % si `deshabilitado`.
// Nota: en el pendiente, los "Radios" se apilan en vertical, FILL, mínimo 44 px de alto.
async function setTxt(t, s){ for(const fn of t.getRangeAllFontNames(0,t.characters.length)) await figma.loadFontAsync(fn); t.characters=s; t.name=s.slice(0,60); }
async function PASS(fid, sub, disabled){
  const R = await bridge.require('btrebase'); const Q = await bridge.require('btpat2');
  const frag = await figma.getNodeByIdAsync(fid);
  const panel = frag.children.find(k=>k.name==='Contenido').children[0].clone(); figma.currentPage.appendChild(panel);
  const base = await figma.getNodeByIdAsync('93:81527');
  const bar0 = base.children.find(k=>k.name==='Barra fija inferior'); const gapBottom = base.height - (bar0.y+bar0.height);
  const c0 = base.children.find(k=>k.name==='Contenido'); const gapBar = bar0.y - (c0.y+c0.height);
  await R.REBASE(fid, '93:81527', []);
  const f = await figma.getNodeByIdAsync(fid);
  const c = f.children.find(k=>k.name==='Contenido');
  const maria = c.children[1], tomas = c.children[2];
  const card = tomas.clone(); c.insertChild(1, card); maria.remove();
  const ts = card.findAll(n=>n.type==='TEXT');
  await setTxt(ts.find(t=>t.characters==='3'),'2');
  await setTxt(ts.find(t=>/Tomás/.test(t.characters)),'María Fernanda López');
  await setTxt(ts.find(t=>/Niño/.test(t.characters)), sub);
  c.insertChild(2, panel); panel.layoutSizingHorizontal='FILL';
  const btn = panel.children.find(k=>k.name.startsWith('Button/')); if(btn) btn.remove();
  Q.fixCristals(c);
  const bar = f.children.find(k=>k.name==='Barra fija inferior');
  const H = Math.ceil(c.y + c.height + gapBar + bar.height + gapBottom);
  f.resize(f.width, H); bar.y = H - gapBottom - bar.height;
  const amb=f.children.find(k=>k.name==='Fondo ambiental'); if(amb) amb.resize(f.width,H);
  const cta = bar.children.find(k=>k.name.startsWith('Button/')); if(cta) cta.opacity = disabled?0.5:1;
  return {H, n:c.children.map(k=>k.name.slice(0,30)+'|'+Math.round(k.height))};
}
module.exports = {PASS};
