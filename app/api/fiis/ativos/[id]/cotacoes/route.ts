import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cotacoes = await prisma.fiiCotacao.findMany({ where: { ativoId: id }, orderBy: { data: "asc" } });

  return NextResponse.json(
    cotacoes.map((c) => ({
      data: c.data.toISOString().slice(0, 10),
      preco: Number(c.preco),
      dyMes: c.dyMes != null ? Number(c.dyMes) : null,
    }))
  );
}
