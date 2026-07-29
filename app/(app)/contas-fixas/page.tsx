import { prisma } from "@/lib/prisma";
import { mesParaData, mesAnterior, serializeContaFixaComMes } from "@/lib/contas-fixas";
import { ContasFixasClient } from "./client";

function mesAtualStr() {
  return new Date().toISOString().slice(0, 7);
}

export default async function ContasFixasPage() {
  const mes = mesAtualStr();
  const mesAnteriorStr = mesAnterior(mes);
  const mesData = mesParaData(mes);
  const mesAnteriorData = mesParaData(mesAnteriorStr);

  const contas = await prisma.contaFixa.findMany({
    where: { isActive: true },
    include: { lancamentos: { where: { mes: { in: [mesData, mesAnteriorData] } } } },
    orderBy: { nome: "asc" },
  });

  const serializados = contas.map((conta) => {
    const lancamentoMes = conta.lancamentos.find((l) => l.mes.getTime() === mesData.getTime()) ?? null;
    const lancamentoAnterior = conta.lancamentos.find((l) => l.mes.getTime() === mesAnteriorData.getTime()) ?? null;
    return serializeContaFixaComMes(conta, lancamentoMes, lancamentoAnterior);
  });

  return <ContasFixasClient initialContas={serializados} mesInicial={mes} />;
}
