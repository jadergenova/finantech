export function mesParaData(mes: string): Date {
  return new Date(`${mes}-01`);
}

export function mesAnterior(mes: string): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mesNum - 2, 1));
  return data.toISOString().slice(0, 7);
}

export function proximoMes(mes: string): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mesNum, 1));
  return data.toISOString().slice(0, 7);
}
