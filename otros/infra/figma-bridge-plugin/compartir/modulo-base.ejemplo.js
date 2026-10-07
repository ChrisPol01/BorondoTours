// Módulo base de ejemplo para un proyecto NUEVO (no Borondo).
// Patrón: se guarda en el documento con  bridge.define('ui', <contenido de este archivo>)
// y se usa con  const UI = bridge.require('ui').
//
// Trae lo mínimo y GENÉRICO: color (sol), carga de fuentes, frame con auto-layout (F) y texto (T).
// Cambia PALETTE y las fuentes por las de tu proyecto. A partir de aquí construyes tus botones,
// tarjetas, inputs, etc. — igual que hicimos en Borondo, pero con tu marca.

// 1) Paleta propia del proyecto (edítala). Clave corta -> hex.
const PALETTE = {
  primary: '#2563EB',
  text:    '#0F172A',
  muted:   '#64748B',
  bg:      '#FFFFFF',
  surface: '#F1F5F9',
};

const hex = h => {
  h = h.replace('#', '');
  return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 };
};
const col = c => PALETTE[c] || c;                       // acepta clave de paleta o hex directo
const sol = (c, o = 1) => ({ type:'SOLID', color: hex(col(c)), opacity: o });

// 2) Fuentes del proyecto (edita familias/estilos). ensureFont lo inyecta el runtime del plugin.
//    Usa el fontName que DEVUELVE ensureFont (los nombres de estilo varían por equipo).
async function fonts() {
  await ensureFont('Inter', 'Regular');
  await ensureFont('Inter', 'Semi Bold');
}

// 3) F — frame con Auto Layout. o = { dir:'h'|'v', gap, pad, w, h, r, fill, align, just, x, y, stretch, grow, clip }
function F(parent, o = {}) {
  const f = figma.createFrame();
  f.name = o.name || 'frame';
  f.fills = o.fill ? (Array.isArray(o.fill) ? o.fill : [sol(o.fill, o.op ?? 1)]) : [];
  if (o.dir) {
    f.layoutMode = o.dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
    f.itemSpacing = o.gap ?? 0;
    const p = o.pad ?? 0;
    const [pt, pr, pb, pl] = Array.isArray(p) ? (p.length === 2 ? [p[0],p[1],p[0],p[1]] : p) : [p,p,p,p];
    f.paddingTop = pt; f.paddingRight = pr; f.paddingBottom = pb; f.paddingLeft = pl;
    f.primaryAxisSizingMode = (o.w && o.dir === 'h') || (o.h && o.dir === 'v') ? 'FIXED' : 'AUTO';
    f.counterAxisSizingMode = (o.dir === 'h' ? o.h : o.w) ? 'FIXED' : 'AUTO';
    if (o.align) f.counterAxisAlignItems = o.align;   // 'MIN'|'CENTER'|'MAX'
    if (o.just)  f.primaryAxisAlignItems = o.just;    // 'MIN'|'CENTER'|'MAX'|'SPACE_BETWEEN'
  }
  if (o.w || o.h) f.resize(o.w || 100, o.h || 100);
  if (o.r != null) f.cornerRadius = o.r;
  if (o.stroke) { f.strokes = [sol(o.stroke, o.sop ?? 1)]; f.strokeWeight = o.sw || 1; }
  f.clipsContent = o.clip ?? false;
  if (parent) parent.appendChild(f);
  if (o.x != null) f.x = o.x;
  if (o.y != null) f.y = o.y;
  if (o.grow) f.layoutGrow = 1;
  if (o.stretch) f.layoutAlign = 'STRETCH';
  return f;
}

// 4) T — texto. o = { f:'Inter', s:'Regular', size, c, lh (line-height %), al, w, stretch }
function T(parent, s, o = {}) {
  const t = figma.createText();
  t.fontName = { family: o.f || 'Inter', style: o.s || 'Regular' };
  t.characters = String(s);
  t.fontSize = o.size || 14;
  t.fills = [sol(o.c || 'text', o.op ?? 1)];
  if (o.lh) t.lineHeight = { unit:'PERCENT', value:o.lh };
  if (o.al) t.textAlignHorizontal = o.al;             // 'LEFT'|'CENTER'|'RIGHT'
  if (parent) parent.appendChild(t);
  if (o.w) { t.textAutoResize = 'HEIGHT'; t.resize(o.w, t.height); }
  if (o.stretch) { t.layoutAlign = 'STRETCH'; t.textAutoResize = 'HEIGHT'; }
  return t;
}

// Ejemplo de componente propio construido sobre las primitivas (bórralo o cámbialo):
function BUTTON(parent, label, o = {}) {
  const b = F(parent, { name:'Button/'+label, dir:'h', gap:8, pad:[12,20], align:'CENTER', just:'CENTER', r:12, fill: o.bg || 'primary' });
  T(b, label, { s:'Semi Bold', size:15, c:o.tc || 'bg' });
  return b;
}

module.exports = { PALETTE, hex, col, sol, fonts, F, T, BUTTON };
