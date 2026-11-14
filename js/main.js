/* ====== CONFIGURAÇÃO — troque aqui ====== */
const WHATSAPP = '5567999999999';          // número da secretaria (DDI+DDD+número)
const WHATSAPP_PAULINHO = '5567999999999'; // número do Paulinho (encordoamento)
/* ======================================== */

const wa = (num, txt) => 'https://wa.me/' + num + '?text=' + encodeURIComponent(txt);
document.querySelectorAll('[data-wa]').forEach(a => {
  a.href = wa(WHATSAPP, 'Olá! Quero agendar minha aula experimental gratuita na Prime Court.');
  a.target = '_blank'; a.rel = 'noopener';
});
document.querySelectorAll('[data-wa-paulinho]').forEach(a => {
  a.href = wa(WHATSAPP_PAULINHO, 'Olá, Paulinho! Quero encordoar minha raquete na Prime Court.');
  a.target = '_blank'; a.rel = 'noopener';
});

// menu overlay
const ov = document.getElementById('ov');
const setMenu = o => { ov.classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; };
document.querySelectorAll('[data-menu]').forEach(b => b.addEventListener('click', () => setMenu(true)));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// header sólido ao rolar
const hd = document.querySelector('.hd');
const onScroll = () => hd.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// revelar ao rolar
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ===== Planos (só na página de planos) =====
const PLANS = {
  'Adulto': { note: 'Aulas de 1 hora.', rows: [['1x por semana', '300'], ['2x por semana', '480'], ['3x por semana', '630']] },
  'Infantil até 8': { note: 'Infantil iniciante, até 8 anos. Aulas de 1 hora.', rows: [['1x por semana', '220'], ['2x por semana', '370'], ['3x por semana', '490']] },
  'Infantil 8+': { note: 'Infantil intermediário, acima de 8 anos. Aulas de 1 hora.', rows: [['1x por semana', '265'], ['2x por semana', '440'], ['3x por semana', '575']] },
  'Juvenil avançado': { note: 'Das 14h às 16h, aulas de 2 horas.', rows: [['2x por semana', '580'], ['3x por semana', '690'], ['5x por semana', '1.100']] },
};
const tabs = document.getElementById('tabs');
if (tabs) {
  const out = document.getElementById('plans'), note = document.getElementById('note');
  const draw = k => {
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
    note.textContent = PLANS[k].note;
    out.innerHTML = PLANS[k].rows.map(([f, p], i) => `<div class="plan${i === 1 ? ' hi' : ''}">${i === 1 ? '<span class="pop">Mais escolhido</span>' : ''}<span class="f">${f}</span><span class="pr"><sup>R$</sup>${p}<small>/mês</small></span><span class="free">✓ Aula experimental gratuita</span><a class="btn" data-wa href="#">Agendar aula</a></div>`).join('');
    out.querySelectorAll('[data-wa]').forEach(a => { a.href = wa(WHATSAPP, `Olá! Quero agendar uma aula experimental. Tenho interesse no plano ${k} - ${f(a)}.`); a.target = '_blank'; });
    function f(a) { return a.parentElement.querySelector('.f').textContent; }
  };
  tabs.innerHTML = Object.keys(PLANS).map(k => `<button data-k="${k}">${k}</button>`).join('');
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) draw(b.dataset.k); });
  draw('Adulto');
}

