/* Página de detalhes de um torneio: torneio.html?id=... */
aoCarregarTorneios(() => {
  const box = document.getElementById('torneio');
  if (!box) return;
  const id = new URLSearchParams(location.search).get('id');
  const t = TORNEIOS.find(x => x.id === id);
  if (!t) {
    box.innerHTML = '<section class="sec wrap" style="text-align:center"><h2 class="sec-title">Torneio não encontrado.</h2><p class="note">Veja a lista completa de torneios.</p><div style="margin-top:24px"><a class="btn dark" href="torneios.html">Ver torneios</a></div></section>';
    return;
  }
  document.title = t.nome + ' — Torneios — Prime Court Tênis · Dourados, MS';
  const st = tStatus(t), datas = tDatas(t);
  const fmtPrazo = s => { const d = dt(s); return d.getDate() + ' de ' + MESES[d.getMonth()]; };
  const waInsc = tWa('Olá! Quero me inscrever no ' + t.nome + ' (' + datas + ').');

  let cta;
  if (st.k === 'abertas') cta = `<a class="btn" target="_blank" rel="noopener" href="${waInsc}">Quero me inscrever →</a>${t.prazo ? `<p class="small">Inscrições até ${fmtPrazo(t.prazo)}.</p>` : ''}`;
  else if (st.k === 'encerradas') cta = `<span class="btn off">Inscrições encerradas</span><a class="btn dark" target="_blank" rel="noopener" href="${tWa('Olá! Gostaria de saber sobre a lista de espera do ' + t.nome + '.')}">Perguntar sobre vaga</a>`;
  else if (st.k === 'realizado') cta = `<span class="btn off">Torneio realizado</span><a class="btn dark" href="torneios.html">Ver próximos torneios</a>`;
  else cta = `<span class="btn off">Inscrições em breve</span><a class="btn dark" target="_blank" rel="noopener" href="${tWa('Olá! Quero ser avisado quando abrirem as inscrições do ' + t.nome + '.')}">Avisar-me quando abrir</a>`;

  box.innerHTML = `
  <section class="ph-hero"><div class="wrap">
    <a class="crumb" href="torneios.html">← Torneios</a>
    <span class="chip ${st.k}" style="margin-bottom:14px"><i></i>${st.label}</span>
    <h1>${t.nome}</h1><p>${t.resumo}</p>
  </div></section>
  <section class="sec wrap"><div class="tdet">
    <div class="tdet-main">
      <div class="photo clay r169"><span>Foto: ${t.nome}</span></div>
      <h2>Como funciona</h2>
      <ul class="bul">${t.comoFunciona.map(x => `<li>${x}</li>`).join('')}</ul>
      <h2>Categorias</h2>
      <div class="tags">${t.categorias.map(c => {
        const nome = typeof c === 'string' ? c : c.nome, cheia = typeof c !== 'string' && c.vagas === 'esgotadas';
        return `<span class="${cheia ? 'out' : ''}">${nome}${cheia ? ' <em>Sem vagas</em>' : ''}</span>`;
      }).join('')}</div>
      <h2>Premiação</h2><p class="txt">${t.premiacao}</p>
      <h2>Ficou com dúvida?</h2>
      <form class="duvida" id="duvida">
        <label for="d-nome">Seu nome</label><input id="d-nome" placeholder="Como podemos te chamar?">
        <label for="d-txt">Sua dúvida</label><textarea id="d-txt" rows="4" placeholder="Escreva aqui e envie direto para o organizador."></textarea>
        <button class="btn dark" type="submit">Enviar pelo WhatsApp →</button>
      </form>
    </div>
    <aside class="tdet-side"><div class="info-box">
      <div><b>Data</b>${datas}</div>
      <div><b>Horário</b>${t.horario}</div>
      <div><b>Local</b>${t.local}</div>
      <div><b>Quem pode participar</b>${t.publico}</div>
      <div><b>Valor da inscrição</b>${t.valor}</div>
      <div class="cta">${cta}</div>
    </div></aside>
  </div></section>`;

  document.getElementById('duvida').addEventListener('submit', e => {
    e.preventDefault();
    const n = document.getElementById('d-nome').value.trim(), d = document.getElementById('d-txt').value.trim();
    if (!d) { document.getElementById('d-txt').focus(); return; }
    window.open(tWa('Olá! ' + (n ? 'Sou ' + n + '. ' : '') + 'Tenho uma dúvida sobre o ' + t.nome + ': ' + d), '_blank', 'noopener');
  });
});
