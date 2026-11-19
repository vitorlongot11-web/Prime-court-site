/* "Agendar aula": em vez de ir direto ao WhatsApp, abre um formulário curto.
   As respostas viram a mensagem pronta no WhatsApp da secretaria (wa() e WHATSAPP vêm de js/main.js).
   Abre a partir de: botões "Agendar aula / Agende sua aula / Marcar aula…" (qualquer [data-wa] com esse texto)
   e botões com data-agendar (cartões de planos: data-pub, data-freq, data-modo). */
(() => {
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'css/agendar.css'; document.head.appendChild(css);

  const GRUPOS = [['adulto', 'Adulto'], ['adolescente', 'Adolescente'], ['crianca', 'Criança']];
  const EXPERIENCIA = [['Nunca fiz', 'Nunca fiz aula'], ['Já fiz antes', 'Já fiz antes'], ['Jogo atualmente', 'Jogo atualmente']];
  const PLANOS = [['nao', 'Ainda não sei'], ['1', '1 vez por semana'], ['2', '2 vezes por semana'], ['3', '3 vezes por semana'], ['5', '5 vezes por semana (juvenil avançado)']];
  const NOME_GRUPO = { adulto: 'Adulto', adolescente: 'Adolescente', crianca: 'Criança' };

  let box = null, form = null, ultimoGatilho = null, aberto = false, grupoManual = false;

  const chips = (nome, lista, obrigatorio) => lista.map(([v, t], i) =>
    `<label class="ag-chip"><input type="radio" name="${nome}" value="${v}"${obrigatorio && i === 0 ? ' required' : ''}><span>${t}</span></label>`).join('');

  function monta() {
    box = document.createElement('div');
    box.className = 'ag'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = `
      <div class="ag-box" role="dialog" aria-modal="true" aria-labelledby="ag-t">
        <button type="button" class="ag-x" aria-label="Fechar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <h2 id="ag-t">Agende sua aula experimental</h2>
        <p class="ag-sub">É grátis. Conte um pouco sobre você e a secretaria já responde no WhatsApp com tudo em mãos.</p>
        <form novalidate>
          <div class="ag-f"><label for="ag-nome">Seu nome</label><input id="ag-nome" name="nome" type="text" autocomplete="name" maxlength="80" required><p class="ag-err" data-e="nome"></p></div>
          <fieldset class="ag-f"><legend>Quem vai ter aula?</legend><div class="ag-chips">${chips('grupo', GRUPOS, true)}</div><p class="ag-err" data-e="grupo"></p></fieldset>
          <div class="ag-row">
            <div class="ag-f"><label for="ag-idade">Idade de quem vai ter aula</label><input id="ag-idade" name="idade" type="number" inputmode="numeric" min="3" max="99" required><p class="ag-err" data-e="idade"></p></div>
            <div class="ag-f ag-aluno" hidden><label for="ag-aluno">Nome do aluno <span>(opcional)</span></label><input id="ag-aluno" name="aluno" type="text" maxlength="80"></div>
          </div>
          <fieldset class="ag-f"><legend>Já fez aula de tênis?</legend><div class="ag-chips">${chips('exp', EXPERIENCIA, true)}</div><p class="ag-err" data-e="exp"></p></fieldset>
          <div class="ag-f"><label for="ag-plano">Já pensou em algum plano?</label><select id="ag-plano" name="plano">${PLANOS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
          <div class="ag-f"><label for="ag-obs">Quer contar mais alguma coisa? <span>(opcional)</span></label><textarea id="ag-obs" name="obs" rows="2" maxlength="400"></textarea></div>
          <button type="submit" class="btn ag-enviar"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.3 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>Enviar pelo WhatsApp</button>
          <p class="ag-nota">Ao enviar, abrimos o WhatsApp com a sua mensagem pronta.</p>
        </form>
      </div>`;
    document.body.appendChild(box);
    form = box.querySelector('form');

    box.addEventListener('click', e => { if (e.target === box || e.target.closest('.ag-x')) fecha(); });
    form.addEventListener('submit', envia);
    form.addEventListener('input', e => {
      const e2 = box.querySelector(`[data-e="${e.target.name}"]`); if (e2) e2.textContent = '';
      if (e.target.name === 'grupo') { grupoManual = true; atualizaAluno(); }
      if (e.target.name === 'idade' && !grupoManual) sugereGrupo();
    });
    addEventListener('keydown', e => {
      if (!aberto) return;
      if (e.key === 'Escape') fecha();
      else if (e.key === 'Tab') {                         // mantém o foco dentro da janela
        const f = [...box.querySelectorAll('input:not([hidden]),select,textarea,button')].filter(x => x.offsetParent !== null && !x.disabled);
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
  }

  const radio = (nome, v) => form.querySelector(`input[name="${nome}"][value="${v}"]`);
  const marcado = nome => { const r = form.querySelector(`input[name="${nome}"]:checked`); return r ? r.value : ''; };
  function atualizaAluno() {
    const g = marcado('grupo'), campo = form.querySelector('.ag-aluno');
    campo.hidden = !(g === 'adolescente' || g === 'crianca');
  }
  function sugereGrupo() {
    const n = parseInt(form.idade.value, 10);
    if (!n) return;
    const g = n < 13 ? 'crianca' : n < 18 ? 'adolescente' : 'adulto';
    radio('grupo', g).checked = true; atualizaAluno();
  }

  function abre(gatilho) {
    if (!box) monta();
    ultimoGatilho = gatilho || document.activeElement;
    // pré-preenche quando vem de um cartão de plano
    const d = (gatilho && gatilho.dataset) || {};
    if (d.freq) form.plano.value = d.freq;
    if (d.pub) {
      const g = /^Infantil/.test(d.pub) ? 'crianca' : /^Juvenil/.test(d.pub) ? 'adolescente' : 'adulto';
      if (!marcado('grupo')) { radio('grupo', g).checked = true; grupoManual = false; atualizaAluno(); }
    }
    form.dataset.modo = d.modo || ''; form.dataset.pub = d.pub || '';
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; aberto = true;
    setTimeout(() => form.nome.focus({ preventScroll: true }), 60);
  }
  function fecha() {
    if (!aberto) return;
    aberto = false; box.classList.remove('open'); box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (ultimoGatilho && ultimoGatilho.focus) ultimoGatilho.focus({ preventScroll: true });
  }

  function erro(campo, texto) { const p = box.querySelector(`[data-e="${campo}"]`); if (p) p.textContent = texto; return false; }
  function valida() {
    let ok = true, primeiro = null;
    const marca = (campo, texto, el) => { erro(campo, texto); ok = false; if (!primeiro) primeiro = el; };
    if (!form.nome.value.trim()) marca('nome', 'Escreva o seu nome.', form.nome);
    if (!marcado('grupo')) marca('grupo', 'Escolha quem vai ter aula.', radio('grupo', 'adulto'));
    const idade = parseInt(form.idade.value, 10);
    if (!idade || idade < 3 || idade > 99) marca('idade', 'Informe a idade, de 3 a 99 anos.', form.idade);
    if (!marcado('exp')) marca('exp', 'Conte se você já fez aula de tênis.', radio('exp', 'Nunca fiz'));
    if (primeiro) primeiro.focus();
    return ok;
  }

  function mensagem() {
    const g = marcado('grupo'), idade = parseInt(form.idade.value, 10), aluno = form.aluno.value.trim();
    const pl = form.plano.value, modo = form.dataset.modo, pub = form.dataset.pub;
    const plano = pl === 'nao' ? 'Ainda não sei'
      : `${pl} ${pl === '1' ? 'vez' : 'vezes'} por semana` + (pub ? ` (${pub}${modo ? ', pagamento ' + modo.toLowerCase() : ''})` : '');
    const linhas = [
      'Olá! Quero agendar uma aula experimental gratuita na Prime Court.',
      '',
      `*Nome:* ${form.nome.value.trim()}`,
      `*Aula para:* ${NOME_GRUPO[g]}, ${idade} ${idade === 1 ? 'ano' : 'anos'}${aluno ? ' (aluno: ' + aluno + ')' : ''}`,
      `*Já fez aula de tênis:* ${marcado('exp')}`,
      `*Plano em mente:* ${plano}`,
    ];
    const obs = form.obs.value.trim();
    if (obs) linhas.push(`*Observações:* ${obs}`);
    return linhas.join('\n');
  }

  function envia(e) {
    e.preventDefault();
    if (!valida()) return;
    window.open(wa(WHATSAPP, mensagem()), '_blank', 'noopener');
    form.reset(); grupoManual = false; atualizaAluno();
    fecha();
  }

  // qualquer botão "Agendar aula…" abre o formulário (o link continua valendo se o script falhar)
  const querAgendar = a => a.matches('[data-agendar]') || (a.matches('[data-wa]') && /agend|marcar aula/i.test(a.textContent));
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || !querAgendar(a)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); e.stopPropagation();
    const ov = document.getElementById('ov');              // se o menu lateral estiver aberto, fecha antes
    if (ov && ov.classList.contains('open')) { const c = ov.querySelector('[data-close]'); if (c) c.click(); }
    abre(a);
  }, true);
})();
