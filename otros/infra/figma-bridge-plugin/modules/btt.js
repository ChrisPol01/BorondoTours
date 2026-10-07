// btt — Temas de color con variables de Figma (Colorido · Claro · Oscuro)
// Uso: bridge.define('btt', <este archivo>); const btt = bridge.require('btt');
//   btt.ensure()            crea/actualiza las 3 colecciones "Tema · X" y sus 20 tokens
//   btt.BIND(nodo)          vincula colores sueltos del árbol a las variables del tema Colorido
//   btt.APPLY(copia,'Oscuro') re-vincula una copia al tema indicado (por nombre de variable)
//   btt.SYNC(nodo)          refresca el color cacheado de los paints vinculados
// Notas:
// - Figma Starter permite 1 modo por colección: cada tema es una colección con los mismos nombres.
//   Con plan Professional se podría pasar a 1 colección con 3 modos (cambio automático).
// - "Sistema" no es tema: en código elige Claro u Oscuro con prefers-color-scheme.
// - Bug de Figma: al asignar node.fills con un paint vinculado, la primera asignación resetea la
//   opacidad a 1. Por eso se asigna dos veces (node.fills=r; node.fills=r;).
// - BIND salta instancias (heredan del componente principal).

const {hex,C}=bridge.require('bt');
const THEMES=['Colorido','Claro','Oscuro'];
const A=n=>({alias:n});
const TOKENS={
 // Claro = estilo iOS: fondo gris muy claro, tarjetas blancas translúcidas (+blur en APPLY), texto casi negro.
 // Oscuro = neutro negro/gris (sin azul), acentos de marca intactos.
 'surface/page':[A('brand/blanco-niebla'),'#F2F2F7','#0B0B0C'],
 'surface/card':[A('brand/blanco-niebla'),'#FFFFFFB8','#161618'],
 'surface/warm':[A('brand/arena'),'#E9E9EE','#1F1F22'],
 // Sin negro puro (#000000) en ningún tema (auditoría 2026-09-30): Claro strong = Azul Profundo.
 'surface/strong':[A('brand/azul-profundo'),'#103B66','#1F1F22'],
 'tint':[A('brand/azul-profundo'),'#1C1C1E','#FFFFFF'],
 'border':[A('brand/azul-profundo'),'#1C1C1E','#FFFFFF'],
 'text/heading':[A('brand/azul-profundo'),'#1C1C1E','#FFFFFF'],
 'text/primary':[A('brand/negro-volcanico'),'#1C1C1E','#EDEDED'],
 'text/muted':[A('brand/azul-condor'),'#6E6E73','#A1A1AA'],
 'text/subtle':[A('derived/neutral'),'#8E8E93','#8A8A8F'],
 'text/on-strong':[A('brand/blanco-niebla'),'#F9FBFC','#F9FBFC'],
 'text/on-action':[A('brand/negro-volcanico'),'#101010','#101010'],
 'action/primary':[A('brand/turquesa-laguna'),'#00B7C7','#00B7C7'],
 'action/primary-hover':[A('brand/verde-frailejon'),'#79C142','#79C142'],
 'action/cta':[A('brand/dorado'),'#FDB813','#FDB813'],
 'status/available':[A('brand/verde-frailejon'),'#79C142','#8BD152'],
 'status/limited':[A('brand/dorado'),'#FDB813','#FDB813'],
 'status/danger':[A('derived/danger'),'#B42318','#F97066'],
 'status/unavailable':[A('derived/neutral'),'#8E8E93','#6B6B70'],
 'focus':[A('brand/azul-profundo'),'#007AFF','#00B7C7']};
const rgb=h=>{const s=h.replace('#','');const n=i=>parseInt(s.slice(i,i+2),16)/255;return {r:n(0),g:n(2),b:n(4),a:s.length===8?n(6):1};};
function prim(name){return figma.variables.getLocalVariables('COLOR').find(v=>v.name===name&&v.variableCollectionId==='VariableCollectionId:1:2');}
function ensure(opts){const cols=figma.variables.getLocalVariableCollections();const out={};
 THEMES.forEach((t,i)=>{let c=cols.find(x=>x.name==='Tema · '+t);if(!c)c=figma.variables.createVariableCollection('Tema · '+t);const mode=c.modes[0].modeId;if(c.modes[0].name!==t)c.renameMode(mode,t);
  const vars=figma.variables.getLocalVariables('COLOR').filter(v=>v.variableCollectionId===c.id);
  // Solo crea variables faltantes: los valores vigentes viven en ../theme-variables.json y no se sobrescriben
  // (antes ensure() reiniciaba Colorido a los valores iniciales). Para forzar: ensure({force:true}).
  for(const [name,vals] of Object.entries(TOKENS)){let v=vars.find(x=>x.name===name);if(v&&!(opts&&opts.force))continue;if(!v)v=figma.variables.createVariable(name,c,'COLOR');const val=vals[i];
   if(val&&val.alias){v.setValueForMode(mode,figma.variables.createVariableAlias(prim(val.alias)));}else v.setValueForMode(mode,rgb(val));
   v.scopes=name.startsWith('text')?['TEXT_FILL','SHAPE_FILL','STROKE_COLOR']:['ALL_FILLS','STROKE_COLOR','EFFECT_COLOR'];}
  out[t]=c;});return out;}
