// btvisfix — corrige lo que reporta btvis: a cada texto/icono le asigna el token de texto con mejor
// contraste sobre el fondo real calculado (btqt.best). Las imágenes no se tocan (revisar a ojo).
// FIX(root, V?) -> { found, fixed, after, left }. V = variables del tema (btqf.vars() para Colorido).
const v = bridge.require('btvis'); const F = bridge.require('btqf'); const T = bridge.require('btqt');
function rgb(h) { return { r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 }; }
function FIX(root, V) { V = V || F.vars(); const bad = v.audit(root, { full: true }).filter(x => !x.img); let k = 0; const left = [];
  for (const x of bad) { const nd = figma.getNodeById(x.id); if (!nd) continue; const p = T.best(nd, rgb(x.bg), V); if (!p.role) { left.push(x.txt); continue; }
    const prop = x.kind === 'text' ? 'fills' : (nd.strokes && nd.strokes.length ? 'strokes' : 'fills');
    try { F.setP(nd, prop, V[p.role], 1); k++; } catch (e) { left.push(x.txt + ':' + e.message); } }
  const after = v.audit(root, { full: true }).filter(x => !x.img);
  return { found: bad.length, fixed: k, after: after.length, left: after.slice(0, 4).map(x => x.txt + ' ' + x.fg + '/' + x.bg + ' ' + x.r) }; }
module.exports = { FIX };
