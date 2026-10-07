// Módulo `btlgs` — aplica la capa "Cristal" (btlg) a las pantallas por lotes para no agotar la memoria del plugin.
// Uso: bridge.require('btlgs').RUN(0,10); RUN(10,20); ... (~10 pantallas por lote). Después: btq.all por pantalla.
const q=bridge.require('btq');const L=bridge.require('btlg');
function RUN(from,to){const sc=q.screens();let k=0,e=[];for(const s of sc.slice(from,to)){const ids=s.findAll(x=>x.type==='FRAME'&&x.getPluginData('glass')&&!q.inInst(x));const a=ids.filter(x=>x.getPluginData('glass')!=='strong').map(x=>x.id),b=ids.filter(x=>x.getPluginData('glass')==='strong').map(x=>x.id);const r=L.BATCH(a,{keepRadius:true}),r2=L.BATCH(b,{strong:true,keepRadius:true});k+=r.k+r2.k;e=e.concat(r.err,r2.err);}return {total:sc.length,k,e:e.slice(0,5)};}
module.exports={RUN};
