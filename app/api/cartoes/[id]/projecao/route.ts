import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projetarParcelasFuturas } from "@/lib/cartao-projecao";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: cartaoId } = await params;
  const meses = Number(req.nextUrl.searchParams.get("meses") ?? "3");

  const transacoes = await prisma.cartaoTransacao.findMany({
    where: { cartaoId, parcelaTotal: { not: null } },
  });

  const projecoes = projetarParcelasFuturas(transacoes, meses);
  return NextResponse.json(projecoes);
}
