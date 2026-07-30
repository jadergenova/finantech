import { prisma } from "@/lib/prisma";
import { serializeFgtsLancamentos } from "@/lib/fgts";
import { FgtsClient } from "./client";

export default async function FgtsPage() {
  const lancamentos = await prisma.fgtsLancamento.findMany({ orderBy: { mes: "asc" } });
  return <FgtsClient initialLancamentos={serializeFgtsLancamentos(lancamentos)} />;
}
