// btpat2 — piezas de apoyo para paneles y acciones.
// PANELHEAD(m, label, closeSrcId): barra superior del panel (texto text/muted + botón cerrar clonado).
// STACK(acc, primarios, par): acciones apiladas (primario arriba, fila secundaria de 2, peligro al final).
// SPACER(m, antesDe): espaciador con layoutGrow 1 para fijar las acciones abajo.
// fixCristals(root): ajusta cada "Cristal" al tamaño de su contenedor (salta hijos de instancias).
// Nota: setBoundVariableForPaint devuelve un objeto de solo lectura; la opacidad se aplica con spread.
async function varByName(name){ const vs = await figma.variables.getLocalVariablesAsync('COLOR'); return vs.find(v=>v.name===name); }
async function bindText(t, name){ const v = await varByName(name); const p={...figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',v), opacity:1}; t.fills=[p]; }
function inInstance(n){ let p=n.parent; while(p){ if(p.type==='INSTANCE') return true; p=p.parent; } return n.type==='INSTANCE'; }
async function PANELHEAD(m, label, closeSrcId){
  let bar = m.children.find(c=>c.name==='Barra');
  if(!bar){
    bar = figma.createFrame(); bar.name='Barra'; bar.fills=[]; bar.layoutMode='HORIZONTAL'; bar.primaryAxisAlignItems='SPACE_BETWEEN'; bar.counterAxisAlignItems='CENTER';
    bar.primaryAxisSizingMode='FIXED'; bar.counterAxisSizingMode='AUTO';
    const idx = m.children.findIndex(c=>c.name==='Cristal');
    m.insertChild(idx+1, bar); bar.layoutSizingHorizontal='FILL';
    await figma.loadFontAsync({family:'Inter',style:'Semi Bold'});
    const t = figma.createText(); t.fontName={family:'Inter',style:'Semi Bold'}; t.fontSize=14; t.characters=label; t.name=label;
    bar.appendChild(t); await bindText(t,'text/muted');
    const x = (await figma.getNodeByIdAsync(closeSrcId)).clone(); bar.appendChild(x);
  }
  return bar;
}
function STACK(acc, primaryNames, pairNames){
  acc.layoutWrap='NO_WRAP'; acc.layoutMode='VERTICAL'; acc.itemSpacing=10; acc.primaryAxisSizingMode='AUTO';
  let row = null;
  if (pairNames && pairNames.length){
    row = figma.createFrame(); row.name='Fila secundaria'; row.fills=[]; row.layoutMode='HORIZONTAL'; row.itemSpacing=10; row.counterAxisSizingMode='AUTO';
    acc.appendChild(row); row.layoutSizingHorizontal='FILL';
    for (const nm of pairNames){ const b = acc.children.find(c=>c.name===nm); if(b){ row.appendChild(b); b.layoutSizingHorizontal='FILL'; b.layoutSizingVertical='HUG'; b.primaryAxisAlignItems='CENTER'; } }
  }
  for (const b of acc.children){ if(b===row) continue; b.layoutSizingHorizontal='FILL'; b.layoutSizingVertical='HUG'; if(b.layoutMode) b.primaryAxisAlignItems='CENTER'; }
  for (const nm of (primaryNames||[]).slice().reverse()){ const b=acc.children.find(c=>c.name===nm); if(b) acc.insertChild(0,b); }
  if(row) acc.insertChild((primaryNames||[]).length, row);
  return acc.children.map(c=>c.name);
}
function SPACER(m, beforeName){
  let sp = m.children.find(c=>c.name==='Espaciador'); if(sp) return sp;
  sp = figma.createFrame(); sp.name='Espaciador'; sp.fills=[]; sp.resize(10,1);
  const idx = m.children.findIndex(c=>c.name===beforeName); m.insertChild(idx, sp); sp.layoutSizingHorizontal='FILL'; sp.layoutGrow=1; return sp;
}
function fixCristals(root){ for (const b of root.findAll(n=>n.children && n.children[0] && n.children[0].name==='Cristal')){ if(inInstance(b)) continue; const cr=b.children[0]; try{ cr.x=0; cr.y=0; cr.resize(b.width,b.height); }catch(e){} } }
module.exports = {PANELHEAD, STACK, SPACER, fixCristals, bindText, varByName, inInstance};
