interface LancamentoRaw {
  id: string;
  data: Date;
  descricao: string;
  valor: unknown;
  ehReserva: boolean;
}

export function serializeLancamento(lancamento: LancamentoRaw) {
  return {
    id: lancamento.id,
    data: lancamento.data.toISOString().slice(0, 10),
    descricao: lancamento.descricao,
    valor: Number(lancamento.valor),
    ehReserva: lancamento.ehReserva,
  };
}
