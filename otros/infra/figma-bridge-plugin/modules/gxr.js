// gxr — constructor declarativo de pantallas de "B2B · Gestión" a partir de bridge.store 'gxSpec'[fila].
// BUILD(key,'D'|'M') crea el canónico Normal; STATES(key) crea las columnas 1..6 de D y M; THEMES(key) las copias.
// Bloques: stats, filter, tabs, table, split, card, cards, text, custom (registro en bridge.state.gxCustom / módulo gxc).
const g=bridge.require('gx');const S=bridge.require('gxs');const B=bridge.require('gxb');
function badge(parent,val,tono){const bd=figma.getNodeById(S.comp().badge).children.find(v=>v.name==='Tono='+(tono||'Neutral')).createInstance();parent.appendChild(bd);g.setProp(bd,'Valor',String(val));return bd;}
function card(parent,c,mob){const k=B.CARD(parent,c.title,{link:c.link,gap:c.gap,strong:c.strong,w:c.w,grow:c.grow});
 if(c.text)g.tx(k,c.text,{size:14,lh:150,stretch:true});
 if(c.big)g.tx(k,c.big,{f:'Sora',s:'Bold',size:28});
 if(c.progress!=null){const bar=g.box(k,{name:'Progreso',dir:'h',h:8,r:999,tok:'glass/fill'});bar.layoutAlign='STRETCH';bar.primaryAxisSizingMode='FIXED';g.box(bar,{dir:'h',w:Math.max(8,Math.round((mob?318:(c.pw||400))*c.progress)),h:8,r:999,tok:'action/primary'});}
 if(c.pills){const r=B.ROWF(k,{gap:8,wrap:true});for(const [e,t] of c.pills)B.pill(r,e,t);}
 if(c.chips){const r=B.ROWF(k,{gap:8,wrap:true});c.chips.forEach((t,i)=>B.chip(r,t,i===(c.chipOn||0)));}
 if(c.kv)B.KV(k,c.kv,{kw:mob?120:(c.kw||160)});
 if(c.list)for(const it of c.list){const row=B.ROWF(k,{gap:12,align:'CENTER'});if(it[0]){const ib=g.box(row,{dir:'h',w:40,h:40,r:12,align:'CENTER',just:'CENTER',tok:it[5]||'glass/fill'});B.icoI(ib,it[0],it[5]&&it[5]!=='glass/fill'?'text/on-action':'glass/text',18);}const col=g.box(row,{dir:'v',gap:2});col.layoutGrow=1;g.tx(col,it[1],{s:'Semi Bold',size:14,stretch:true});if(it[2])g.tx(col,it[2],{size:12,stretch:true});if(it[3]!=null&&it[3]!==''){if(Array.isArray(it[3]))B.pill(row,it[3][0],it[3][1]);else badge(row,it[3],it[4]);}if(it[6])g.tx(row,it[6],{s:'Semi Bold',size:14,tok:'action/primary'});}
 if(c.inputs)for(const i of c.inputs)B.input(k,i[0],i[1],i[2],i[3]);
 if(c.checks)for(const [l,on] of c.checks){const ci=g.inst(B.CHECK,{Estado:on?'On':'Off'},k);g.setT(ci,null,l);}
 if(c.toggles)for(const [l,sub,on] of c.toggles){const row=B.ROWF(k,{gap:12,align:'CENTER'});B.icoI(row,'grip','glass/text',18);const col=g.box(row,{dir:'v',gap:2});col.layoutGrow=1;g.tx(col,l,{s:'Semi Bold',size:14});if(sub)g.tx(col,sub,{size:12});const sw=g.box(row,{name:on?'Interruptor (activado)':'Interruptor',dir:'h',w:44,h:26,r:999,pad:3,just:on?'MAX':'MIN',tok:on?'action/primary':'glass/fill'});g.box(sw,{dir:'h',w:20,h:20,r:999,tok:on?'text/on-action':'glass/text'});}
 if(c.buttons){const r=B.ROWF(k,{gap:12,align:'CENTER',wrap:true});for(const [l,v] of c.buttons){const b=B.btn(r,l,v||'Primario');if(mob&&c.buttons.length===1)b.layoutSizingHorizontal='FILL';}}
 if(c.table)table(k,c.table,mob,true);
 if(c.custom)custom(c.custom,k,mob,c);
 return k;}
