interface TransacaoParaProjecao {
  data: Date;
  descricao: string;
  valor: unknown;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
}

export interface ParcelaProjetada {
  mes: string; // YYYY-MM
  descricao: string;
  valor: number;
  parcela: number;
  parcelaTotal: number;
}

export function projetarParcelasFuturas(
  transacoes: TransacaoParaProjecao[],
  mesesAFrente = 3
): ParcelaProjetada[] {
  const grupos = new Map<
    string,
    { data: Date; valor: number; descricao: string; parcelaAtual: number; parcelaTotal: number }
  >();

  for (const t of transacoes) {
    if (t.parcelaAtual == null || t.parcelaTotal == null) continue;
    const chave = `${t.descricao}|${Number(t.valor)}|${t.parcelaTotal}`;
    const existente = grupos.get(chave);
    if (!existente || t.parcelaAtual > existente.parcelaAtual) {
      grupos.set(chave, {
        data: t.data,
        valor: Number(t.valor),
        descricao: t.descricao,
        parcelaAtual: t.parcelaAtual,
        parcelaTotal: t.parcelaTotal,
      });
    }
  }

  const projecoes: ParcelaProjetada[] = [];
  for (const grupo of grupos.values()) {
    for (let i = grupo.parcelaAtual + 1; i <= grupo.parcelaTotal; i++) {
      const offsetMeses = i - grupo.parcelaAtual;
      if (offsetMeses > mesesAFrente) break;
      const dataProjetada = new Date(grupo.data);
      dataProjetada.setMonth(dataProjetada.getMonth() + offsetMeses);
      projecoes.push({
        mes: dataProjetada.toISOString().slice(0, 7),
        descricao: grupo.descricao,
        valor: grupo.valor,
        parcela: i,
        parcelaTotal: grupo.parcelaTotal,
      });
    }
  }

  return projecoes.sort((a, b) => a.mes.localeCompare(b.mes));
}
