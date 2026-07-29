import { prisma } from "@/lib/prisma";
import { serializeFiiPosicao } from "@/lib/fiis";
import { FiisClient } from "./client";

export default async function FiisPage() {
  const ativos = await prisma.fiiAtivo.findMany({
    where: { isActive: true },
    include: {
      aportes: true,
      cotacoes: { orderBy: { data: "desc" }, take: 1 },
    },
    orderBy: { ticker: "asc" },
  });

  return <FiisClient initialPosicoes={ativos.map(serializeFiiPosicao)} />;
}
