"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Btn } from "@/components/ui/form-field";
import { PasteFillButton } from "@/components/ui/paste-fill-button";
import { formatMoney, formatDate } from "@/lib/format";

interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  ehReserva: boolean;
}

export function ContaCorrenteClient({ initialLancamentos }: { initialLancamentos: Lancamento[] }) {
  const [lancamentos, setLancamentos] = useState(initialLancamentos);
  const [showNovo, setShowNovo] = useState(false);

  async function handleNovo(data: { data: string; descricao: string; valor: number; ehReserva: boolean }) {
    const res = await fetch("/api/conta-corrente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const novo = await res.json();
      setLancamentos((prev) => [novo, ...prev].sort((a, b) => b.data.localeCompare(a.data)));
      setShowNovo(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    const res = await fetch(`/api/conta-corrente/${id}`, { method: "DELETE" });
    if (res.ok) setLancamentos((prev) => prev.filter((l) => l.id !== id));
  }

  const saldoContaCorrente = lancamentos.filter((l) => !l.ehReserva).reduce((sum, l) => sum + l.valor, 0);
  const saldoReserva = lancamentos.filter((l) => l.ehReserva).reduce((sum, l) => sum + l.valor, 0);

  return (
    <div>
      <PageHeader
        title="Conta Corrente"
        description="Lançamentos do dia a dia e movimentações da reserva"
        action={
          <Btn onClick={() => setShowNovo(true)}>
            <Plus size={16} className="inline mr-1" /> Lançamento
          </Btn>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div
            className="text-xl font-extrabold tracking-tight tabular-nums"
            style={{ color: saldoContaCorrente >= 0 ? "var(--bright)" : "var(--red)" }}
          >
            {formatMoney(saldoContaCorrente)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Saldo Conta Corrente
          </div>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-xl font-extrabold tracking-tight tabular-nums" style={{ color: "var(--purple)" }}>
            {formatMoney(saldoReserva)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Saldo Reserva
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "data", header: "Data", render: (l) => formatDate(l.data) },
          { key: "descricao", header: "Descrição", render: (l) => l.descricao },
          {
            key: "valor",
            header: "Valor",
            align: "right",
            render: (l) => (
              <span style={{ color: l.valor >= 0 ? "var(--emerald)" : "var(--red)" }}>{formatMoney(l.valor)}</span>
            ),
          },
          {
            key: "reserva",
            header: "Reserva",
            render: (l) => (l.ehReserva ? <StatusBadge active activeLabel="Reserva" /> : "—"),
          },
          {
            key: "acoes",
            header: "",
            align: "right",
            render: (l) => (
              <button onClick={() => handleExcluir(l.id)} style={{ color: "var(--muted)" }} aria-label="Excluir">
                <Trash2 size={16} />
              </button>
            ),
          },
        ]}
        data={lancamentos}
        keyField={(l) => l.id}
        emptyMessage="Nenhum lançamento ainda."
      />

      {showNovo && <NovoLancamentoModal onClose={() => setShowNovo(false)} onSubmit={handleNovo} />}
    </div>
  );
}

function NovoLancamentoModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { data: string; descricao: string; valor: number; ehReserva: boolean }) => Promise<void>;
}) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [ehReserva, setEhReserva] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ data, descricao, valor: Number(valor), ehReserva });
    setLoading(false);
  }

  return (
    <Modal title="Novo lançamento" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-end mb-2">
          <PasteFillButton
            onParsed={(dados) => {
              if (dados.data) setData(dados.data);
              if (dados.valor !== undefined) setValor(String(dados.valor));
              if (dados.descricao) setDescricao(dados.descricao);
            }}
          />
        </div>
        <Field label="Data">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </Field>
        <Field label="Descrição">
          <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} required autoFocus />
        </Field>
        <Field label="Valor" hint="Positivo para entrada, negativo para saída">
          <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
        </Field>
        <label className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--text)" }}>
          <input type="checkbox" checked={ehReserva} onChange={(e) => setEhReserva(e.target.checked)} />
          Movimentação da reserva
        </label>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}
