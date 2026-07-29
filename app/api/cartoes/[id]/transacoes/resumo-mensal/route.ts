import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: cartaoId } = await params;

  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 5);
  inicio.setDate(1);

  const transacoes = await prisma.cartaoTransacao.findMany({
    where: { cartaoId, data: { gte: inicio } },
  });

  const porMes = new Map<string, number>();
  for (const t of transacoes) {
    const valor = Number(t.valor);
    if (valor <= 0) continue;
    const mes = t.data.toISOString().slice(0, 7);
    porMes.set(mes, (porMes.get(mes) ?? 0) + valor);
  }

  const resultado = Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));

  return NextResponse.json(resultado);
}
