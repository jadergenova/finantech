const BRAPI_BASE_URL = "https://brapi.dev/api";

export interface BrapiQuote {
  symbol: string;
  regularMarketPrice: number;
  dividendYield?: number;
}

interface BrapiQuoteRaw {
  symbol: string;
  regularMarketPrice: number;
  dividendYield?: number;
}

async function fetchOne(ticker: string, token: string | undefined): Promise<BrapiQuoteRaw | null> {
  const url = new URL(`${BRAPI_BASE_URL}/quote/${ticker}`);
  if (token) url.searchParams.set("token", token);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detalhe = body?.message ?? body?.error ?? null;
    throw new Error(`brapi.dev respondeu ${res.status} para ${ticker}${detalhe ? `: ${detalhe}` : ""}`);
  }

  const data = await res.json();
  return data.results?.[0] ?? null;
}

/**
 * O plano gratuito da brapi.dev permite só 1 ativo por requisição, então
 * buscamos cada ticker separadamente em vez de uma chamada em lote.
 */
export async function fetchQuotes(tickers: string[]): Promise<BrapiQuote[]> {
  if (tickers.length === 0) return [];

  const token = process.env.BRAPI_TOKEN;
  const resultados = await Promise.all(tickers.map((ticker) => fetchOne(ticker, token)));

  return resultados
    .filter((r): r is BrapiQuoteRaw => r !== null)
    .map((r) => ({
      symbol: r.symbol,
      regularMarketPrice: r.regularMarketPrice,
      dividendYield: r.dividendYield,
    }));
}
