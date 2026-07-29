import { prisma } from "@/lib/prisma";
import { serializeRendaFixaProduto } from "@/lib/renda-fixa";
import { RendaFixaClient } from "./client";

export default async function RendaFixaPage() {
  const [produtos, instituicoes] = await Promise.all([
    prisma.rendaFixaProduto.findMany({
      where: { isActive: true },
      include: { instituicao: true, saldos: { orderBy: { data: "desc" }, take: 2 } },
      orderBy: { nome: "asc" },
    }),
    prisma.instituicao.findMany({ where: { isActive: true }, orderBy: { nome: "asc" } }),
  ]);

  return <RendaFixaClient initialProdutos={produtos.map(serializeRendaFixaProduto)} instituicoes={instituicoes} />;
}
