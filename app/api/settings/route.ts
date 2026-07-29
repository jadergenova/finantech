import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  nomeSistema: z.string().min(1).optional(),
  logoBase64: z.string().nullable().optional(),
  temaPreset: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.appSettings.findUnique({ where: { id: "current" } });
  return NextResponse.json(settings ?? { id: "current", nomeSistema: "FinanTech", logoBase64: null, temaPreset: "blue" });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: "current" },
    update: body.data,
    create: { id: "current", ...body.data },
  });

  return NextResponse.json(settings);
}
