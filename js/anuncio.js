/* Anúncio do próximo torneio: cartão no Início + pop-up (1 vez por visita).
   O formato fica em ANUNCIO_MODO, no torneios-data.js. */
aoCarregarTorneios(() => {
  const slot = document.getElementById('news-slot');
  const t = tProximo();
  if (!t) { if (slot) slot.remove(); return; }
  const store = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const modo = ANUNCIO_MODO;
  const isHome = !!document.querySelector('.hero');
  const st = tStatus(t), link = 'torneio.html?id=' + t.id;
  const datas = tDatas(t);

  // atalho do hero: próximo torneio
  const at = document.getElementById('atalho-torneio');
  if (at) { at.href = link; at.querySelector('span:last-child').innerHTML = 'Próximo torneio<small>' + t.nome + ' · ' + st.label + '</small>'; }

  // 1) faixa no topo (todas as páginas)
  if (modo === 'faixa+cartao') {
    const hd = document.querySelector('.hd');
    const a = document.createElement('a');
    a.className = 'strip'; a.href = link;
    a.innerHTML = `<i class="dot ${st.k}"></i><b>${t.nome}</b><span class="sep">·</span><span>${datas}</span><span class="sep">·</span><span>${st.label}</span><u>Ver detalhes →</u>`;
    hd.insertBefore(a, hd.firstChild);
    document.body.classList.add('has-strip');
  }

  if (slot && !(modo === 'faixa+cartao' || modo === 'cartao' || modo === 'popup+cartao')) slot.remove();

  // 2) cartão grande no Início
  if (isHome && (modo === 'faixa+cartao' || modo === 'cartao' || modo === 'popup+cartao')) {
    const a = dt(t.inicio);
    const sec = document.createElement('section');
    sec.className = 'sec wrap news-sec';
    const real = v => v && !String(v).trim().startsWith('[');
    const ic = p => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    const fatos = [
      ['Data', tDatasLongas(t), ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>')],
      real(t.local) && ['Local', t.local, ic('<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>')],
      real(t.horario) && ['Horário', t.horario, ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')],
      st.k === 'abertas' && t.prazo && ['Inscrições até', tDatasLongas({ inicio: t.prazo, fim: t.prazo }), ic('<path d="M5 12l4 4 10-10"/>')],
    ].filter(Boolean);
    sec.innerHTML = `
      <article class="news">
        <a class="news-poster" href="${link}" aria-label="Cartaz: ${t.nome}"><span class="np-in">${t.cartaz ? `<img src="${t.cartaz}" alt="Cartaz do ${t.nome}">` : `<div class="photo clay"><span>Cartaz do torneio</span></div>`}</span></a>
        <div class="news-body">
          <small class="kick">Próximo torneio</small>
          <div class="news-head"><h2>${t.nome}</h2><span class="chip ${st.k}"><i></i>${st.label}</span></div>
          ${real(t.resumo) ? `<p class="news-sum">${t.resumo}</p>` : ''}
          <ul class="news-facts">${fatos.map(f => `<li>${f[2]}<span><small>${f[0]}</small><b>${f[1]}</b></span></li>`).join('')}</ul>
          <div class="news-cta">
            <a class="btn" href="${link}">Ver informações ${'→'}</a>
            ${st.k === 'abertas' ? `<a class="btn ghost" target="_blank" rel="noopener" href="${tWa('Olá! Quero me inscrever no ' + t.nome + ' (' + datas + ').')}">Inscrever-se</a>` : ''}
          </div>
        </div>
      </article>`;
    if (slot) slot.replaceWith(sec); else document.querySelector('.hero').after(sec);
  }

  // 3) pop-up
  if (isHome && (modo === 'popup' || modo === 'popup+cartao') && !store.get('pop-visto')) {
    setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'pop-ov';
      d.innerHTML = `<div class="pop-box" role="dialog" aria-label="Próximo torneio">
        <button class="pop-x" aria-label="Fechar">×</button>
        ${t.cartaz ? `<img class="pop-img" src="${t.cartaz}" alt="Cartaz do ${t.nome}">` : `<div class="photo clay r169"><span>Cartaz do torneio</span></div>`}
        <div class="pop-in"><span class="chip ${st.k}"><i></i>${st.label}</span>
          <small class="kick">Próximo torneio · ${datas}</small>
          <h2>${t.nome}</h2><p>${t.resumo}</p>
          <a class="btn" href="${link}">Ver informações →</a></div></div>`;
      document.body.appendChild(d);
      store.set('pop-visto', '1');
      const close = () => { d.classList.add('out'); setTimeout(() => d.remove(), 170); };
      d.addEventListener('click', e => { if (e.target === d || e.target.closest('.pop-x')) close(); });
      // deslizar o dedo (ou girar o scroll) fora do cartaz fecha o pop-up, para a página nunca ficar "travada"
      const solta = e => { if (!e.target.closest('.pop-box')) close(); };
      d.addEventListener('touchmove', solta, { passive: true });
      d.addEventListener('wheel', solta, { passive: true });
      addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
    }, 900);
  }
});
