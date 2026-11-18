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

// menu lateral em camadas (estilo "staggered"): montado a partir dos links do #ov de cada página
const ov = document.getElementById('ov');
let ultimoGatilho = null;
const setMenu = o => {
  if (!ov) return;
  ov.classList.toggle('open', o);
  ov.setAttribute('aria-hidden', o ? 'false' : 'true');
  document.body.style.overflow = o ? 'hidden' : '';
  if (o) setTimeout(() => { const c = ov.querySelector('.sm-close'); if (c) c.focus({ preventScroll: true }); }, 60);
  else if (ultimoGatilho) ultimoGatilho.focus({ preventScroll: true });
};
(function montarMenu() {
  if (!ov) return;
  const links = [...ov.querySelectorAll('nav a')];
  const info = ov.querySelector('.info');
  const filhos = info ? [...info.children].map(c => c.cloneNode(true)) : [];
  const atual = location.pathname.split('/').pop() || 'index.html';
  const itens = links.map((a, i) => {
    const href = a.getAttribute('href');
    const on = href === atual || (atual === 'torneio.html' && href === 'torneios.html');
    return `<li style="--i:${i}"><a href="${href}"${on ? ' class="on" aria-current="page"' : ''}><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="lbl"><span>${a.textContent}</span></span></a></li>`;
  }).join('');
  ov.classList.add('sm');
  ov.setAttribute('aria-hidden', 'true');
  ov.innerHTML = `<div class="sm-layer sm-l1"></div><div class="sm-layer sm-l2"></div>
    <aside class="sm-panel" role="dialog" aria-modal="true" aria-label="Menu do site">
      <button class="sm-close" data-close type="button"><span>Fechar</span><i class="ic" aria-hidden="true"></i></button>
      <div class="sm-nav" role="navigation" aria-label="Páginas do site"><ul>${itens}</ul></div>
      <div class="sm-info"></div>
    </aside>`;
  const caixa = ov.querySelector('.sm-info');
  filhos.forEach(f => caixa.appendChild(f));
  const cta = caixa.querySelector('.btn'); if (cta) cta.classList.add('beam');
  caixa.innerHTML = caixa.innerHTML.replace(/CEP\s[\d-]+/g, s => `<span style="white-space:nowrap">${s}</span>`);
  ov.addEventListener('click', e => { if (e.target.closest('[data-close]') || !e.target.closest('.sm-panel')) setMenu(false); });
})();
document.querySelectorAll('[data-menu]').forEach(b => b.addEventListener('click', () => { ultimoGatilho = b; setMenu(true); }));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// header sólido ao rolar
const hd = document.querySelector('.hd');
const onScroll = () => hd.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// revelar ao rolar
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

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
  // cada torneio tem a sua cor (tCor, em torneios-lib.js), igual no dia do calendário e no cartão
  const cor = t => { const p = tCor(t); return `--c:${p.c};--ct:${p.t}`; };
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
      return `<a class="ci ev-${ty}" style="${cor(t)}" href="torneio.html?id=${t.id}"><div class="cd"><b>${tDatas(t).split(' ')[0]}</b><span>${MESES[dt(t.inicio).getMonth()]}</span></div><div class="cn"><h3>${t.nome}</h3><p>${t.resumo}</p></div><div class="cf"><span class="tg ${st.k}">${ty === 'next' ? 'Próximo · ' : ''}${st.label}</span><span class="mais">Saiba mais <i>→</i></span></div></a>`;
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
