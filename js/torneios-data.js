/* ============================================================
   TORNEIOS — edite aqui. É o único arquivo que muda quando
   você abre ou encerra inscrições, ou adiciona um torneio.
   ------------------------------------------------------------
   inscricoes: 'abertas' | 'encerradas' | 'embreve'   (torneio todo)
   categorias: { nome: 'Classe X', vagas: 'abertas' | 'esgotadas' }
               (ou só o texto 'Classe X', que conta como com vaga)
   Textos entre [colchetes] são exemplos: troque pelos reais.
   ============================================================ */

// WhatsApp do organizador (DDI+DDD+número). Um só para todos os torneios.
const WHATSAPP_ORGANIZADOR = '5567999999999';

// Como o anúncio aparece no site:
// 'popup+cartao' | 'faixa+cartao' | 'cartao' | 'popup'
const ANUNCIO_MODO = 'popup+cartao';

const TORNEIOS = [
  {
    id: 'dourados-future',
    nome: 'Dourados Future',
    inicio: '2026-10-03', fim: '2026-10-03',
    resumo: 'Para crianças e adolescentes.',
    inscricoes: 'encerradas',
    prazo: '', horario: '[horário a confirmar]', local: 'Prime Court · Dourados, MS',
    valor: '[valor a confirmar]',
    publico: 'Crianças e adolescentes',
    comoFunciona: ['[Descreva o formato do torneio]'],
    categorias: ['[categorias a confirmar]'],
    premiacao: '[premiação a confirmar]',
  },
  {
    id: 'torneio-juridico',
    nome: 'Torneio Jurídico',
    cartaz: 'assets/cartaz-torneio-juridico.webp',    inicio: '2026-11-07', fim: '2026-11-08',
    resumo: 'Torneio para profissionais do direito: advogados, juízes, promotores e estudantes.',
    inscricoes: 'abertas',
    prazo: '2026-11-06', horario: '[horário a confirmar]', local: 'Prime Court · Dourados, MS',
    valor: '[valor a confirmar]',
    publico: 'Profissionais do direito',
    comoFunciona: [
      '[Exemplo] Jogos de simples e duplas ao longo do fim de semana.',
      '[Exemplo] Chaveamento sorteado e divulgado antes do início.',
      '[Exemplo] Cada jogador garante pelo menos 2 partidas.',
    ],
    // vagas: 'abertas' (tem vaga) ou 'esgotadas' (sem vaga)
    categorias: [
      { nome: '[Classe A]', vagas: 'esgotadas' },
      { nome: '[Classe B]', vagas: 'esgotadas' },
      { nome: '[Classe iniciante]', vagas: 'abertas' },
    ],
    premiacao: '[R$1,000 e trofeu para Campeão e Finalista]',
  },
  {
    id: 'finals-ranking-prime',
    nome: 'Finals Ranking Prime',
    inicio: '2026-11-13', fim: '2026-11-14',
    resumo: 'A grande final do ranking da Prime Court.',
    inscricoes: 'embreve',
    prazo: '', horario: '[horário a confirmar]', local: 'Prime Court · Dourados, MS',
    valor: '[valor a confirmar]',
    publico: 'Jogadores do ranking Prime',
    comoFunciona: ['[Descreva como os finalistas são definidos]'],
    categorias: ['[categorias a confirmar]'],
    premiacao: '[premiação a confirmar]',
  },
  {
    id: 'ftms-finals',
    nome: 'FTMS Finals',
    inicio: '2026-11-27', fim: '2026-11-29',
    resumo: 'Finais da Federação de Tênis de MS.',
    inscricoes: 'embreve',
    prazo: '', horario: '[horário a confirmar]', local: '[local a confirmar]',
    valor: '[valor a confirmar]',
    publico: 'Atletas federados',
    comoFunciona: ['[Descreva o formato]'],
    categorias: ['[categorias a confirmar]'],
    premiacao: '[premiação a confirmar]',
  },
  {
    id: 'dourados-cup',
    nome: 'Dourados Cup',
    inicio: '2026-12-03', fim: '2026-12-05',
    resumo: 'Beneficente: inscrições e doações viram cestas básicas.',
    inscricoes: 'embreve',
    prazo: '', horario: '[horário a confirmar]', local: 'Prime Court · Dourados, MS',
    valor: '[valor a confirmar]',
    publico: 'Aberto a todos',
    comoFunciona: ['[Descreva o formato]', 'Inscrições e doações são convertidas em cestas básicas.'],
    categorias: ['[categorias a confirmar]'],
    premiacao: '[premiação a confirmar]',
  },
];
