import { diasUteisNoMes } from "@/lib/business-days";

interface SaldoDiario {
  data: Date;
  saldo: unknown;
}

interface ProdutoComSaldos {
  id: string;
  nome: string;
  indexador: string | null;
  instituicao: { id: string; nome: string };
  saldos: SaldoDiario[];
}

export function serializeRendaFixaProduto(produto: ProdutoComSaldos) {
  const [ultimo, penultimo] = produto.saldos;
  const saldoAtual = ultimo ? Number(ultimo.saldo) : 0;
  const saldoAnterior = penultimo ? Number(penultimo.saldo) : null;

  let rendimentoDia: number | null = null;
  let rendimentoMesPercentual: number | null = null;

  if (saldoAnterior !== null && saldoAnterior !== 0) {
    rendimentoDia = saldoAtual - saldoAnterior;
    const diasUteis = diasUteisNoMes(new Date());
    rendimentoMesPercentual = ((rendimentoDia * diasUteis) / saldoAnterior) * 100;
  }

  return {
    id: produto.id,
    nome: produto.nome,
    indexador: produto.indexador,
    instituicao: { id: produto.instituicao.id, nome: produto.instituicao.nome },
    saldoAtual,
    dataUltimoSaldo: ultimo ? ultimo.data.toISOString().slice(0, 10) : null,
    rendimentoDia,
    rendimentoMesPercentual,
  };
}
