import { diasUteisNoMes, diasUteisDecorridosNoMes } from "@/lib/business-days";

interface ProdutoComRendimento {
  rendimentoPorDiaUtil: number | null;
}

export interface ProjecaoMensalRendaFixa {
  mes: string;
  diasUteisTotal: number;
  diasUteisDecorridos: number;
  diasUteisRestantes: number;
  valorMedioRendimentoDiario: number;
  valorEstimadoMes: number;
  valorAteDiaAtual: number;
  valorPrevistoRestante: number;
}

export function calcularProjecaoMensalRendaFixa(produtos: ProdutoComRendimento[]): ProjecaoMensalRendaFixa {
  const hoje = new Date();
  const diasUteisTotal = diasUteisNoMes(hoje);
  const diasUteisDecorridos = diasUteisDecorridosNoMes(hoje);
  const diasUteisRestantes = diasUteisTotal - diasUteisDecorridos;

  const valorMedioRendimentoDiario = produtos.reduce(
    (soma, p) => soma + (p.rendimentoPorDiaUtil ?? 0),
    0
  );

  const valorEstimadoMes = valorMedioRendimentoDiario * diasUteisTotal;
  const valorAteDiaAtual = valorMedioRendimentoDiario * diasUteisDecorridos;
  const valorPrevistoRestante = valorMedioRendimentoDiario * diasUteisRestantes;

  return {
    mes: hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    diasUteisTotal,
    diasUteisDecorridos,
    diasUteisRestantes,
    valorMedioRendimentoDiario,
    valorEstimadoMes,
    valorAteDiaAtual,
    valorPrevistoRestante,
  };
}
