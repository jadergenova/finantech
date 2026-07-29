export function diasUteisNoMes(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(year, month, day).getDay();
    if (weekday !== 0 && weekday !== 6) count++;
  }
  return count;
}

/** Dias úteis do mês (local) já decorridos, do dia 1 até `date` (inclusive). */
export function diasUteisDecorridosNoMes(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();

  let count = 0;
  for (let day = 1; day <= date.getDate(); day++) {
    const weekday = new Date(year, month, day).getDay();
    if (weekday !== 0 && weekday !== 6) count++;
  }
  return count;
}

/**
 * Dias úteis entre duas datas armazenadas (UTC, vindas de campos @db.Date),
 * contando do dia seguinte a `inicio` até `fim` (inclusive). Mínimo 1, pra
 * nunca dividir por zero quando as duas datas caem no mesmo dia.
 */
export function diasUteisEntre(inicio: Date, fim: Date): number {
  let count = 0;
  const atual = new Date(inicio);
  atual.setUTCDate(atual.getUTCDate() + 1);

  while (atual.getTime() <= fim.getTime()) {
    const weekday = atual.getUTCDay();
    if (weekday !== 0 && weekday !== 6) count++;
    atual.setUTCDate(atual.getUTCDate() + 1);
  }

  return Math.max(count, 1);
}
