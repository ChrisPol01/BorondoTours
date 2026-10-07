// Módulo `btq` — auditoría de calidad visual de pantallas (contraste WCAG, colores sin variable, chrome falso).
// No modifica nada: solo reporta. Las correcciones viven en btq.FIX.
const lum=c=>{const f=x=>x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);};
const ratio=(a,b)=>{const L1=lum(a),L2=lum(b);return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);};
const mix=(fg,a,bg)=>({r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a)});
// Color real del paint: si está vinculado a una variable se resuelve el RGB. Figma pinta con paint.opacity
// e IGNORA el alfa de la variable; por eso btt/btg copian el alfa de la variable a paint.opacity.
function paintColor(f,n){const b=f.boundVariables&&f.boundVariables.color;if(b){try{const v=figma.variables.getVariableById(b.id);if(v)return v.resolveForConsumer(n).value;}catch(e){}}return f.color;}
function solid(n){if(!('fills' in n)||!Array.isArray(n.fills))return null;const fs=n.fills.filter(f=>f.visible!==false);for(let i=fs.length-1;i>=0;i--){const f=fs[i];if(f.type==='IMAGE'||f.type.indexOf('GRADIENT')===0)return {img:true};if(f.type==='SOLID'){const c=paintColor(f,n);const a=(f.opacity==null?1:f.opacity);if(a>0.02)return {c:{r:c.r,g:c.g,b:c.b},a};}}return null;}
// Fondo efectivo: compone capas translúcidas de los ancestros hasta una opaca (o blanco).
// Vidrio (pluginData glass): se evalúa como opaco con su propio color, porque lo que haya detrás cambia
// (foto, fondo ambiental). Así el texto negro sobre vidrio oscuro no pasa por componerse con blanco.
function isGlass(p){return (p.getPluginData&&p.getPluginData('glass'))||(p.type==='INSTANCE'&&p.mainComponent&&p.mainComponent.getPluginData('glass'));}
// El vidrio se compone sobre surface/page del MISMO tema que su relleno (no sobre blanco).
function glassBase(p){const f=(p.fills||[]).find(z=>z.visible!==false&&z.boundVariables&&z.boundVariables.color);if(!f)return null;const v=figma.variables.getVariableById(f.boundVariables.color.id);if(!v)return null;
 const pg=figma.variables.getLocalVariables('COLOR').find(x=>x.variableCollectionId===v.variableCollectionId&&x.name==='surface/page');return pg?pg.resolveForConsumer(p).value:null;}
// Liquid glass (btlg): el contenedor no tiene relleno; el vidrio está en su hijo "Cristal" (índice 0).
function cristal(p){const c=p.children&&p.children[0];return c&&c.name==='Cristal'&&c.type==='RECTANGLE'?c:null;}
function bgOf(n){const layers=[];let p=n.parent;while(p&&p.type!=='PAGE'&&p.type!=='SECTION'){const g=cristal(p)||p;const s=solid(g);if(s){if(s.img)return {img:true};if(isGlass(g)){const base=glassBase(g);layers.push(base?{c:mix(s.c,s.a,base),a:1}:{c:s.c,a:1});break;}layers.push(s);if(s.a>=0.95)break;}p=p.parent;}
 let c={r:1,g:1,b:1};for(let i=layers.length-1;i>=0;i--)c=mix(layers[i].c,layers[i].a,c);return {c};}
function hex(c){return '#'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');}
// Pantallas: viven en los tableros "16 · Pantallas y estados — <tema>" (pluginData board).
// screens() = tema Colorido (canónico); screens('Claro'|'Oscuro'|'*') para los demás.
function screens(theme){theme=theme||'Colorido';const out=[];const pg=figma.getNodeById('0:1');for(const s of pg.children){if(s.type!=='SECTION')continue;const b=s.getPluginData('board');if(!b||(theme!=='*'&&b!==theme))continue;for(const f of s.children)if(['FRAME','COMPONENT','INSTANCE'].indexOf(f.type)>=0)out.push(f);}return out;}
function inInst(n){let p=n.parent;while(p){if(p.type==='INSTANCE')return true;p=p.parent;}return false;}
function contrast(root){const bad=[];const ts=root.findAll(n=>n.type==='TEXT'&&n.visible);for(const t of ts){const s=solid(t);if(!s||s.img)continue;const b=bgOf(t);if(b.img)continue;const fg=mix(s.c,s.a,b.c);const r=ratio(fg,b.c);const fs=typeof t.fontSize==='number'?t.fontSize:14;const min=fs>=18?3:4.5;if(r<min)bad.push({id:t.id,txt:t.characters.slice(0,30),fg:hex(fg),bg:hex(b.c),r:+r.toFixed(2),inst:inInst(t)});}return bad;}
function unbound(root){let k=0;for(const n of [root].concat(root.findAll(()=>true))){for(const prop of ['fills','strokes']){const ps=n[prop];if(!Array.isArray(ps))continue;for(const p of ps)if(p.type==='SOLID'&&p.visible!==false&&!(p.boundVariables&&p.boundVariables.color))k++;}}return k;}
function fakeChrome(root){return root.findAll(n=>n.type!=='INSTANCE'&&/sidebar|navbar|barra lateral|bottom ?nav|header|encabezado/i.test(n.name)&&!inInst(n)).map(n=>({id:n.id,name:n.name,type:n.type}));}
// icons(root): iconos y trazos (vectores, booleanas, líneas, puntos ≤24 px) con contraste < 3:1 (WCAG 1.4.11).
// Revisa relleno y trazo visibles contra el fondo efectivo; ignora iconos sobre imagen o degradado.
const ICON_TYPES=['VECTOR','BOOLEAN_OPERATION','STAR','LINE','POLYGON'];
// Decorativo: bordes del mapa de departamentos (no transmiten información por sí solos).
function decorative(n){let p=n;while(p&&p.type!=='SECTION'&&p.type!=='PAGE'){const nm=p.name+(p.mainComponent?' '+p.mainComponent.name+(p.mainComponent.parent?' '+p.mainComponent.parent.name:''):'');if(/Mapa Colombia/.test(nm))return true;p=p.parent;}return false;}
function icons(root){const bad=[];const ns=root.findAll(n=>n.visible&&(ICON_TYPES.indexOf(n.type)>=0||(n.type==='ELLIPSE'&&n.width<=24)));
 for(const n of ns){if(decorative(n))continue;const b=bgOf(n);if(b.img)continue;for(const prop of ['fills','strokes']){const ps=n[prop];if(!Array.isArray(ps))continue;const p=ps.filter(x=>x.visible!==false&&x.type==='SOLID').pop();if(!p)continue;
  const a=(p.opacity==null?1:p.opacity)*(p.color.a==null?1:p.color.a);if(a<0.05)continue;const fg=mix(p.color,a,b.c);const r=ratio(fg,b.c);
  if(r<3){bad.push({id:n.id,name:n.name,prop,fg:hex(fg),bg:hex(b.c),r:+r.toFixed(2),inst:inInst(n)});break;}}}return bad;}
// all(root): contraste de texto + iconos en una sola llamada.
function all(root){return {text:contrast(root),icons:icons(root)};}
module.exports={lum,ratio,mix,solid,bgOf,hex,screens,contrast,icons,all,unbound,fakeChrome,inInst};
