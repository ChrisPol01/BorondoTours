// Módulo `btmap` — mapa interactivo de Colombia por departamentos. Depende de `bt`.
// Trazos: @svg-maps/colombia v2.0.0 (Victor Cazanave, basado en MapSVG), licencia CC BY 4.0.
// Los trazos se guardan en bridge.store 'colMap' (descargados desde
// https://raw.githubusercontent.com/VictorCazanave/svg-maps/master/packages/colombia/index.js).
// Fuente de verdad de nombres, código DANE y región: apps/web/src/lib/colombiaMap.ts (META se mantiene igual).
//
// BUILD(parent,x,y): crea 33 component sets "Departamento/<nombre>" con 2 propiedades:
//   Visitado = No | Sí   ·   Estado = Reposo | Hover
//   Interacción: Reposo --(mientras hover, Smart Animate 150 ms)--> Hover.
// MAP(parent,{scale,visited,x,y,inset}): instancia el mapa completo agrupado por región natural;
//   visited = nombres de departamentos con tours completados; inset agrega el recuadro de San Andrés.
const {F,T,sol}=bridge.require('bt');
const META={ama:['91','Amazonas','AMAZONIA'],ant:['05','Antioquia','ANDINA'],ara:['81','Arauca','ORINOQUIA'],atl:['08','Atlántico','CARIBE'],dc:['11','Bogotá D. C.','ANDINA'],bol:['13','Bolívar','CARIBE'],boy:['15','Boyacá','ANDINA'],cal:['17','Caldas','ANDINA'],caq:['18','Caquetá','AMAZONIA'],cas:['85','Casanare','ORINOQUIA'],cau:['19','Cauca','PACIFICA'],ces:['20','Cesar','CARIBE'],cho:['27','Chocó','PACIFICA'],cor:['23','Córdoba','CARIBE'],cun:['25','Cundinamarca','ANDINA'],gua:['94','Guainía','AMAZONIA'],guv:['95','Guaviare','AMAZONIA'],hui:['41','Huila','ANDINA'],lag:['44','La Guajira','CARIBE'],mag:['47','Magdalena','CARIBE'],met:['50','Meta','ORINOQUIA'],nar:['52','Nariño','PACIFICA'],nsa:['54','Norte de Santander','ANDINA'],put:['86','Putumayo','AMAZONIA'],qui:['63','Quindío','ANDINA'],ris:['66','Risaralda','ANDINA'],sap:['88','San Andrés y Providencia','INSULAR'],san:['68','Santander','ANDINA'],suc:['70','Sucre','CARIBE'],tol:['73','Tolima','ANDINA'],vac:['76','Valle del Cauca','PACIFICA'],vid:['99','Vichada','ORINOQUIA'],vau:['97','Vaupés','AMAZONIA']};
const REGIONS={CARIBE:'Caribe',ANDINA:'Andina',PACIFICA:'Pacífica',ORINOQUIA:'Orinoquía',AMAZONIA:'Amazonía',INSULAR:'Insular'};
// Estilo por variante: [relleno, opacidad, trazo, grosor]
const STYLE={'Visitado=No, Estado=Reposo':['ar',1,'bl',1],'Visitado=No, Estado=Hover':['tu',0.55,'az',1.5],'Visitado=Sí, Estado=Reposo':['ve',1,'bl',1],'Visitado=Sí, Estado=Hover':['az',1,'do',2]};
const data=()=>bridge.store.get('colMap');
function vec(path){const w=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+data().viewBox+'"><path d="'+path+'"/></svg>');const v=w.children[0];const x=v.x,y=v.y;figma.currentPage.appendChild(v);w.remove();return {v,x,y};}
async function hoverTo(node,dest){const r=[{trigger:{type:'ON_HOVER'},actions:[{type:'NODE',destinationId:dest.id,navigation:'CHANGE_TO',transition:{type:'SMART_ANIMATE',easing:{type:'EASE_OUT'},duration:0.15},preserveScrollPosition:false}]}];if(node.setReactionsAsync)await node.setReactionsAsync(r);else node.reactions=r;}
async function BUILD(parent,x0,y0){const old=parent.children.find(c=>c.name==='Mapa Colombia / Departamentos');if(old)old.remove();
 const wrap=F(parent,{name:'Mapa Colombia / Departamentos',x:x0,y:y0,w:data().viewBox.split(' ')[2]*1+0,h:data().viewBox.split(' ')[3]*1});wrap.fills=[];
 const out={};
 for(const loc of data().locations){const m=META[loc.id];const comps=[];let off=null;
  for(const key of Object.keys(STYLE)){const {v,x,y}=vec(loc.path);off=off||{x,y};const c=figma.createComponent();c.name=key;c.resize(Math.max(1,v.width),Math.max(1,v.height));c.fills=[];c.appendChild(v);v.x=0;v.y=0;v.name=m[1];const s=STYLE[key];v.fills=[sol(s[0],s[1])];v.strokes=[sol(s[2])];v.strokeWeight=s[3];v.strokeJoin='ROUND';comps.push(c);}
  const set=figma.combineAsVariants(comps,wrap);set.name='Departamento/'+m[1];set.description=m[1]+' · DANE '+m[0]+' · Región '+REGIONS[m[2]];set.setPluginData('dane',m[0]);set.setPluginData('region',m[2]);set.setPluginData('offx',String(off.x));set.setPluginData('offy',String(off.y));
  set.layoutMode='HORIZONTAL';set.itemSpacing=16;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=16;set.primaryAxisSizingMode='AUTO';set.counterAxisSizingMode='AUTO';
  const by=n=>set.children.find(c=>c.name===n);
  await hoverTo(by('Visitado=No, Estado=Reposo'),by('Visitado=No, Estado=Hover'));await hoverTo(by('Visitado=Sí, Estado=Reposo'),by('Visitado=Sí, Estado=Hover'));
  out[loc.id]=set;}
 // Grilla ordenada de los 33 sets
 wrap.layoutMode='HORIZONTAL';wrap.layoutWrap='WRAP';wrap.itemSpacing=24;wrap.counterAxisSpacing=24;wrap.primaryAxisSizingMode='FIXED';wrap.counterAxisSizingMode='AUTO';wrap.resize(2400,wrap.height);
 return Object.keys(out).length;}
