// gxa — Acceso a la app de gestión: iniciar sesión y registro de empresa (sin sidebar). Depende de gx, gxs, gxb.
// ACCESO(dev, cell): 0 Iniciar sesión · 1 Carga · 2 Registro de empresa · 3 Error de credenciales ·
// 4 Sin acceso a la app · 5 Organización suspendida/en revisión · 6 Correo de verificación enviado.
const g=bridge.require('gx');const S=bridge.require('gxs');const B=bridge.require('gxb');
async function ACCESO(dev,cell){await g.bt.fonts();const D=dev==='D';S.ROW('acceso','Acceso · Iniciar sesión y registro de empresa');const G=S.geo();const sec=figma.getNodeById(G.secs.Colorido);
 const f=figma.createFrame();sec.appendChild(f);f.name='Acceso / '+(D?'Desktop':'Móvil')+' — '+S.STATES[cell];f.resize(D?1440:390,D?1024:844);f.clipsContent=true;S.bg(f,dev);
 for(const [k,v] of [['row','acceso'],['dev',dev],['cell',String(cell)],['canon','1'],['theme','Colorido'],['gx','1']])f.setPluginData(k,v);
 const ct=g.box(f,{name:'Contenido',dir:D?'h':'v',gap:D?64:24,align:D?'CENTER':'MIN'});ct.counterAxisSizingMode=D?'AUTO':'FIXED';if(!D){ct.resize(358,100);ct.primaryAxisSizingMode='AUTO';}ct.x=D?120:16;ct.y=D?96:40;
 // Panel de marca
 const brand=g.box(ct,{name:'Marca',dir:'v',gap:20});if(D){brand.counterAxisSizingMode='FIXED';brand.resize(560,100);brand.primaryAxisSizingMode='AUTO';}else brand.layoutAlign='STRETCH';
 const lg=figma.getNodeById('18:121').createInstance();brand.appendChild(lg);const w=lg.findOne(x=>x.name==='wordmark');if(w)g.fill(w,'text/primary');
 g.tx(brand,'BORONDOTECH · APP DE GESTIÓN',{s:'Semi Bold',size:12,ls:8,tok:'text/muted'});
 g.tx(brand,'Tu agencia y tu operación en un solo lugar',{f:'Sora',s:'Bold',size:D?44:28,tok:'text/primary',stretch:true,lh:115});
 if(D){for(const [ic,t] of [['kanban','CRM, cotizaciones y bandeja de WhatsApp e Instagram'],['route','Tours, cupos en tiempo real, manifiestos y planificación'],['shield','Documentos validados con IA y liquidaciones claras']]){const r=B.ROWF(brand,{gap:12,align:'CENTER'});const ib=g.box(r,{dir:'h',w:40,h:40,r:12,align:'CENTER',just:'CENTER',tok:'action/primary'});B.icoI(ib,ic,'text/on-action',18);g.tx(r,t,{size:16,tok:'text/primary'});}}
 // Tarjeta de formulario
 const card=B.CARD(ct,null,{w:D?480:358,gap:16,pad:D?32:24,strong:true});const reg=cell===2;
 const tabs=B.ROWF(card,{name:'Pestañas',gap:4});B.tab(tabs,'Iniciar sesión',!reg);B.tab(tabs,'Registrar empresa',reg);
 const title=g.tx(card,reg?'Crea la cuenta de tu empresa':(cell===6?'Revisa tu correo':'Bienvenido de nuevo'),{f:'Sora',s:'SemiBold',size:24,stretch:true});
 const msg=(tipo,t,d)=>{const m=g.inst(B.MSG,{Tipo:tipo},card);m.layoutAlign='STRETCH';const ts=m.findAll(x=>x.type==='TEXT');if(ts[0])ts[0].characters=t;if(ts[1])ts[1].characters=d;return m;};
 if(cell===3)msg('Error','Correo o contraseña incorrectos','Revisa los datos e inténtalo de nuevo. Tras 5 intentos esperaremos 15 minutos.');
 if(cell===4)msg('Aviso','Tu cuenta no tiene acceso a la app de gestión','Pídele a la persona administradora de tu empresa que te invite desde Equipo y permisos.');
 if(cell===5)msg('Aviso','Tu organización está en revisión','Puedes iniciar sesión y preparar tu perfil. Publicar tours se habilita cuando validemos tus documentos.');
 if(cell===6){msg('Éxito','Enviamos un enlace a lau•••@borondotours.com','Ábrelo en los próximos 30 minutos para confirmar tu correo y entrar.');B.btn(card,'Reenviar enlace','Outline').layoutSizingHorizontal='FILL';}
 else if(reg){B.input(card,'Nombre de la empresa','BorondoTours SAS',null,'Filled');B.input(card,'NIT','901.000.000-1','Lo verificamos con la Cámara de Comercio después del registro.','Filled');B.input(card,'Tu correo','laura@empresa.com',null,'Default');
  const ty=g.tx(card,'¿Qué hace tu empresa?',{s:'Semi Bold',size:14});const r=B.ROWF(card,{gap:8,wrap:true});B.chip(r,'Vendo tours (agencia)',true);B.chip(r,'Opero tours (operador)',true);
  g.tx(card,'Los documentos (RNT, Cámara de Comercio, RUT) se suben después de iniciar sesión.',{size:13,stretch:true});const ck=g.inst(B.CHECK,{Estado:'Off'},card);g.setT(ck,null,'Acepto términos y la política de datos (Ley 1581)');B.btn(card,'Crear cuenta','Primario').layoutSizingHorizontal='FILL';}
 else{B.input(card,'Correo','laura@borondotours.com',null,cell===3?'Error':'Filled');const pw=B.input(card,'Contraseña','••••••••••',cell===3?'Correo o contraseña incorrectos.':null,cell===3?'Error':'Filled');
  const r=B.ROWF(card,{gap:8,align:'CENTER'});const ck=g.inst(B.CHECK,{Estado:'Off'},r);g.setT(ck,null,'Recordarme');const sp=g.box(r,{dir:'h'});sp.layoutGrow=1;g.tx(r,'¿Olvidaste tu contraseña?',{s:'Semi Bold',size:14,tok:'action/primary'});
  const b=B.btn(card,cell===1?'Entrando…':'Iniciar sesión','Primario',{estado:cell===1?'Loading':'Default'});b.layoutSizingHorizontal='FILL';
  const sso=B.btn(card,'Continuar con Google','Outline');sso.layoutSizingHorizontal='FILL';}
 g.tx(card,'¿Eres viajero? Reserva en borondotours.com',{size:13,stretch:true,al:'CENTER'});
 B.SEAL(f);const H=Math.max(D?1024:844,Math.ceil(ct.y+ct.height+(D?96:40)));f.resize(f.width,H);for(const c of f.children)if(c.name==='Fondo ambiental'){c.locked=false;c.resize(f.width,H);c.locked=true;}if(D){ct.y=Math.round((H-ct.height)/2);}
 S.T.SYNC(f);S.PLACE(f,'acceso',cell);const G2=S.geo();G2.done.acceso=G2.done.acceso||{D:[],M:[]};G2.done.acceso[dev][cell]=f.id;bridge.store.set('gxGeo',G2);return f.id;}
module.exports={ACCESO};
