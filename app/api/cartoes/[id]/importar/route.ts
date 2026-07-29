import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFaturaFile } from "@/lib/cartao-import";
import { hashChave } from "@/lib/hash";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: cartaoId } = await params;
  const cartao = await prisma.cartao.findUnique({ where: { id: cartaoId } });
  if (!cartao) return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("arquivo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo no campo 'arquivo'" }, { status: 400 });
  }

  let transacoes;
  try {
    const conteudo = await file.text();
    transacoes = parseFaturaFile(file.name, conteudo);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao ler o arquivo" },
      { status: 400 }
    );
  }

  const ocorrencias = new Map<string, number>();
  const rows = transacoes.map((t) => {
    const chaveBase = `${cartaoId}|${t.data}|${t.descricao}|${t.valor}`;
    const ocorrencia = (ocorrencias.get(chaveBase) ?? 0) + 1;
    ocorrencias.set(chaveBase, ocorrencia);

    return {
      cartaoId,
      data: new Date(t.data),
      descricao: t.descricao,
      valor: t.valor,
      parcelaAtual: t.parcelaAtual ?? null,
      parcelaTotal: t.parcelaTotal ?? null,
      chaveDedup: hashChave(chaveBase, ocorrencia),
    };
  });

  const resultado = await prisma.cartaoTransacao.createMany({ data: rows, skipDuplicates: true });

  return NextResponse.json({
    total: rows.length,
    importadas: resultado.count,
    ignoradasDuplicadas: rows.length - resultado.count,
  });
}
