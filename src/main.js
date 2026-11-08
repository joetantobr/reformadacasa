import './style.css';
import { db as store } from './db.js';

const $app = document.getElementById('app');
const brl = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STATUS = {pendente:'Pendente', andamento:'Em andamento', feito:'Feito'};
const NEXT = {pendente:'andamento', andamento:'feito', feito:'pendente'};

const ICONS = {
  casa:['Casa','<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>'],
  cama:['Quarto','<path d="M3 18V8M3 14h18v4M21 18v-4M6 14v-2.5A1.5 1.5 0 0 1 7.5 10H10a1.5 1.5 0 0 1 1.5 1.5V14M11.5 14v-3h6a3 3 0 0 1 3 3"/>'],
  crianca:['Infantil','<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'],
  banho:['Banheiro','<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>'],
  panela:['Cozinha','<path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM3 10h18M10 7c0-1 1-1.5 1-2.5M14 7c0-1 1-1.5 1-2.5"/>'],
  sofa:['Sala','<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4H3zM5 17v2M19 17v2"/>'],
  tv:['TV','<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M8 3l4 3 4-3M7 21h10"/>'],
  mesa:['Jantar','<path d="M3 10h18M6 10v9M18 10v9M9 14h6M8 10V7M16 10V7"/>'],
  lavar:['Lavanderia','<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M5 7h14M8 5h.01"/>'],
  pc:['Escritório','<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>'],
  carro:['Garagem','<path d="M4 16v-4l2.2-5h11.6L20 12v4zM4 12h16M7 16v3M17 16v3"/><circle cx="7.5" cy="14" r=".6"/><circle cx="16.5" cy="14" r=".6"/>'],
  flor:['Jardim','<circle cx="12" cy="5.5" r="2.2"/><circle cx="15" cy="8.5" r="2.2"/><circle cx="12" cy="11.5" r="2.2"/><circle cx="9" cy="8.5" r="2.2"/><path d="M12 13.7V21M12 18c-2 0-3.5-1.2-4-3M12 19c2 0 3.5-1 4-2.5"/>'],
  sol:['Varanda','<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'],
  piscina:['Piscina','<path d="M2 17c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 8h8"/>'],
  fogo:['Gourmet','<path d="M12 21c-4 0-6.5-2.5-6.5-6 0-3 2-5 3.5-7 .5 2 1.5 3 2.5 3 0-3 1-6 4-8 0 4 3.5 6 3.5 11 0 4-3 7-7 7z"/>'],
  escada:['Escada','<path d="M4 20h4v-4h4v-4h4V8h4V4"/>'],
  porta:['Entrada','<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18"/><circle cx="14.5" cy="12" r=".6"/>'],
  caixa:['Depósito','<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>'],
  halter:['Academia','<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>'],
  telhado:['Telhado','<path d="M2 13l10-8 10 8M5 11v8h14v-8M8 8.6V4h3v2.2"/>'],
  cachorro:['Cachorro','<path d="M6 10c0-3 2.5-5 6-5s6 2 6 5M6 10v4.5a6 6 0 0 0 12 0V10M6 10C5.5 6.5 4 4.6 2.9 5.3 1.9 6.1 3 10.6 6 12M18 10c.5-3.5 2-5.4 3.1-4.7 1 .8-.1 5.3-3.1 6.7M10.8 14.4h2.4L12 15.8zM12 15.8v1.1M10.4 17.3c.9.7 2.3.7 3.2 0"/><circle cx="9.6" cy="11.2" r=".6"/><circle cx="14.4" cy="11.2" r=".6"/>'],
  cabide:['Closet','<path d="M10 6a2 2 0 1 1 2 2v1.5L3.4 16a1 1 0 0 0 .6 1.8h16a1 1 0 0 0 .6-1.8L12 9.5"/>'],
};
const RULES = [
  [/telhad|cobertura|calha|telha/,'telhado'],[/cachorr|canil|\bc[aã]o\b|\bpet\b/,'cachorro'],[/garag/,'carro'],[/piscina/,'piscina'],[/churras|gourmet/,'fogo'],[/jardim|quintal|horta/,'flor'],
  [/varanda|sacada|terra[cç]o|laje/,'sol'],[/banheiro|lavabo|\bwc\b/,'banho'],[/cozinha|copa/,'panela'],
  [/lavanderia|servi[cç]o/,'lavar'],[/escrit|office|estudo/,'pc'],[/\btv\b|cinema|jogos|games/,'tv'],
  [/jantar/,'mesa'],[/closet/,'cabide'],[/academia|gin[aá]stica/,'halter'],[/dep[oó]sito|despensa|dispensa|por[aã]o|s[oó]t[aã]o/,'caixa'],
  [/escada|corredor/,'escada'],[/entrada|hall|recep/,'porta'],[/beb[eê]|crian[cç]a|infantil|maya|brinquedo/,'crianca'],
  [/quarto|su[ií]te|dormit/,'cama'],[/sala|estar/,'sofa'],
];
const guessIcon = nome => { const n = String(nome||'').toLowerCase(); for (const [re,k] of RULES) if (re.test(n)) return k; return 'casa'; };
const iconOf = r => ICONS[r.icone] ? r.icone : guessIcon(r.nome);
const svg = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${(ICONS[k]||ICONS.casa)[1]}</svg>`;

let db = null, floors = [], rooms = [], items = [], meta = {};
let loaded = {floors:false, rooms:false, items:false}, failed = null;
const ui = {floor:null, room:null, editItem:null, editRoom:false, confirm:null, addingFloor:false, restore:null, busy:'', okMsg:''};

const byOrder = (a,b) => (a.ordem ?? 0) - (b.ordem ?? 0) || (a.criadoEm ?? 0) - (b.criadoEm ?? 0);
const roomsOf = fid => rooms.filter(r => r.andarId === fid).sort(byOrder);
const PRIO = {alta:['Alta',18,0], media:['Média',11,1], baixa:['Baixa',4,2]};
const NEXT_PRIO = {alta:'media', media:'baixa', baixa:'alta'};
const prioOf = i => PRIO[i.prioridade] ? i.prioridade : 'media';
const itemsOf = rid => items.filter(i => i.comodoId === rid).sort((a,b)=>PRIO[prioOf(a)][2]-PRIO[prioOf(b)][2] || (a.criadoEm??0)-(b.criadoEm??0));
function thermo(p){
  const h = PRIO[p][1];
  return `<svg viewBox="0 0 16 32" width="14" height="28" aria-hidden="true"><rect x="5" y="2" width="6" height="21" rx="3" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="25.5" r="4.5" fill="currentColor"/><rect x="6.6" y="${23-h}" width="2.8" height="${h+2}" rx="1.4" fill="currentColor"/></svg>`;
}
const prioSelect = (id, val) => `<label class="check">Prioridade <select class="field" id="${id}" style="flex:1">${Object.entries(PRIO).map(([k,[nm]])=>`<option value="${k}" ${k===val?'selected':''}>${nm}</option>`).join('')}</select></label>`;
function stats(list){
  const total = list.length, feito = list.filter(i=>i.status==='feito').length;
  const custo = list.reduce((s,i)=>s+(Number(i.custo)||0),0);
  return {total, feito, custo, pct: total ? Math.round(feito/total*100) : 0};
}
function roomState(r){
  const its = itemsOf(r.id); if (!its.length) return 'vazio';
  if (its.every(i=>i.status==='feito')) return 'feito';
  if (its.some(i=>i.status!=='pendente')) return 'andamento';
  return 'pendente';
}
const itemsOfFloor = fid => items.filter(i => roomsOf(fid).some(r=>r.id===i.comodoId));

async function write(fn){
  try { await fn(); }
  catch(e){ flash(e && e.code === 'not_granted' ? 'Você só pode visualizar esta casa.' : 'Não foi possível salvar. Tente de novo.'); }
}
let flashMsg = '';
function flash(m){ flashMsg = m; render(); setTimeout(()=>{flashMsg=''; render();}, 3500); }

/* ---------- Render ---------- */
function render(){
  if (ui.dragging) return;
  if (failed){ $app.innerHTML = `<div class="status">${esc(failed)}</div>`; return; }
  if (!(loaded.floors && loaded.rooms && loaded.items)){ $app.innerHTML = `<div class="status">Carregando a casa…</div>`; return; }
  const active = document.activeElement && document.activeElement.id;
  const key = [ui.editZone, ui.layout, ui.options, ui.room, ui.editItem, ui.editRoom, ui.addingFloor, ui.addingYard, ui.addSub].join('|');
  const kept = {};
  if (key === lastKey) $app.querySelectorAll('input[id]:not([type=file]),select[id],textarea[id]').forEach(el => kept[el.id] = el.type==='checkbox' ? el.checked : el.value);
  lastKey = key;
  const allF = [...floors].sort(byOrder);
  const fl = allF.filter(isFloor);
  if (ui.floor !== 'none' && !allF.some(f=>f.id===ui.floor)) ui.floor = fl[0]?.id ?? null;
  if (ui.room && !rooms.some(r=>r.id===ui.room)) ui.room = null;
  $app.innerHTML = (ui.layout ? layoutView() : ui.options ? optionsView() : ui.room ? roomView() : houseView(fl)) + (flashMsg ? `<div class="confirm">${esc(flashMsg)}</div>` : '') + footerView();
  for (const [id,v] of Object.entries(kept)){ const el = document.getElementById(id); if (el){ if (el.type==='checkbox') el.checked = v; else el.value = v; } }
  if (active){ const el = document.getElementById(active); if (el) el.focus(); }
}
let lastKey = null;
const isFloor = f => !f.tipo || f.tipo === 'andar';
const windowsOf = fid => { const rs = roomsOf(fid); return rs.length ? `<span class="windows">${rs.map(r=>`<button class="win s-${roomState(r)}" data-act="open-room" data-id="${r.id}" data-name="${esc(r.nome)}" aria-label="Abrir ${esc(r.nome)}">${svg(iconOf(r))}</button>`).join('')}</span>` : ''; };
const zoneLabel = z => { const n = roomsOf(z.id).length; return `${esc(z.nome)}${n ? ` · ${n} ${n===1?'cômodo':'cômodos'}` : ''}`; };
let zonesChecked = false;
function ensureZones(){
  if (zonesChecked || !db) return; zonesChecked = true;
  const add = [];
  if (!floors.some(f=>f.tipo==='telhado')) add.push(['telhado',{nome:'Telhado', tipo:'telhado', sigla:'', ordem:1000, criadoEm:Date.now()}]);
  if (add.length) write(async()=>{ for (const [id,d] of add) await db.doc('andares/'+id).set(d); });
}

function houseView(fl){
  const all = stats(items);
  const roofZ = floors.find(f=>f.tipo==='telhado'), yards = floors.filter(f=>f.tipo==='externo').sort(byOrder);
  const roofHtml = roofZ ? `<div class="roof" role="button" tabindex="0" data-act="pick-floor" data-id="${roofZ.id}" aria-pressed="${roofZ.id===ui.floor}">${windowsOf(roofZ.id)}<span class="zlabel">${esc(roofZ.nome)}</span></div>` : '<div class="roof"></div>';
  const yardEl = z => `<div class="yard" role="button" tabindex="0" data-act="pick-floor" data-id="${z.id}" aria-pressed="${z.id===ui.floor}"><span class="zlabel">${zoneLabel(z)}</span>${windowsOf(z.id) || '<span class="yhint">Nenhum cômodo ainda</span>'}</div>`;
  const top = [...fl].reverse();
  const nRows = Math.max(fl.length, 1), groundRow = nRows + 2;
  const defaultRow = fl.length >= 2 ? fl.length : nRows + 1;
  const rowOf = z => { const k = top.findIndex(f=>f.id===z.nivel); return k >= 0 ? k + 2 : defaultRow; };
  const byRow = {};
  yards.forEach(z => { (byRow[rowOf(z)] ||= []).push(z); });
  const yardsHtml = Object.entries(byRow).map(([row, zs]) => `<div class="yardcell" style="grid-row:${row}">${zs.map(yardEl).join('')}</div>`).join('');
  const nivelOpts = sel => top.map(f=>`<option value="${f.id}" ${f.id===sel?'selected':''}>${esc(f.nome)}</option>`).join('');
  const floorsHtml = top.map((f, k) => {
    const st = stats(itemsOfFloor(f.id)), n = roomsOf(f.id).length;
    return `<div class="floor" style="grid-row:${k+2}" role="button" tabindex="0" data-act="pick-floor" data-id="${f.id}" aria-pressed="${f.id===ui.floor}">
      <span class="lvl">${esc(f.sigla || '')}</span>
      <span class="nm">${esc(f.nome)}<span class="meta">${n} ${n===1?'cômodo':'cômodos'} · ${st.feito}/${st.total} serviços${st.custo?` · ${brl.format(st.custo)}`:''}</span></span>
      <span class="pct">${st.pct}%</span>
      ${windowsOf(f.id)}
      <span class="bar-bg"></span><span class="bar" style="width:${st.pct}%"></span>
    </div>`;
  }).join('');
  const cur = floors.find(f=>f.id===ui.floor);
  let roomsHtml = '';
  if (cur){
    const rs = roomsOf(cur.id);
    roomsHtml = `<div class="section" id="rooms-section">
      <div class="head"><div><div class="eyebrow">Cômodos</div><h2>${esc(cur.nome)}</h2></div>
        <div class="row" style="gap:2px"><button class="btn ghost" data-act="edit-zone" data-id="${cur.id}">Renomear</button>${isFloor(cur) ? `<button class="btn ghost" data-act="ask" data-what="floor:${cur.id}">Excluir andar</button>` : cur.tipo==='externo' ? `<button class="btn ghost" data-act="ask" data-what="floor:${cur.id}">Excluir área</button>` : ''}</div></div>
      ${ui.editZone === cur.id ? `<form class="row" data-form="save-zone" data-id="${cur.id}">${isFloor(cur) ? `<input class="field" id="ez-sigla" value="${esc(cur.sigla||'')}" placeholder="Sigla" style="flex:0 0 80px" autocomplete="off">` : ''}<input class="field" id="ez-nome" value="${esc(cur.nome)}" required autocomplete="off"><button class="btn primary">Salvar</button><button type="button" class="btn" data-act="cancel">Cancelar</button></form>` : ''}
      ${cur.tipo==='externo' && fl.length ? `<label class="check">Fica na altura do <select class="field" id="area-nivel" data-id="${cur.id}" style="flex:1">${nivelOpts(top[rowOf(cur)-2]?.id)}</select></label>` : ''}
      ${ui.confirm === 'floor:'+cur.id ? `<div class="confirm">Excluir “${esc(cur.nome)}” com todos os cômodos e serviços?
        <button class="btn danger" data-act="del-floor" data-id="${cur.id}">Excluir</button><button class="btn" data-act="cancel">Cancelar</button></div>`:''}
      <div class="rooms">${rs.length ? rs.map(r => {
        const its = itemsOf(r.id), st = stats(its);
        const resumo = its.filter(i=>i.status!=='feito').map(i=>`<span class="pt-${prioOf(i)}">${esc(i.texto)}</span>${i.porte?` <span class="porte">${'$'.repeat(i.porte)}</span>`:''}`).join(' · ') || (its.length ? 'Tudo feito' : 'Nenhum serviço ainda');
        return `<button class="room" data-act="open-room" data-id="${r.id}">
          <span class="rico">${svg(iconOf(r))}</span><span class="rn">${esc(r.nome)}</span><span class="rc">${st.feito}/${st.total}${st.custo?`<br>${brl.format(st.custo)}`:''}</span>
          <span class="rs">${resumo}</span></button>`;
      }).join('') : `<div class="empty">Nenhum cômodo aqui ainda. Adicione o primeiro abaixo.</div>`}</div>
      <form class="row" data-form="add-room"><input class="field" id="new-room" placeholder="Novo cômodo (ex.: Quarto da Maya)" autocomplete="off" required>
        <button class="btn primary">Adicionar</button></form>
    </div>`;
  }
  return `<div class="head"><div><div class="eyebrow">Planejamento de obra</div><h1>Reforma da Casa</h1></div>
      <div class="totals"><span><b>${all.pct}%</b>concluído</span><span><b>${all.feito}/${all.total}</b>serviços</span>${all.custo?`<span><b>${brl.format(all.custo)}</b>estimado</span>`:''}</div></div>
    <div class="building">
      ${roofHtml}${fl.length ? floorsHtml : `<div class="floor" style="grid-row:2"><span></span><span class="nm">Nenhum andar ainda</span></div>`}<div class="ground" style="grid-row:${groundRow}"></div>
      ${yardsHtml}
      ${ui.addingYard ? `<form class="row addfloor" data-form="add-yard" style="width:100%">
          <input class="field" id="new-yard" placeholder="Nome (ex.: Calçada, Quintal)" autocomplete="off" required>
          <label class="check" style="flex:1 1 200px">Na altura do <select class="field" id="new-yard-nivel" style="flex:1">${nivelOpts(fl[0]?.id)}</select></label>
          <button class="btn primary">Salvar</button><button type="button" class="btn" data-act="cancel">Cancelar</button></form>`
      : ui.addingFloor ? `<form class="row addfloor" data-form="add-floor" style="width:100%">
          <input class="field" id="new-floor-sigla" placeholder="Sigla (ex.: 4º)" style="flex:0 0 90px" autocomplete="off">
          <input class="field" id="new-floor" placeholder="Nome (ex.: Terraço)" autocomplete="off" required>
          <button class="btn primary">Salvar</button><button type="button" class="btn" data-act="cancel">Cancelar</button></form>`
        : `<div class="row addfloor"><button class="btn" data-act="add-floor-open">+ Andar</button><button class="btn" data-act="add-yard-open">+ Área externa</button></div>`}
    </div>
    ${roomsHtml}`;
}

const VERSAO = 'v0.24';
const subId = () => Math.random().toString(36).slice(2,10);
const subsOf = i => Array.isArray(i.subitens) ? i.subitens : [];
function subsHtml(i){
  const subs = subsOf(i), adding = ui.addSub === i.id;
  const list = subs.map(s=>`<div class="sub${s.feito?' done':''}"><button class="subchk" data-act="sub-toggle" data-id="${i.id}" data-sub="${s.id}" aria-pressed="${!!s.feito}" aria-label="Marcar ${esc(s.texto)}">${s.feito?'✓':''}</button><span class="subtx">${esc(s.texto)}</span><button class="subdel" data-act="sub-del" data-id="${i.id}" data-sub="${s.id}" aria-label="Remover ${esc(s.texto)}">×</button></div>`).join('');
  const add = adding ? `<form class="subform" data-form="add-sub" data-id="${i.id}"><input class="field" id="sub-new" placeholder="Ex.: trocar registro" autocomplete="off" required><button class="btn primary">Adicionar</button><button type="button" class="btn ghost" data-act="sub-close">Fechar</button></form>`
    : `<button class="subadd" data-act="sub-open" data-id="${i.id}">+ Subitem</button>`;
  return `<div class="subs">${list}${add}</div>`;
}
const PORTE = {1:'Simples', 2:'Média', 3:'Obra grande'};
const porteBadge = n => n ? `<span class="porte" title="${PORTE[n]}">${'$'.repeat(n)}<span class="dim">${'$'.repeat(3-n)}</span></span>` : '';
const porteSeg = (who, val) => `<div class="seg" role="group" aria-label="Tamanho do gasto">${[1,2,3].map(n=>`<button type="button" class="segb" data-act="set-porte" data-who="${who}" data-id="${n}" aria-pressed="${val===n}" title="${PORTE[n]}">${'$'.repeat(n)}</button>`).join('')}</div>`;
function footerView(){
  return `<footer class="foot">
    <button class="gear" data-act="options" aria-label="Opções" aria-pressed="${!!ui.options}"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button><span>Reforma da Casa · ${VERSAO}</span></footer>`;
}
function optionsView(){
  return `<button class="btn back" data-act="options">← Voltar para a casa</button>
    <div><div class="eyebrow">Configurações</div><h1>Opções</h1></div>
    <div class="backup"><div><div class="eyebrow">Organização</div><h2>Layout da casa</h2></div>
      <p>Mude a ordem dos cômodos em cada andar, no telhado e nas áreas externas.</p>
      <div class="row"><button class="btn primary" data-act="layout">Mudar Layout da Casa</button></div></div>
    <div class="backup"><div><div class="eyebrow">Onde ficam os dados</div><h2>${db && db.mode==='supabase' ? 'Banco online' : 'Só neste aparelho'}</h2></div>
      <p>${db && db.mode==='supabase' ? 'Os dados ficam no Supabase e aparecem em todos os celulares e computadores que abrirem o app.' : '<span class="warn">O Supabase não está conectado. Os dados estão salvos só neste navegador e não aparecem em outros aparelhos.</span>'}</p></div>
    ${backupView()}`;
}

const GRIP = '<span class="grip" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16"><g fill="currentColor"><circle cx="2.5" cy="3" r="1.4"/><circle cx="7.5" cy="3" r="1.4"/><circle cx="2.5" cy="8" r="1.4"/><circle cx="7.5" cy="8" r="1.4"/><circle cx="2.5" cy="13" r="1.4"/><circle cx="7.5" cy="13" r="1.4"/></g></svg></span>';
function layoutView(){
  const zones = [...floors.filter(f=>f.tipo==='telhado'), ...floors.filter(isFloor).sort(byOrder).reverse(), ...floors.filter(f=>f.tipo==='externo').sort(byOrder)];
  return `<button class="btn back" data-act="back">← Voltar para as opções</button>
    <div><div class="eyebrow">Opções</div><h1>Layout da casa</h1></div>
    <p class="legend" style="margin:0">Arraste pelos pontinhos ou use as setas. A ordem vale para os ícones da casinha e para a lista de cômodos.</p>
    ${zones.map(z => { const rs = roomsOf(z.id); return `<div class="lzone"><div class="eyebrow">${esc(z.nome)}</div>
      ${rs.length ? `<div class="rooms" data-sort>${rs.map((r,k) => `<div class="room lrow" data-sort-item data-id="${r.id}">${GRIP}<span class="rico">${svg(iconOf(r))}</span><span class="rn">${esc(r.nome)}</span>
        <span class="arrows"><button class="arrow" data-act="move-room" data-id="${r.id}" data-dir="-1" aria-label="Subir ${esc(r.nome)}" ${k===0?'disabled':''}>↑</button><button class="arrow" data-act="move-room" data-id="${r.id}" data-dir="1" aria-label="Descer ${esc(r.nome)}" ${k===rs.length-1?'disabled':''}>↓</button></span></div>`).join('')}</div>`
        : '<div class="empty" style="background:var(--sheet);border:1.5px solid var(--line);border-radius:10px">Nenhum cômodo aqui.</div>'}</div>`; }).join('')}`;
}
function saveOrder(ids){
  const changed = [];
  ids.forEach((id,k) => { const r = rooms.find(x=>x.id===id); if (r && r.ordem !== k+1){ r.ordem = k+1; changed.push([id,k+1]); } });
  render();
  if (changed.length) write(async()=>{ for (const [id,o] of changed) await db.doc('comodos/'+id).update({ordem:o}); });
}

function backupView(){
  const last = meta.ultimoBackup ? new Date(meta.ultimoBackup) : null;
  const dias = last ? Math.floor((Date.now()-last)/86400000) : null;
  const quando = !last ? '<span class="warn">Nenhum backup feito ainda.</span>'
    : `Último backup: ${last.toLocaleDateString('pt-BR')} às ${last.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}${dias>=7?` <span class="warn">(há ${dias} dias)</span>`:''}`;
  const r = ui.restore;
  return `<div class="backup">
    <div><div class="eyebrow">Segurança dos dados</div><h2>Backup</h2></div>
    <p>${quando}</p>
    <p>O backup é um arquivo .json com todos os andares, cômodos e serviços. Guarde no Google Drive ou no celular.</p>
    ${ui.busy ? `<p>${esc(ui.busy)}</p>` : ''}
    ${ui.okMsg ? `<div class="ok">${esc(ui.okMsg)}</div>` : ''}
    ${r ? `<div class="confirm">Restaurar o backup de ${esc(r.quando)} (${r.data.andares.length} andares, ${r.data.comodos.length} cômodos, ${r.data.itens.length} serviços)? Tudo o que está no app agora será substituído.
      <button class="btn danger" data-act="restore-go">Restaurar</button><button class="btn" data-act="restore-cancel">Cancelar</button></div>` : ''}
    <div class="row">
      <button class="btn primary" data-act="backup" ${ui.busy?'disabled':''}>Baixar backup</button>
      <span class="btn fileBtn">Restaurar backup<input type="file" id="restore-file" accept=".json,application/json" ${ui.busy?'disabled':''}></span>
    </div>
  </div>`;
}

function backupData(){
  const strip = ({id,...rest}) => ({id, ...rest});
  return {app:'reforma-da-casa', versao:1, geradoEm:new Date().toISOString(),
    andares:floors.map(strip), comodos:rooms.map(strip), itens:items.map(strip)};
}
async function doBackup(){
  const json = JSON.stringify(backupData(), null, 2);
  const nome = `reforma-da-casa-${new Date().toISOString().slice(0,10)}.json`;
  try {
    const url = URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
  } catch(e){ return flash('Não foi possível baixar o backup.'); }
  ui.okMsg = `Backup salvo: ${nome}`;
  write(()=>db.doc('meta/app').set({...meta, ultimoBackup:Date.now()}));
  render(); setTimeout(()=>{ui.okMsg=''; render();}, 5000);
}
function readRestoreFile(file){
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const d = JSON.parse(fr.result);
      if (d.app !== 'reforma-da-casa' || !Array.isArray(d.andares) || !Array.isArray(d.comodos) || !Array.isArray(d.itens)) throw 0;
      const quando = d.geradoEm ? new Date(d.geradoEm).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}) : 'data desconhecida';
      ui.restore = {data:d, quando}; render();
    } catch { flash('Esse arquivo não é um backup da Reforma da Casa.'); }
  };
  fr.readAsText(file);
}
async function doRestore(){
  const d = ui.restore.data; ui.restore = null; ui.room = null;
  const clean = o => { const {id, ...rest} = o; return rest; };
  const ok = s => /^[A-Za-z0-9_\-.~:@+]{1,200}$/.test(s);
  try {
    ui.busy = 'Apagando os dados atuais…'; render();
    for (const i of items) await db.doc('itens/'+i.id).delete();
    for (const r of rooms) await db.doc('comodos/'+r.id).delete();
    for (const f of floors) await db.doc('andares/'+f.id).delete();
    const all = [...d.andares.map(x=>['andares',x]), ...d.comodos.map(x=>['comodos',x]), ...d.itens.map(x=>['itens',x])].filter(([,x])=>x && ok(String(x.id)));
    let n = 0;
    for (const [col,x] of all){ await db.doc(col+'/'+x.id).set(clean(x)); n++; if (n%10===0){ ui.busy = `Restaurando… ${n} de ${all.length}`; render(); } }
    ui.busy=''; ui.okMsg = 'Backup restaurado.'; render(); setTimeout(()=>{ui.okMsg=''; render();}, 5000);
  } catch(e){ ui.busy=''; flash('A restauração parou no meio. Tente restaurar o mesmo arquivo de novo.'); }
}

function roomView(){
  const r = rooms.find(x=>x.id===ui.room), f = floors.find(x=>x.id===r.andarId);
  const sorted = itemsOf(r.id), st = stats(sorted);
  if (ui.orderRoom !== r.id){ ui.orderRoom = r.id; ui.order = sorted.map(i=>i.id); }
  const pos = id => { const k = ui.order.indexOf(id); return k < 0 ? 1e9 : k; };
  const its = [...sorted].sort((a,b)=>pos(a.id)-pos(b.id) || (a.criadoEm??0)-(b.criadoEm??0));
  const list = its.map(i => {
    const editing = ui.editItem === i.id;
    return `<div class="item s-${i.status}${ui.touched===i.id?' touched':''}">
      <button class="thermo p-${prioOf(i)}" data-act="cycle-prio" data-id="${i.id}" title="Prioridade ${PRIO[prioOf(i)][0]} — tocar para mudar">${thermo(prioOf(i))}<span>${PRIO[prioOf(i)][0]}</span></button>
      <button class="st ${i.status}" data-act="cycle" data-id="${i.id}" title="Tocar para mudar o status">${STATUS[i.status]||'Pendente'}</button>
      <div class="it"><span class="pt-${prioOf(i)}">${esc(i.texto)}</span>${i.obs?`<span class="obs">${esc(i.obs)}</span>`:''}${(i.opcional||i.custo||i.porte||subsOf(i).length)?`<small>${subsOf(i).length?`<span>${subsOf(i).filter(s=>s.feito).length}/${subsOf(i).length} subitens</span>`:''}${porteBadge(i.porte)}${i.opcional?'<span class="opt">opcional</span>':''}${i.custo?`<span>${brl.format(i.custo)}</span>`:''}</small>`:''}</div>
      <button class="btn ghost" data-act="edit-item" data-id="${i.id}" aria-label="Editar">${editing?'Fechar':'Editar'}</button>
      ${subsHtml(i)}
      ${editing ? `<form class="edit" data-form="save-item" data-id="${i.id}">
        <input class="field" id="ei-texto" value="${esc(i.texto)}" required>
        <textarea class="field" id="ei-obs" rows="3" placeholder="Observações (opcional)">${esc(i.obs||'')}</textarea>
        <div class="row"><input class="field" id="ei-custo" inputmode="numeric" placeholder="Custo estimado (R$)" value="${i.custo||''}">${porteSeg('ei', ui.eiPorte||0)}
          <label class="check"><input type="checkbox" id="ei-opc" ${i.opcional?'checked':''}> Opcional</label></div>
        ${prioSelect('ei-prio', prioOf(i))}
        <div class="row"><button class="btn primary">Salvar</button>
          ${ui.confirm==='item:'+i.id ? `<button type="button" class="btn danger" data-act="del-item" data-id="${i.id}">Confirmar exclusão</button>`
            : `<button type="button" class="btn ghost" data-act="ask" data-what="item:${i.id}">Excluir</button>`}</div>
      </form>`:''}
    </div>`;
  }).join('');
  const floorOpts = [...floors].sort(byOrder).map(x=>`<option value="${x.id}" ${x.id===r.andarId?'selected':''}>${esc(x.nome)}</option>`).join('');
  return `<button class="btn back" data-act="back">← ${esc(f?.nome || 'Casa')}</button>
    <div class="head"><div class="titleico"><span class="big">${svg(iconOf(r))}</span><div><div class="eyebrow">${esc(f?.nome||'')}</div><h1>${esc(r.nome)}</h1></div></div>
      <button class="btn ghost" data-act="edit-room">${ui.editRoom?'Fechar':'Editar cômodo'}</button></div>
    <div class="chips"><span class="chip">${st.feito}/${st.total} feitos</span><span class="chip">${its.filter(i=>i.status==='andamento').length} em andamento</span>${st.custo?`<span class="chip">${brl.format(st.custo)} estimado</span>`:''}</div>
    ${ui.editRoom ? `<form class="add" data-form="save-room" style="border-style:solid;border-color:var(--line)">
      <input class="field" id="er-nome" value="${esc(r.nome)}" required>
      <label class="check">Andar <select class="field" id="er-andar" style="flex:1">${floorOpts}</select></label>
      <span class="lbl">Ícone</span>
      <div class="picker">${Object.entries(ICONS).map(([k,[nm]])=>`<button type="button" class="pick" data-act="pick-icon" data-id="${k}" aria-pressed="${k===(ui.iconDraft||iconOf(r))}">${svg(k)}${nm}</button>`).join('')}</div>
      <div class="row"><button class="btn primary">Salvar</button>
        ${ui.confirm==='room:'+r.id ? `<button type="button" class="btn danger" data-act="del-room" data-id="${r.id}">Excluir cômodo e serviços</button>`
          : `<button type="button" class="btn ghost" data-act="ask" data-what="room:${r.id}">Excluir cômodo</button>`}</div></form>`:''}
    <div class="items">${list || `<div class="empty" style="background:var(--sheet);border:1.5px solid var(--line);border-radius:10px">Nada anotado ainda. O que este cômodo precisa?</div>`}</div>
    <form class="add" data-form="add-item">
      <input class="field" id="ni-texto" placeholder="O que precisa? (ex.: trocar o piso)" autocomplete="off" required>
      <textarea class="field" id="ni-obs" rows="2" placeholder="Observações (opcional): detalhes, cores, materiais…"></textarea>
      <div class="row"><input class="field" id="ni-custo" inputmode="numeric" placeholder="Custo estimado (opcional)" autocomplete="off">${porteSeg('ni', ui.niPorte||0)}
        <label class="check"><input type="checkbox" id="ni-opc"> Opcional</label></div>
      ${prioSelect('ni-prio', 'media')}
      <button class="btn primary">Adicionar serviço</button>
    </form>
    <p class="legend">Toque no status para alternar: Pendente → Em andamento → Feito. Toque no termômetro para mudar a prioridade: Alta → Média → Baixa. A lista se reorganiza quando você sai do cômodo.</p>`;
}

/* ---------- Ações ---------- */
const money = v => { const n = Number(String(v).replace(/[^\d,]/g,'').replace(',','.')); return n>0 ? Math.round(n) : 0; };

/* Navegação: cada tela vira um passo no histórico, então o Voltar do celular volta só uma tela */
let navDepth = 0, pushing = false, houseScroll = 0;
function go(hash){
  if (location.hash.slice(1) === hash) return;
  pushing = true; navDepth++; location.hash = hash;
}
function goBack(){
  if (navDepth > 0) history.back();
  else { pushing = true; location.hash = ''; }
}
function applyHash(){
  const h = decodeURIComponent(location.hash.slice(1));
  const wasHouse = !ui.room && !ui.options && !ui.layout;
  if (wasHouse) houseScroll = window.scrollY;
  ui.options = h === 'opcoes'; ui.layout = h === 'layout';
  const newRoom = h.startsWith('comodo-') ? h.slice(7) : null;
  if (newRoom !== ui.room){
    ui.room = newRoom; ui.editItem = null; ui.editRoom = false; ui.confirm = null; ui.addSub = null; ui.orderRoom = null; ui.touched = null;
    const r = newRoom && rooms.find(x=>x.id===newRoom); if (r) ui.floor = r.andarId;
  }
  ui.restore = null; hideTip();
  render();
  window.scrollTo(0, (!ui.room && !ui.options && !ui.layout) ? houseScroll : 0);
}
window.addEventListener('hashchange', () => { if (pushing) pushing = false; else if (navDepth > 0) navDepth--; applyHash(); });

let touchTimer = null;
function touch(id){
  ui.touched = id; clearTimeout(touchTimer);
  touchTimer = setTimeout(()=>{ if (ui.touched===id){ ui.touched=null; render(); } }, 4000);
}

/* Nome do cômodo ao passar o mouse ou segurar o dedo */
const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
let pressTimer = null, longPressed = false, tipTimer = null;
function showTip(el){
  tip.textContent = el.dataset.name; tip.hidden = false;
  const r = el.getBoundingClientRect(), w = tip.offsetWidth;
  const x = Math.max(8, Math.min(r.left + r.width/2 - w/2, document.documentElement.clientWidth - w - 8));
  tip.style.left = (x + window.scrollX) + 'px';
  tip.style.top = (r.top + window.scrollY - tip.offsetHeight - 8) + 'px';
}
const hideTip = () => { tip.hidden = true; };
$app.addEventListener('mouseover', e => { const w = e.target.closest('.win'); if (w && !ui.dragging) showTip(w); });
$app.addEventListener('mouseout', e => { if (e.target.closest('.win')) hideTip(); });
$app.addEventListener('focusin', e => { if (e.target.matches('.win:focus-visible')) showTip(e.target); });
$app.addEventListener('focusout', e => { if (e.target.closest('.win')) hideTip(); });
$app.addEventListener('pointerdown', e => {
  const w = e.target.closest('.win'); if (!w || e.pointerType === 'mouse') return;
  longPressed = false; clearTimeout(pressTimer);
  pressTimer = setTimeout(() => { longPressed = true; showTip(w); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 1800); }, 450);
});
['pointerup','pointercancel','pointerleave'].forEach(t => $app.addEventListener(t, () => clearTimeout(pressTimer)));
$app.addEventListener('contextmenu', e => { if (e.target.closest('.win')) e.preventDefault(); });
$app.addEventListener('keydown', e => {
  if (e.target.matches('.floor,.roof,.yard') && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.target.click(); }
});

/* Arrastar para reordenar cômodos (ícones da casa e lista do andar) */
let drag = null, suppressClick = false;
$app.addEventListener('pointerdown', e => {
  const item = e.target.closest('[data-sort-item]'); if (!item || (e.button && e.button !== 0)) return;
  const box = item.parentElement; if (!box || !box.hasAttribute('data-sort')) return;
  const isList = box.classList.contains('rooms');
  if (isList && !e.target.closest('.grip')) return;
  if (isList) e.preventDefault();
  drag = {item, box, x:e.clientX, y:e.clientY, on:false, pid:e.pointerId, horiz:!isList};
});
window.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pid) return;
  if (!drag.on){
    if (Math.hypot(e.clientX-drag.x, e.clientY-drag.y) < 6) return;
    drag.on = true; ui.dragging = true; clearTimeout(pressTimer); hideTip();
    drag.item.classList.add('dragging'); document.body.classList.add('is-dragging');
  }
  e.preventDefault();
  const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-sort-item]');
  if (el && el !== drag.item && el.parentElement === drag.box){
    const r = el.getBoundingClientRect();
    const after = drag.horiz ? e.clientX > r.left + r.width/2 : e.clientY > r.top + r.height/2;
    drag.box.insertBefore(drag.item, after ? el.nextSibling : el);
  }
  if (e.clientY < 60) window.scrollBy(0,-10); else if (e.clientY > window.innerHeight-60) window.scrollBy(0,10);
}, {passive:false});
function endDrag(e){
  if (!drag || e.pointerId !== drag.pid) return;
  const d = drag; drag = null;
  if (!d.on) return;
  suppressClick = true; setTimeout(()=>{ suppressClick = false; }, 60);
  d.item.classList.remove('dragging'); document.body.classList.remove('is-dragging'); ui.dragging = false;
  saveOrder([...d.box.querySelectorAll('[data-sort-item]')].map(x=>x.dataset.id));
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

$app.addEventListener('click', e => {
  if (suppressClick){ suppressClick = false; return; }
  if (e.target.closest('.grip')) return;
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.classList.contains('win') && longPressed){ longPressed = false; return; }
  hideTip();
  const id = b.dataset.id, act = b.dataset.act;
  if (act==='pick-floor'){
    ui.floor = ui.floor===id ? 'none' : id; ui.confirm=null; ui.editZone=null; render();
    if (ui.floor !== 'none' && window.matchMedia('(max-width: 760px)').matches){
      const sec = document.getElementById('rooms-section');
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (sec) sec.scrollIntoView({behavior: smooth ? 'smooth' : 'auto', block: 'start'});
    }
    return;
  }
  else if (act==='open-room'){ go('comodo-'+id); return; }
  else if (act==='back'){ goBack(); return; }
  else if (act==='add-floor-open'){ ui.addingFloor=true; render(); document.getElementById('new-floor-sigla')?.focus(); return; }
  else if (act==='add-yard-open'){ ui.addingYard=true; render(); document.getElementById('new-yard')?.focus(); return; }
  else if (act==='cancel'){ ui.confirm=null; ui.addingFloor=false; ui.addingYard=false; ui.editZone=null; }
  else if (act==='edit-zone'){ ui.editZone = ui.editZone===id ? null : id; ui.confirm=null; render(); document.getElementById('ez-nome')?.focus(); return; }
  else if (act==='ask'){ ui.confirm=b.dataset.what; }
  else if (act==='edit-item'){ ui.editItem = ui.editItem===id ? null : id; ui.eiPorte = items.find(i=>i.id===id)?.porte || 0; ui.confirm=null; }
  else if (act==='set-porte'){ const k = b.dataset.who==='ei' ? 'eiPorte' : 'niPorte', n = Number(id); ui[k] = ui[k]===n ? 0 : n; }
  else if (act==='edit-room'){ ui.editRoom=!ui.editRoom; ui.iconDraft=null; ui.confirm=null; }
  else if (act==='pick-icon'){ ui.iconDraft=id; }
  else if (act==='backup'){ doBackup(); return; }
  else if (act==='layout'){ go('layout'); return; }
  else if (act==='move-room'){
    const r = rooms.find(x=>x.id===id); if (!r) return;
    const ids = roomsOf(r.andarId).map(x=>x.id), k = ids.indexOf(id), j = k + Number(b.dataset.dir);
    if (j < 0 || j >= ids.length) return;
    [ids[k], ids[j]] = [ids[j], ids[k]]; saveOrder(ids); return;
  }
  else if (act==='sub-open'){ ui.addSub=id; render(); document.getElementById('sub-new')?.focus(); return; }
  else if (act==='sub-close'){ ui.addSub=null; }
  else if (act==='sub-toggle' || act==='sub-del'){
    const it = items.find(i=>i.id===id), sid = b.dataset.sub;
    const subs = act==='sub-del' ? subsOf(it).filter(s=>s.id!==sid) : subsOf(it).map(s=>s.id===sid ? {...s, feito:!s.feito} : s);
    if (act==='sub-toggle') touch(id);
    write(()=>db.doc('itens/'+id).update({subitens:subs})); return;
  }
  else if (act==='cycle-prio'){ const it = items.find(i=>i.id===id); touch(id); write(()=>db.doc('itens/'+id).update({prioridade:NEXT_PRIO[prioOf(it)]})); return; }
  else if (act==='options'){ if (ui.options) goBack(); else go('opcoes'); return; }
  else if (act==='restore-cancel'){ ui.restore=null; }
  else if (act==='restore-go'){ doRestore(); return; }
  else if (act==='cycle'){ const it = items.find(i=>i.id===id); touch(id); write(()=>db.doc('itens/'+id).update({status:NEXT[it.status]||'andamento'})); return; }
  else if (act==='del-item'){ ui.editItem=null; ui.confirm=null; write(()=>db.doc('itens/'+id).delete()); }
  else if (act==='del-room'){ ui.editRoom=false; ui.confirm=null; goBack();
    write(async()=>{ for (const i of itemsOf(id)) await db.doc('itens/'+i.id).delete(); await db.doc('comodos/'+id).delete(); }); }
  else if (act==='del-floor'){ ui.confirm=null;
    write(async()=>{ for (const r of roomsOf(id)){ for (const i of itemsOf(r.id)) await db.doc('itens/'+i.id).delete(); await db.doc('comodos/'+r.id).delete(); } await db.doc('andares/'+id).delete(); }); }
  render();
});

$app.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, kind = f.dataset.form, v = id => document.getElementById(id);
  if (!db) return flash('Sem conexão com o banco da casa.');
  if (kind==='save-zone'){
    const id = f.dataset.id, nome = v('ez-nome').value.trim(); if(!nome) return;
    const upd = {nome}; if (v('ez-sigla')) upd.sigla = v('ez-sigla').value.trim();
    ui.editZone = null; write(()=>db.doc('andares/'+id).update(upd));
  } else if (kind==='add-sub'){
    const id = f.dataset.id, texto = v('sub-new').value.trim(); if(!texto) return;
    const it = items.find(i=>i.id===id);
    v('sub-new').value='';
    write(()=>db.doc('itens/'+id).update({subitens:[...subsOf(it), {id:subId(), texto, feito:false}]}));
    v('sub-new').focus(); return;
  } else if (kind==='add-yard'){
    const nome = v('new-yard').value.trim(); if(!nome) return;
    const nivel = v('new-yard-nivel').value; ui.addingYard=false;
    write(async()=>{ const ref = await db.collection('andares').add({nome, tipo:'externo', nivel, sigla:'', ordem:Date.now(), criadoEm:Date.now()}); ui.floor = ref.id; render(); });
  } else if (kind==='add-floor'){
    const nome = v('new-floor').value.trim(); if(!nome) return;
    const ordem = floors.filter(isFloor).reduce((m,x)=>Math.max(m,x.ordem??0),0)+1;
    ui.addingFloor=false;
    write(async()=>{ const ref = await db.collection('andares').add({nome, sigla:v('new-floor-sigla').value.trim(), ordem, criadoEm:Date.now()}); ui.floor = ref.id; });
  } else if (kind==='add-room'){
    const nome = v('new-room').value.trim(); if(!nome) return; v('new-room').value='';
    const ordem = roomsOf(ui.floor).reduce((m,x)=>Math.max(m,x.ordem??0),0)+1;
    write(()=>db.collection('comodos').add({nome, andarId:ui.floor, icone:guessIcon(nome), ordem, criadoEm:Date.now()}));
  } else if (kind==='add-item'){
    const texto = v('ni-texto').value.trim(); if(!texto) return;
    const doc = {texto, porte:ui.niPorte||0, obs:v('ni-obs').value.trim(), comodoId:ui.room, status:'pendente', opcional:v('ni-opc').checked, custo:money(v('ni-custo').value), prioridade:v('ni-prio').value, criadoEm:Date.now()};
    ui.niPorte = 0; v('ni-texto').value=''; v('ni-obs').value=''; v('ni-custo').value=''; v('ni-opc').checked=false; v('ni-prio').value='media';
    write(()=>db.collection('itens').add(doc));
    v('ni-texto').focus();
  } else if (kind==='save-item'){
    const id = f.dataset.id, texto = v('ei-texto').value.trim(); if(!texto) return;
    const upd = {texto, porte:ui.eiPorte||0, obs:v('ei-obs').value.trim(), opcional:v('ei-opc').checked, custo:money(v('ei-custo').value), prioridade:v('ei-prio').value};
    ui.editItem=null; ui.confirm=null; write(()=>db.doc('itens/'+id).update(upd));
  } else if (kind==='save-room'){
    const r = rooms.find(x=>x.id===ui.room);
    const upd = {nome:v('er-nome').value.trim(), andarId:v('er-andar').value, icone:ui.iconDraft||iconOf(r)}; if(!upd.nome) return;
    ui.editRoom=false; ui.iconDraft=null; ui.floor=upd.andarId; write(()=>db.doc('comodos/'+ui.room).update(upd));
  }
  render();
});

$app.addEventListener('change', e => {
  if (e.target.id === 'area-nivel'){ const id = e.target.dataset.id, nivel = e.target.value; write(()=>db.doc('andares/'+id).update({nivel})); return; }
  if (e.target.id === 'restore-file' && e.target.files[0]){ readRestoreFile(e.target.files[0]); e.target.value=''; }
});

/* ---------- Dados ---------- */
if (location.hash) applyHash();
(async () => {
  db = store;
  const loadTimer = setTimeout(()=>{ if(!(loaded.floors&&loaded.rooms&&loaded.items)){ failed='A casa está demorando para carregar. Verifique a conexão.'; render(); } }, 10000);
  const done = () => { if (loaded.floors&&loaded.rooms&&loaded.items){ clearTimeout(loadTimer); failed=null; ensureZones(); } render(); };
  const err = () => { clearTimeout(loadTimer); failed='Não foi possível ler os dados da casa.'; render(); };
  const map = s => s.docs.map(d => ({id:d.id, ...d.data()}));
  db.collection('andares').onSnapshot(s=>{ floors=map(s); loaded.floors=true; done(); }, err);
  db.collection('comodos').onSnapshot(s=>{ rooms=map(s); loaded.rooms=true; done(); }, err);
  db.collection('itens').onSnapshot(s=>{ items=map(s); loaded.items=true; done(); }, err);
  db.doc('meta/app').onSnapshot(s=>{ meta = s.data() || {}; render(); }, ()=>{});
})();
