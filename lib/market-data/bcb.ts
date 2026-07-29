const BCB_SERIES = {
  CDI: 12,
  SELIC: 11,
  IPCA: 433,
} as const;

export type IndiceMercado = keyof typeof BCB_SERIES;

export interface TaxaMercadoPonto {
  data: string; // YYYY-MM-DD
  valor: number;
}

export async function fetchTaxaMercado(indice: IndiceMercado, quantidade = 30): Promise<TaxaMercadoPonto[]> {
  const codigo = BCB_SERIES[indice];
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/${quantidade}?formato=json`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Banco Central respondeu ${res.status}`);
  }

  const data: { data: string; valor: string }[] = await res.json();
  return data.map((d) => ({
    data: brDateToIso(d.data),
    valor: Number(d.valor),
  }));
}

function brDateToIso(d: string): string {
  const [day, month, year] = d.split("/");
  return `${year}-${month}-${day}`;
}
