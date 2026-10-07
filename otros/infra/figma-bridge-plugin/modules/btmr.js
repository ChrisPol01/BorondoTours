// btmr — estados Desktop de Mis reservas a partir del estado móvil equivalente.
// MRSTATE(tipo, mobileId, pestaña): clona la base Desktop 93:83928, deja el encabezado y las
//   Pestañas, mueve el indicador (Cristal + peso Semi Bold) a la pestaña `pestaña` y clona el
//   contenido del panel móvil. tipo 'vacio' quita las pestañas y centra el vacío (padding 64).
// fitFrame(f, minH): alto = contenido + colofón (mín. 900), sidebar = alto − 32, fondo ambiental.
// Contadores de pestañas: activa = brand/turquesa-laguna con texto text/on-action;
//   inactivas = brand/azul-condor con texto brand/blanco-niebla.
async function setActiveTab(tabs, idx){
  const items = tabs.children.filter(c=>c.name!=='Cristal');
  const cur = items.find(it=>it.children.some(k=>k.name==='Cristal'));
  const tgt = items[idx];
  if(cur && tgt && cur!==tgt){
    const cr = cur.children.find(k=>k.name==='Cristal'); tgt.insertChild(0, cr);
    const tc = cur.findOne(n=>n.type==='TEXT'), tt = tgt.findOne(n=>n.type==='TEXT');
    const fam = tc.fontName.family;
    await figma.loadFontAsync({family:fam,style:'Regular'}); await figma.loadFontAsync({family:fam,style:'Semi Bold'});
    tc.fontName={family:fam,style:'Regular'}; tt.fontName={family:fam,style:'Semi Bold'};
    if(cr){ cr.x=0; cr.y=0; cr.resize(tgt.width,tgt.height); }
  }
}
function fitFrame(f, minH){
  const c = f.children.find(k=>k.name==='Contenido');
  const col = f.children.find(k=>k.name.startsWith('Colofón'));
  const H = Math.max(minH||900, Math.ceil(c.y + c.height + 48 + (col?col.height:0)));
  f.resize(f.width, H);
  if(col) col.y = H - col.height;
  const sb = f.children.find(k=>k.name.startsWith('Sidebar')); if(sb) sb.resize(sb.width, H-32);
  const amb = f.children.find(k=>k.name==='Fondo ambiental'); if(amb) amb.resize(amb.width, H);
  return H;
}
async function MRSTATE(kind, mobileId, tabIdx){
  const base = await figma.getNodeByIdAsync('93:83928');
  const f = base.clone();
  const c = f.children.find(k=>k.name==='Contenido');
  for (const k of c.children.slice()) if(!(k.name==='frame' && k===c.children[0]) && k.name!=='Pestañas') k.remove();
  const tabs = c.children.find(k=>k.name==='Pestañas');
  const mob = await figma.getNodeByIdAsync(mobileId);
  const panel = mob.children.find(k=>k.name==='Contenido').children[0];
  if(kind==='vacio'){
    if(tabs) tabs.remove();
    const p = panel.clone(); c.appendChild(p); p.layoutSizingHorizontal='FILL';
    p.paddingTop = 64; p.paddingBottom = 64;
  } else {
    await setActiveTab(tabs, tabIdx);
    for (const k of panel.children){ if(k.name==='Cristal'||k.name==='Pestañas') continue; const cl=k.clone(); c.appendChild(cl); cl.layoutSizingHorizontal='FILL'; }
  }
  c.layoutSizingVertical='HUG';
  const Q = await bridge.require('btpat2'); Q.fixCristals(c);
  return f;
}
module.exports = {MRSTATE, setActiveTab, fitFrame};
