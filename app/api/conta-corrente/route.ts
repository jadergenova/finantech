import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeLancamento } from "@/lib/conta-corrente";
import { mesParaData, proximoMes } from "@/lib/mes";

const createSchema = z.object({
  data: z.string().min(1),
  descricao: z.string().min(1),
  valor: z.number(),
  ehReserva: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mes = req.nextUrl.searchParams.get("mes");
  const where = mes ? { data: { gte: mesParaData(mes), lt: mesParaData(proximoMes(mes)) } } : {};

  const lancamentos = await prisma.contaCorrenteLancamento.findMany({ where, orderBy: { data: "desc" } });
  return NextResponse.json(lancamentos.map(serializeLancamento));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { data, descricao, valor, ehReserva } = body.data;
  const lancamento = await prisma.contaCorrenteLancamento.create({
    data: { data: new Date(data), descricao, valor, ehReserva: ehReserva ?? false },
  });

  return NextResponse.json(serializeLancamento(lancamento), { status: 201 });
}
