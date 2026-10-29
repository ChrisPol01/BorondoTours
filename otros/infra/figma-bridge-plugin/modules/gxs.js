// gxs — tableros y pantallas de la página "B2B · Gestión" (app de gestión). Depende de gx, btt, btmx2.
// Tableros: Colorido (canónico, pluginData canon=1) · Claro · Oscuro (copias con src = id del canónico).
// Geometría en bridge.store 'gxGeo': {page, secs:{Colorido,Claro,Oscuro}, rows:[{key,label,y,dY,mY,dH,mH}], next}
// Columnas = estados: Normal · Carga · Vacío · Error · Sin permiso · Módulo bloqueado · Éxito.
const g=bridge.require('gx');const T=bridge.require('btt');const X=bridge.require('btmx2');
const PAD=120,LABEL=560,DX=1640,MX=490,BW=12280,GAPB=1200;
const STATES=['Normal','Carga','Vacío','Error','Sin permiso','Módulo bloqueado','Éxito'];
const THX={Colorido:0,Claro:BW+GAPB,Oscuro:2*(BW+GAPB)};
function geo(){return bridge.store.get('gxGeo');}
function comp(){return bridge.store.get('gxComp');}
function cellX(dev,i){return PAD+LABEL+i*(dev==='D'?DX:MX);}
// Fondo idéntico al B2C: se clona de una pantalla canónica del tablero Colorido del B2C (solo lectura del original).
function bg(f,dev){const src=figma.getNodeById(dev==='D'?'93:83928':'93:84220');const V=g.V();
 const fl=[g.G.sp(V['surface/page'],f,1),{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[g.G.stop(V['bg/top'],f,0),g.G.stop(V['bg/bottom'],f,1)],opacity:1,visible:true}];f.fills=fl;f.fills=fl;
 const keep=src.children.filter(c=>c.name==='Fondo ambiental'||c.name==='Patrón topográfico');for(const k of keep){const c=k.clone();f.appendChild(c);c.x=k.x;c.y=k.y;c.locked=false;if(c.name==='Fondo ambiental')c.resize(f.width,f.height);c.constraints={horizontal:'STRETCH',vertical:c.name==='Fondo ambiental'?'STRETCH':'MIN'};c.locked=true;}}
// Pantalla base con chrome. o:{row,dev,name,alc:'Cliente'|'Plataforma',group,active,title(móvil),tab:'Agencia'|'Operador'|'Plataforma',tabActive}
function SCREEN(o){const G=geo();const sec=figma.getNodeById(G.secs.Colorido);const C=comp();const D=o.dev==='D';const f=figma.createFrame();sec.appendChild(f);f.name=o.name;f.resize(D?1440:390,D?1024:844);f.clipsContent=true;bg(f,o.dev);
 let sb=null,tb=null,top=null;
 if(D){const set=figma.getNodeById(C.sidebar);sb=set.children.find(v=>v.name==='Estado='+(o.collapsed?'Colapsado':'Expandido')+', Alcance='+(o.alc||'Cliente')).createInstance();f.appendChild(sb);sb.x=16;sb.y=16;sb.name='AppSidebar';if(!o.collapsed)setActive(sb,o.group,o.active);}
 else{top=figma.getNodeById(C.topBar).createInstance();f.appendChild(top);top.x=16;top.y=12;top.name='AppTopBar';g.setProp(top,'Título',o.title||o.active||'Inicio');
  const ts=figma.getNodeById(C.tabBar);tb=ts.children.find(v=>v.name==='Perfil='+(o.tab||'Agencia')).createInstance();f.appendChild(tb);tb.name='MobileTabBar';tb.x=16;
  if(o.tabActive!=null){tb.children.forEach((t,i)=>{if(t.type==='INSTANCE')t.setProperties({Estado:i===o.tabActive?'Activo':'Reposo'});});}}
 const ct=g.box(f,{name:'Contenido',dir:'v',gap:D?24:16});ct.counterAxisSizingMode='FIXED';ct.resize(D?(o.collapsed?1256:1072):358,100);ct.primaryAxisSizingMode='AUTO';ct.x=D?(o.collapsed?136:328):16;ct.y=D?40:80;
 f.setPluginData('row',o.row);f.setPluginData('dev',o.dev);f.setPluginData('cell','0');f.setPluginData('canon','1');f.setPluginData('theme','Colorido');f.setPluginData('gx','1');
 return {f,ct,sb,tb,top};}