function sets(){const r={};figma.currentPage.findAll(n=>n.type==='COMPONENT_SET'&&n.name.startsWith('Departamento/')).forEach(s=>r[s.name.slice(13)]=s);return r;}
function MAP(parent,o={}){const k=o.scale||1;const vb=data().viewBox.split(' ').map(Number);const f=F(parent,{name:o.name||'Mapa Colombia',w:Math.round(vb[2]*k),h:Math.round(vb[3]*k),x:o.x,y:o.y});f.fills=[];f.clipsContent=false;
 const vis=new Set(o.visited||[]);const all=sets();const regs={};
 for(const [name,set] of Object.entries(all)){const reg=set.getPluginData('region');if(!regs[reg]){regs[reg]=F(f,{name:'Región/'+REGIONS[reg],w:f.width,h:f.height,x:0,y:0});regs[reg].fills=[];}
  const v=set.children.find(c=>c.name===(vis.has(name)?'Visitado=Sí, Estado=Reposo':'Visitado=No, Estado=Reposo'));const i=v.createInstance();i.name=name;regs[reg].appendChild(i);
  i.rescale(k);i.x=Number(set.getPluginData('offx'))*k;i.y=Number(set.getPluginData('offy'))*k;}
 // Recuadro ampliado: San Andrés y Providencia es muy pequeño a escala nacional
 if(o.inset!==false){const sap=f.findOne(n=>n.type==='INSTANCE'&&n.name.startsWith('San Andrés'));if(sap){const box=F(f,{name:'Recuadro San Andrés y Providencia',dir:'v',gap:6,pad:10,r:12,fill:[sol('az',0.06)],stroke:'az',sop:0.25,align:'CENTER',x:0,y:0});box.appendChild(sap);box.dashPattern=[4,3];sap.rescale(28/Math.max(sap.height,0.5));sap.findAll(v=>v.type==='VECTOR').forEach(v=>{v.strokes=[sol('az',0.5)];v.strokeWeight=1;});T(box,'San Andrés',{size:Math.max(9,Math.round(11*k*1.3)),c:'co'});}}
 return f;}
module.exports={META,REGIONS,STYLE,BUILD,MAP,sets};
