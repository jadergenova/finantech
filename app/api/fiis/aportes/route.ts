import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeFiiPosicao } from "@/lib/fiis";

const createSchema = z.object({
  ticker: z.string().min(1),
  segmento: z.string().optional(),
  dataAporte: z.string().min(1),
  qtdeCotas: z.number().positive(),
  precoCompra: z.number().positive(),
  valorAportado: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { ticker, segmento, dataAporte, qtdeCotas, precoCompra, valorAportado } = body.data;
  const tickerUpper = ticker.toUpperCase();

  const ativo = await prisma.fiiAtivo.upsert({
    where: { ticker: tickerUpper },
    update: segmento ? { segmento } : {},
    create: { ticker: tickerUpper, segmento },
  });

  await prisma.fiiAporte.create({
    data: {
      ativoId: ativo.id,
      dataAporte: new Date(dataAporte),
      qtdeCotas,
      precoCompra,
      valorAportado,
    },
  });

  const atualizado = await prisma.fiiAtivo.findUniqueOrThrow({
    where: { id: ativo.id },
    include: { aportes: true, cotacoes: { orderBy: { data: "desc" }, take: 1 } },
  });

  return NextResponse.json(serializeFiiPosicao(atualizado), { status: 201 });
}
