// Módulo 'btnorm' — normaliza controles dibujados en pantallas (2026-09-29).
// Alturas: Button 32/40/48 (móvil mínimo 48) · Chip/Tab 32 (desktop) / 40 (móvil) · Input 48 r12 · Badge 16/24.
const r8=v=>Math.max(0,Math.round(v/4)*4);
function target(n,mobile){const m=n.name.match(/^(Button|Chip|Input|Tab|Badge)(?:\/(\w+))?/);if(!m)return null;const k=m[1];
 if(k==='Button'){const h=n.height;let H=h<=34?32:(h<=45?40:48);if(mobile&&H<48)H=48;return {H,r:999};}
 if(k==='Chip'||k==='Tab')return {H:mobile?40:32,r:999};
 if(k==='Input')return {H:48,r:12};
 if(k==='Badge')return {H:n.height<17?16:24,r:999};return null;}
function fix(n,mobile){const t=target(n,mobile);if(!t||n.type!=='FRAME'||n.layoutMode!=='HORIZONTAL')return 0;
 const b=[Math.round(n.height),n.cornerRadius,n.paddingLeft];const inner=n.height-n.paddingTop-n.paddingBottom;if(inner>t.H)return 0;
 const pad=(t.H-inner)/2;n.paddingTop=Math.floor(pad);n.paddingBottom=Math.ceil(pad);n.paddingLeft=r8(n.paddingLeft);n.paddingRight=r8(n.paddingRight);
 if(n.itemSpacing)n.itemSpacing=r8(n.itemSpacing);n.counterAxisAlignItems='CENTER';
 if(n.layoutSizingVertical==='FIXED')n.resize(n.width,t.H);n.cornerRadius=t.r;
 const cr=n.children.find(k=>k.name==='Cristal');if(cr){const lk=cr.locked;cr.locked=false;cr.resize(n.width,n.height);cr.x=0;cr.y=0;cr.cornerRadius=t.r;cr.locked=lk;}
 return (b[0]!==Math.round(n.height)||b[1]!==t.r||b[2]!==n.paddingLeft)?1:0;}
function RUN(root){const mobile=root.width<600;let k=0;for(const n of root.findAll(x=>x.type==='FRAME'&&/^(Button|Chip|Input|Tab|Badge)\b/.test(x.name))){let p=n.parent,skip=false;while(p&&p!==root){if(p.type==='INSTANCE'||p.type==='COMPONENT'){skip=true;break;}p=p.parent;}if(!skip)k+=fix(n,mobile);}return k;}
return {RUN,fix,target};
