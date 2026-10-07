// Módulo 'btcs' — Estados de controles del Design System (2026-09-29).
// Construye component sets con propiedad Estado para: Button, Input, Chip, Tab, Checkbox y Radio.
// Depende de: bt (texto, iconos, fuentes), btqf (pintura con variables), btlg (liquid glass).
// Decisiones:
//  - Alturas en múltiplos de 8: S 32 · M 40 · L 48 (L = objetivo táctil ≥ 44 px en móvil).
//  - Anillo de foco: 2 px por fuera con 'text/primary' (en Colorido 'focus' = turquesa = relleno del
//    botón primario y el anillo no se vería).
//  - Deshabilitado: opacidad 50 %. Cargando: spinner + "Cargando…", sin interacción.
//  - Todo va enlazado a variables del tema Colorido; en copias Claro/Oscuro se aplica btt.APPLY.
const B=bridge.require('bt'); const Q=bridge.require('btqf'); const L=bridge.require('btlg');
const V=()=>Q.vars();
const SIZES={S:{h:32,px:14,fs:13,ic:16},M:{h:40,px:20,fs:14,ic:18},L:{h:48,px:24,fs:16,ic:20}};
function fill(n,name,op){Q.setP(n,'fills',V()[name],op??1);}
function stroke(n,name,w,align,op){Q.setP(n,'strokes',V()[name],op??1);n.strokeWeight=w;n.strokeAlign=align||'INSIDE';}
function txt(parent,s,o){const t=B.T(parent,s,{size:o.size,s:o.w||'Regular'});fill(t,o.c||'glass/text',1);t.name=o.name||s;return t;}
function ico(parent,name,size,c){const i=B.I(parent,name,{size});i.findAll(v=>'strokes' in v&&v.strokes.length).forEach(v=>Q.setP(v,'strokes',V()[c],1));return i;}
function ring(n){stroke(n,'text/primary',2,'OUTSIDE');}
function pressed(n){n.effects=[...(n.effects||[]),{type:'INNER_SHADOW',color:{r:0.06,g:0.1,b:0.17,a:0.28},offset:{x:0,y:2},radius:6,spread:0,visible:true,blendMode:'NORMAL'}];}
function spinner(parent,size,c){const e=figma.createEllipse();e.name='spinner';e.resize(size,size);e.fills=[];stroke(e,c,2,'CENTER');e.arcData={startingAngle:0,endingAngle:Math.PI*1.5,innerRadius:0};e.strokeCap='ROUND';parent.appendChild(e);return e;}
function hbox(c,h,px,gap,r){c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='AUTO';c.counterAxisSizingMode='FIXED';c.resize(Math.max(c.width,40),h);c.paddingLeft=c.paddingRight=px;c.paddingTop=c.paddingBottom=0;c.itemSpacing=gap;c.primaryAxisAlignItems='CENTER';c.counterAxisAlignItems='CENTER';c.cornerRadius=r;c.fills=[];}
function frameSet(set,cols,gx,gy){const k=set.children;let x=24,y=24,rowH=0;k.forEach((c,i)=>{if(i&&i%cols===0){x=24;y+=rowH+gy;rowH=0;}c.x=x;c.y=y;x+=c.width+gx;rowH=Math.max(rowH,c.height);});
 let w=0,h=0;k.forEach(c=>{w=Math.max(w,c.x+c.width);h=Math.max(h,c.y+c.height);});set.resizeWithoutConstraints(w+24,h+24);
 set.fills=[];set.cornerRadius=16;set.strokes=[{type:'SOLID',color:{r:0.59,g:0.28,b:1}}];set.dashPattern=[6,4];set.strokeWeight=1;}
// ---------- Button ----------
const BTN_STATES=['Default','Hover','Pressed','Focus','Disabled','Loading'];
function button(variant,state,size){const z=SIZES[size];const c=figma.createComponent();c.name='Variante='+variant+', Estado='+state+', Tamaño='+size;
 const r=variant==='Ghost'?12:999;hbox(c,z.h,z.px,8,r);
 const onSolid=variant==='Primario'||variant==='CTA';const ink=onSolid?'text/on-action':(variant==='Ghost'?'text/muted':'glass/text');
 if(variant==='Outline'){L.LG(c,{keepRadius:true,shadow:false});stroke(c,'glass/border',1,'INSIDE',0.4);}
 if(onSolid){fill(c,variant==='CTA'?'action/cta':'action/primary');}
 if(state==='Hover'||state==='Pressed'){
  if(onSolid)fill(c,'action/primary-hover');
  if(variant==='Outline'){const cr=c.children.find(k=>k.name==='Cristal');cr.locked=false;fill(cr,'glass/surface',0.14);cr.locked=true;}
  if(variant==='Ghost')fill(c,'tint',0.16);
  if(state==='Pressed')pressed(c);}
 if(state==='Focus')ring(c);
 if(state==='Loading'){spinner(c,z.ic-2,ink);}
 else{const i=ico(c,'calendar',z.ic,ink);i.name='icono';}
 const t=txt(c,state==='Loading'?'Cargando…':'Reservar',{size:z.fs,w:'Semi Bold',c:ink,name:'Etiqueta'});
 if(state==='Disabled')c.opacity=0.5;
 if(state==='Loading')c.setPluginData('aria','aria-busy=true');
 return c;}
