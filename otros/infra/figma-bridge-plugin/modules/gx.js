// gx — helpers de la app de gestión (página "B2B · Gestión"). Depende de bt, btt, btg, btlg.
// Todo color va vinculado a variables del tema Colorido (las copias Claro/Oscuro se re-vinculan con btt.APPLY).
// Texto sobre página: text/primary (títulos) y text/muted (secundario). Texto sobre vidrio: glass/text.
const bt=bridge.require('bt');const T=bridge.require('btt');const G=bridge.require('btg');const LGm=bridge.require('btlg');
let _V=null;function V(){if(!_V)_V=T.vmap('Colorido');return _V;}
function fill(n,tok,op){const f=[G.sp(V()[tok],n,op==null?1:op)];n.fills=f;n.fills=f;return n;}
function stroke(n,tok,op,w){const s=[G.sp(V()[tok],n,op==null?1:op)];n.strokes=s;n.strokes=s;n.strokeWeight=w||1;n.strokeAlign='INSIDE';return n;}
function box(parent,o){o=o||{};const f=bt.F(parent,o);if(o.tok)fill(f,o.tok,o.top);if(o.stok)stroke(f,o.stok,o.sop,o.sw);return f;}
function tx(parent,s,o){o=o||{};const t=bt.T(parent,s,{f:o.f,s:o.s,size:o.size,w:o.w,stretch:o.stretch,grow:o.grow,lh:o.lh,al:o.al,ls:o.ls});fill(t,o.tok||'glass/text');if(o.name)t.name=o.name;return t;}
// Icono lucide aplanado en un solo vector llamado "Vector" (permite overrides de color en instancias)
function ic(parent,name,tok,size){const n=bt.I(null,name,{size:size||20,c:'bl'});const vs=n.findAll(x=>x.type==='VECTOR'||x.type==='BOOLEAN_OPERATION');let v=vs[0];
 if(vs.length>1){v=figma.flatten(vs,n);}if(v){v.name='Vector';stroke(v,tok||'glass/text',1,2);v.strokeAlign='CENTER';v.fills=[];}n.fills=[];n.clipsContent=false;if(parent)parent.appendChild(n);return n;}
// Vidrio estándar (btlg). Llamar después de llenar el contenido.
function lg(f,o){o=o||{};return LGm.LG(f,{strong:o.strong,keepRadius:true,shadow:o.shadow});}
function inst(setId,props,parent){const s=figma.getNodeById(setId);let c=s;if(s.type==='COMPONENT_SET'){c=s.children.find(v=>Object.entries(props||{}).every(([k,val])=>v.variantProperties&&v.variantProperties[k]===val))||s.defaultVariant;}const i=c.createInstance();if(parent)parent.appendChild(i);return i;}
function setT(node,name,val){const t=node.findOne(x=>x.type==='TEXT'&&(!name||x.name===name));if(t)t.characters=String(val);return t;}
function setProp(i,prefix,val){const k=Object.keys(i.componentProperties).find(x=>x.split('#')[0]===prefix);if(k){const o={};o[k]=val;i.setProperties(o);}return i;}
function dot(parent,tok,d){const e=figma.createEllipse();e.resize(d||8,d||8);fill(e,tok);parent.appendChild(e);return e;}
function rule(parent,w){const r=figma.createRectangle();r.name='bt-rule';r.resize(w||200,1);fill(r,'glass/text',0.16);parent.appendChild(r);if(!w)r.layoutAlign='STRETCH';return r;}
module.exports={V,fill,stroke,box,tx,ic,lg,inst,setT,setProp,dot,rule,bt,T,G};
