// Módulo `btmx` — matriz de temas en la sección 16 (58:7481). Filas = pantalla; columnas = Colorido | Claro | Oscuro,
// cada columna con Desktop (x+0) y Móvil (x+1520). El plan (filas, y) vive en pluginData 'matrix' de la sección.
// Uso: HEAD() una vez; ROWS(a,b) por lotes de ~5 filas (≈30 s). Tras cambiar pantallas originales: btt.REFRESH(sección).
const T=bridge.require('btt');
function M(){return JSON.parse(figma.getNodeById('58:7481').getPluginData('matrix'));}
async function label(sec,txt,x,y,size,col){const fn=await ensureFont('Sora','Bold');const t=figma.createText();t.fontName=fn;t.characters=txt;t.fontSize=size;t.fills=[{type:'SOLID',color:col||{r:0.063,g:0.231,b:0.4}}];sec.appendChild(t);t.x=x;t.y=y;return t;}
async function HEAD(){const m=M();const sec=figma.getNodeById(m.sec);const TH=T.THEMES;
 for(let i=0;i<TH.length;i++){const x=m.LEFT+i*(m.COLW+m.GAP);await label(sec,TH[i],x,60,96);await label(sec,'Desktop',x,220,40,{r:0.14,g:0.39,b:0.67});await label(sec,'Móvil',x+1520,220,40,{r:0.14,g:0.39,b:0.67});}}
async function ROWS(a,b){const m=M();const sec=figma.getNodeById(m.sec);const TH=T.THEMES;let k=0;
 for(let r=a;r<Math.min(b,m.plan.length);r++){const row=m.plan[r];const lb=await label(sec,row.b,40,row.y,44);lb.textAutoResize='HEIGHT';lb.resize(460,lb.height);
  for(let i=0;i<TH.length;i++){const x0=m.LEFT+i*(m.COLW+m.GAP);
   for(const [key,dx] of [['d',0],['m',1520]]){const sid=row[key];if(!sid)continue;const o=figma.getNodeById(sid);const c=o.clone();sec.appendChild(c);T.COPYOP(o,c);c.x=x0+dx;c.y=row.y;c.name=o.name+' · '+TH[i];c.setPluginData('src',sid);c.setPluginData('theme',TH[i]);if(TH[i]!=='Colorido')T.APPLY(c,TH[i]);T.SYNC(c);k++;}}}
 return k;}
module.exports={M,label,HEAD,ROWS};

// Pipeline de actualización (REFRESH + degradados + contraste): ver btmx2.js → UPDATE().