function BUTTONS(host){const out=[];for(const v of ['Primario','CTA','Outline','Ghost']){for(const s of BTN_STATES)out.push(button(v,s,'M'));out.push(button(v,'Default','S'));out.push(button(v,'Default','L'));}
 out.forEach(c=>host.appendChild(c));const set=figma.combineAsVariants(out,host);set.name='Button';frameSet(set,8,24,24);
 const pT=set.addComponentProperty('Etiqueta','TEXT','Reservar');const pI=set.addComponentProperty('Icono','BOOLEAN',true);
 for(const c of set.children){const t=c.findOne(n=>n.name==='Etiqueta');if(t&&t.characters!=='Cargando…')t.componentPropertyReferences={characters:pT};const i=c.findOne(n=>n.name==='icono');if(i)i.componentPropertyReferences={visible:pI};}
 return set;}
// ---------- Input ----------
const INPUT_STATES=['Default','Hover','Focus','Filled','Error','Success','Disabled'];
function input(state){const c=figma.createComponent();c.name='Estado='+state;c.layoutMode='VERTICAL';c.primaryAxisSizingMode='AUTO';c.counterAxisSizingMode='FIXED';c.resize(320,100);c.itemSpacing=8;c.fills=[];
 txt(c,'Correo electrónico',{size:13,w:'Semi Bold',c:'text/primary',name:'Etiqueta'});
 const f=figma.createFrame();f.name='Campo';c.appendChild(f);hbox(f,48,16,10,12);f.primaryAxisSizingMode='FIXED';f.layoutAlign='STRETCH';f.primaryAxisAlignItems='MIN';
 L.LG(f,{keepRadius:true,shadow:false});
 ico(f,'mail',18,'glass/text');
 const filled=['Filled','Error','Success'].includes(state);const val=txt(f,filled?'andres.morales@correo.com':'tu@correo.com',{size:15,c:filled?'glass/text':'text/muted',name:'Valor'});val.layoutGrow=1;
 if(state==='Hover')stroke(f,'glass/border',1,'INSIDE',0.6);
 if(state==='Focus')ring(f);
 if(state==='Error')stroke(f,'status/danger',2,'INSIDE');
 if(state==='Success')stroke(f,'status/available',2,'INSIDE');
 const h=figma.createFrame();h.name='Ayuda';c.appendChild(h);h.layoutMode='HORIZONTAL';h.primaryAxisSizingMode='AUTO';h.counterAxisSizingMode='AUTO';h.itemSpacing=6;h.counterAxisAlignItems='CENTER';h.fills=[];
 const hc=state==='Error'?'status/danger':(state==='Success'?'status/available':'text/muted');
 if(state==='Error')ico(h,'info',14,hc);if(state==='Success')ico(h,'check',14,hc);
 txt(h,state==='Error'?'Revisa el formato del correo.':(state==='Success'?'Correo verificado.':'Te enviaremos la confirmación aquí.'),{size:12,c:hc,name:'Texto de ayuda'});
 if(state==='Disabled')c.opacity=0.5;return c;}
function INPUTS(host){const out=INPUT_STATES.map(input);out.forEach(c=>host.appendChild(c));const set=figma.combineAsVariants(out,host);set.name='Input';frameSet(set,4,32,32);return set;}
// ---------- Chip ----------
const CHIP_STATES=['Default','Hover','Seleccionado','Focus','Disabled'];
function chip(state){const c=figma.createComponent();c.name='Estado='+state;hbox(c,32,14,6,999);L.LG(c,{keepRadius:true,shadow:false});
 const sel=state==='Seleccionado';const ink=sel?'text/on-action':'glass/text';const cr=c.children.find(k=>k.name==='Cristal');cr.locked=false;
 if(sel)fill(cr,'action/primary');if(state==='Hover')fill(cr,'glass/surface',0.14);cr.locked=true;
 ico(c,'leaf',16,ink);txt(c,'Naturaleza',{size:13,w:sel?'Semi Bold':'Regular',c:ink,name:'Etiqueta'});
 if(state==='Focus')ring(c);if(state==='Disabled')c.opacity=0.5;return c;}
function CHIPS(host){const out=CHIP_STATES.map(chip);out.forEach(c=>host.appendChild(c));const set=figma.combineAsVariants(out,host);set.name='Chip';frameSet(set,5,24,24);return set;}
// ---------- Tab ----------
const TAB_STATES=['Default','Hover','Activa','Focus','Disabled'];
function tab(state){const c=figma.createComponent();c.name='Estado='+state;hbox(c,40,16,6,999);
 const act=state==='Activa';if(act)fill(c,'action/primary',0.16);if(state==='Hover')fill(c,'tint',0.12);
 txt(c,'Próximas',{size:14,w:act?'Semi Bold':'Regular',c:act||state==='Hover'?'glass/text':'text/muted',name:'Etiqueta'});
 if(state==='Focus')ring(c);if(state==='Disabled')c.opacity=0.5;return c;}
