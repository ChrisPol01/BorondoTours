// Módulo `btd` — conversión de una pantalla a tema Oscuro (noche). Depende de `bt`.
// night(root) recolorea textos, iconos, superficies y chips sin tocar tarjetas ni instancias.
// Temporal: cuando los colores pasen a variables de Figma, el tema se cambia por modo y este módulo sobra.
const NIGHT='#0A1A2B';
const {hex,sol}=bridge.require('bt');
const hx=f=>'#'+[f.color.r,f.color.g,f.color.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const grad=(a,b)=>[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0,color:{...hex(a),a:1}},{position:1,color:{...hex(b),a:1}}]}];
function inCard(n){let p=n.parent;while(p){if(p.name&&(p.name.startsWith('TourCard')||p.name.startsWith('Button/')||p.name.includes('Buscador')||p.name.startsWith('Chip/')||p.name.startsWith('Badge/')||p.name.startsWith('Panel')))return true;if(p.type==='INSTANCE')return true;p=p.parent;}return false;}
function night(root){root.findAll(n=>n.type==='TEXT'&&!inCard(n)).forEach(t=>{const f=t.fills[0];if(!f||f.type!=='SOLID')return;const h=hx(f);if(h==='#101010'||h==='#103B66')t.fills=[sol('bl')];else if(h==='#2364AA'||h==='#667085')t.fills=[sol('bl',0.72)];});
 root.findAll(n=>n.type==='VECTOR'&&n.strokes.length&&!inCard(n)).forEach(v=>{const h=hx(v.strokes[0]);if(['#103B66','#2364AA','#667085','#101010'].includes(h))v.strokes=[sol('bl',0.9)];});
 root.findAll(n=>n.name==='Patrón topográfico').forEach(g=>g.findAll(e=>e.type==='ELLIPSE').forEach(e=>e.strokes=[sol('tu',0.07)]));
 root.findAll(n=>n.type==='FRAME'&&!inCard(n)&&n.fills.length&&n.fills[0].type==='SOLID'&&n!==root).forEach(f=>{const h=hx(f.fills[0]);const op=f.fills[0].opacity;if(h==='#F3E8D1'){f.fills=[sol('bl',0.06)];f.strokes=[sol('bl',0.14)];}else if(h==='#F9FBFC'&&op>0.9&&f.width<1000&&!(f.name||'').startsWith('Chip')){f.fills=[sol('bl',0.06)];f.strokes=[sol('bl',0.16)];f.effects=[{type:'BACKGROUND_BLUR',radius:14,visible:true}];}else if(h==='#D5DEE6'||h==='#E4EAF0'){f.fills=[sol('bl',0.2)];}});
 root.findAll(n=>n.name&&n.name.startsWith('Chip/')).forEach(c=>{const f=c.fills[0];if(f&&f.type==='SOLID'&&hx(f)==='#F9FBFC'){c.fills=[sol('bl',0.08)];c.strokes=[sol('bl',0.28)];c.findAll(t=>t.type==='TEXT').forEach(t=>t.fills=[sol('bl')]);c.findAll(v=>v.type==='VECTOR').forEach(v=>v.strokes=[sol('bl')]);}});
 root.findAll(n=>n.name&&n.name.startsWith('Button/outline')).forEach(b=>{b.strokes=[sol('bl',0.35)];b.findAll(v=>v.type==='VECTOR').forEach(v=>v.strokes=[sol('bl')]);b.findAll(t=>t.type==='TEXT').forEach(t=>t.fills=[sol('bl')]);});
 root.findAll(n=>n.type==='INSTANCE'&&n.mainComponent&&n.mainComponent.name==='Tono=Sobre foto clara').forEach(i=>i.swapComponent(figma.getNodeById('36:1699').children[0]));
 root.fills=[sol(NIGHT)];}
module.exports={NIGHT,grad,night,hx};
