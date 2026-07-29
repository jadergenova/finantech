export { mesParaData, mesAnterior } from "./mes";

interface LancamentoRaw {
  id: string;
  valor: unknown;
  pago: boolean;
}

export function serializeContaFixaComMes(
  conta: { id: string; nome: string },
  lancamentoMes: LancamentoRaw | null,
  lancamentoMesAnterior: LancamentoRaw | null
) {
  return {
    id: conta.id,
    nome: conta.nome,
    lancamentoId: lancamentoMes?.id ?? null,
    valor: lancamentoMes ? Number(lancamentoMes.valor) : null,
    pago: lancamentoMes?.pago ?? false,
    valorSugerido: lancamentoMes
      ? Number(lancamentoMes.valor)
      : lancamentoMesAnterior
        ? Number(lancamentoMesAnterior.valor)
        : null,
  };
}
