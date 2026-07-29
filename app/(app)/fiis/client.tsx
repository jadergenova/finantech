"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Btn } from "@/components/ui/form-field";
import { PasteFillButton } from "@/components/ui/paste-fill-button";
import { formatMoney, formatPercent, formatDate } from "@/lib/format";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--bright)",
  fontSize: 13,
};

interface Posicao {
  id: string;
  ticker: string;
  nome: string | null;
  segmento: string | null;
  qtdeCotas: number;
  precoMedio: number;
  precoAtual: number;
  valorAtual: number;
  ganhoPerda: number;
  dyMes: number | null;
  dataUltimaCotacao: string | null;
}

export function FiisClient({ initialPosicoes }: { initialPosicoes: Posicao[] }) {
  const [posicoes, setPosicoes] = useState(initialPosicoes);
  const [showAporte, setShowAporte] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [historicoPosicao, setHistoricoPosicao] = useState<Posicao | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncError("");
    const res = await fetch("/api/fiis/cotacoes/sync", { method: "POST" });
    setSyncing(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setSyncError(body?.error ?? "Falha ao atualizar cotações");
      return;
    }
    setPosicoes(await res.json());
  }

  async function handleNovoAporte(data: {
    ticker: string;
    segmento: string;
    dataAporte: string;
    qtdeCotas: number;
    precoCompra: number;
    valorAportado: number;
  }) {
    const res = await fetch("/api/fiis/aportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const ativosRes = await fetch("/api/fiis/ativos");
      if (ativosRes.ok) setPosicoes(await ativosRes.json());
      setShowAporte(false);
    }
  }

  const valorTotalCarteira = posicoes.reduce((sum, p) => sum + p.valorAtual, 0);

  return (
    <div>
      <PageHeader
        title="FIIs"
        description={`Valor da carteira: ${formatMoney(valorTotalCarteira)}`}
        action={
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={handleSync} loading={syncing}>
              <RefreshCw size={16} className="inline mr-1" /> Atualizar cotações
            </Btn>
            <Btn onClick={() => setShowAporte(true)}>
              <Plus size={16} className="inline mr-1" /> Novo aporte
            </Btn>
          </div>
        }
      />

      {syncError && (
        <p className="text-sm mb-4" style={{ color: "var(--red)" }}>
          {syncError}
        </p>
      )}

      <DataTable
        columns={[
          { key: "ticker", header: "Ticker", render: (p) => p.ticker },
          { key: "segmento", header: "Segmento", render: (p) => p.segmento ?? "—" },
          { key: "qtde", header: "Cotas", align: "right", render: (p) => p.qtdeCotas.toLocaleString("pt-BR") },
          { key: "pm", header: "Preço médio", align: "right", render: (p) => formatMoney(p.precoMedio) },
          { key: "atual", header: "Preço atual", align: "right", render: (p) => formatMoney(p.precoAtual) },
          { key: "valorAtual", header: "Valor atual", align: "right", render: (p) => formatMoney(p.valorAtual) },
          {
            key: "ganhoPerda",
            header: "Ganho/Perda",
            align: "right",
            render: (p) => (
              <span style={{ color: p.ganhoPerda >= 0 ? "var(--emerald)" : "var(--red)" }}>
                {formatMoney(p.ganhoPerda)}
              </span>
            ),
          },
          { key: "dy", header: "DY", align: "right", render: (p) => (p.dyMes === null ? "—" : formatPercent(p.dyMes)) },
          {
            key: "dataCotacao",
            header: "Cotação de",
            render: (p) => (p.dataUltimaCotacao ? formatDate(p.dataUltimaCotacao) : "—"),
          },
          {
            key: "acoes",
            header: "",
            align: "right",
            render: (p) => (
              <button
                onClick={() => setHistoricoPosicao(p)}
                style={{ color: "var(--muted)" }}
                aria-label="Ver histórico"
                title="Ver histórico de cotação"
              >
                <LineChartIcon size={16} />
              </button>
            ),
          },
        ]}
        data={posicoes}
        keyField={(p) => p.id}
        emptyMessage="Nenhum FII cadastrado ainda."
      />

      {showAporte && <NovoAporteModal onClose={() => setShowAporte(false)} onSubmit={handleNovoAporte} />}

      {historicoPosicao && (
        <HistoricoModal posicao={historicoPosicao} onClose={() => setHistoricoPosicao(null)} />
      )}
    </div>
  );
}

interface PontoCotacao {
  data: string;
  preco: number;
  dyMes: number | null;
}

function HistoricoModal({ posicao, onClose }: { posicao: Posicao; onClose: () => void }) {
  const [pontos, setPontos] = useState<PontoCotacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/fiis/ativos/${posicao.id}/cotacoes`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setPontos)
      .finally(() => setLoading(false));
  }, [posicao.id]);

  return (
    <Modal title={`Histórico — ${posicao.ticker}`} onClose={onClose}>
      {loading ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Carregando…
        </p>
      ) : pontos.length < 2 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Ainda não há cotações suficientes salvas. Clique em &quot;Atualizar cotações&quot; ao longo de vários dias
          pra ver o histórico aqui.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={pontos} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="data"
              tickFormatter={(v) => formatDate(v)}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => formatMoney(Number(value))}
              labelFormatter={(label) => formatDate(label as string)}
            />
            <Line type="monotone" dataKey="preco" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Modal>
  );
}

function NovoAporteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    ticker: string;
    segmento: string;
    dataAporte: string;
    qtdeCotas: number;
    precoCompra: number;
    valorAportado: number;
  }) => Promise<void>;
}) {
  const [ticker, setTicker] = useState("");
  const [segmento, setSegmento] = useState("");
  const [dataAporte, setDataAporte] = useState(new Date().toISOString().slice(0, 10));
  const [qtdeCotas, setQtdeCotas] = useState("");
  const [precoCompra, setPrecoCompra] = useState("");
  const [loading, setLoading] = useState(false);

  const valorAportado = Number(qtdeCotas || 0) * Number(precoCompra || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ticker,
      segmento,
      dataAporte,
      qtdeCotas: Number(qtdeCotas),
      precoCompra: Number(precoCompra),
      valorAportado,
    });
    setLoading(false);
  }

  return (
    <Modal title="Novo aporte em FII" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-end mb-2">
          <PasteFillButton
            onParsed={(dados) => {
              if (dados.data) setDataAporte(dados.data);
              if (dados.valor !== undefined) setPrecoCompra(String(dados.valor));
            }}
          />
        </div>
        <Field label="Ticker" hint="Ex: KNCR11">
          <Input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required autoFocus />
        </Field>
        <Field label="Segmento" hint='Opcional. Ex: "Papel CDI", "Tijolo Shopping"'>
          <Input value={segmento} onChange={(e) => setSegmento(e.target.value)} />
        </Field>
        <Field label="Data do aporte">
          <Input type="date" value={dataAporte} onChange={(e) => setDataAporte(e.target.value)} required />
        </Field>
        <Field label="Quantidade de cotas">
          <Input type="number" step="0.01" value={qtdeCotas} onChange={(e) => setQtdeCotas(e.target.value)} required />
        </Field>
        <Field label="Preço de compra (por cota)">
          <Input type="number" step="0.01" value={precoCompra} onChange={(e) => setPrecoCompra(e.target.value)} required />
        </Field>
        <Field label="Valor total aportado">
          <Input type="text" value={valorAportado ? valorAportado.toFixed(2) : ""} disabled />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}
