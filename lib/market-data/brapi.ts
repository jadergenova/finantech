const BRAPI_BASE_URL = "https://brapi.dev/api";

export interface BrapiQuote {
  symbol: string;
  regularMarketPrice: number;
  dividendYield?: number;
}

export async function fetchQuotes(tickers: string[]): Promise<BrapiQuote[]> {
  if (tickers.length === 0) return [];

  const token = process.env.BRAPI_TOKEN;
  const url = new URL(`${BRAPI_BASE_URL}/quote/${tickers.join(",")}`);
  if (token) url.searchParams.set("token", token);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`brapi.dev respondeu ${res.status}`);
  }

  const data = await res.json();
  return (data.results ?? []).map((r: { symbol: string; regularMarketPrice: number; dividendYield?: number }) => ({
    symbol: r.symbol,
    regularMarketPrice: r.regularMarketPrice,
    dividendYield: r.dividendYield,
  }));
}
