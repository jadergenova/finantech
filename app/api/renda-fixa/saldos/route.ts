import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { diasUteisEntre } from "@/lib/business-days";

const upsertSchema = z.object({
  produtoId: z.string().min(1),
  data: z.string().min(1),
  saldo: z.number(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = upsertSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { produtoId, data, saldo } = body.data;
  const saldoDiario = await prisma.rendaFixaSaldoDiario.upsert({
    where: { produtoId_data: { produtoId, data: new Date(data) } },
    update: { saldo },
    create: { produtoId, data: new Date(data), saldo },
  });

  return NextResponse.json(
    {
      ...saldoDiario,
      saldo: Number(saldoDiario.saldo),
      data: saldoDiario.data.toISOString().slice(0, 10),
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const produtoId = req.nextUrl.searchParams.get("produtoId");
  if (!produtoId) return NextResponse.json({ error: "produtoId é obrigatório" }, { status: 400 });

  const saldos = await prisma.rendaFixaSaldoDiario.findMany({
    where: { produtoId },
    orderBy: { data: "asc" },
  });

  let anterior: { data: Date; saldo: number } | null = null;
  const lancamentos = saldos.map((s) => {
    const saldo = Number(s.saldo);
    let rendimento: number | null = null;
    let diasUteis: number | null = null;
    if (anterior) {
      rendimento = saldo - anterior.saldo;
      diasUteis = diasUteisEntre(anterior.data, s.data);
    }
    anterior = { data: s.data, saldo };
    return { id: s.id, data: s.data.toISOString().slice(0, 10), saldo, rendimento, diasUteis };
  });

  return NextResponse.json(lancamentos.reverse());
}
