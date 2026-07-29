import { prisma } from "@/lib/prisma";
import { serializeLancamento } from "@/lib/conta-corrente";
import { ContaCorrenteClient } from "./client";

export default async function ContaCorrentePage() {
  const lancamentos = await prisma.contaCorrenteLancamento.findMany({ orderBy: { data: "desc" } });
  return <ContaCorrenteClient initialLancamentos={lancamentos.map(serializeLancamento)} />;
}
