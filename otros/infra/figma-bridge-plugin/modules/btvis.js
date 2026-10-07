// btvis — auditor visual de contraste (reemplaza a btq.contrast/btmx2.AUDIT para revisar pantallas).
// Compone TODAS las capas pintadas debajo del centro de cada texto/icono en orden de render (DFS):
// fondo del frame, hermanos, velos, degradados (promedio de paradas) y vidrio. Imágenes = "img" (revisar a ojo).
// Umbral WCAG: 4.5 texto normal; 3 texto grande (>=24 px, o >=18.66 px en negrita) e iconos.
// Exento: controles deshabilitados (opacidad efectiva del contenedor <= 0.6), WCAG 1.4.3.
// Nota: una captura de un nodo suelto se pinta sobre blanco; no sirve para juzgar contraste.
const q = bridge.require('btq');
function paintC(f, n) { const bv = f.boundVariables && f.boundVariables.color; if (bv) { try { const v = figma.variables.getVariableById(bv.id); if (v) return v.resolveForConsumer(n).value; } catch (e) {} } return f.color; }
function col(f, n) { if (f.visible === false) return null; const a0 = f.opacity == null ? 1 : f.opacity;
  if (f.type === 'SOLID') return { c: paintC(f, n), a: a0 };
  if (f.type.indexOf('GRADIENT') === 0) { const st = f.gradientStops || []; if (!st.length) return null; let r = 0, g = 0, b = 0, a = 0; for (const s of st) { r += s.color.r; g += s.color.g; b += s.color.b; a += s.color.a; } const k = st.length; return { c: { r: r / k, g: g / k, b: b / k }, a: (a / k) * a0 }; }
  if (f.type === 'IMAGE') return { img: true, a: a0 }; return null; }
function effOpacity(n, root) { let o = 1, p = n; while (p) { if (p.opacity != null) o *= p.opacity; if (p === root) break; p = p.parent; } return o; }
function scan(root) { const layers = [], targets = []; let i = 0;
  const walk = (n) => { i++; if (n.visible === false) return; const bb = n.absoluteBoundingBox;
    if (n.type === 'TEXT') { targets.push({ n, i, kind: 'text' }); return; }
    if ((n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION') && bb && bb.width <= 48 && bb.height <= 48) targets.push({ n, i, kind: 'icon' });
    if (bb && 'fills' in n && Array.isArray(n.fills)) { for (const f of n.fills) { const c = col(f, n); if (c && c.a > 0.02) layers.push({ i, bb, c, n }); } }
    if ('children' in n) for (const k of n.children) walk(k); };
  walk(root); return { layers, targets }; }
function fgOf(t) { const prop = t.kind === 'text' ? 'fills' : (t.n.strokes && t.n.strokes.length ? 'strokes' : 'fills'); const ps = t.n[prop]; if (!Array.isArray(ps)) return null;
  for (let j = ps.length - 1; j >= 0; j--) { const f = ps[j]; if (f.visible !== false && f.type === 'SOLID') return { c: paintC(f, t.n), a: (f.opacity == null ? 1 : f.opacity) }; } return null; }
function audit(root, opts) { opts = opts || {}; const sc = scan(root); const layers = sc.layers; const bad = [];
  for (const t of sc.targets) { const bb = t.n.absoluteBoundingBox; if (!bb) continue;
    if (effOpacity(t.n.parent || t.n, root) <= 0.6) continue;
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    let c = { r: 1, g: 1, b: 1 }, img = false;
    for (const L of layers) { if (L.i >= t.i) break; const b = L.bb; if (cx < b.x || cx > b.x + b.width || cy < b.y || cy > b.y + b.height) continue;
      if (L.c.img) { img = true; c = { r: 0.35, g: 0.35, b: 0.35 }; continue; } c = q.mix(L.c.c, L.c.a * effOpacity(L.n, root), c); }
    const fg = fgOf(t); if (!fg) continue; const fc = q.mix(fg.c, fg.a * effOpacity(t.n, root), c); const r = q.ratio(fc, c);
    let min = 3; if (t.kind === 'text') { const fs = typeof t.n.fontSize === 'number' ? t.n.fontSize : 16; const fw = typeof t.n.fontWeight === 'number' ? t.n.fontWeight : 400; min = (fs >= 24 || (fs >= 18.66 && fw >= 700)) ? 3 : 4.5; }
    if (r < min - 0.01) bad.push({ id: t.n.id, kind: t.kind, txt: t.kind === 'text' ? (t.n.characters || '').slice(0, 40) : t.n.name.slice(0, 30), fg: q.hex(fc), bg: q.hex(c), r: +r.toFixed(2), img }); }
  return opts.full ? bad : { n: bad.length, sample: bad.slice(0, opts.max || 12) }; }
module.exports = { audit, scan };
