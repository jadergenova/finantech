import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeRendaFixaProduto } from "@/lib/renda-fixa";

const createSchema = z.object({
  instituicaoId: z.string().min(1),
  nome: z.string().min(1),
  indexador: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const produtos = await prisma.rendaFixaProduto.findMany({
    where: { isActive: true },
    include: {
      instituicao: true,
      saldos: { orderBy: { data: "desc" }, take: 2 },
    },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(produtos.map(serializeRendaFixaProduto));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const produto = await prisma.rendaFixaProduto.create({
    data: body.data,
    include: { instituicao: true, saldos: true },
  });

  return NextResponse.json(serializeRendaFixaProduto(produto), { status: 201 });
}
