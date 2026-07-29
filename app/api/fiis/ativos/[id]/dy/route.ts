import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  dyMes: z.number(),
  dyValor: z.number().nullable().optional(),
  data: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: ativoId } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { dyMes, dyValor, data } = body.data;
  const dataAlvo = new Date(data ?? new Date().toISOString().slice(0, 10));

  const existente = await prisma.fiiCotacao.findUnique({
    where: { ativoId_data: { ativoId, data: dataAlvo } },
  });

  if (existente) {
    await prisma.fiiCotacao.update({ where: { id: existente.id }, data: { dyMes, dyValor } });
  } else {
    const ultimaCotacao = await prisma.fiiCotacao.findFirst({
      where: { ativoId },
      orderBy: { data: "desc" },
    });

    let preco = ultimaCotacao ? Number(ultimaCotacao.preco) : 0;
    if (!ultimaCotacao) {
      // Sem cotação nenhuma ainda: usa o preço médio dos aportes como fallback,
      // em vez de 0 (que zeraria "preço atual"/"ganho-perda" na posição).
      const aportes = await prisma.fiiAporte.findMany({ where: { ativoId } });
      const qtdeTotal = aportes.reduce((s, a) => s + Number(a.qtdeCotas), 0);
      const valorTotal = aportes.reduce((s, a) => s + Number(a.valorAportado), 0);
      preco = qtdeTotal > 0 ? valorTotal / qtdeTotal : 0;
    }

    await prisma.fiiCotacao.create({
      data: { ativoId, data: dataAlvo, preco, dyMes, dyValor, fonte: "manual" },
    });
  }

  return NextResponse.json({ ok: true });
}
