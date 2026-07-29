import { prisma } from "@/lib/prisma";
import { serializeFiiPosicao } from "@/lib/fiis";
import { serializeRendaFixaProduto } from "@/lib/renda-fixa";
import { mesParaData } from "@/lib/contas-fixas";
import { diasUteisNoMes } from "@/lib/business-days";
import { calcularEvolucaoPatrimonio } from "@/lib/patrimonio-evolucao";
import { formatMoney, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardCharts } from "./charts";

export default async function DashboardPage() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioProximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
  const mesAtualData = mesParaData(hoje.toISOString().slice(0, 7));

  const [produtosRaw, ativosRaw, saldosRaw, transacoesMesRaw, lancamentosMesRaw, lancamentosContaCorrente] =
    await Promise.all([
      prisma.rendaFixaProduto.findMany({
        where: { isActive: true },
        include: { instituicao: true, saldos: { orderBy: { data: "desc" }, take: 2 } },
      }),
      prisma.fiiAtivo.findMany({
        where: { isActive: true },
        include: { aportes: true, cotacoes: { orderBy: { data: "desc" }, take: 1 } },
      }),
      prisma.rendaFixaSaldoDiario.findMany({
        where: { produto: { isActive: true } },
        orderBy: { data: "asc" },
      }),
      prisma.cartaoTransacao.findMany({
        where: { cartao: { isActive: true }, data: { gte: inicioMes, lt: inicioProximoMes } },
      }),
      prisma.contaFixaLancamento.findMany({
        where: { contaFixa: { isActive: true }, mes: mesAtualData },
      }),
      prisma.contaCorrenteLancamento.findMany({ where: { ehReserva: false } }),
    ]);

  const cotacoesFiiRaw = await prisma.fiiCotacao.findMany({
    where: { ativo: { isActive: true } },
    orderBy: { data: "asc" },
  });
  const aportesFiiRaw = ativosRaw.flatMap((a) => a.aportes);

  const saldoContaCorrente = lancamentosContaCorrente.reduce((sum, l) => sum + Number(l.valor), 0);

  const faturaDoMes = transacoesMesRaw.reduce((sum, t) => {
    const valor = Number(t.valor);
    return sum + (valor > 0 ? valor : 0);
  }, 0);

  const contasFixasDoMes = lancamentosMesRaw.reduce((sum, l) => sum + Number(l.valor), 0);

  const produtos = produtosRaw.map(serializeRendaFixaProduto);
  const posicoesFii = ativosRaw.map(serializeFiiPosicao);

  const saldoRendaFixa = produtos.reduce((sum, p) => sum + p.saldoAtual, 0);
  const valorFiis = posicoesFii.reduce((sum, p) => sum + p.valorAtual, 0);
  const patrimonioTotal = saldoRendaFixa + valorFiis;

  const rendimentoDiaTotal = produtos.reduce((sum, p) => sum + (p.rendimentoDia ?? 0), 0);
  const diasUteis = diasUteisNoMes(new Date());
  const rendimentoMesPercentual = saldoRendaFixa > 0 ? ((rendimentoDiaTotal * diasUteis) / saldoRendaFixa) * 100 : 0;

  const evolucao = calcularEvolucaoPatrimonio(saldosRaw, aportesFiiRaw, cotacoesFiiRaw);

  const stats = [
    { label: "Patrimônio total", value: formatMoney(patrimonioTotal), color: "var(--bright)" },
    { label: "Saldo Renda Fixa", value: formatMoney(saldoRendaFixa), color: "var(--accent2)" },
    { label: "Valor carteira FII", value: formatMoney(valorFiis), color: "var(--purple)" },
    {
      label: "Rendimento do mês (%)",
      value: formatPercent(rendimentoMesPercentual),
      color: rendimentoMesPercentual >= 0 ? "var(--emerald)" : "var(--red)",
    },
    { label: "Fatura do mês", value: formatMoney(faturaDoMes), color: "var(--amber)" },
    { label: "Contas fixas do mês", value: formatMoney(contasFixasDoMes), color: "var(--accent2)" },
    {
      label: "Saldo Conta Corrente",
      value: formatMoney(saldoContaCorrente),
      color: saldoContaCorrente >= 0 ? "var(--emerald)" : "var(--red)",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do seu patrimônio" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="text-xl font-extrabold tracking-tight tabular-nums" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <DashboardCharts evolucao={evolucao} />
    </div>
  );
}
