import type { TransacaoImportada } from "./types";

const PARCELA_REGEX = /\s-\s*Parcela\s+(\d+)\/(\d+)\s*$/i;

function parseValorBr(raw: string): number {
  const negativo = raw.trim().startsWith("-");
  const numerico = raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const valor = Math.abs(Number(numerico));
  return negativo ? -valor : valor;
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Formato do export de fatura do Nubank: `date,title,amount`, data já em ISO,
 * valor em formato BR entre aspas ("1.234,56"), pagamentos/estornos com prefixo "- ".
 */
export function parseNubankCsv(conteudo: string): TransacaoImportada[] {
  const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const [, ...dados] = linhas;

  return dados.map((linha) => {
    const [data, tituloRaw, valorRaw] = splitCsvLine(linha);
    const match = tituloRaw.match(PARCELA_REGEX);
    const descricao = match ? tituloRaw.replace(PARCELA_REGEX, "").trim() : tituloRaw.trim();

    return {
      data: data.trim(),
      descricao,
      valor: parseValorBr(valorRaw),
      parcelaAtual: match ? Number(match[1]) : undefined,
      parcelaTotal: match ? Number(match[2]) : undefined,
    };
  });
}
