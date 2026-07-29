import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchQuotes } from "@/lib/market-data/brapi";
import { fetchTaxaMercado } from "@/lib/market-data/bcb";
import { serializeFiiPosicao } from "@/lib/fiis";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ativos = await prisma.fiiAtivo.findMany({ where: { isActive: true } });
  const hoje = new Date().toISOString().slice(0, 10);

  if (ativos.length > 0) {
    try {
      const quotes = await fetchQuotes(ativos.map((a) => a.ticker));
      await Promise.all(
        quotes.map((q) => {
          const ativo = ativos.find((a) => a.ticker === q.symbol);
          if (!ativo) return Promise.resolve();
          // Não inclui dyMes no update quando a brapi não retorna o dado (plano gratuito não
          // libera dividendos) — evita apagar um DY que o usuário tenha lançado manualmente.
          const dadosAtualizacao: { preco: number; dyMes?: number } = { preco: q.regularMarketPrice };
          if (q.dividendYield !== undefined) dadosAtualizacao.dyMes = q.dividendYield;

          return prisma.fiiCotacao.upsert({
            where: { ativoId_data: { ativoId: ativo.id, data: new Date(hoje) } },
            update: dadosAtualizacao,
            create: {
              ativoId: ativo.id,
              data: new Date(hoje),
              preco: q.regularMarketPrice,
              dyMes: q.dividendYield ?? null,
            },
          });
        })
      );
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Falha ao buscar cotações na brapi.dev" },
        { status: 502 }
      );
    }
  }

  try {
    const [cdi, selic, ipca] = await Promise.all([
      fetchTaxaMercado("CDI", 1),
      fetchTaxaMercado("SELIC", 1),
      fetchTaxaMercado("IPCA", 1),
    ]);
    for (const [indice, pontos] of [
      ["CDI", cdi],
      ["SELIC", selic],
      ["IPCA", ipca],
    ] as const) {
      for (const ponto of pontos) {
        await prisma.taxaMercado.upsert({
          where: { indice_data: { indice, data: new Date(ponto.data) } },
          update: { valor: ponto.valor },
          create: { indice, data: new Date(ponto.data), valor: ponto.valor },
        });
      }
    }
  } catch {
    // Taxas de mercado são complementares — não bloqueia a sincronização de cotações se falhar.
  }

  const atualizados = await prisma.fiiAtivo.findMany({
    where: { isActive: true },
    include: { aportes: true, cotacoes: { orderBy: { data: "desc" }, take: 1 } },
    orderBy: { ticker: "asc" },
  });

  return NextResponse.json(atualizados.map(serializeFiiPosicao));
}
