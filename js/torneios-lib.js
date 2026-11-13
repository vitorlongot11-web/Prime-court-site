/* Funções dos torneios (não precisa mexer). Os dados ficam em torneios-data.js */
/* ----- funções usadas pelo site (não precisa mexer) ----- */
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const dt = s => new Date(s + 'T12:00:00');
function tDatas(t) {
  const a = dt(t.inicio), b = dt(t.fim), p = n => String(n).padStart(2, '0');
  if (t.inicio === t.fim) return p(a.getDate()) + ' ' + MESES[a.getMonth()];
  return a.getMonth() === b.getMonth()
    ? p(a.getDate()) + '–' + p(b.getDate()) + ' ' + MESES[b.getMonth()]
    : p(a.getDate()) + ' ' + MESES[a.getMonth()] + ' – ' + p(b.getDate()) + ' ' + MESES[b.getMonth()];
}
const MESES_FULL = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function tDatasLongas(t) {
  const a = dt(t.inicio), b = dt(t.fim), p = n => String(n).padStart(2, '0');
  if (t.inicio === t.fim) return p(a.getDate()) + ' de ' + MESES_FULL[a.getMonth()];
  return a.getMonth() === b.getMonth()
    ? p(a.getDate()) + '–' + p(b.getDate()) + ' de ' + MESES_FULL[b.getMonth()]
    : p(a.getDate()) + ' de ' + MESES_FULL[a.getMonth()] + ' – ' + p(b.getDate()) + ' de ' + MESES_FULL[b.getMonth()];
}
function tRealizado(t) { return new Date(t.fim + 'T23:59:59') < new Date(); }
function tStatus(t) {
  if (tRealizado(t)) return { k: 'realizado', label: 'Realizado' };
  if (t.inscricoes === 'abertas') return { k: 'abertas', label: 'Inscrições abertas' };
  if (t.inscricoes === 'encerradas') return { k: 'encerradas', label: 'Inscrições encerradas' };
  return { k: 'embreve', label: 'Inscrições em breve' };
}
function tProximo() {
  return TORNEIOS.filter(t => !tRealizado(t)).sort((a, b) => a.inicio.localeCompare(b.inicio))[0];
}
function tWa(texto) { return 'https://wa.me/' + WHATSAPP_ORGANIZADOR + '?text=' + encodeURIComponent(texto); }

/* ============================================================
   PLANILHA DO GOOGLE — fonte dos torneios (atualiza sozinho)
   Se a planilha não carregar, o site usa o torneios-data.js.
   ============================================================ */
const PLANILHA_ID = '1yYykhaBg7eup2jQhp_LoUdOQS8MCZqAe7W9XufsM-FY';

const _norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
function _csv(txt) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function _dataIso(s) {
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : '';
}
async function _aba(nome) {
  const r = await fetch('https://docs.google.com/spreadsheets/d/' + PLANILHA_ID + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(nome), { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const rows = _csv(await r.text()); const head = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()]))).filter(o => Object.values(o).some(Boolean));
}
async function _carregarPlanilha() {
  if (!PLANILHA_ID) return;
  try {
    const [ts, cs] = await Promise.all([_aba('Torneios'), _aba('Classes')]);
    const locais = TORNEIOS.slice(); // os cartazes ficam no torneios-data.js (campo "cartaz"), não na planilha
    const lista = ts.filter(t => t.nome && _dataIso(t.inicio)).map(t => {
      const st = _norm(t.inscricoes);
      const id = t.id || _norm(t.nome).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      t.cartaz = (locais.find(l => l.id === id) || {}).cartaz;
      return {
        id,
        nome: t.nome,
        inicio: _dataIso(t.inicio), fim: _dataIso(t.fim) || _dataIso(t.inicio),
        resumo: t.resumo, cartaz: t.cartaz, prazo: _dataIso(t.prazo), horario: t.horario, local: t.local, valor: t.valor, publico: t.publico,
        inscricoes: st.startsWith('aberta') ? 'abertas' : st.startsWith('encerrada') ? 'encerradas' : 'embreve',
        comoFunciona: t.comoFunciona ? t.comoFunciona.split('|').map(x => x.trim()).filter(Boolean) : [],
        categorias: cs.filter(c => c.classe && (_norm(c.torneio) === _norm(t.nome) || _norm(c.torneio) === _norm(t.id)))
          .map(c => ({ nome: c.classe, vagas: /^(sem|esgot)/.test(_norm(c.vagas)) ? 'esgotadas' : 'abertas' })),
        premiacao: t.premiacao,
      };
    });
    if (lista.length) { TORNEIOS.length = 0; TORNEIOS.push(...lista); }
  } catch (e) { console.warn('Planilha indisponível; usando torneios-data.js.', e); }
}
// espera a planilha (no máximo 4 s) antes de mostrar os torneios
const TORNEIOS_PRONTO = Promise.race([_carregarPlanilha(), new Promise(r => setTimeout(r, 4000))]);
function aoCarregarTorneios(fn) { TORNEIOS_PRONTO.then(fn); }
