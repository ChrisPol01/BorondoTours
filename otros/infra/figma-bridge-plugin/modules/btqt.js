// Módulo `btqt` — corrección de texto con bajo contraste. Depende de btq y btqf.
// TEXTFIX(root): a cada texto que falla WCAG le asigna el rol de texto del tema con mejor contraste.
// Si ninguno llega a 4.5:1 (y el padre no es instancia), oscurece el contenedor con surface/strong 88%.
// btq se resuelve en cada acceso (Proxy): así siempre se usa la versión vigente de la auditoría.
const q=new Proxy({},{get:(_,k)=>bridge.require('btq')[k]});
const B=bridge.require('btqf');
function best(node,bg,V){let b=null,br=0;for(const r of ['glass/text','text/primary','text/on-action','text/heading','text/muted','text/on-strong']){if(!V[r])continue;const c=V[r].resolveForConsumer(node).value;const ra=q.ratio(c,bg);if(ra>br+0.01){br=ra;b=r;}}return {role:b,ratio:br};}
function TEXTFIX(root){const V=B.vars();let k=0;for(const x of q.contrast(root)){const t=figma.getNodeById(x.id);const bg=q.bgOf(t).c;const p=best(t,bg,V);if(p.ratio<4.5&&t.parent&&!q.inInst(t.parent)){B.setP(t.parent,'fills',V['surface/strong'],0.88);B.setP(t,'fills',V['text/on-strong'],1);}else B.setP(t,'fills',V[p.role],1);k++;}return k;}
module.exports={best,TEXTFIX};
