// Módulo 'btreg' — regenera las copias Claro/Oscuro de una pantalla canónica del tablero Colorido.
// REPLACE(copia) rehace una copia en su sitio; CREATE(canon, tema) la crea en la celda de 'geo2'.
// Depende de btt (APPLY, SYNC, COPYOP) y btmx2 (GRAD, FX). remap() reapunta las reacciones del prototipo.
const T=bridge.require('btt');const X=bridge.require('btmx2');
function geo(){return bridge.store.get('geo2');}
function remap(frame,theme){const G=geo();const sec=figma.getNodeById(G.secs[theme]);const canon=bridge.store.get('canonMap')||{};const by={};for(const c of sec.children)if(c.type==='FRAME')by[theme==='Colorido'?c.id:c.getPluginData('src')]=c.id;
 let k=0;for(const n of [frame].concat(frame.findAll(x=>x.reactions&&x.reactions.length))){if(!n.reactions||!n.reactions.length)continue;let mod=false;const fix=a=>{if(a&&a.type==='NODE'&&a.destinationId){const cid=canon[a.destinationId]||a.destinationId;const d=by[cid];if(d&&d!==a.destinationId){mod=true;return {...a,destinationId:d};}}return a;};
  const R=n.reactions.map(r=>{const o={...r};if(r.action)o.action=fix(r.action);if(r.actions)o.actions=r.actions.map(fix);return o;});if(mod){n.reactions=R;k++;}}return k;}
function make(canon,theme,x,y){const G=geo();const sec=figma.getNodeById(G.secs[theme]);const c=canon.clone();sec.appendChild(c);T.COPYOP(canon,c);c.x=x;c.y=y;c.name=canon.name+' · '+theme;
 for(const k of ['row','dev','cell'])c.setPluginData(k,canon.getPluginData(k));c.setPluginData('canon','');c.setPluginData('src',canon.id);c.setPluginData('theme',theme);T.APPLY(c,theme);c.setPluginData('theme',theme);X.GRAD(c);X.FX(c);T.SYNC(c);remap(c,theme);return c;}
function REPLACE(copyId){const old=figma.getNodeById(copyId);const canon=figma.getNodeById(old.getPluginData('src'));const th=old.getPluginData('theme');const c=make(canon,th,old.x,old.y);old.remove();return c.id;}
function CREATE(canonId,theme){const canon=figma.getNodeById(canonId);const G=geo();const L=bridge.store.get('layout2');const ri=L.findIndex(r=>r[0]===canon.getPluginData('row'));const g=G.geo[ri];const d=canon.getPluginData('dev');const i=+canon.getPluginData('cell');
 const x=G.PAD+G.LABEL+i*(d==='D'?G.DX:G.MX),y=d==='D'?g.dY:g.mY;const sec=figma.getNodeById(G.secs[theme]);const prev=sec.children.find(f=>f.type==='FRAME'&&f.getPluginData('src')===canonId);if(prev)prev.remove();
 const c=make(canon,theme,x,y);return c.id;}
module.exports={REPLACE,CREATE,remap,make};
