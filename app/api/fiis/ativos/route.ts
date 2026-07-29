import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeFiiPosicao } from "@/lib/fiis";

const createSchema = z.object({
  ticker: z.string().min(1),
  segmento: z.string().optional(),
});

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

/**
 * Cria (ou reativa) um ativo só para acompanhar a cotação, sem nenhum aporte ainda
 * — útil pra já ir monitorando o preço de um FII que você pretende comprar.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { ticker, segmento } = body.data;
  const tickerUpper = ticker.toUpperCase();

  const ativo = await prisma.fiiAtivo.upsert({
    where: { ticker: tickerUpper },
    update: { isActive: true, ...(segmento ? { segmento } : {}) },
    create: { ticker: tickerUpper, segmento },
  });

  const completo = await prisma.fiiAtivo.findUniqueOrThrow({
    where: { id: ativo.id },
    include: { aportes: true, cotacoes: { orderBy: { data: "desc" }, take: 1 } },
  });

  return NextResponse.json(serializeFiiPosicao(completo), { status: 201 });
}
