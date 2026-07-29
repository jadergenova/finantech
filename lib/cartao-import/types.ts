export interface TransacaoImportada {
  data: string; // YYYY-MM-DD
  descricao: string;
  valor: number;
  parcelaAtual?: number;
  parcelaTotal?: number;
}
