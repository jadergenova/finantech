import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ pago: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const lancamento = await prisma.contaFixaLancamento.update({ where: { id }, data: { pago: body.data.pago } });

  return NextResponse.json({
    ...lancamento,
    valor: Number(lancamento.valor),
    mes: lancamento.mes.toISOString().slice(0, 10),
  });
}
