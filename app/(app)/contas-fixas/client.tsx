"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Btn } from "@/components/ui/form-field";
import { PasteFillButton } from "@/components/ui/paste-fill-button";
import { formatMoney } from "@/lib/format";

interface ContaFixa {
  id: string;
  nome: string;
  lancamentoId: string | null;
  valor: number | null;
  pago: boolean;
  valorSugerido: number | null;
}

export function ContasFixasClient({
  initialContas,
  mesInicial,
}: {
  initialContas: ContaFixa[];
  mesInicial: string;
}) {
  const [contas, setContas] = useState(initialContas);
  const [mes, setMes] = useState(mesInicial);
  const [loading, setLoading] = useState(false);
  const [showNovaConta, setShowNovaConta] = useState(false);
  const [lancamentoModalConta, setLancamentoModalConta] = useState<ContaFixa | null>(null);

  async function carregarContas(mesFiltro: string) {
    setLoading(true);
    const res = await fetch(`/api/contas-fixas?mes=${mesFiltro}`);
    if (res.ok) setContas(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    carregarContas(mes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  async function handleNovaConta(nome: string) {
    const res = await fetch("/api/contas-fixas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      setShowNovaConta(false);
      await carregarContas(mes);
    }
  }

  async function handleLancar(conta: ContaFixa, valor: number) {
    const res = await fetch("/api/contas-fixas/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contaFixaId: conta.id, mes, valor }),
    });
    if (res.ok) {
      setLancamentoModalConta(null);
      await carregarContas(mes);
    }
  }

  async function handleTogglePago(conta: ContaFixa) {
    if (!conta.lancamentoId) return;
    const res = await fetch(`/api/contas-fixas/lancamentos/${conta.lancamentoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pago: !conta.pago }),
    });
    if (res.ok) {
      setContas((prev) => prev.map((c) => (c.id === conta.id ? { ...c, pago: !c.pago } : c)));
    }
  }

  const total = contas.reduce((sum, c) => sum + (c.valor ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Contas Fixas"
        description={`Total do mês: ${formatMoney(total)}`}
        action={
          <>
            <Field label="Mês">
              <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
            </Field>
            <Btn onClick={() => setShowNovaConta(true)}>
              <Plus size={16} className="inline mr-1" /> Conta
            </Btn>
          </>
        }
      />

      <DataTable
        columns={[
          { key: "nome", header: "Conta", render: (c) => c.nome },
          {
            key: "valor",
            header: "Valor",
            align: "right",
            render: (c) => (c.valor === null ? "—" : formatMoney(c.valor)),
          },
          {
            key: "pago",
            header: "Status",
            render: (c) =>
              c.lancamentoId ? (
                <button onClick={() => handleTogglePago(c)}>
                  <StatusBadge active={c.pago} activeLabel="Pago" inactiveLabel="Pendente" />
                </button>
              ) : (
                "—"
              ),
          },
          {
            key: "acoes",
            header: "",
            align: "right",
            render: (c) => (
              <Btn variant="ghost" onClick={() => setLancamentoModalConta(c)}>
                {c.lancamentoId ? "Editar" : "Lançar"}
              </Btn>
            ),
          },
        ]}
        data={loading ? [] : contas}
        keyField={(c) => c.id}
        emptyMessage={loading ? "Carregando…" : "Nenhuma conta cadastrada ainda."}
      />

      {lancamentoModalConta && (
        <LancarValorModal
          conta={lancamentoModalConta}
          onClose={() => setLancamentoModalConta(null)}
          onSubmit={handleLancar}
        />
      )}

      {showNovaConta && <NovaContaModal onClose={() => setShowNovaConta(false)} onSubmit={handleNovaConta} />}
    </div>
  );
}

function LancarValorModal({
  conta,
  onClose,
  onSubmit,
}: {
  conta: ContaFixa;
  onClose: () => void;
  onSubmit: (conta: ContaFixa, valor: number) => Promise<void>;
}) {
  const [valor, setValor] = useState(String(conta.valor ?? conta.valorSugerido ?? ""));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(conta, Number(valor));
    setLoading(false);
  }

  return (
    <Modal title={`Lançar valor — ${conta.nome}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-end mb-2">
          <PasteFillButton onParsed={(dados) => { if (dados.valor !== undefined) setValor(String(dados.valor)); }} />
        </div>
        <Field
          label="Valor"
          hint={
            conta.valor === null && conta.valorSugerido !== null
              ? `Sugestão baseada no mês anterior: ${formatMoney(conta.valorSugerido)}`
              : undefined
          }
        >
          <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required autoFocus />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}

function NovaContaModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (nome: string) => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(nome);
    setLoading(false);
  }

  return (
    <Modal title="Nova conta fixa" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Nome" hint='Ex: "Aluguel", "Condomínio", "Nubank"'>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}
