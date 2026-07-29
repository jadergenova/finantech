export interface DadosColados {
  data?: string; // YYYY-MM-DD
  valor?: number;
  descricao?: string;
}

function parseValorToken(token: string, negativo: boolean): number {
  const normalizado = token.includes(",") ? token.replace(/\./g, "").replace(",", ".") : token;
  const valor = Number(normalizado);
  return negativo ? -Math.abs(valor) : valor;
}

export function parseTextoColado(texto: string): DadosColados {
  let restante = texto.trim();
  const resultado: DadosColados = {};

  const dataIso = restante.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  const dataBr = restante.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (dataIso) {
    resultado.data = dataIso[0];
    restante = restante.replace(dataIso[0], "").trim();
  } else if (dataBr) {
    const [, dia, mes, ano] = dataBr;
    resultado.data = `${ano}-${mes}-${dia}`;
    restante = restante.replace(dataBr[0], "").trim();
  }

  const valorMatch = restante.match(/(-)?\s*R?\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/);
  if (valorMatch) {
    resultado.valor = parseValorToken(valorMatch[2], !!valorMatch[1]);
    restante = restante.replace(valorMatch[0], "").trim();
  }

  restante = restante
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–,]+|[\s\-–,]+$/g, "")
    .trim();
  if (restante) resultado.descricao = restante;

  return resultado;
}
