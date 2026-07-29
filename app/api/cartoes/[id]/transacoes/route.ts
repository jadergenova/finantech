import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: cartaoId } = await params;
  const mes = req.nextUrl.searchParams.get("mes");

  const where: Prisma.CartaoTransacaoWhereInput = { cartaoId };
  if (mes) {
    const [ano, mesNum] = mes.split("-").map(Number);
    where.data = { gte: new Date(ano, mesNum - 1, 1), lt: new Date(ano, mesNum, 1) };
  }

  const transacoes = await prisma.cartaoTransacao.findMany({ where, orderBy: { data: "desc" } });

  return NextResponse.json(
    transacoes.map((t) => ({
      ...t,
      valor: Number(t.valor),
      data: t.data.toISOString().slice(0, 10),
    }))
  );
}