function TABS(host){const out=TAB_STATES.map(tab);out.forEach(c=>host.appendChild(c));const set=figma.combineAsVariants(out,host);set.name='Tab';frameSet(set,5,24,24);return set;}
// ---------- Checkbox / Radio ----------
const CHECK_STATES=['Off','On','Indeterminado','Focus','Error','Disabled'];
function check(kind,state){const c=figma.createComponent();c.name='Estado='+state;c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='AUTO';c.counterAxisSizingMode='AUTO';c.itemSpacing=10;c.counterAxisAlignItems='CENTER';c.fills=[];
 const b=kind==='Radio'?figma.createEllipse():figma.createFrame();b.name='control';b.resize(20,20);c.appendChild(b);b.fills=[];
 if(kind!=='Radio'){b.cornerRadius=6;b.layoutMode='HORIZONTAL';b.primaryAxisAlignItems='CENTER';b.counterAxisAlignItems='CENTER';b.primaryAxisSizingMode='FIXED';b.counterAxisSizingMode='FIXED';b.clipsContent=false;}
 const on=state==='On'||state==='Indeterminado';
 if(kind==='Radio'){stroke(b,on?'action/primary':(state==='Error'?'status/danger':'text/muted'),2,'INSIDE');
  if(on){const d=figma.createEllipse();d.name='punto';d.resize(10,10);fill(d,'action/primary');c.appendChild(d);d.layoutPositioning='ABSOLUTE';d.x=5;d.y=b.y+5;}}
 else{if(on){fill(b,'action/primary');ico(b,state==='On'?'check':'minus',14,'text/on-action');}else stroke(b,state==='Error'?'status/danger':'text/muted',state==='Error'?2:1.5,'INSIDE');}
 if(state==='Focus')ring(b);
 txt(c,kind==='Radio'?'Residente en Colombia':'Acepto la política de datos',{size:14,c:state==='Error'?'status/danger':'text/primary',name:'Etiqueta'});
 if(state==='Disabled')c.opacity=0.5;return c;}
function CHECKS(host,kind){const st=kind==='Radio'?CHECK_STATES.filter(s=>s!=='Indeterminado'):CHECK_STATES;const out=st.map(s=>check(kind,s));out.forEach(c=>host.appendChild(c));const set=figma.combineAsVariants(out,host);set.name=kind;frameSet(set,6,32,24);
 // el punto del radio se posiciona tras combinar (coordenadas relativas al componente)
 if(kind==='Radio')set.children.forEach(c=>{const d=c.findOne(n=>n.name==='punto');const b=c.findOne(n=>n.name==='control');if(d&&b){d.x=b.x+5;d.y=b.y+5;}});return set;}
async function BUILD(parent,x,y){await B.fonts();
 const host=figma.createFrame();host.name='Estados — Controles (componentes)';parent.appendChild(host);host.x=x;host.y=y;
 host.layoutMode='VERTICAL';host.itemSpacing=40;host.paddingLeft=host.paddingRight=host.paddingTop=host.paddingBottom=40;host.primaryAxisSizingMode='AUTO';host.counterAxisSizingMode='AUTO';host.fills=[];
 const title=(s,sub)=>{const g=figma.createFrame();g.name='Título · '+s;g.fills=[];g.layoutMode='VERTICAL';g.itemSpacing=4;g.primaryAxisSizingMode='AUTO';g.counterAxisSizingMode='AUTO';host.appendChild(g);
  const t=B.T(g,s,{f:'Sora',s:'Bold',size:24});fill(t,'text/primary');const d=B.T(g,sub,{size:13});fill(d,'text/muted');};
 const sets={};
 title('Button','Variante × Estado (M) + tamaños S/M/L. Alturas 32/40/48. Foco: anillo 2 px. Deshabilitado 50 %.');sets.button=BUTTONS(host);
 title('Input','Default · Hover · Focus · Filled · Error · Success · Disabled. Error y éxito llevan icono además del color.');sets.input=INPUTS(host);
 title('Chip','Default · Hover · Seleccionado · Focus · Disabled.');sets.chip=CHIPS(host);
 title('Tab','Default · Hover · Activa · Focus · Disabled.');sets.tab=TABS(host);
 title('Checkbox','Off · On · Indeterminado · Focus · Error · Disabled.');sets.checkbox=CHECKS(host,'Checkbox');
 title('Radio','Off · On · Focus · Error · Disabled.');sets.radio=CHECKS(host,'Radio');
 const r={host:host.id};for(const k in sets)r[k]={id:sets[k].id,n:sets[k].children.length};return r;}
return {BUILD,BUTTONS,INPUTS,CHIPS,TABS,CHECKS,SIZES};
