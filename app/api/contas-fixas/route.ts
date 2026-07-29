import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mesParaData, mesAnterior, serializeContaFixaComMes } from "@/lib/contas-fixas";

const createSchema = z.object({ nome: z.string().min(1) });

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mes = req.nextUrl.searchParams.get("mes") ?? new Date().toISOString().slice(0, 7);
  const mesAnteriorStr = mesAnterior(mes);
  const mesData = mesParaData(mes);
  const mesAnteriorData = mesParaData(mesAnteriorStr);

  const contas = await prisma.contaFixa.findMany({
    where: { isActive: true },
    include: {
      lancamentos: { where: { mes: { in: [mesData, mesAnteriorData] } } },
    },
    orderBy: { nome: "asc" },
  });

  const resultado = contas.map((conta) => {
    const lancamentoMes = conta.lancamentos.find((l) => l.mes.getTime() === mesData.getTime()) ?? null;
    const lancamentoAnterior = conta.lancamentos.find((l) => l.mes.getTime() === mesAnteriorData.getTime()) ?? null;
    return serializeContaFixaComMes(conta, lancamentoMes, lancamentoAnterior);
  });

  return NextResponse.json(resultado);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const conta = await prisma.contaFixa.create({ data: body.data });
  return NextResponse.json(conta, { status: 201 });
}
