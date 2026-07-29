interface Aporte {
  qtdeCotas: unknown;
  valorAportado: unknown;
}

interface Cotacao {
  data: Date;
  preco: unknown;
  dyMes: unknown;
}

interface AtivoComDados {
  id: string;
  ticker: string;
  nome: string | null;
  segmento: string | null;
  aportes: Aporte[];
  cotacoes: Cotacao[];
}

export function serializeFiiPosicao(ativo: AtivoComDados) {
  const qtdeCotas = ativo.aportes.reduce((sum, a) => sum + Number(a.qtdeCotas), 0);
  const valorTotalAportado = ativo.aportes.reduce((sum, a) => sum + Number(a.valorAportado), 0);
  const precoMedio = qtdeCotas > 0 ? valorTotalAportado / qtdeCotas : 0;

  const ultimaCotacao = ativo.cotacoes[0];
  const precoAtual = ultimaCotacao ? Number(ultimaCotacao.preco) : precoMedio;
  const dyMes = ultimaCotacao?.dyMes != null ? Number(ultimaCotacao.dyMes) : null;

  const valorAtual = precoAtual * qtdeCotas;
  const ganhoPerda = (precoAtual - precoMedio) * qtdeCotas;

  return {
    id: ativo.id,
    ticker: ativo.ticker,
    nome: ativo.nome,
    segmento: ativo.segmento,
    qtdeCotas,
    precoMedio,
    precoAtual,
    valorAtual,
    ganhoPerda,
    dyMes,
    dataUltimaCotacao: ultimaCotacao ? ultimaCotacao.data.toISOString().slice(0, 10) : null,
  };
}
