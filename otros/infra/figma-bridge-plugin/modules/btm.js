// Módulo `btm` — pantallas móviles (390 px). Depende de `bt`.
// shell(name,x,y,{top,topId,y,gap,fill}) crea el frame con la barra superior (51:4504 fondo claro por defecto).
// finish(p,col,tab) agrega la barra inferior (36:1740), marca la pestaña activa y ajusta el alto.
const bt=bridge.require('bt'); const {F,T,I,sol}=bt;
function activeTab(bot,label){
  const tabs=bot.children; const act=tabs.find(t=>t.fills&&t.fills.length&&t.fills[0].opacity!==0);
  const tb=tabs.find(t=>t.findOne(n=>n.type==='TEXT'&&n.characters===label)); if(!act||!tb||act===tb) return;
  const sw=(x,y)=>{const s=[x.fills,x.strokes,x.effects]; x.fills=y.fills; x.strokes=y.strokes; x.effects=y.effects; y.fills=s[0]; y.strokes=s[1]; y.effects=s[2];}; sw(act,tb);
  const la=act.findOne(n=>n.type==='TEXT'&&!/^\d+$/.test(n.characters)), lb=tb.findOne(n=>n.type==='TEXT'&&n.characters===label);
  const f=[la.fills,la.fontName]; la.fills=lb.fills; la.fontName=lb.fontName; lb.fills=f[0]; lb.fontName=f[1];
  const ia=act.findOne(n=>n.name&&n.name.startsWith('icon/')), ib=tb.findOne(n=>n.name&&n.name.startsWith('icon/'));
  const ca=ia.findOne(v=>'strokes' in v&&v.strokes.length).strokes, cb=ib.findOne(v=>'strokes' in v&&v.strokes.length).strokes;
  ia.findAll(v=>'strokes' in v&&v.strokes.length).forEach(v=>v.strokes=cb); ib.findAll(v=>'strokes' in v&&v.strokes.length).forEach(v=>v.strokes=ca);
}
function shell(name,x,y,o={}){
  figma.currentPage.children.filter(c=>c.name===name).forEach(c=>c.remove());
  const p=F(figma.currentPage,{name,w:390,h:1200,x,y,fill:o.fill||'bl',clip:true});
  if(o.top!==false){const top=figma.getNodeById(o.topId||'51:4504').createInstance(); p.appendChild(top); top.x=16; top.y=12;}
  const col=F(p,{name:'Contenido',dir:'v',gap:o.gap??16,w:358,x:16,y:o.y??80});
  return {p,col};
}
function finish(p,col,tab){
  let bot=null; if(tab){ bot=figma.getNodeById('36:1740').createInstance(); p.appendChild(bot); activeTab(bot,tab); }
  const H=Math.round(col.y+col.height+(bot?bot.height+40:40)); p.resize(390,H); if(bot){bot.x=16; bot.y=H-bot.height-16;}
  return H;
}
module.exports={shell,finish,activeTab};
