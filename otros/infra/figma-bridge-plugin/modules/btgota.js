// Módulo `btgota` — patrón "gota sobre foto" para tarjetas con imagen (TourCard). Depende de btg y btt.
// Convierte una tarjeta al patrón validado: imagen a tamaño completo + viñeta de degradado inferior
// (la foto se funde con el fondo, sin corte) + capa "Cristal" (liquid glass) y "body" flotando como
// gota de vidrio sobre la parte inferior. El texto va sobre la gota, legible gracias a la viñeta.
// Estructura resultante (orden): imagen(0) < Viñeta foto(1) < Cristal(2) < body(3).
// El contenedor queda en layoutMode NONE y los hijos se ubican por X/Y (no requiere ABSOLUTE).
const G=bridge.require('btg');const T=bridge.require('btt');
function gota(card){const vs=T.vmap('Colorido');const kids=card.children.slice();
 const cristal=kids.find(c=>c.name==='Cristal');const body=kids.find(c=>c.type==='FRAME'&&c.name==='body')||kids.find(c=>c.type==='FRAME');
 const img=kids.find(c=>(c.type==='RECTANGLE'||c.type==='FRAME')&&c!==cristal&&c!==body&&c.name!=='Viñeta foto');
 if(!cristal||!img||!body)return 'skip';
 card.layoutMode='NONE';card.clipsContent=true;const W=card.width,H=card.height,R=typeof card.cornerRadius==='number'?card.cornerRadius:20;
 const clr=n=>{try{n.layoutPositioning='AUTO';}catch(e){}};
 clr(img);img.x=0;img.y=0;img.resize(W,H);img.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
 let vig=kids.find(c=>c.name==='Viñeta foto');if(!vig){vig=figma.createRectangle();vig.name='Viñeta foto';card.appendChild(vig);}
 clr(vig);vig.x=0;vig.y=0;vig.resize(W,H);vig.cornerRadius=R;vig.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
 vig.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0.45,color:{r:0.04,g:0.10,b:0.17,a:0}},{position:1,color:{r:0.04,g:0.10,b:0.17,a:0.55}}]}];vig.locked=true;
 const pad=14,gh=Math.round(body.height),gw=W-pad*2,gx=pad,gy=H-gh-pad;
 clr(cristal);cristal.x=gx;cristal.y=gy;cristal.resize(gw,gh);cristal.cornerRadius=26;cristal.constraints={horizontal:'STRETCH',vertical:'MAX'};
 clr(body);body.x=gx;body.y=gy;body.resize(gw,gh);body.constraints={horizontal:'STRETCH',vertical:'MAX'};
 if('paddingLeft' in body){body.paddingLeft=18;body.paddingRight=18;body.paddingTop=14;body.paddingBottom=16;}
 const cf=cristal.effects.map(e=>e.type==='BACKGROUND_BLUR'?{...e,radius:50}:e);cristal.effects=cf;
 card.insertChild(0,img);card.insertChild(1,vig);card.insertChild(2,cristal);card.insertChild(3,body);
 card.effects=[G.fx('DROP_SHADOW',vs['glass/shadow'],card,{offset:{x:0,y:10},radius:30})];return 'ok';}
// RUN(from,to): aplica el patrón a todas las tarjetas TourCard/* de las pantallas [from,to). Por lotes (~20).
function RUN(from,to){const q=bridge.require('btq');const sc=q.screens();let ok=0,sk=0;
 for(const s of sc.slice(from,to)){for(const c of s.findAll(x=>x.type==='FRAME'&&/^TourCard\//.test(x.name)&&x.children.some(k=>k.name==='Cristal'))){gota(c)==='ok'?ok++:sk++;}}return {ok,sk};}
module.exports={gota,RUN};
