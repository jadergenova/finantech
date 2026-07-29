import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mesParaData } from "@/lib/contas-fixas";

const upsertSchema = z.object({
  contaFixaId: z.string().min(1),
  mes: z.string().min(1),
  valor: z.number(),
  pago: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = upsertSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { contaFixaId, mes, valor, pago } = body.data;
  const mesData = mesParaData(mes);

  const lancamento = await prisma.contaFixaLancamento.upsert({
    where: { contaFixaId_mes: { contaFixaId, mes: mesData } },
    update: { valor, ...(pago !== undefined ? { pago } : {}) },
    create: { contaFixaId, mes: mesData, valor, pago: pago ?? false },
  });

  return NextResponse.json(
    {
      ...lancamento,
      valor: Number(lancamento.valor),
      mes: lancamento.mes.toISOString().slice(0, 10),
    },
    { status: 201 }
  );
}