function table(parent,t,mob,inner){if(!mob){const card=B.TABLE(parent,t.headers,t.rows,{title:inner?null:t.title,link:inner?null:t.link,more:t.more,selected:t.selected});if(inner){card.fills=[];card.setPluginData('needlg','');card.paddingLeft=card.paddingRight=0;}return card;}
 if(t.title&&!inner){const h=B.ROWF(parent,{gap:8,align:'CENTER'});const tt=g.tx(h,t.title,{f:'Sora',s:'SemiBold',size:18,tok:'text/primary'});tt.layoutGrow=1;if(t.link)g.tx(h,t.link,{s:'Semi Bold',size:14,tok:'action/primary'});}
 const rows=(t.mrows||t.rows.map(r=>[r[0],[r[1],r[2]].filter(Boolean).join(' · '),r[3],r[4]])).slice(0,t.mmax||4);return B.MLIST(parent,rows);}
function custom(name,parent,mob,blk){const reg=bridge.require('gxc');if(!reg[name])throw new Error('custom '+name);return reg[name](parent,mob,blk);}
function block(parent,b,mob,W){switch(b.t){
 case 'stats':return B.STATS(parent,mob?b.items.slice(0,4):b.items);
 case 'filter':return B.FILTER(parent,b.estado);
 case 'tabs':{const r=B.ROWF(parent,{name:'Pestañas',gap:4,wrap:mob});(mob&&b.mitems?b.mitems:b.items).forEach((l,i)=>B.tab(r,l,i===(b.active||0)));return r;}
 case 'table':return table(parent,b,mob,false);
 case 'card':return card(parent,b,mob);
 case 'text':return g.tx(parent,b.s,{f:b.f||'Inter',s:b.st||'Regular',size:b.size||15,tok:b.tok||'text/muted',stretch:true});
 case 'custom':return custom(b.fn,parent,mob,b);
 case 'cards':{if(mob){for(const c of b.items.slice(0,b.mmax||3))card(parent,c,true);return null;}const r=B.ROWF(parent,{name:'Tarjetas',gap:24,wrap:true});const n=b.cols||3;const w=Math.floor((W-24*(n-1))/n);for(const c of b.items)card(r,Object.assign({},c,{w}),false);return r;}
 case 'split':{if(mob){for(const col of b.cols)for(const x of col)block(parent,x,true,358);return null;}const r=B.ROWF(parent,{name:'Columnas',gap:24});const ra=b.ratio||b.cols.map(()=>1);const tot=ra.reduce((a,c)=>a+c,0);const avail=W-24*(b.cols.length-1);b.cols.forEach((col,i)=>{const cw=Math.floor(avail*ra[i]/tot);const cf=g.box(r,{name:'Columna '+(i+1),dir:'v',gap:24});cf.counterAxisSizingMode='FIXED';cf.resize(cw,100);cf.primaryAxisSizingMode='AUTO';for(const x of col)block(cf,x,false,cw);});return r;}
 default:throw new Error('bloque '+b.t);}}
async function BUILD(key,dev){await g.bt.fonts();const sp=bridge.store.get('gxSpec')[key];S.ROW(key,sp.label);const mob=dev==='M';
 const {f,ct}=S.SCREEN({row:key,dev,name:sp.label+' / '+(mob?'Móvil':'Desktop')+' — Normal',alc:sp.alc||'Cliente',group:sp.group,active:sp.active,title:sp.mtitle||sp.active,tab:sp.tab||sp.group,tabActive:sp.tabActive==null?4:sp.tabActive,collapsed:sp.collapsed});
 B.PH(ct,sp.ph);const W=ct.width;for(const b of (mob&&sp.mblocks?sp.mblocks:sp.blocks))block(ct,b,mob,W);
 B.SEAL(f);S.FIT(f);S.PLACE(f,key,0);const G=S.geo();G.done=G.done||{};G.done[key]=G.done[key]||{D:[],M:[]};G.done[key][dev]=[f.id];bridge.store.set('gxGeo',G);return f.id;}
function STATES(key,dev,from,to){const sp=bridge.store.get('gxSpec')[key];const G=S.geo();const list=G.done[key][dev];const canon=list[0];const out=[];for(let k=from||1;k<=(to||6);k++){if(list[k]){const old=figma.getNodeById(list[k]);if(old)old.remove();}list[k]=B.STATE(canon,k,sp.states||{});out.push(list[k]);}const G2=S.geo();G2.done[key][dev]=list;bridge.store.set('gxGeo',G2);return out;}
module.exports={BUILD,STATES,block,card,table,badge};
