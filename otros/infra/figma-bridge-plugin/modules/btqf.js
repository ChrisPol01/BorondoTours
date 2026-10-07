// Módulo `btqf` — correcciones automáticas de calidad (depende de `btq`). Úsalo tras cambios masivos:
//   const F=bridge.require('btqf'); for (const s of bridge.require('btq').screens()) F.FIX(s);
// FIX: 1) fondo #0a1a2b sin variable -> surface/page; 2) tarjetas glass blancas (<30%) sobre fondo claro -> tarjeta sólida
// con borde 18% y sombra; 3) navbar "Sobre foto oscura" sobre fondo claro -> variante clara (36:1667); 4) chip seleccionado
// que perdió opacidad -> 100%; 5) textos con contraste < WCAG AA -> token con mejor contraste; 6) iconos sin contraste.
// btq se resuelve en cada acceso (Proxy): así siempre se usa la versión vigente de la auditoría.
const q=new Proxy({},{get:(_,k)=>bridge.require('btq')[k]});
function vars(){const col=figma.variables.getLocalVariableCollections().find(c=>c.name==='Tema · Colorido');const V={};figma.variables.getLocalVariables('COLOR').filter(v=>v.variableCollectionId===col.id).forEach(v=>V[v.name]=v);return V;}
// Asigna dos veces (bug de Figma: la primera asignación pierde opacidad) y escribe el color resuelto.
function paint(node,v,op){const p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0},opacity:op},'color',v);let c={r:0,g:0,b:0};try{c=v.resolveForConsumer(node).value;}catch(e){}return {...p,color:{r:c.r,g:c.g,b:c.b},opacity:op};}
function setP(node,prop,v,op){const pp=paint(node,v,op);node[prop]=[pp];node[prop]=[pp];}
const L=c=>q.lum(c);const light=c=>L(c)>0.4,dark=c=>L(c)<0.15;
const SAT=c=>Math.max(c.r,c.g,c.b)-Math.min(c.r,c.g,c.b)>0.3;
// Elige el token de texto con mejor contraste sobre el fondo (el dorado cuenta como "claro" pero exige texto primario).
function bestText(node,bg,V){let best=null,br=0;for(const r of ['text/primary','text/heading','text/muted','text/on-strong']){const c=V[r].resolveForConsumer(node).value;const ra=q.ratio(c,bg);if(ra>br){br=ra;best=r;}}return {role:best,ratio:br};}
function FIX(root){const V=vars();const st={root:0,card:0,nav:0,chip:0,text:0,icon:0,left:[]};
 const rf=(root.fills||[]).find(f=>f.type==='SOLID'&&f.visible!==false);
 if(rf&&!(rf.boundVariables&&rf.boundVariables.color)&&q.hex(rf.color)==='#0a1a2b'){setP(root,'fills',V['surface/page'],1);st.root++;}
 root.findAll(n=>n.type==='FRAME'&&!q.inInst(n)).forEach(n=>{const s=q.solid(n);if(!s||s.img||s.a>=0.3||L(s.c)<0.9)return;const b=q.bgOf(n);if(b.img||!light(b.c))return;
   setP(n,'fills',V['surface/card'],1);const bp=paint(n,V['border'],0.18);n.strokes=[bp];n.strokes=[bp];n.strokeWeight=1;
   if(!(n.effects||[]).some(e=>e.type==='DROP_SHADOW'))n.effects=[...(n.effects||[]),{type:'DROP_SHADOW',color:{r:0.063,g:0.231,b:0.4,a:0.12},offset:{x:0,y:8},radius:24,spread:0,visible:true,blendMode:'NORMAL'}];st.card++;});
 const clara=figma.getNodeById('36:1667');
 root.findAll(n=>n.type==='INSTANCE'&&n.mainComponent&&n.mainComponent.id==='36:1635').forEach(i=>{const b=q.bgOf(i);if(!b.img&&light(b.c)){i.swapComponent(clara);st.nav++;}});
 root.findAll(n=>n.type==='TEXT'&&n.visible).forEach(t=>{const s=q.solid(t);if(!s||s.img||L(s.c)<0.8)return;const p=t.parent;const ps=p&&q.solid(p);if(!ps||ps.img||ps.a>=0.3||!SAT(ps.c))return;
   const f=p.fills.map(x=>x.type==='SOLID'&&x.visible!==false?{...x,opacity:1}:x);p.fills=f;p.fills=f;st.chip++;});
 for(const b of q.contrast(root)){const t=figma.getNodeById(b.id);const bg=q.bgOf(t).c;const pick=bestText(t,bg,V);
   if(pick.ratio<4.5){setP(t.parent,'fills',V['surface/strong'],0.88);setP(t,'fills',V['text/on-strong'],1);}else setP(t,'fills',V[pick.role],1);st.text++;}
 root.findAll(n=>['VECTOR','BOOLEAN_OPERATION','ELLIPSE','LINE'].indexOf(n.type)>=0&&n.parent&&/^icon\//.test(n.parent.name)).forEach(n=>{const b=q.bgOf(n.parent);if(b.img)return;for(const pr of ['strokes','fills']){const ps=n[pr];if(!Array.isArray(ps))continue;const p=ps.find(x=>x.type==='SOLID'&&x.visible!==false);if(!p||q.ratio(p.color,b.c)>=3)continue;setP(n,pr,V[light(b.c)?'text/primary':dark(b.c)?'text/on-strong':'text/on-action'],1);st.icon++;}});
 st.left=q.contrast(root).map(x=>x.txt+' '+x.fg+'/'+x.bg);return st;}
module.exports={vars,paint,setP,bestText,FIX};
