// Módulo `btlg` — Liquid glass estandarizado (receta iOS 26). Depende de btt y btg.
// Estructura (igual para todos los componentes):
//   Contenedor (Auto Layout, radio alto, Clip content ON, sombra suave Y10 B30 negro 10 %, SIN relleno)
//     └─ "Cristal" (rectángulo, Absolute Position, índice 0 = DETRÁS del contenido, cubre todo el contenedor)
//          Fill glass/fill (Blanco 10 %) · Background blur 40 · Stroke 1 px degradado lineal
//          (Blanco 60 % arriba-izq → 0 % abajo-der) · Inner shadow Y2 B10 Blanco 20 %
//     └─ contenido (texto blanco glass/text)
// Nota: la capa de cristal va DETRÁS del texto. Si quedara encima, su desenfoque de fondo borraría el texto.
// Nota: Figma pinta con paint.opacity e ignora el alfa de la variable; btg.sp copia ese alfa.
const T=bridge.require('btt');const G=bridge.require('btg');
const NAME='Cristal';
function layer(node){let r=(node.children||[]).find(c=>c.name===NAME&&c.type==='RECTANGLE');if(!r){r=figma.createRectangle();r.name=NAME;node.insertChild(0,r);}else if(node.children.indexOf(r)!==0)node.insertChild(0,r);return r;}
function LG(node,o){o=o||{};if(!('children' in node))return null;const vs=T.vmap('Colorido');const strong=o.strong;
 // 1) contenedor
 node.fills=[];node.strokes=[];node.clipsContent=true;
 if(typeof node.cornerRadius==='number'&&node.cornerRadius<12&&!o.keepRadius)node.cornerRadius=o.radius||24;
 node.effects=o.shadow===false?[]:[G.fx('DROP_SHADOW',vs['glass/shadow'],node,{offset:{x:0,y:10},radius:30})];
 // 2) capa de cristal
 const r=layer(node);r.locked=false;
 if(node.layoutMode&&node.layoutMode!=='NONE')r.layoutPositioning='ABSOLUTE';
 r.x=0;r.y=0;r.resize(Math.max(1,node.width),Math.max(1,node.height));r.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
 r.cornerRadius=typeof node.cornerRadius==='number'?node.cornerRadius:24;
 const f=[G.sp(vs[strong?'glass/strong':'glass/fill'],r,1)];r.fills=f;r.fills=f;
 r.strokes=[{type:'GRADIENT_LINEAR',gradientTransform:[[1,1,-0.5],[-1,1,0.5]],gradientStops:[G.stop(vs['glass/rim-hi'],r,0),G.stop(vs['glass/rim-lo'],r,1)],opacity:1,visible:true}];
 r.strokeWeight=1;r.strokeAlign='INSIDE';
 r.effects=[{type:'BACKGROUND_BLUR',radius:o.blur||40,visible:true},G.fx('INNER_SHADOW',vs['glass/sheen'],r,{offset:{x:0,y:2},radius:10})];
 r.locked=true;node.setPluginData('glass',strong?'strong':'fill');G.TEXT(node);return r;}
// Reaplica a una lista de ids en lotes (evita que el plugin se cierre por memoria).
function BATCH(ids,o){let k=0;const err=[];for(const id of ids){const nd=figma.getNodeById(id);if(!nd||nd.type==='INSTANCE')continue;try{LG(nd,o);k++;}catch(e){err.push(id+':'+e.message);}}return {k,err};}
module.exports={LG,BATCH,NAME};
