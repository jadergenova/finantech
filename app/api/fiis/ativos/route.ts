import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeFiiPosicao } from "@/lib/fiis";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ativos = await prisma.fiiAtivo.findMany({
    where: { isActive: true },
    include: {
      aportes: true,
      cotacoes: { orderBy: { data: "desc" }, take: 1 },
    },
    orderBy: { ticker: "asc" },
  });

  return NextResponse.json(ativos.map(serializeFiiPosicao));
}