// ===== Lista de torneios (página Torneios) — dados em js/torneios-data.js =====
const evBox = document.getElementById('events');
if (evBox) aoCarregarTorneios(() => {
  const prox = tProximo();
  // calendário: um "folhinha" por mês, com os dias dos torneios marcados e a lista logo abaixo
  const ord = TORNEIOS.slice().sort((a, b) => a.inicio.localeCompare(b.inicio));
  const iso = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  const hoje = iso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  // sempre mostra o mês atual + os 3 seguintes (mesmo vazios); meses mais à frente só entram se tiverem torneio
  const meses = [], agora = new Date();
  const add = (y, m) => { const k = y + '-' + m; if (!meses.find(x => x.k === k)) meses.push({ k, y, m }); };
  for (let i = 0; i < 4; i++) { const d = new Date(agora.getFullYear(), agora.getMonth() + i, 1); add(d.getFullYear(), d.getMonth()); }
  ord.filter(t => !tRealizado(t)).forEach(t => {
    for (let d = dt(t.inicio), f = dt(t.fim); d <= f; d.setDate(d.getDate() + 1)) {
      if (d >= new Date(agora.getFullYear(), agora.getMonth(), 1)) add(d.getFullYear(), d.getMonth());
    }
  });
  meses.sort((a, b) => a.y - b.y || a.m - b.m);
  const rank = { next: 3, up: 2, past: 1 };
  const tipo = t => tRealizado(t) ? 'past' : (prox && prox.id === t.id ? 'next' : 'up');
  // cada torneio tem a sua cor, igual no dia do calendário e no cartão (c = fundo, t = texto)
  // paleta "quadra": saibro, bordô, areia, lima, verde-quadra, azul-hard
  const CORES_BASE = ['#e8743b', '#b23a48', '#f2c14e', '#d4ec3a', '#2e9d6f', '#4a90d9'];
  const PALETA = CORES_BASE.map(c => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    return { c, t: (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1b1a12' : '#ffffff' };
  });
  const CORES = { 'torneio-juridico': 0, 'finals-ranking-prime': 1, 'ftms-finals': 2, 'dourados-cup': 3, 'dourados-future': 4 };
  const cor = t => { const p = PALETA[(t.id in CORES ? CORES[t.id] : ord.findIndex(x => x.id === t.id) + 5) % PALETA.length]; return `--c:${p.c};--ct:${p.t}`; };
  evBox.innerHTML = meses.map(({ y, m }) => {
    const pref = y + '-' + String(m + 1).padStart(2, '0');
    const doMes = ord.filter(t => t.inicio.slice(0, 7) <= pref && t.fim.slice(0, 7) >= pref);
    const dias = new Date(y, m + 1, 0).getDate(), lead = new Date(y, m, 1).getDay();
    let cel = '<i class="e"></i>'.repeat(lead);
    for (let d = 1; d <= dias; d++) {
      const s = iso(y, m, d), ts = doMes.filter(t => t.inicio <= s && t.fim >= s);
      const cls = 'dia' + (s === hoje ? ' hoje' : '');
      if (!ts.length) { cel += `<span class="${cls}">${d}</span>`; continue; }
      const t = ts.sort((a, b) => rank[tipo(b)] - rank[tipo(a)])[0];
      const pos = (s === t.inicio ? ' ini' : '') + (s === t.fim ? ' fim' : '');
      cel += `<a class="${cls} ev-${tipo(t)}${pos}" style="${cor(t)}" href="torneio.html?id=${t.id}" title="${t.nome}">${d}</a>`;
    }
    const lista = doMes.map(t => {
      const st = tStatus(t), ty = tipo(t);
      return `<a class="ci ev-${ty}" style="${cor(t)}" href="torneio.html?id=${t.id}"><div class="cd"><b>${tDatas(t).split(' ')[0]}</b><span>${MESES[dt(t.inicio).getMonth()]}</span></div><div class="cn"><h3>${t.nome}</h3><p>${t.resumo}</p></div><span class="tg ${st.k}">${ty === 'next' ? 'Próximo · ' : ''}${st.label}</span></a>`;
    }).join('');
    return `<article class="mes"><header><h2>${MESES_FULL[m]}</h2><span>${y}</span></header>
      <div class="gr"><b>D</b><b>S</b><b>T</b><b>Q</b><b>Q</b><b>S</b><b>S</b>${cel}</div>
      <div class="ls">${lista || '<p class="vazio">Datas dos torneios em breve.</p>'}</div></article>`;
  }).join('');
});

// barra do celular: some ao rolar para baixo, volta ao rolar para cima
(() => {
  const bar = document.querySelector('.bar'); if (!bar) return;
  let last = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY, dy = y - last;
    if (Math.abs(dy) < 8) return;
    bar.classList.toggle('hide', dy > 0 && y > 140 && !document.getElementById('ov').classList.contains('open'));
    last = y;
  }, { passive: true });
})();
