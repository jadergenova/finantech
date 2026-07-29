import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({ nome: z.string().min(1) });

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const instituicoes = await prisma.instituicao.findMany({
    where: { isActive: true },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(instituicoes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const instituicao = await prisma.instituicao.create({ data: body.data });
  return NextResponse.json(instituicao, { status: 201 });
}
