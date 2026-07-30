import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeFgtsLancamentos } from "@/lib/fgts";
import { mesParaData } from "@/lib/mes";

const upsertSchema = z.object({
  mes: z.string().min(1),
  deposito: z.number(),
  saldo: z.number(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lancamentos = await prisma.fgtsLancamento.findMany({ orderBy: { mes: "asc" } });
  return NextResponse.json(serializeFgtsLancamentos(lancamentos));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = upsertSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { mes, deposito, saldo } = body.data;
  const mesData = mesParaData(mes);

  await prisma.fgtsLancamento.upsert({
    where: { mes: mesData },
    update: { deposito, saldo },
    create: { mes: mesData, deposito, saldo },
  });

  const lancamentos = await prisma.fgtsLancamento.findMany({ orderBy: { mes: "asc" } });
  return NextResponse.json(serializeFgtsLancamentos(lancamentos), { status: 201 });
}
