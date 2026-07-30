interface LancamentoRaw {
  id: string;
  mes: Date;
  deposito: unknown;
  saldo: unknown;
}

export function serializeFgtsLancamentos(lancamentos: LancamentoRaw[]) {
  const ordenados = [...lancamentos].sort((a, b) => a.mes.getTime() - b.mes.getTime());
  let saldoAnterior: number | null = null;

  const resultado = ordenados.map((l) => {
    const saldo = Number(l.saldo);
    const deposito = Number(l.deposito);
    const juros = saldoAnterior !== null ? saldo - saldoAnterior - deposito : null;
    saldoAnterior = saldo;

    return {
      id: l.id,
      mes: l.mes.toISOString().slice(0, 7),
      deposito,
      saldo,
      juros,
    };
  });

  return resultado.reverse();
}
