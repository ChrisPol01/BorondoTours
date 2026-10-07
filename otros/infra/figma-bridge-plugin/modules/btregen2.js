// btregen2 — ejecuta btregen.ONE por lotes con presupuesto de nodos.
// RUN(maxNodes): procesa canónicos pendientes (Claro y luego Oscuro) hasta sumar `maxNodes`
//   nodos (siempre al menos uno). Guarda el avance en 'regenPlan' después de CADA pantalla, así un
//   BRIDGE_OFFLINE no pierde trabajo. Errores por pantalla van a R.err (se reintentan borrándolos).
// Medido: ~9 s por pantalla de 350 nodos (APPLY y SYNC dominan). Lotes de 400–700 nodos con
//   figma_execute_code async:true. Tras un BRIDGE_OFFLINE, esperar ~25 s: el plugin suele seguir
//   trabajando y el avance aparece en el store.
async function RUN(maxNodes){
  const B=await bridge.require('btregen'); const R=await bridge.store.get('regenPlan'); R.err=R.err||{}; const errs=[]; let used=0,k=0; const t0=Date.now();
  outer: for (const th of ['Claro','Oscuro']) for (const p of R.plan[th]){
    if(R.done[th].includes(p.canon)||R.err[th+p.canon]) continue;
    const n=await figma.getNodeByIdAsync(p.canon); const w=n.findAll(()=>true).length;
    if(k>0 && used+w>maxNodes) break outer; used+=w; k++;
    try{ await B.ONE(p.canon,th); R.done[th].push(p.canon); }
    catch(e){ R.err[th+p.canon]=String(e).slice(0,160); errs.push(p.canon+': '+String(e).slice(0,120)); }
    await bridge.store.set('regenPlan',R);
  }
  const tot=R.plan.Claro.length+R.plan.Oscuro.length;
  return {k, used, errs, ms:Date.now()-t0, left: tot-R.done.Claro.length-R.done.Oscuro.length-Object.keys(R.err).length};
}
module.exports = {RUN};
