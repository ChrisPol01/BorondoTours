// Módulo `btmx2` — actualización de la matriz de temas (sección 16, 58:7481). Depende de btq, btqf, btt.
// IMPORTANTE (memoria del plugin): regenerar clones y auditar contraste (btq.all/POST) en la MISMA llamada
// satura el runtime y desconecta el puente. Por eso están SEPARADOS:
//   REGEN(from,to): regenera las copias [from,to) (clone + GRAD + FX). Barato. Lotes de ~6.
//   AUDIT(from,to): corre POST (mejor token de contraste por tema) sobre [from,to). Lotes de ~6.
//   UPDATE(from,to): compat — hace REGEN y luego AUDIT del mismo rango (usar solo en lotes chicos).
// btq se resuelve en cada acceso (Proxy): así siempre se usa la versión vigente de la auditoría.
const q=new Proxy({},{get:(_,k)=>bridge.require('btq')[k]});const F=bridge.require('btqf');const T=bridge.require('btt');
// Colorido ya usa los valores del Home (Inmersivo unificado): el tema efectivo es el de la copia.
function eff(clone){return clone.getPluginData('theme');}
// FX: re-vincula el color de sombras/brillos (vidrio) al tema de la copia (APPLY solo cambia fills/strokes)
function FX(clone){const th=eff(clone);if(!th)return 0;const V=tv(th);let k=0;
 for(const n of [clone].concat(clone.findAll(x=>Array.isArray(x.effects)&&x.effects.length))){let ch=false;
  const out=n.effects.map(e=>{const b=e.boundVariables&&e.boundVariables.color;if(!b)return e;const v=figma.variables.getVariableById(b.id);if(!v||!V[v.name]||V[v.name].id===v.id)return e;ch=true;const c=V[v.name].resolveForConsumer(n).value;return figma.variables.setBoundVariableForEffect({...e,color:{r:c.r,g:c.g,b:c.b,a:c.a}},'color',V[v.name]);});
  if(ch){n.effects=out;k++;}}return k;}
function tv(theme){const col=figma.variables.getLocalVariableCollections().find(c=>c.name==='Tema · '+theme);const V={};figma.variables.getLocalVariables('COLOR').filter(v=>v.variableCollectionId===col.id).forEach(v=>V[v.name]=v);return V;}
function GRAD(clone){const th=eff(clone);if(!th)return 0;const V=tv(th);let k=0;
 // Incluye strokes: el borde degradado de la capa "Cristal" (btlg) también se re-vincula al tema.
 for(const nd of [clone].concat(clone.findAll(x=>'fills' in x||'strokes' in x))){for(const pr of ['fills','strokes']){const fs=nd[pr];if(!Array.isArray(fs))continue;let ch=false;
  const out=fs.map(p=>{if(p.type.indexOf('GRADIENT')!==0)return p;const st=p.gradientStops.map(s=>{const b=s.boundVariables&&s.boundVariables.color;if(!b)return s;const v=figma.variables.getVariableById(b.id);if(!v||!V[v.name]||V[v.name].id===v.id)return s;ch=true;const c=V[v.name].resolveForConsumer(nd).value;return {position:s.position,color:{r:c.r,g:c.g,b:c.b,a:c.a==null?1:c.a},boundVariables:{color:figma.variables.createVariableAlias(V[v.name])}};});return ch?Object.assign({},p,{gradientStops:st}):p;});
  if(ch){nd[pr]=out;k++;}}}return k;}
function POST(clone){if(!clone.findAll)return 0;const th=eff(clone);if(!th)return 0;const V=tv(th);let k=0;
 for(const b of q.contrast(clone)){const t=figma.getNodeById(b.id);const bg=q.bgOf(t).c;let best=null,br=0;
  for(const r of ['glass/text','text/primary','text/on-action','text/on-strong','text/heading']){if(!V[r])continue;const c=V[r].resolveForConsumer(t).value;const ra=q.ratio(c,bg);if(ra>br){br=ra;best=r;}}
  if(br<4.5){for(const c of [{r:0,g:0,b:0},{r:1,g:1,b:1}]){const ra=q.ratio(c,bg);if(ra>br){br=ra;best=null;t.fills=[{type:'SOLID',color:c}];}}}
  if(best)F.setP(t,'fills',V[best],1);k++;}
 return k;}
// Lista ordenada de copias (con pluginData src). Estable por posición.
function copies(){return [...figma.getNodeById('58:7481').children].filter(c=>c.getPluginData('src')).sort((a,b)=>a.y-b.y||a.x-b.x);}
// REGEN: regenera clones del rango, SIN auditar (barato). Devuelve cuántas copias tocó.
function REGEN(from,to){const sec=figma.getNodeById('58:7481');const all=copies();const slice=all.slice(from||0,to==null?all.length:to);
 let g=0,cp=0;for(const old of slice){const sid=old.getPluginData('src'),th=old.getPluginData('theme');const o=figma.getNodeById(sid);if(!o)continue;
  const c=o.clone();sec.appendChild(c);T.COPYOP(o,c);c.x=old.x;c.y=old.y;c.name=o.name+' · '+th;c.setPluginData('src',sid);if(th!=='Colorido')T.APPLY(c,th);c.setPluginData('theme',th);T.SYNC(c);old.remove();cp++;g+=GRAD(c)+FX(c);}
 return {total:all.length,copies:cp,grad:g};}
// AUDIT: corre POST sobre el rango (contraste). Barato si el rango es chico (~6).
function AUDIT(from,to){const all=copies();const slice=all.slice(from||0,to==null?all.length:to);let k=0;for(const c of slice)k+=POST(c);return {total:all.length,text:k};}
function POSTALL(){const all=copies();let g=0,k=0;for(const c of all){g+=GRAD(c)+FX(c);k+=POST(c);}return {g,k};}
// UPDATE(from,to): compat. Regenera y audita el mismo rango. Solo lotes chicos (riesgo de memoria).
function UPDATE(from,to){const r=REGEN(from,to);const a=AUDIT(from,to);return {total:r.total,copies:r.copies,grad:r.grad,text:a.text};}
module.exports={tv,eff,FX,GRAD,POST,POSTALL,copies,REGEN,AUDIT,UPDATE};
