// btflow — Mapa de flujo del frontend B2C (Desktop/Web y Móvil)
// Uso: bridge.define('btflow', <este archivo>); const fl = bridge.require('btflow');
//   await fl.BUILD(page, 'd' | 'm', {x, y})  arma un tablero con carriles por recorrido
// Cada tarjeta muestra una miniatura real de la pantalla (exportada), su estado de diseño
// (Diseñada · Estado · Adaptar a móvil · Pendiente) y un enlace al frame original.
// Los estados de cada pantalla cuelgan debajo de ella con una flecha y el disparador.
// Las miniaturas son una foto: tras cambiar pantallas, volver a correr BUILD.
// DATA es la fuente de verdad del inventario de pantallas; mantenerla al crear pantallas nuevas.
const {F,T,I,sol,hex,fonts,C}=bridge.require('bt');

const DATA=[
 {lane:'1 · Descubrir',items:[
  {n:'Home',d:'38:1793',m:'39:2658',to:[[1,'Elegir experiencia'],[2,'Elegir destino'],[3,'Buscar']],st:[{n:'Panel de promociones',d:'39:2203',m:'73:90832',t:'Clic en Promociones'}]},
  {n:'Experiencias por categoría',p:1,note:'Chips de la taxonomía → /experiencias/{slug}',to:[[3,'Ver tours']]},
  {n:'Destino / región',p:1,note:'Landing por región o departamento',to:[[3,'Ver tours']]},
  {n:'Explorar · lista',d:'39:2889',m:'39:3333',to:[[4,'Clic en tour']],st:[{n:'Filtros (hoja inferior)',m:'39:3468',t:'Tocar Filtros'},{n:'Vista mapa',d:'39:3524',m:'73:90650',t:'Cambiar a mapa'},{n:'Sugerencias de búsqueda',d:'74:91036',m:'74:91498',t:'Escribir en el buscador'},{n:'Sin resultados',id:'53:5282',t:'Filtros sin coincidencias'},{n:'Cargando (skeleton)',id:'53:5323',t:'Mientras carga'}]},
  {n:'Detalle del tour',d:'39:3670',m:'48:994',out:'Reservar → 2 · Cuenta / 3 · Reserva',st:[{n:'Fecha agotada',id:'53:5352',t:'Fecha en rojo'},{n:'Lista de espera',id:'53:5386',t:'Avisarme'},{n:'Lista de espera · confirmado',id:'53:5428',t:'Enviar'}]}]},
 {lane:'2 · Cuenta (Auth Gate)',items:[
  {n:'Iniciar sesión',id:'54:6055',to:[[1,'Crear cuenta'],[3,'Olvidé mi contraseña']],out:'Sesión iniciada → vuelve al checkout'},
  {n:'Crear cuenta',id:'54:6109',to:[[2,'Registrarme']]},
  {n:'Código de verificación (OTP)',id:'54:6169',to:[[4,'Correo sin verificar']]},
  {n:'Recuperar contraseña',p:1,note:'Correo → código → nueva contraseña'},
  {n:'Verificar correo',p:1,note:'Aviso de enlace enviado + reenviar'}]},
 {lane:'3 · Reserva y pago',items:[
  {n:'Checkout 1 · Tu viaje',d:'48:1263',m:'48:2292',to:[[1,'Continuar']]},
  {n:'Checkout 2 · Viajeros',d:'48:1460',m:'48:2466',to:[[2,'Continuar']],st:[{n:'Extranjero · pasaporte pendiente',id:'53:5452',t:'No residente'},{n:'Extranjero · pasaporte cargado',id:'53:5486',t:'Subir foto'}]},
  {n:'Checkout 3 · Pago',d:'48:1793',m:'48:2385',to:[[3,'Pagar en OnePay'],[5,'Divide tu cuenta']],st:[{n:'Pago rechazado',id:'53:5513',t:'Banco rechaza'},{n:'Link de pago vencido',id:'53:5539',t:'Pasa el plazo'},{n:'Cupo agotado al pagar',id:'53:5568',t:'Otro pagó primero'},{n:'Divide tu cuenta · activo',id:'53:5593',t:'Activar división'}]},
  {n:'Procesando pago',p:1,note:'Espera del webhook de OnePay',to:[[4,'Pago confirmado']]},
  {n:'Checkout 4 · Confirmación',d:'48:2147',m:'48:2639',out:'Ver reserva → 4 · Portal'},
  {n:'Pago del participante',p:1,note:'Link individual de Divide tu cuenta'},
  {n:'Pago del saldo',p:1,note:'Desde Mis reservas · Por pagar'}]},
 {lane:'4 · Portal del viajero',items:[
  {n:'Mis reservas',d:'49:2737',m:'50:4342',to:[[1,'Voucher'],[2,'Cancelar'],[3,'Retracto']],st:[{n:'Pestaña · Por pagar',id:'54:5657',t:'Tab Por pagar'},{n:'Pestaña · Completadas',id:'54:5699',t:'Tab Completadas'},{n:'Pestaña · Canceladas',id:'54:5752',t:'Tab Canceladas'},{n:'Vacío · sin reservas',id:'54:5783',t:'Sin reservas'},{n:'Detalle de reserva',id:'54:5798',t:'Ver detalle'},{n:'Modal · cancelar',id:'54:5864',t:'Cancelar reserva'},{n:'Modal · reprogramar',id:'54:5919',t:'Reprogramar'}]},
  {n:'Voucher (QR)',p:1,note:'Vista del voucher y descarga PDF'},
  {n:'Cancelación confirmada',p:1,note:'Resumen de penalidad y saldo'},
  {n:'Solicitud de reembolso',p:1,note:'Retracto Ley 1480 · PQRS'},
  {n:'Mis tours',d:'49:3008',m:'52:4536'},
  {n:'Favoritos',d:'49:3240',m:'52:4667',st:[{n:'Vacío · sin favoritos',id:'54:5976',t:'Sin favoritos'}]},
  {n:'Mensajes',d:'49:3500',m:'52:4768',st:[{n:'Chat del tour',m:'52:4865',t:'Abrir chat'},{n:'Bloqueado · antes de 24 h',id:'54:5993',t:'Faltan más de 24 h'},{n:'Solo lectura · tour finalizado',id:'54:6022',t:'Tour terminado'}]},
  {n:'Perfil',d:'49:3696',m:'52:4917',st:[{n:'Menú de perfil',id:'54:6305',t:'Clic en avatar'}]},
  {n:'Notificaciones',id:'54:6261'},
  {n:'Calificar tour (post-tour)',id:'54:6213',note:'Modal bloqueante al terminar el tour'},
  {n:'Onboarding del viajero',p:1,note:'Tooltips del primer ingreso'}]},
 {lane:'5 · Contenido e información',items:[
  {n:'Blog',d:'49:3925',m:'52:5094',to:[[1,'Leer artículo']]},
  {n:'Artículo del blog',p:1,note:'Detalle + tours relacionados'},
  {n:'Nosotros',d:'50:4094',m:'52:5165'},
  {n:'Contacto',p:1,note:'Horario lun–sáb 8:00 a. m.–5:00 p. m.'},
  {n:'Preguntas frecuentes',p:1},
  {n:'Legal',p:1,note:'Términos · Privacidad · Datos personales'},
  {n:'Política de cancelación',p:1}]},
 {lane:'6 · Sistema',items:[
  {n:'Error 404',id:'54:6364'},
  {n:'Error 500',id:'54:6381'},
  {n:'Soporte',id:'54:6400'},
  {n:'Consentimiento de cookies',p:1,note:'Ley 1581 · no pre-marcado'},
  {n:'Sin conexión',p:1}]}];

