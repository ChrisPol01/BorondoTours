// Módulo 'btboard' — utilidades de los tableros por tema (etiquetas, pies de estado y colocación).
async function fonts(){await ensureFont('Sora','Bold');await ensureFont('Inter','Semi Bold');await ensureFont('Inter','Regular');}
function labelVar(){const vs=figma.variables.getLocalVariables('COLOR');return vs.find(v=>v.name==='brand/azul-profundo')||vs.find(v=>/azul-profundo/.test(v.name));}
function txt(sec,s,x,y,size,style,family){const t=figma.createText();t.fontName={family:family||'Inter',style:style||'Semi Bold'};t.characters=s;t.fontSize=size;const v=labelVar();if(v){const p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0.06,g:0.23,b:0.4}},'color',v);t.fills=[p];}else t.fills=[{type:'SOLID',color:{r:0.06,g:0.23,b:0.4}}];sec.appendChild(t);t.x=x;t.y=y;t.setPluginData('boardlabel','1');return t;}
function caption(name){let s=name.replace(/ · (Colorido|Claro|Oscuro)$/,'');const m=s.match(/(?: · | — )(.+)$/);if(/\/\s*(Desktop|Móvil)\s*$/.test(s)&&!/ · /.test(s.split('/')[0]))return 'Base';return m?m[1].replace(/\s*\/\s*(Desktop|Móvil)$/,''):'Base';}
function place(sec,node,x,y,meta){sec.appendChild(node);node.x=x;node.y=y;for(const k in meta)node.setPluginData(k,String(meta[k]));}
module.exports={fonts,txt,caption,place,labelVar};
