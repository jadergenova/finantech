import type { TransacaoImportada } from "./types";

const PARCELA_REGEX = /\s-\s*Parcela\s+(\d+)\/(\d+)\s*$/i;

function extractTag(bloco: string, tag: string): string | null {
  const match = bloco.match(new RegExp(`<${tag}>([^<\r\n]*)`, "i"));
  return match ? match[1].trim() : null;
}

function parseOfxDate(raw: string): string {
  const ano = raw.slice(0, 4);
  const mes = raw.slice(4, 6);
  const dia = raw.slice(6, 8);
  return `${ano}-${mes}-${dia}`;
}

/**
 * Parser best-effort do formato OFX (SGML, quase sempre XML inválido na prática).
 * Não foi validado contra um arquivo real do usuário — ajustar se o banco exportar
 * campos diferentes de TRNAMT/NAME/MEMO/DTPOSTED dentro de <STMTTRN>.
 */
export function parseOfx(conteudo: string): TransacaoImportada[] {
  const blocos = conteudo.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) ?? [];

  return blocos
    .map((bloco): TransacaoImportada | null => {
      const dtPosted = extractTag(bloco, "DTPOSTED");
      const trnAmt = extractTag(bloco, "TRNAMT");
      const nome = extractTag(bloco, "NAME") ?? extractTag(bloco, "MEMO") ?? "";
      if (!dtPosted || !trnAmt) return null;

      const match = nome.match(PARCELA_REGEX);
      const descricao = match ? nome.replace(PARCELA_REGEX, "").trim() : nome.trim();

      return {
        data: parseOfxDate(dtPosted),
        descricao,
        valor: Number(trnAmt),
        parcelaAtual: match ? Number(match[1]) : undefined,
        parcelaTotal: match ? Number(match[2]) : undefined,
      };
    })
    .filter((t): t is TransacaoImportada => t !== null);
}
