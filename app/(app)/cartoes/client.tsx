"use client";

import { useEffect, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Btn } from "@/components/ui/form-field";
import { formatMoney, formatDate } from "@/lib/format";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--bright)",
  fontSize: 13,
};

interface Cartao {
  id: string;
  nome: string;
}

interface Transacao {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
}

interface Projecao {
  mes: string;
  descricao: string;
  valor: number;
  parcela: number;
  parcelaTotal: number;
}

interface ResumoMensal {
  mes: string;
  total: number;
}

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

export function CartoesClient({ initialCartoes }: { initialCartoes: Cartao[] }) {
  const [cartoes, setCartoes] = useState(initialCartoes);
  const [cartaoId, setCartaoId] = useState(initialCartoes[0]?.id ?? "");
  const [mes, setMes] = useState(mesAtual());
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [projecoes, setProjecoes] = useState<Projecao[]>([]);
  const [resumoMensal, setResumoMensal] = useState<ResumoMensal[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [showNovoCartao, setShowNovoCartao] = useState(false);

  async function carregarDados(id: string, mesFiltro: string) {
    if (!id) {
      setTransacoes([]);
      setProjecoes([]);
      setResumoMensal([]);
      return;
    }
    setLoading(true);
    const [transacoesRes, projecaoRes, resumoRes] = await Promise.all([
      fetch(`/api/cartoes/${id}/transacoes?mes=${mesFiltro}`),
      fetch(`/api/cartoes/${id}/projecao?meses=3`),
      fetch(`/api/cartoes/${id}/transacoes/resumo-mensal`),
    ]);
    if (transacoesRes.ok) setTransacoes(await transacoesRes.json());
    if (projecaoRes.ok) setProjecoes(await projecaoRes.json());
    if (resumoRes.ok) setResumoMensal(await resumoRes.json());
    setLoading(false);
  }

  useEffect(() => {
    carregarDados(cartaoId, mes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartaoId, mes]);

  async function handleNovoCartao(nome: string) {
    const res = await fetch("/api/cartoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      const novo = await res.json();
      setCartoes((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      setCartaoId(novo.id);
      setShowNovoCartao(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !cartaoId) return;

    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("arquivo", file);
    const res = await fetch(`/api/cartoes/${cartaoId}/importar`, { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setUploadMsg(body?.error ?? "Falha ao importar o arquivo");
      return;
    }
    const resultado = await res.json();
    setUploadMsg(
      `${resultado.importadas} transações importadas${
        resultado.ignoradasDuplicadas ? `, ${resultado.ignoradasDuplicadas} já existiam` : ""
      }.`
    );
    await carregarDados(cartaoId, mes);
  }

  const totalMes = transacoes.reduce((sum, t) => sum + (t.valor > 0 ? t.valor : 0), 0);

  const projecaoPorMes = projecoes.reduce<Record<string, number>>((acc, p) => {
    acc[p.mes] = (acc[p.mes] ?? 0) + p.valor;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Cartões"
        description={
          cartoes.length === 0 ? "Cadastre um cartão para começar" : `Fatura do mês: ${formatMoney(totalMes)}`
        }
        action={
          <Btn onClick={() => setShowNovoCartao(true)}>
            <Plus size={16} className="inline mr-1" /> Novo cartão
          </Btn>
        }
      />

      {cartoes.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div className="min-w-[180px]">
            <Field label="Cartão">
              <Select value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}>
                {cartoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="min-w-[160px]">
            <Field label="Mês">
              <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
            </Field>
          </div>
          <div className="mb-4">
            <label
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              <Upload size={16} />
              {uploading ? "Importando…" : "Importar fatura"}
              <input type="file" accept=".csv,.ofx" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>
      )}

      {uploadMsg && (
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          {uploadMsg}
        </p>
      )}

      {cartoes.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center text-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Nenhum cartão cadastrado ainda.
        </div>
      ) : (
        <>
          <DataTable
            columns={[
              { key: "data", header: "Data", render: (t) => formatDate(t.data) },
              { key: "descricao", header: "Descrição", render: (t) => t.descricao },
              {
                key: "parcela",
                header: "Parcela",
                render: (t) => (t.parcelaAtual && t.parcelaTotal ? `${t.parcelaAtual}/${t.parcelaTotal}` : "—"),
              },
              {
                key: "valor",
                header: "Valor",
                align: "right",
                render: (t) => (
                  <span style={{ color: t.valor >= 0 ? "var(--text)" : "var(--emerald)" }}>
                    {formatMoney(t.valor)}
                  </span>
                ),
              },
            ]}
            data={loading ? [] : transacoes}
            keyField={(t) => t.id}
            emptyMessage={loading ? "Carregando…" : "Nenhuma transação neste mês."}
          />

          {resumoMensal.length > 1 && (
            <div
              className="mt-6 rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: "var(--muted)" }}>
                Gastos por mês
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={resumoMensal} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(v) => formatMoney(v)}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatMoney(Number(value))} />
                  <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {Object.keys(projecaoPorMes).length > 0 && (
            <div
              className="mt-6 rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: "var(--muted)" }}>
                Próximos meses (parcelas já contratadas)
              </p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(projecaoPorMes).map(([mesProj, valor]) => (
                  <div key={mesProj} className="rounded-lg border px-4 py-3" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {mesProj}
                    </div>
                    <div className="text-lg font-bold" style={{ color: "var(--purple)" }}>
                      {formatMoney(valor)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showNovoCartao && <NovoCartaoModal onClose={() => setShowNovoCartao(false)} onSubmit={handleNovoCartao} />}
    </div>
  );
}

function NovoCartaoModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (nome: string) => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(nome);
    setLoading(false);
  }

  return (
    <Modal title="Novo cartão" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Nome" hint='Ex: "Nubank", "Bradesco", "Mercado Pago"'>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
        </Field>
        <Btn type="submit" loading={loading} className="w-full">
          Salvar
        </Btn>
      </form>
    </Modal>
  );
}