const W=280,TH=175,SW=220,STH=138,GX=100,GS=64;
const STATUS={ok:['Diseñada','ve','#3D6B1F'],st:['Estado','tu','#006B75'],ad:['Adaptar a móvil','co','#2364AA'],p:['Pendiente','do','#8A5A00']};
const thumbs={};
async function thumb(id,w){const k=id+'@'+w;if(thumbs[k])return thumbs[k];const n=figma.getNodeById(id);if(!n)return null;
 const bytes=await n.exportAsync({format:'PNG',constraint:{type:'WIDTH',value:w*2}});const img=figma.createImage(bytes);thumbs[k]={hash:img.hash,ar:n.height/n.width};return thumbs[k];}
// Ids de pantallas nuevas y estados móviles: se guardan en el documento (figma.root pluginData 'flowIds')
// y en modules/flow-ids.json. Tienen prioridad sobre DATA.
function FIDS(){const s=bridge.store.get('flowIds');if(s)return s;try{return JSON.parse(figma.root.getPluginData('flowIds')||'{}');}catch(e){return {};}}
function pick(it,vp){ // devuelve {id, status}
 const ov=(FIDS().screens||{})[it.n];if(ov&&(vp==='d'?ov.d:ov.m))return {id:vp==='d'?ov.d:ov.m,s:'ok'};
 const mid=(FIDS().states||{})[it.id];if(vp==='m'&&mid)return {id:mid,s:'ok'};
 if(it.p)return {id:null,s:'p'};
 if(vp==='d'){if(it.d)return {id:it.d,s:'ok'};if(it.id)return {id:it.id,s:'ok'};return {id:null,s:'p'};}
 if(it.m)return {id:it.m,s:'ok'};if(it.id)return {id:it.id,s:'ad'};if(it.d)return {id:it.d,s:'ad'};return {id:null,s:'p'};}
