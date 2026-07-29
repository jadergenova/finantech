"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatMoney, formatDate } from "@/lib/format";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--bright)",
  fontSize: 13,
};

interface PontoEvolucao {
  data: string;
  rendaFixa: number;
  patrimonioTotal: number;
}

export function DashboardCharts({ evolucao }: { evolucao: PontoEvolucao[] }) {
  if (evolucao.length < 2) {
    return (
      <div
        className="rounded-xl border p-5 text-sm"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
      >
        Lance saldos diários de Renda Fixa e atualize cotações de FIIs por alguns dias para ver o gráfico de evolução
        aqui.
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: "var(--muted)" }}>
        Evolução do patrimônio
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={evolucao} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="data"
            tickFormatter={(v) => formatDate(v)}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={64}
            tickFormatter={(v) => formatMoney(v)}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => formatMoney(Number(value))}
            labelFormatter={(label) => formatDate(label as string)}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
          <Line
            type="monotone"
            dataKey="patrimonioTotal"
            name="Patrimônio total"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="rendaFixa"
            name="Renda Fixa"
            stroke="var(--purple)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
