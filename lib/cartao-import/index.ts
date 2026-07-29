import { parseNubankCsv } from "./nubank-csv";
import { parseOfx } from "./ofx";
import type { TransacaoImportada } from "./types";

export type { TransacaoImportada };

export function parseFaturaFile(nomeArquivo: string, conteudo: string): TransacaoImportada[] {
  const extensao = nomeArquivo.toLowerCase().split(".").pop();
  if (extensao === "ofx") return parseOfx(conteudo);
  if (extensao === "csv") return parseNubankCsv(conteudo);
  throw new Error("Formato de arquivo não suportado. Envie um .csv ou .ofx.");
}