function pickState(st,vp){const mid=(FIDS().states||{})[st.id];if(vp==='m'&&mid)return {id:mid,s:'st'};if(vp==='d'){if(st.d||st.id)return {id:st.d||st.id,s:'st'};return null;}
 if(st.m)return {id:st.m,s:'st'};if(st.id)return {id:st.id,s:'ad'};return null;} // estados solo de desktop (vista mapa) se omiten en móvil y viceversa
async function CARD(parent,name,sel,o){const w=o.w,th=o.th;const [label,bg,tc]=STATUS[sel.s];
 const c=F(parent,{name:'Flujo/'+name,dir:'v',w,r:16,fill:sel.s==='p'?'ar':'bl',clip:true});c.primaryAxisSizingMode='AUTO';
 c.strokes=[sol(sel.s==='p'?'do':'az',sel.s==='p'?0.9:0.14)];c.strokeWeight=sel.s==='p'?1.5:1;if(sel.s==='p')c.dashPattern=[8,6];
 const img=F(c,{name:'miniatura',w,h:th,fill:sel.s==='p'?[sol('do',0.08)]:'bl',clip:true});img.layoutAlign='STRETCH';
 if(sel.id){const t=await thumb(sel.id,w);if(t){const frac=Math.min(1,(th/w)/t.ar);img.fills=[{type:'IMAGE',imageHash:t.hash,scaleMode:'CROP',imageTransform:[[1,0,0],[0,frac,0]]}];}}
 else{img.layoutMode='VERTICAL';img.primaryAxisAlignItems='CENTER';img.counterAxisAlignItems='CENTER';img.itemSpacing=6;I(img,'plus',{c:'#8A5A00',size:28});T(img,'Por diseñar',{s:'Semi Bold',size:12,c:'#8A5A00'});}
 const b=F(c,{name:'info',dir:'v',gap:6,pad:12,stretch:true});
 const tt=T(b,name,{f:'Sora',s:'SemiBold',size:o.small?13:15,c:'az',stretch:true,lh:125});if(sel.id)tt.hyperlink={type:'NODE',value:sel.id};
 const row=F(b,{dir:'h',gap:6,align:'CENTER'});const bd=F(row,{dir:'h',pad:[3,8],r:999,fill:[sol(bg,0.16)]});T(bd,label,{s:'Semi Bold',size:10,c:tc});
 if(sel.id){const lk=T(row,'Abrir ↗',{size:10,c:'co'});lk.hyperlink={type:'NODE',value:sel.id};}
 if(o.note)T(b,o.note,{size:11,c:'nu',stretch:true,lh:140});
 return c;}
function ARROW(parent,pts,label,o={}){const v=figma.createVector();v.name='Flecha'+(label?' / '+label:'');parent.appendChild(v);
 const minX=Math.min(...pts.map(p=>p[0])),minY=Math.min(...pts.map(p=>p[1]));
 v.vectorNetwork={vertices:pts.map((p,i)=>({x:p[0]-minX,y:p[1]-minY,strokeCap:i===pts.length-1?'ARROW_LINES':'NONE'})),segments:pts.slice(1).map((_,i)=>({start:i,end:i+1})),regions:[]};
 v.x=minX;v.y=minY;v.strokes=[sol(o.c||'co',1)];v.strokeWeight=1.5;v.strokeJoin='ROUND';if(o.dash)v.dashPattern=[6,4];
 if(label){const a=pts[o.labelSeg??0],z=pts[(o.labelSeg??0)+1];const L=F(parent,{name:'Etiqueta',dir:'h',pad:[3,8],r:999,fill:'bl'});L.strokes=[sol('co',0.3)];L.strokeWeight=1;T(L,label,{size:10,s:'Semi Bold',c:'co'});
  L.x=Math.round((a[0]+z[0])/2-L.width/2);L.y=Math.round((a[1]+z[1])/2-L.height/2);}
 return v;}