function setActive(sb,group,active){for(const gr of sb.findAll(x=>x.type==='FRAME'&&x.name.startsWith('Grupo · '))){const k=gr.name.slice(8);const open=k===group;const h=gr.children.find(x=>x.type==='INSTANCE');if(h)h.setProperties({Estado:open?'Abierto':'Cerrado'});const it=gr.children.find(x=>x.name.startsWith('Items · '));if(it)it.visible=open;}
 if(active){const it=sb.findOne(x=>x.type==='INSTANCE'&&x.name==='Item / '+active);if(it)it.setProperties({Estado:'Activo'});}}
// Ajusta alto y chrome al contenido, fija sizing y sincroniza opacidades de paints vinculados.
function FIT(f,minH){const D=f.width>1000;const ct=f.findChild(x=>x.name==='Contenido');const H=Math.max(minH||(D?1024:844),Math.ceil(ct.y+ct.height+(D?40:100)));f.resize(f.width,H);
 const sb=f.findChild(x=>x.name==='AppSidebar');if(sb)sb.resize(sb.width,H-32);const tb=f.findChild(x=>x.name==='MobileTabBar');if(tb){tb.y=H-84;}
 for(const c of f.children)if(c.name==='Fondo ambiental'){c.locked=false;c.resize(f.width,H);c.locked=true;}
 if(tb){f.appendChild(tb);} const top=f.findChild(x=>x.name==='AppTopBar');if(top)f.appendChild(top);
 T.SYNC(f);return H;}
// Coloca el canónico en su fila/celda; crea la fila si no existe (alto = máximos de D y M).
function ROW(key,label){const G=geo();let r=G.rows.find(x=>x.key===key);if(r)return r;r={key,label,y:G.next,dY:G.next+80,mY:null,dH:0,mH:0};G.rows.push(r);bridge.store.set('gxGeo',G);return r;}
function PLACE(f,key,cell){const G=geo();const r=G.rows.find(x=>x.key===key);const dev=f.getPluginData('dev');f.x=cellX(dev,cell);f.setPluginData('cell',String(cell));
 if(dev==='D'){f.y=r.dY;r.dH=Math.max(r.dH,f.height);} else {if(r.mY==null)r.mY=r.dY+r.dH+200;f.y=r.mY;r.mH=Math.max(r.mH,f.height);}
 const end=(r.mY!=null?r.mY+r.mH:r.dY+r.dH)+360;if(end>G.next)G.next=end;bridge.store.set('gxGeo',G);return f;}
// Etiquetas de fila en los 3 tableros (texto con variables del tema de cada tablero).
async function LABELS(key){const G=geo();const r=G.rows.find(x=>x.key===key);await g.bt.fonts();for(const th of ['Colorido','Claro','Oscuro']){const sec=figma.getNodeById(G.secs[th]);for(const old of sec.children.filter(c=>c.getPluginData('rowlabel')===key))old.remove();const vm=T.vmap(th);
  const mk=(s,y,size,fam,sty)=>{const t=figma.createText();sec.appendChild(t);t.fontName={family:fam,style:sty};t.characters=s;t.fontSize=size;t.x=PAD;t.y=y;t.resize(LABEL-80,t.height);t.textAutoResize='HEIGHT';const p=[g.G.sp(vm['text/primary'],t,1)];t.fills=p;t.fills=p;t.setPluginData('rowlabel',key);return t;};
  mk(r.label,r.y,56,'Sora','Bold');mk('Desktop',r.dY+80,28,'Inter','Regular');if(r.mY!=null)mk('Móvil',r.mY,28,'Inter','Regular');}}
// Copia Claro/Oscuro de un canónico (misma posición relativa en el tablero del tema).
function COPY(canonId,theme){const G=geo();const canon=figma.getNodeById(canonId);const sec=figma.getNodeById(G.secs[theme]);const prev=sec.children.find(c=>c.type==='FRAME'&&c.getPluginData('src')===canonId);const px=prev?prev.x:canon.x,py=prev?prev.y:canon.y;if(prev)prev.remove();
 const c=canon.clone();sec.appendChild(c);T.COPYOP(canon,c);c.x=px;c.y=py;c.name=canon.name+' · '+theme;for(const k of ['row','dev','cell','gx'])c.setPluginData(k,canon.getPluginData(k));c.setPluginData('canon','');c.setPluginData('src',canonId);T.APPLY(c,theme);c.setPluginData('theme',theme);X.GRAD(c);X.FX(c);T.SYNC(c);return c.id;}
module.exports={PAD,LABEL,DX,MX,BW,STATES,THX,geo,comp,cellX,SCREEN,setActive,FIT,ROW,PLACE,LABELS,COPY};
