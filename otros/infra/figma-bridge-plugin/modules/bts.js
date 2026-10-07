// Módulo `bts` — estados, modales y formularios. Depende de `bt`.
// ROW(secId,title) crea el bloque "Estados" debajo del contenido de una Section; FIT(secId) ajusta la Section.
// ST(row,cap) = columna de un estado con su rótulo. MODAL(parent,{w,title,sub,icon,iconBg,iconC,close}) -> {c,body}.
// FIELD, CHECK, DIV, NOTE(k: info|warn|err|ok), KV = piezas de formulario y resumen.
const {F,T,I,sol,shadowFloat}=bridge.require('bt');
function ROW(secId,title){const s=figma.getNodeById(secId);const old=s.children.find(c=>c.name==='Estados');if(old)old.remove();let maxB=0;for(const c of s.children)maxB=Math.max(maxB,c.y+c.height);
 const w=F(s,{name:'Estados',dir:'v',gap:24,x:80,y:maxB+120});T(w,title||'Estados',{f:'Sora',s:'Bold',size:32,c:'az'});T(w,'Variantes de estado del flujo. Referencia para implementación.',{size:14,c:'co'});
 const r=F(w,{name:'Fila',dir:'h',gap:80,align:'MIN'});return r;}
function FIT(secId){const s=figma.getNodeById(secId);let mx=0,my=0;for(const c of s.children){mx=Math.max(mx,c.x+c.width);my=Math.max(my,c.y+c.height);}s.resizeWithoutConstraints(Math.max(s.width,mx+80),my+80);return [Math.round(s.width),Math.round(s.height)];}
function ST(row,cap){const w=F(row,{name:'Estado/'+cap,dir:'v',gap:12});T(w,cap,{s:'Semi Bold',size:14,c:'nu',ls:2});return w;}
function MODAL(parent,o={}){const c=F(parent,{name:'Modal/'+(o.title||''),dir:'v',gap:20,pad:32,w:o.w||480,r:32,fill:'bl'});c.effects=shadowFloat;
 const h=F(c,{name:'Header',dir:'h',gap:12,align:'MIN',stretch:true});
 if(o.icon){const ic=F(h,{name:'Icono',dir:'h',w:48,h:48,r:16,fill:o.iconBg||'ar',align:'CENTER',just:'CENTER'});I(ic,o.icon,{c:o.iconC||'az',size:24});}
 const tx=F(h,{name:'Titulos',dir:'v',gap:6,grow:true});T(tx,o.title||'',{f:'Sora',s:'Bold',size:22,c:'ne',stretch:true});if(o.sub)T(tx,o.sub,{size:14,c:'co',lh:150,stretch:true});
 if(o.close!==false){const x=F(h,{name:'Cerrar',dir:'h',w:44,h:44,r:999,align:'CENTER',just:'CENTER',fill:[sol('az',0.06)]});I(x,'x',{c:'az',size:20});}
 const body=F(c,{name:'Cuerpo',dir:'v',gap:16,stretch:true});return {c,body};}
function FIELD(parent,label,ph,o={}){const w=F(parent,{name:'Campo/'+label,dir:'v',gap:6,stretch:true});T(w,label,{s:'Semi Bold',size:13,c:'az'});
 const b=F(w,{name:'Input',dir:'h',gap:10,pad:[12,16],r:12,fill:'bl',align:'CENTER',stretch:true,stroke:o.error?'da':'az',sop:o.error?1:0.18});if(o.focus){b.strokes=[sol('az',1)];b.strokeWeight=2;}
 if(o.icon)I(b,o.icon,{c:'nu',size:18});T(b,o.val||ph,{size:15,c:o.val?'ne':'nu',grow:true});if(o.iconR)I(b,o.iconR,{c:'nu',size:18});
 if(o.error)T(w,o.error,{size:12,c:'da'});else if(o.help)T(w,o.help,{size:12,c:'nu'});return w;}
function CHECK(parent,label,on,o={}){const r=F(parent,{name:'Check',dir:'h',gap:10,align:'MIN',stretch:true});const b=F(r,{name:'Box',dir:'h',w:20,h:20,r:6,align:'CENTER',just:'CENTER',fill:on?'tu':'bl',stroke:on?null:'az',sop:0.4});if(on)I(b,'check',{c:'bl',size:14,sw:3});T(r,label,{size:o.size||13,c:'ne',lh:150,grow:true});return r;}
function DIV(parent,txt){const r=F(parent,{name:'Divisor',dir:'h',gap:12,align:'CENTER',stretch:true});F(r,{name:'l',h:1,w:10,grow:true,fill:[sol('az',0.15)]});if(txt)T(r,txt,{size:12,c:'nu'});F(r,{name:'l',h:1,w:10,grow:true,fill:[sol('az',0.15)]});return r;}
function NOTE(parent,txt,o={}){const k=o.k||'info';const m={info:['tu','info'],warn:['do','alert-triangle'],err:['da','alert-circle'],ok:['ve','check-circle']}[k];const n=F(parent,{name:'Aviso/'+k,dir:'h',gap:10,pad:[12,14],r:12,fill:[sol(m[0],0.12)],align:'MIN',stretch:true});I(n,m[1],{c:k==='warn'?'az':m[0],size:18});T(n,txt,{size:13,c:'ne',lh:150,grow:true});return n;}
function KV(parent,k,v,o={}){const r=F(parent,{name:'Fila/'+k,dir:'h',gap:12,align:'CENTER',stretch:true,just:'SPACE_BETWEEN'});T(r,k,{size:14,c:o.kc||'co'});T(r,v,{s:o.bold?'Semi Bold':'Regular',size:o.size||14,c:o.vc||'ne'});return r;}
module.exports={ROW,FIT,ST,MODAL,FIELD,CHECK,DIV,NOTE,KV};
