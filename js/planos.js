/* Planos e preços: escolhe o público e a forma de pagamento; cada cartão recalcula o preço mensal
   com o desconto da condição escolhida. Depende de wa() e WHATSAPP (js/main.js). */
(() => {
  const tabsEl = document.getElementById('tabs'), payEl = document.getElementById('pay');
  const out = document.getElementById('plans'), note = document.getElementById('note');
  if (!tabsEl || !payEl || !out) return;

  /* ---------- dados (edite aqui) ---------- */
  const PUBLICOS = {
    'Adulto':           { nota: 'Aulas de 1 hora.',                                          horas: 1, aula: '1 hora',                    rows: [[1, 300], [2, 480], [3, 630]] },
    'Infantil até 8':   { nota: 'Infantil iniciante, até 8 anos. Aulas de 1 hora.',          horas: 1, aula: '1 hora',                    rows: [[1, 220], [2, 370], [3, 490]] },
    'Infantil 8+':      { nota: 'Infantil intermediário, acima de 8 anos. Aulas de 1 hora.', horas: 1, aula: '1 hora',                    rows: [[1, 265], [2, 440], [3, 575]] },
    'Juvenil avançado': { nota: 'Das 14h às 16h, aulas de 2 horas.',                         horas: 2, aula: '2 horas, das 14h às 16h',   rows: [[2, 580], [3, 690], [5, 1100]] },
  };
  // off = desconto sobre o valor mensal; meses = quantos meses são pagos de uma vez
  const MODOS = [
    { k: 'cheio',   nome: 'Mensal',       off: 0,    meses: 1, dica: 'Valor mensal, sem desconto.' },
    { k: 'pontual', nome: 'Até o dia 10', off: 0.10, meses: 1, dica: 'pagando até o dia 10' },
    { k: 'tri',     nome: 'Trimestral',   off: 0.04, meses: 3, dica: 'a cada 3 meses, adiantado no Pix' },
    { k: 'sem',     nome: 'Semestral',    off: 0.08, meses: 6, dica: 'a cada 6 meses, adiantado no Pix' },
  ];

  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cent = n => Math.round(n * 100) / 100;
  const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(cent(n)) ? 0 : 2, maximumFractionDigits: 2 });
  const S = { pub: 'Adulto', modo: 'cheio' };
  let anteriores = [];

  /* ---------- seletor com indicador deslizante ---------- */
  function montaSeg(el, opcoes, atual, aoMudar) {
    el.innerHTML = '<span class="seg-ind" aria-hidden="true"></span>' + opcoes.map(o =>
      `<button type="button" role="radio" data-k="${o.k}" aria-checked="${o.k === atual}" tabindex="${o.k === atual ? 0 : -1}">${o.nome}${o.chip ? `<b>${o.chip}</b>` : ''}</button>`).join('');
    const ind = el.querySelector('.seg-ind');
    const bts = [...el.querySelectorAll('button')];
    const poe = (anima = true) => {
      const on = el.querySelector('[aria-checked=true]'); if (!on) return;
      ind.style.transition = anima && !reduz ? '' : 'none';
      ind.style.width = on.offsetWidth + 'px';
      ind.style.transform = `translateX(${on.offsetLeft}px)`;
      const x = on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2;
      if (el.scrollWidth > el.clientWidth) el.scrollTo({ left: x, behavior: reduz ? 'auto' : 'smooth' });
    };
    const escolhe = b => {
      bts.forEach(x => { x.setAttribute('aria-checked', x === b); x.tabIndex = x === b ? 0 : -1; });
      poe(); aoMudar(b.dataset.k);
    };
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (b) escolhe(b); });
    el.addEventListener('keydown', e => {
      const i = bts.indexOf(document.activeElement);
      if (i < 0 || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const n = bts[(i + (e.key === 'ArrowRight' ? 1 : -1) + bts.length) % bts.length];
      n.focus(); escolhe(n);
    });
    new ResizeObserver(() => poe(false)).observe(el);
    document.fonts && document.fonts.ready.then(() => poe(false));
    poe(false);
  }

  /* ---------- números que contam até o valor novo ---------- */
  function conta(el, de, para) {
    if (reduz || de === para || !isFinite(de)) { el.textContent = fmt(para); return; }
    const t0 = performance.now(), dur = 520;
    const passo = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p >= 1 ? fmt(para) : fmt(Math.round(de + (para - de) * e));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  /* ---------- cartões ---------- */
  function desenha() {
    const pub = PUBLICOS[S.pub], modo = MODOS.find(m => m.k === S.modo);
    note.textContent = pub.nota;
    const meio = 1;
    out.innerHTML = pub.rows.map(([vezes, base], i) => {
      const liq = cent(base * (1 - modo.off)), total = cent(liq * modo.meses);
      const horas = vezes * pub.horas;
      let sub;
      if (modo.off === 0) sub = modo.dica;
      else if (modo.meses === 1) sub = `<s>R$ ${fmt(base)}</s><em>−${Math.round(modo.off * 100)}%</em> ${modo.dica}`;
      else sub = `<s>R$ ${fmt(base)}</s><em>−${Math.round(modo.off * 100)}%</em> R$ ${fmt(total)} ${modo.dica}`;
      const msg = `Olá! Quero agendar uma aula experimental. Tenho interesse no plano ${S.pub} - ${vezes}x por semana (${modo.nome.toLowerCase()}).`;
      return `<article class="pl-card${i === meio ? ' dest' : ''}">
        ${i === meio ? '<span class="pl-flag">Mais escolhido</span>' : ''}
        <div class="pl-freq"><b>${vezes}<i>x</i></b><span>por semana</span></div>
        <div class="pl-preco"><span class="pl-rs">R$</span><span class="pl-val" data-para="${liq}">${fmt(anteriores[i] != null ? anteriores[i] : liq)}</span><span class="pl-mes">/mês</span></div>
        <p class="pl-sub">${sub}</p>
        <ul class="pl-lista">
          <li>Aulas de ${pub.aula}</li>
          <li>${horas} ${horas > 1 ? 'horas' : 'hora'} de quadra por semana</li>
          <li>Aula experimental grátis</li>
        </ul>
        <a class="btn${i === meio ? '' : ' dark'}" href="${wa(WHATSAPP, msg)}" target="_blank" rel="noopener">Agendar aula experimental</a>
      </article>`;
    }).join('');
    out.querySelectorAll('.pl-val').forEach((el, i) => {
      const para = parseFloat(el.dataset.para);
      conta(el, anteriores[i] != null ? anteriores[i] : para, para);
    });
    anteriores = pub.rows.map(([, base]) => cent(base * (1 - modo.off)));
  }

  montaSeg(tabsEl, Object.keys(PUBLICOS).map(k => ({ k, nome: k })), S.pub, k => { S.pub = k; desenha(); });
  montaSeg(payEl, MODOS.map(m => ({ k: m.k, nome: m.nome, chip: m.off ? `−${Math.round(m.off * 100)}%` : '' })), S.modo, k => { S.modo = k; desenha(); });
  desenha();
})();
