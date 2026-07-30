"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Btn } from "@/components/ui/form-field";
import { PasteFillButton } from "@/components/ui/paste-fill-button";
import { formatMoney } from "@/lib/format";

interface Lancamento {
  id: string;
  mes: string;
  deposito: number;
  saldo: number;
  juros: number | null;
}

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

function formatMes(mes: string) {
  const [ano, mesNum] = mes.split("-");
  return new Date(Number(ano), Number(mesNum) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function FgtsClient({ initialLancamentos }: { initialLancamentos: Lancamento[] }) {
  const [lancamentos, setLancamentos] = useState(initialLancamentos);
  const [showNovo, setShowNovo] = useState(false);

  async function refresh() {
    const res = await fetch("/api/fgts");
    if (res.ok) setLancamentos(await res.json());
  }

  async function handleNovo(data: { mes: string; deposito: number; saldo: number }) {
    const res = await fetch("/api/fgts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setLancamentos(await res.json());
      setShowNovo(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    const res = await fetch(`/api/fgts/${id}`, { method: "DELETE" });
    if (res.ok) await refresh();
  }

  const saldoAtual = lancamentos[0]?.saldo ?? 0;
  const totalDepositado = lancamentos.reduce((sum, l) => sum + l.deposito, 0);
  const jurosAcumulado = lancamentos.reduce((sum, l) => sum + (l.juros ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="FGTS"
        action={
          <Btn onClick={() => setShowNovo(true)}>
            <Plus size={16} className="inline mr-1" /> Lançar mês
          </Btn>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-xl font-extrabold tracking-tight tabular-nums" style={{ color: "var(--bright)" }}>
            {formatMoney(saldoAtual)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Saldo atual
          </div>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-xl font-extrabold tracking-tight tabular-nums" style={{ color: "var(--accent2)" }}>
            {formatMoney(totalDepositado)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Total depositado
          </div>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-xl font-extrabold tracking-tight tabular-nums" style={{ color: "var(--emerald)" }}>
            {formatMoney(jurosAcumulado)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Juros acumulados
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "mes", header: "Mês", render: (l) => formatMes(l.mes) },
          { key: "deposito", header: "Depósito", align: "right", render: (l) => formatMoney(l.deposito) },
          {
            key: "juros",
            header: "Juros do mês",
            align: "right",
            render: (l) =>
              l.juros === null ? (
                "—"
              ) : (
                <span style={{ color: l.juros >= 0 ? "var(--emerald)" : "var(--red)" }}>{formatMoney(l.juros)}</span>
              ),
          },
          { key: "saldo", header: "Saldo acumulado", align: "right", render: (l) => formatMoney(l.saldo) },
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
        emptyMessage="Nenhum lançamento de FGTS ainda."
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
  onSubmit: (data: { mes: string; deposito: number; saldo: number }) => Promise<void>;
}) {
  const [mes, setMes] = useState(mesAtual());
  const [deposito, setDeposito] = useState("");
  const [saldo, setSaldo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ mes, deposito: Number(deposito || 0), saldo: Number(saldo) });
    setLoading(false);
  }

  return (
    <Modal title="Lançar mês de FGTS" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-end mb-2">
          <PasteFillButton onParsed={(dados) => { if (dados.valor !== undefined) setSaldo(String(dados.valor)); }} />
        </div>
        <Field label="Mês">
          <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} required />
        </Field>
        <Field label="Depósito do mês" hint="Valor que o empregador depositou nesse mês. Deixe 0 se não houve.">
          <Input type="number" step="0.01" value={deposito} onChange={(e) => setDeposito(e.target.value)} />
        </Field>
        <Field label="Saldo acumulado ao final do mês">
          <Input type="number" step="0.01" value={saldo} onChange={(e) => setSaldo(e.target.value)} required />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}
