interface SaldoDiarioRaw {
  produtoId: string;
  data: Date;
  saldo: unknown;
}

interface AporteRaw {
  ativoId: string;
  dataAporte: Date;
  qtdeCotas: unknown;
  valorAportado: unknown;
}

interface CotacaoRaw {
  ativoId: string;
  data: Date;
  preco: unknown;
}

export interface PontoEvolucao {
  data: string;
  rendaFixa: number;
  patrimonioTotal: number;
}

export function calcularEvolucaoPatrimonio(
  saldosRf: SaldoDiarioRaw[],
  aportesFii: AporteRaw[],
  cotacoesFii: CotacaoRaw[]
): PontoEvolucao[] {
  const datasRf = Array.from(new Set(saldosRf.map((s) => s.data.toISOString().slice(0, 10)))).sort();
  const saldosOrdenados = [...saldosRf].sort((a, b) => a.data.getTime() - b.data.getTime());

  const saldoPorProduto = new Map<string, number>();
  const rfPorData = new Map<string, number>();
  let idx = 0;
  for (const dataStr of datasRf) {
    while (idx < saldosOrdenados.length && saldosOrdenados[idx].data.toISOString().slice(0, 10) === dataStr) {
      saldoPorProduto.set(saldosOrdenados[idx].produtoId, Number(saldosOrdenados[idx].saldo));
      idx++;
    }
    rfPorData.set(dataStr, Array.from(saldoPorProduto.values()).reduce((s, v) => s + v, 0));
  }

  const ativosIds = Array.from(new Set(aportesFii.map((a) => a.ativoId)));

  const precoMedioPorAtivo = new Map<string, number>();
  const aportesPorAtivo = new Map<string, { data: string; qtde: number }[]>();
  for (const ativoId of ativosIds) {
    const doAtivo = aportesFii.filter((a) => a.ativoId === ativoId);
    const qtdeTotal = doAtivo.reduce((s, a) => s + Number(a.qtdeCotas), 0);
    const valorTotal = doAtivo.reduce((s, a) => s + Number(a.valorAportado), 0);
    precoMedioPorAtivo.set(ativoId, qtdeTotal > 0 ? valorTotal / qtdeTotal : 0);
    aportesPorAtivo.set(
      ativoId,
      doAtivo
        .map((a) => ({ data: a.dataAporte.toISOString().slice(0, 10), qtde: Number(a.qtdeCotas) }))
        .sort((a, b) => a.data.localeCompare(b.data))
    );
  }

  const cotacoesPorAtivo = new Map<string, { data: string; preco: number }[]>();
  for (const c of cotacoesFii) {
    const lista = cotacoesPorAtivo.get(c.ativoId) ?? [];
    lista.push({ data: c.data.toISOString().slice(0, 10), preco: Number(c.preco) });
    cotacoesPorAtivo.set(c.ativoId, lista);
  }
  for (const lista of cotacoesPorAtivo.values()) lista.sort((a, b) => a.data.localeCompare(b.data));

  function cotasAteData(ativoId: string, data: string): number {
    return (aportesPorAtivo.get(ativoId) ?? []).filter((a) => a.data <= data).reduce((s, a) => s + a.qtde, 0);
  }

  function precoAteData(ativoId: string, data: string): number {
    const anteriores = (cotacoesPorAtivo.get(ativoId) ?? []).filter((c) => c.data <= data);
    if (anteriores.length > 0) return anteriores[anteriores.length - 1].preco;
    return precoMedioPorAtivo.get(ativoId) ?? 0;
  }

  const datasFii = new Set<string>();
  for (const lista of cotacoesPorAtivo.values()) for (const c of lista) datasFii.add(c.data);

  const todasDatas = Array.from(new Set([...datasRf, ...datasFii])).sort();

  let ultimoRf = 0;
  const pontos: PontoEvolucao[] = [];
  for (const data of todasDatas) {
    if (rfPorData.has(data)) ultimoRf = rfPorData.get(data)!;
    const valorFii = ativosIds.reduce((sum, ativoId) => sum + cotasAteData(ativoId, data) * precoAteData(ativoId, data), 0);
    pontos.push({ data, rendaFixa: ultimoRf, patrimonioTotal: ultimoRf + valorFii });
  }

  return pontos;
}