function vmap(theme){const c=figma.variables.getLocalVariableCollections().find(x=>x.name==='Tema · '+theme);const m={};figma.variables.getLocalVariables('COLOR').filter(v=>v.variableCollectionId===c.id).forEach(v=>m[v.name]=v);return m;}
const H=p=>'#'+[p.color.r,p.color.g,p.color.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const K={};for(const [k,v] of Object.entries(C))K[v.toUpperCase()]=k;
function bg(n){let p=n.parent;while(p&&p.type!=='PAGE'&&p.type!=='SECTION'){if('fills' in p&&Array.isArray(p.fills)){const f=p.fills.find(x=>x.visible!==false&&(x.type==='IMAGE'||(x.type==='SOLID'&&(x.opacity??1)>=0.5)));if(f)return f.type==='IMAGE'?'img':K[H(f)]||'?';}p=p.parent;}return null;}
function inkRole(k,n){const b=bg(n);if(k==='ne'&&(b==='do'||b==='ve'||b==='tu'))return 'text/on-action';
 return {ne:'text/primary',az:'text/heading',co:'text/muted',nu:'text/subtle',bl:'text/on-strong',da:'status/danger',tu:'action/primary',do:'action/cta',ve:'status/available',ar:'surface/warm'}[k];}
function fillRole(k,op,n){const top=n.parent&&(n.parent.type==='SECTION'||n.parent.type==='PAGE');
 if(k==='bl')return op>=0.9?(top?'surface/page':'surface/card'):(bg(n)==='img'?null:'surface/card');
 if(k==='az')return op>=0.9?'surface/strong':'tint';
 return {ar:'surface/warm',tu:'action/primary',ve:'status/available',do:'action/cta',da:'status/danger',nu:'status/unavailable'}[k]||null;}
function strokeRole(k){return {az:'border',tu:'action/primary',da:'status/danger',ve:'status/available',do:'action/cta',co:'text/muted',nu:'status/unavailable'}[k]||null;}
function rebind(paints,roleOf,vars,stats,node){let ch=false;const out=paints.map(p=>{if(p.type!=='SOLID'||(p.boundVariables&&p.boundVariables.color))return p;const k=K[H(p)];if(!k)return p;const r=roleOf(k,p.opacity??1);if(!r||!vars[r])return p;ch=true;stats[r]=(stats[r]||0)+1;return bindP(p,vars[r],node);});return ch?out:null;}
// bindP: vincula y además escribe el color resuelto (Figma deja el color viejo cacheado y así lo pinta)
function bindP(p,v,node){let c=null;try{c=v.resolveForConsumer(node).value;}catch(e){}const base=c?{...p,color:{r:c.r,g:c.g,b:c.b}}:p;const np=figma.variables.setBoundVariableForPaint(base,'color',v);return {...np,opacity:(c&&c.a<0.999)?c.a:(p.opacity??1)};}
// SYNC: reescribe el color cacheado de cada paint vinculado con su valor resuelto
function SYNC(root){let k=0;const fix=(node,ps)=>{let ch=false;const o=ps.map(p=>{const b=p.boundVariables&&p.boundVariables.color;if(!b)return p;const v=figma.variables.getVariableById(b.id);if(!v)return p;ch=true;k++;return bindP(p,v,node);});return ch?o:null;};
 for(const node of [root,...root.findAll(()=>true)]){if('fills' in node&&Array.isArray(node.fills)){const r=fix(node,node.fills);if(r){node.fills=r;node.fills=r;}}if('strokes' in node&&Array.isArray(node.strokes)){const r=fix(node,node.strokes);if(r){node.strokes=r;node.strokes=r;}}}return k;}
function inInstance(n){let p=n.parent;while(p){if(p.type==='INSTANCE')return true;p=p.parent;}return false;}
function BIND(root){const vars=vmap('Colorido');const stats={};const nodes=[root,...(root.findAll?root.findAll(()=>true):[])];let n=0;
 for(const node of nodes){if(node.type==='INSTANCE'||inInstance(node))continue;n++;
  const isText=node.type==='TEXT';const isBox=['FRAME','COMPONENT','COMPONENT_SET','RECTANGLE'].includes(node.type);
  if('fills' in node&&Array.isArray(node.fills)&&node.fills.length){const r=rebind(node.fills,(k,op)=>isText?inkRole(k,node):(isBox?fillRole(k,op,node):inkRole(k,node)),vars,stats,node);if(r){node.fills=r;node.fills=r;}}
  if('strokes' in node&&Array.isArray(node.strokes)&&node.strokes.length){const r=rebind(node.strokes,(k,op)=>isBox?strokeRole(k):(k==='bl'&&node.type!=='VECTOR'?null:inkRole(k,node)),vars,stats,node);if(r){node.strokes=r;node.strokes=r;}}}
 return {nodes:n,stats};}
function APPLY(root,theme){const to=vmap(theme);const all=figma.variables.getLocalVariables('COLOR');const byId={};all.forEach(v=>byId[v.id]=v);let k=0;
 const swap=(ps,node)=>{let ch=false;const o=ps.map(p=>{const b=p.boundVariables&&p.boundVariables.color;if(!b)return p;const v=byId[b.id];if(!v||!v.variableCollectionId||!to[v.name]||v.variableCollectionId===to[v.name].variableCollectionId)return p;ch=true;k++;return bindP(p,to[v.name],node);});return ch?o:null;};
 for(const node of [root,...root.findAll(()=>true)]){if('fills' in node&&Array.isArray(node.fills)){const r=swap(node.fills,node);if(r){node.fills=r;node.fills=r;}}if('strokes' in node&&Array.isArray(node.strokes)){const r=swap(node.strokes,node);if(r){node.strokes=r;node.strokes=r;}}}
 // Claro: vidrio tipo iOS (blur de fondo) en superficies de tarjeta
 if(theme==='Claro'){for(const node of [root,...root.findAll(n=>n.type==='FRAME'||n.type==='INSTANCE')]){if(!('fills' in node)||!Array.isArray(node.fills))continue;const f=node.fills.find(p=>p.boundVariables&&p.boundVariables.color&&to['surface/card']&&p.boundVariables.color.id===to['surface/card'].id);if(!f||node.width<120)continue;
  const ef=(node.effects||[]).filter(e=>e.type!=='BACKGROUND_BLUR');ef.push({type:'BACKGROUND_BLUR',radius:24,visible:true});node.effects=ef;}}
 root.setPluginData('theme',theme);return k;}
// COPYOP: clone() pierde la opacidad de paints vinculados en overrides de instancias; se copia del original
function COPYOP(a,b){const A=[a,...a.findAll(()=>true)],B=[b,...b.findAll(()=>true)];if(A.length!==B.length)return -1;let k=0;
 for(let i=0;i<A.length;i++)for(const key of ['fills','strokes']){const pa=A[i][key],pb=B[i][key];if(!Array.isArray(pa)||!Array.isArray(pb)||pa.length!==pb.length)continue;let ch=false;const o=pb.map((p,j)=>{const q=pa[j];if(q.opacity!=null&&Math.abs((p.opacity??1)-q.opacity)>0.001){ch=true;return {...p,opacity:q.opacity};}return p;});if(ch){B[i][key]=o;B[i][key]=o;k++;}}return k;}
// REFRESH: regenera las copias de una secci�n de temas desde sus originales (pluginData src + theme)
function REFRESH(section){const out=[];for(const old of [...section.children]){const sid=old.getPluginData('src'),th=old.getPluginData('theme');if(!sid||!th)continue;const o=figma.getNodeById(sid);if(!o)continue;
 const c=o.clone();section.appendChild(c);COPYOP(o,c);c.x=old.x;c.y=old.y;c.name=o.name+' � '+th;c.setPluginData('src',sid);if(th!=='Colorido')APPLY(c,th);c.setPluginData('theme',th);SYNC(c);old.remove();out.push(c.id);}return out;}
module.exports={THEMES,TOKENS,ensure,vmap,BIND,APPLY,SYNC,REFRESH,COPYOP};
