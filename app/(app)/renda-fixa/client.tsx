"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Btn } from "@/components/ui/form-field";
import { PasteFillButton } from "@/components/ui/paste-fill-button";
import { formatMoney, formatPercent, formatDate } from "@/lib/format";
import { calcularProjecaoMensalRendaFixa } from "@/lib/renda-fixa-projecao";

interface Produto {
  id: string;
  nome: string;
  indexador: string | null;
  instituicao: { id: string; nome: string };
  saldoAtual: number;
  dataUltimoSaldo: string | null;
  rendimentoDia: number | null;
  rendimentoPorDiaUtil: number | null;
  rendimentoMesPercentual: number | null;
}

interface Instituicao {
  id: string;
  nome: string;
}

export function RendaFixaClient({
  initialProdutos,
  instituicoes: initialInstituicoes,
}: {
  initialProdutos: Produto[];
  instituicoes: Instituicao[];
}) {
  const [produtos, setProdutos] = useState(initialProdutos);
  const [instituicoes, setInstituicoes] = useState(initialInstituicoes);
  const [saldoModalProduto, setSaldoModalProduto] = useState<Produto | null>(null);
  const [showNovoProduto, setShowNovoProduto] = useState(false);
  const [showNovaInstituicao, setShowNovaInstituicao] = useState(false);

  async function refreshProdutos() {
    const res = await fetch("/api/renda-fixa/produtos");
    if (res.ok) setProdutos(await res.json());
  }

  async function handleLancarSaldo(produto: Produto, data: string, saldo: number) {
    const res = await fetch("/api/renda-fixa/saldos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId: produto.id, data, saldo }),
    });
    if (res.ok) {
      setSaldoModalProduto(null);
      await refreshProdutos();
    }
  }

  async function handleNovaInstituicao(nome: string) {
    const res = await fetch("/api/instituicoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      const nova = await res.json();
      setInstituicoes((prev) => [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome)));
      setShowNovaInstituicao(false);
    }
  }

  async function handleNovoProduto(instituicaoId: string, nome: string, indexador: string) {
    const res = await fetch("/api/renda-fixa/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instituicaoId, nome, indexador: indexador || undefined }),
    });
    if (res.ok) {
      setShowNovoProduto(false);
      await refreshProdutos();
    }
  }

  const totalPatrimonio = produtos.reduce((sum, p) => sum + p.saldoAtual, 0);
  const projecao = calcularProjecaoMensalRendaFixa(produtos);

  return (
    <div>
      <PageHeader
        title="Renda Fixa"
        description={`Patrimônio total: ${formatMoney(totalPatrimonio)}`}
        action={
          <>
            <Btn variant="ghost" onClick={() => setShowNovaInstituicao(true)}>
              <Plus size={16} className="inline mr-1" /> Instituição
            </Btn>
            <Btn onClick={() => setShowNovoProduto(true)}>
              <Plus size={16} className="inline mr-1" /> Produto
            </Btn>
          </>
        }
      />

      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: "var(--muted)" }}>
          Projeção do mês — {projecao.mes}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ProjecaoItem label="Dias úteis no mês" value={String(projecao.diasUteisTotal)} />
          <ProjecaoItem label="Dias já rendidos" value={String(projecao.diasUteisDecorridos)} />
          <ProjecaoItem label="Dias restantes" value={String(projecao.diasUteisRestantes)} />
          <ProjecaoItem label="Média diária" value={formatMoney(projecao.valorMedioRendimentoDiario)} />
          <ProjecaoItem label="Estimado no mês" value={formatMoney(projecao.valorEstimadoMes)} color="var(--accent2)" />
          <ProjecaoItem
            label="Rendido até hoje"
            value={formatMoney(projecao.valorAteDiaAtual)}
            color="var(--emerald)"
          />
          <ProjecaoItem
            label="Previsto até o fim do mês"
            value={formatMoney(projecao.valorPrevistoRestante)}
            color="var(--purple)"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: "instituicao", header: "Instituição", render: (p) => p.instituicao.nome },
          { key: "nome", header: "Produto", render: (p) => p.nome },
          { key: "indexador", header: "Indexador", render: (p) => p.indexador ?? "—" },
          { key: "saldo", header: "Saldo atual", align: "right", render: (p) => formatMoney(p.saldoAtual) },
          {
            key: "rendimentoDia",
            header: "Rend. no período",
            align: "right",
            render: (p) =>
              p.rendimentoDia === null ? (
                "—"
              ) : (
                <span style={{ color: p.rendimentoDia >= 0 ? "var(--emerald)" : "var(--red)" }}>
                  {formatMoney(p.rendimentoDia)}
                </span>
              ),
          },
          {
            key: "rendimentoMes",
            header: "Rend. % mês",
            align: "right",
            render: (p) =>
              p.rendimentoMesPercentual === null ? (
                "—"
              ) : (
                <span style={{ color: p.rendimentoMesPercentual >= 0 ? "var(--emerald)" : "var(--red)" }}>
                  {formatPercent(p.rendimentoMesPercentual)}
                </span>
              ),
          },
          {
            key: "dataUltimoSaldo",
            header: "Último lançamento",
            render: (p) => (p.dataUltimoSaldo ? formatDate(p.dataUltimoSaldo) : "—"),
          },
          {
            key: "acoes",
            header: "",
            align: "right",
            render: (p) => (
              <Btn variant="ghost" onClick={() => setSaldoModalProduto(p)}>
                Lançar saldo
              </Btn>
            ),
          },
        ]}
        data={produtos}
        keyField={(p) => p.id}
        emptyMessage="Nenhum produto de renda fixa cadastrado ainda."
      />

      {saldoModalProduto && (
        <LancarSaldoModal
          produto={saldoModalProduto}
          onClose={() => setSaldoModalProduto(null)}
          onSubmit={handleLancarSaldo}
        />
      )}

      {showNovaInstituicao && (
        <NovaInstituicaoModal onClose={() => setShowNovaInstituicao(false)} onSubmit={handleNovaInstituicao} />
      )}

      {showNovoProduto && (
        <NovoProdutoModal
          instituicoes={instituicoes}
          onClose={() => setShowNovoProduto(false)}
          onSubmit={handleNovoProduto}
        />
      )}
    </div>
  );
}

function ProjecaoItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-lg font-bold tabular-nums" style={{ color: color ?? "var(--bright)" }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}

function LancarSaldoModal({
  produto,
  onClose,
  onSubmit,
}: {
  produto: Produto;
  onClose: () => void;
  onSubmit: (produto: Produto, data: string, saldo: number) => Promise<void>;
}) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [saldo, setSaldo] = useState(String(produto.saldoAtual || ""));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(produto, data, Number(saldo));
    setLoading(false);
  }

  return (
    <Modal title={`Lançar saldo — ${produto.nome}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-end mb-2">
          <PasteFillButton
            onParsed={(dados) => {
              if (dados.data) setData(dados.data);
              if (dados.valor !== undefined) setSaldo(String(dados.valor));
            }}
          />
        </div>
        <Field label="Data">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </Field>
        <Field label="Saldo">
          <Input type="number" step="0.01" value={saldo} onChange={(e) => setSaldo(e.target.value)} required />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}

function NovaInstituicaoModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (nome: string) => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(nome);
    setLoading(false);
  }

  return (
    <Modal title="Nova instituição" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Nome">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}

function NovoProdutoModal({
  instituicoes,
  onClose,
  onSubmit,
}: {
  instituicoes: Instituicao[];
  onClose: () => void;
  onSubmit: (instituicaoId: string, nome: string, indexador: string) => Promise<void>;
}) {
  const [instituicaoId, setInstituicaoId] = useState(instituicoes[0]?.id ?? "");
  const [nome, setNome] = useState("");
  const [indexador, setIndexador] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(instituicaoId, nome, indexador);
    setLoading(false);
  }

  return (
    <Modal title="Novo produto de Renda Fixa" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Instituição">
          <Select value={instituicaoId} onChange={(e) => setInstituicaoId(e.target.value)} required>
            {instituicoes.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nome do produto" hint='Ex: "Bradesco 100%", "Sofisa LCA 94,5"'>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </Field>
        <Field label="Indexador" hint="Opcional. Ex: % CDI, IPCA+">
          <Input value={indexador} onChange={(e) => setIndexador(e.target.value)} />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}