async function LANE(board,lane,vp,y0){const x0=320;const cols=[];let x=x0,maxH=0;
 const head=T(board,lane.lane,{f:'Sora',s:'Bold',size:22,c:'az',x:40,y:y0+8});head.resize(240,head.height);head.textAutoResize='HEIGHT';
 for(const it of lane.items){const sel=pick(it,vp);const card=await CARD(board,it.n,sel,{w:W,th:TH,note:it.note||(sel.s==='ad'?'Diseñado para desktop; pasar a hoja inferior':'')});card.x=x;card.y=y0;
  let cy=y0+card.height;const stc=[];
  for(const st of (it.st||[])){const ss=pickState(st,vp);if(!ss)continue;const sc=await CARD(board,st.n,ss,{w:SW,th:STH,small:true});sc.x=x+(W-SW)/2;sc.y=cy+GS;
   ARROW(board,[[x+W/2,cy],[x+W/2,sc.y]],st.t);cy=sc.y+sc.height;stc.push(sc);}
  if(it.out){const o=F(board,{name:'Salida',dir:'h',gap:6,pad:[6,10],r:999,fill:[sol('az',0.06)]});T(o,it.out,{size:11,s:'Semi Bold',c:'az'});o.x=x;o.y=cy+24;cy=o.y+o.height;}
  cols.push({x,y:y0,w:W,h:card.height,bottom:cy});maxH=Math.max(maxH,cy-y0);x+=W+GX;}
 // flechas entre tarjetas del carril (no contiguas: codo por encima)
 let lift=0;lane.items.forEach((it,i)=>{for(const [j,label] of (it.to||[])){const a=cols[i],b=cols[j];if(!a||!b)continue;
  if(j===i+1)ARROW(board,[[a.x+a.w,a.y+TH/2],[b.x,b.y+TH/2]],label);
  else{lift+=26;const top=y0-14-lift;ARROW(board,[[a.x+a.w*0.7,a.y],[a.x+a.w*0.7,top],[b.x+b.w*0.3,top],[b.x+b.w*0.3,b.y]],label,{labelSeg:1});}}});
 return {height:maxH+120,lift,width:x};}
async function BUILD(page,vp,pos={}){await fonts();const board=figma.createFrame();page.appendChild(board);board.name=vp==='d'?'Flujo · Desktop / Web':'Flujo · Móvil';
 board.fills=[sol('bl')];board.cornerRadius=24;board.clipsContent=false;board.x=pos.x||0;board.y=pos.y||0;
 T(board,board.name,{f:'Sora',s:'ExtraBold',size:40,c:'az',x:40,y:40});
 T(board,'Recorrido del viajero de izquierda a derecha. Los estados de cada pantalla cuelgan debajo con su disparador. Clic en el nombre o en "Abrir ↗" para ir al frame.',{size:14,c:'co',x:40,y:100,w:900});
 const lg=F(board,{name:'Leyenda',dir:'h',gap:12,x:40,y:140});for(const k of ['ok','st','ad','p']){const [l,bg,tc]=STATUS[k];const b=F(lg,{dir:'h',pad:[4,10],r:999,fill:[sol(bg,0.16)]});T(b,l,{s:'Semi Bold',size:12,c:tc});}
 let y=240,w=0;const stats={ok:0,st:0,ad:0,p:0};
 for(const lane of DATA){const lift=(lane.items.reduce((a,it,i)=>a+(it.to||[]).filter(([j])=>j!==i+1).length,0))*26+40;y+=lift;
  const r=await LANE(board,lane,vp,y);y+=r.height;w=Math.max(w,r.width);
  lane.items.forEach(it=>{stats[pick(it,vp).s]++;(it.st||[]).forEach(s=>{const q=pickState(s,vp);if(q)stats[q.s]++;});});
  const sep=figma.createRectangle();board.appendChild(sep);sep.resize(Math.max(w,1000),1);sep.x=40;sep.y=y-40;sep.fills=[sol('az',0.1)];}
 board.resize(w+120,y+40);board.setPluginData('flow',vp);return {id:board.id,stats};}
module.exports={DATA,BUILD,CARD,ARROW,thumb};
