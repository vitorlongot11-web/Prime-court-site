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
  evBox.innerHTML = TORNEIOS.map(t => {
    const st = tStatus(t), a = dt(t.inicio), isNext = prox && prox.id === t.id;
    return `<a class="it${st.k === 'realizado' ? ' past' : ''}${isNext ? ' next' : ''}" href="torneio.html?id=${t.id}"><div class="d"><b>${tDatas(t).split(' ')[0]}</b><span>${MESES[a.getMonth()]}</span></div><div><h3>${t.nome}</h3><p>${t.resumo}</p></div><span class="tg ${st.k}">${isNext ? 'Próximo · ' : ''}${st.label}</span></a>`;
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
