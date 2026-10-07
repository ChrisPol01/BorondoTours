// Módulo `btqfix` — corrección de contraste reutilizable. Depende de btq y btqf.
// FIXROOT(root,tv): para cada texto/icono que falla WCAG, elige el token de color con mejor contraste
//   sobre su fondo real (btq.bgOf, que ya reconoce la capa "Cristal" del liquid glass).
//   tv = mapa {nombreVar: variable} del tema. Para Colorido usa btqf.vars(); para copias de la
//   matriz 16 usa btmx2.tv(theme). Los iconos también pueden tomar on-action/on-strong (Negro Volcánico
//   sobre dorado/turquesa, ya que en Colorido text/primary es blanco).
// Uso: const X=bridge.require('btqfix'); for(const s of bridge.require('btq').screens()) X.FIXROOT(s);
const q=bridge.require('btq');const F=bridge.require('btqf');
const TXT=['glass/text','text/primary','text/on-action','text/on-strong','text/heading','text/muted'];
function FIXROOT(root,tv){const V=tv||F.vars();let k=0;const a=q.all(root);
 for(const x of (a.text||a.contrast||[]).concat(a.icons||[])){const nd=figma.getNodeById(x.id);if(!nd)continue;const bg=q.bgOf(nd).c;let best=null,br=0;
  for(const r of TXT){if(!V[r])continue;const c=V[r].resolveForConsumer(nd).value;const ra=q.ratio(c,bg);if(ra>br){br=ra;best=r;}}
  const pr=x.prop||'fills';if(best)F.setP(nd,pr,V[best],1);k++;}
 return k;}
module.exports={FIXROOT,TXT};
