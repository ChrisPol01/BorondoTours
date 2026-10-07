// Módulo `btg` — vidrio "gota de agua" (liquid glass tipo iOS), vinculado a variables del tema. Depende de btt.
// Receta: relleno translúcido (glass/fill, o glass/strong en menús/modales)
//  + borde 1px con degradado especular (glass/rim-hi arriba-izquierda → glass/rim-lo → glass/rim-hi abajo-derecha)
//  + brillo superior interno (glass/sheen) + resplandor interno suave (glass/glow)
//  + sombra difusa (glass/shadow) + desenfoque de fondo 28 px.
// Por tema: Colorido y Claro = vidrio OSCURO; Oscuro = vidrio CLARO translúcido; Inmersivo (Home azul) = NEUTRO.
// Variante light (glass/light) = vidrio blanco con texto negro, disponible en todos los temas.
// Fondo de página: color + manchas ambientales (AMBIENT) para que el vidrio tenga algo que desenfocar.
// Valores de todas las variables: ../theme-variables.json
const T=bridge.require('btt');
function V(){return T.vmap('Colorido');}
function sp(v,node,op){let c={r:1,g:1,b:1,a:1};try{c=v.resolveForConsumer(node).value;}catch(e){}
 const p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:1},'color',v);return {...p,opacity:(op==null?1:op)*(c.a==null?1:c.a)};}
function stop(v,node,pos){const c=v.resolveForConsumer(node).value;return {position:pos,color:{r:c.r,g:c.g,b:c.b,a:c.a},boundVariables:{color:figma.variables.createVariableAlias(v)}};}
function fx(type,v,node,extra){let c={r:0,g:0,b:0,a:0.2};try{c=v.resolveForConsumer(node).value;}catch(e){}
 const e=Object.assign({type,color:{r:c.r,g:c.g,b:c.b,a:c.a},offset:{x:0,y:0},radius:0,spread:0,visible:true,blendMode:'NORMAL'},extra);
 return figma.variables.setBoundVariableForEffect(e,'color',v);}
// GLASS(node,{strong,blur,shadow})
// Texto sobre vidrio (regla de marca): vidrio oscuro → glass/text (Blanco Niebla);
// vidrio claro (o.light) → glass/light-text (Negro Volcánico). Botones de acción conservan text/on-action.
function TEXT(node){const vs=V();const light=node.getPluginData('glass')==='light';const tok=vs[light?'glass/light-text':'glass/text'];let k=0;
 // Solo textos cuyo fondo inmediato es el vidrio: si un ancestro intermedio tiene relleno propio
 // (botón, chip, tarjeta, otro vidrio) se respeta su color de texto.
 for(const t of node.findAll(x=>x.type==='TEXT')){let p=t.parent,own=false;while(p&&p!==node){const f=Array.isArray(p.fills)&&p.fills.find(z=>z.visible!==false&&(z.type!=='SOLID'||(z.opacity??1)*(z.color.a??1)>0.3));
   if(f||(p.getPluginData&&p.getPluginData('glass'))){own=true;break;}p=p.parent;}
  if(own)continue;const f=[sp(tok,t,1)];t.fills=f;t.fills=f;k++;}return k;}
// GLASS(node,{strong,light,blur,shadow}) — light=true: vidrio claro (texto negro)
function GLASS(node,o){o=o||{};const vs=V();
 const fillTok=o.light?'glass/light':(o.strong?'glass/strong':'glass/fill');
 const f=[sp(vs[fillTok],node,1)];node.fills=f;node.fills=f;
 const rim={type:'GRADIENT_LINEAR',gradientTransform:[[1,1,-0.5],[-1,1,0.5]],gradientStops:[stop(vs['glass/rim-hi'],node,0),stop(vs['glass/rim-lo'],node,0.5),stop(vs['glass/rim-hi'],node,1)],opacity:1,visible:true};
 node.strokes=[rim];node.strokeWeight=1;node.strokeAlign='INSIDE';
 const ef=[];if(o.shadow!==false)ef.push(fx('DROP_SHADOW',vs['glass/shadow'],node,{offset:{x:0,y:10},radius:30}));
 ef.push(fx('INNER_SHADOW',vs['glass/sheen'],node,{offset:{x:0,y:1.5},radius:1}));
 ef.push(fx('INNER_SHADOW',vs['glass/glow'],node,{offset:{x:0,y:0},radius:16}));
 ef.push({type:'BACKGROUND_BLUR',radius:o.blur||28,visible:true});node.effects=ef;node.setPluginData('glass',o.light?'light':(o.strong?'strong':'fill'));if(o.text!==false&&node.findAll)TEXT(node);return node;}
// AMBIENT(root) — capa de fondo con 3 manchas de color desenfocadas (detrás de todo, bloqueada).
// Le da al vidrio algo que desenfocar: sin color detrás, el glass no se percibe.
function AMBIENT(root){const vs=V();const old=root.findChild(x=>x.name==='Fondo ambiental');if(old){old.locked=false;old.remove();}
 const g=figma.createFrame();g.name='Fondo ambiental';g.fills=[];g.clipsContent=true;root.insertChild(0,g);
 if(root.layoutMode&&root.layoutMode!=='NONE')g.layoutPositioning='ABSOLUTE';
 g.x=0;g.y=0;g.resize(root.width,root.height);g.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
 const W=root.width,H=Math.min(root.height,2400);
 const spots=[['ambient/1',W*0.62,-H*0.08,W*0.55],['ambient/2',-W*0.18,H*0.32,W*0.5],['ambient/3',W*0.35,H*0.7,W*0.6]];
 for(const [tok,x,y,d] of spots){const e=figma.createEllipse();e.resize(d,d);e.x=x;e.y=y;const f=[sp(vs[tok],e,1)];e.fills=f;e.fills=f;
  e.effects=[{type:'LAYER_BLUR',radius:Math.round(d*0.35),visible:true}];e.name=tok;g.appendChild(e);}
 g.locked=true;return g;}
module.exports={GLASS,TEXT,AMBIENT,sp,fx,stop};
