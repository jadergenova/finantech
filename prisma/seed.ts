import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const HOJE = new Date().toISOString().slice(0, 10);

// Extraído da aba "Resumo" de jaderfev21.xlsx (saldo do dia mais recente por produto).
const RENDA_FIXA_SEED: { instituicao: string; produto: string; saldo: number }[] = [
  { instituicao: "Bradesco", produto: "Bradesco", saldo: 600 },
  { instituicao: "Bradesco", produto: "Bradesco 100%", saldo: 58819.18 },
  { instituicao: "Nubank", produto: "NU 120", saldo: 11458.89 },
  { instituicao: "Sofisa", produto: "Sofisa Jan 110", saldo: 100505.55 },
  { instituicao: "Sofisa", produto: "Sofisa 110", saldo: 83279.44 },
  { instituicao: "Sofisa", produto: "Sofisa LCA 94,5", saldo: 22606.53 },
  { instituicao: "C6 Bank", produto: "C6", saldo: 68467.63 },
  { instituicao: "Mercado Pago", produto: "MP C/C 105", saldo: 191645.03 },
  { instituicao: "Mercado Pago", produto: "MP Cof 120", saldo: 11626.86 },
  { instituicao: "Mercado Pago", produto: "MP CDB 107", saldo: 27626.15 },
];

// Extraído do quadro "Períodos" da aba Resumo (saldo de fechamento mensal por produto,
// ago/2025 a jun/2026). RF NU 140 e RF Nubank 100 ficaram de fora — contas já encerradas
// (saldo zerado nesse período) e não existem como produto ativo no sistema.
const RENDA_FIXA_HISTORICO_SEED: { produto: string; historico: { data: string; saldo: number }[] }[] = [
  {
    produto: "Bradesco",
    historico: [
      { data: "2025-08-31", saldo: 850 },
      { data: "2025-09-30", saldo: 850 },
      { data: "2025-10-31", saldo: 600 },
      { data: "2025-11-30", saldo: 600 },
      { data: "2025-12-31", saldo: 600 },
      { data: "2026-01-31", saldo: 600 },
      { data: "2026-02-28", saldo: 600 },
      { data: "2026-03-31", saldo: 3600 },
      { data: "2026-04-30", saldo: 600 },
      { data: "2026-05-31", saldo: 600 },
      { data: "2026-06-30", saldo: 600 },
    ],
  },
  {
    produto: "Bradesco 100%",
    historico: [
      { data: "2025-08-31", saldo: 0 },
      { data: "2025-09-30", saldo: 0 },
      { data: "2025-10-31", saldo: 0 },
      { data: "2025-11-30", saldo: 0 },
      { data: "2025-12-31", saldo: 0 },
      { data: "2026-01-31", saldo: 0 },
      { data: "2026-02-28", saldo: 53430.62 },
      { data: "2026-03-31", saldo: 53884.5 },
      { data: "2026-04-30", saldo: 57352.3 },
      { data: "2026-05-31", saldo: 57830.49 },
      { data: "2026-06-30", saldo: 58336.74 },
    ],
  },
  {
    produto: "NU 120",
    historico: [
      { data: "2025-08-31", saldo: 10113.59 },
      { data: "2025-09-30", saldo: 10223.56 },
      { data: "2025-10-31", saldo: 10345.78 },
      { data: "2025-11-30", saldo: 10453.57 },
      { data: "2025-12-31", saldo: 10568.3 },
      { data: "2026-01-31", saldo: 10706.72 },
      { data: "2026-02-28", saldo: 10816.82 },
      { data: "2026-03-31", saldo: 10939.38 },
      { data: "2026-04-30", saldo: 11056.53 },
      { data: "2026-05-31", saldo: 11173.31 },
      { data: "2026-06-30", saldo: 11296.77 },
    ],
  },
  {
    produto: "Sofisa Jan 110",
    historico: [
      { data: "2025-08-31", saldo: 89513.6 },
      { data: "2025-09-30", saldo: 90481.12 },
      { data: "2025-10-31", saldo: 91555.04 },
      { data: "2025-11-30", saldo: 92501.13 },
      { data: "2025-12-31", saldo: 93506.97 },
      { data: "2026-01-31", saldo: 94525.67 },
      { data: "2026-02-28", saldo: 95458.59 },
      { data: "2026-03-31", saldo: 96496.03 },
      { data: "2026-04-30", saldo: 97486.52 },
      { data: "2026-05-31", saldo: 98472.8 },
      { data: "2026-06-30", saldo: 99512.14 },
    ],
  },
  {
    produto: "Sofisa 110",
    historico: [
      { data: "2025-08-31", saldo: 196095.85 },
      { data: "2025-09-30", saldo: 189209.4 },
      { data: "2025-10-31", saldo: 191527.95 },
      { data: "2025-11-30", saldo: 193572.69 },
      { data: "2025-12-31", saldo: 195744.92 },
      { data: "2026-01-31", saldo: 197375.13 },
      { data: "2026-02-28", saldo: 176097.64 },
      { data: "2026-03-31", saldo: 81580.3 },
      { data: "2026-04-30", saldo: 82427.39 },
      { data: "2026-05-31", saldo: 82699.45 },
      { data: "2026-06-30", saldo: 83012.54 },
    ],
  },
  {
    produto: "Sofisa LCA 94,5",
    historico: [
      { data: "2025-08-31", saldo: 0 },
      { data: "2025-09-30", saldo: 20336.13 },
      { data: "2025-10-31", saldo: 20581.22 },
      { data: "2025-11-30", saldo: 20796.73 },
      { data: "2025-12-31", saldo: 21025.46 },
      { data: "2026-01-31", saldo: 21256.69 },
      { data: "2026-02-28", saldo: 21468.1 },
      { data: "2026-03-31", saldo: 21702.78 },
      { data: "2026-04-30", saldo: 21926.46 },
      { data: "2026-05-31", saldo: 22148.82 },
      { data: "2026-06-30", saldo: 22383.25 },
    ],
  },
  {
    produto: "C6",
    historico: [
      { data: "2025-08-31", saldo: 0 },
      { data: "2025-09-30", saldo: 0 },
      { data: "2025-10-31", saldo: 0 },
      { data: "2025-11-30", saldo: 0 },
      { data: "2025-12-31", saldo: 13815.28 },
      { data: "2026-01-31", saldo: 18994.79 },
      { data: "2026-02-28", saldo: 41883.88 },
      { data: "2026-03-31", saldo: 63132.69 },
      { data: "2026-04-30", saldo: 66688.63 },
      { data: "2026-05-31", saldo: 67256.76 },
      { data: "2026-06-30", saldo: 67882.12 },
    ],
  },
  {
    produto: "MP C/C 105",
    historico: [
      { data: "2025-08-31", saldo: 89881.32 },
      { data: "2025-09-30", saldo: 82128.27 },
      { data: "2025-10-31", saldo: 87494.64 },
      { data: "2025-11-30", saldo: 88280.65 },
      { data: "2025-12-31", saldo: 94380.38 },
      { data: "2026-01-31", saldo: 106666.22 },
      { data: "2026-02-28", saldo: 107726.14 },
      { data: "2026-03-31", saldo: 184912.74 },
      { data: "2026-04-30", saldo: 186555.12 },
      { data: "2026-05-31", saldo: 188752.44 },
      { data: "2026-06-30", saldo: 190520.57 },
    ],
  },
  {
    produto: "MP Cof 120",
    historico: [
      { data: "2025-08-31", saldo: 10290.55 },
      { data: "2025-09-30", saldo: 10412.85 },
      { data: "2025-10-31", saldo: 10542.27 },
      { data: "2025-11-30", saldo: 10656.02 },
      { data: "2025-12-31", saldo: 10778.19 },
      { data: "2026-01-31", saldo: 10897.87 },
      { data: "2026-02-28", saldo: 11022.94 },
      { data: "2026-03-31", saldo: 11156.62 },
      { data: "2026-04-30", saldo: 11272.86 },
      { data: "2026-05-31", saldo: 11386.46 },
      { data: "2026-06-30", saldo: 11509.84 },
    ],
  },
  {
    produto: "MP CDB 107",
    historico: [
      { data: "2025-08-31", saldo: 23099.54 },
      { data: "2025-09-30", saldo: 25083.25 },
      { data: "2025-10-31", saldo: 25334.2 },
      { data: "2025-11-30", saldo: 25568.02 },
      { data: "2025-12-31", saldo: 25816.55 },
      { data: "2026-01-31", saldo: 26068.17 },
      { data: "2026-02-28", saldo: 26298.5 },
      { data: "2026-03-31", saldo: 26604.75 },
      { data: "2026-04-30", saldo: 26857.03 },
      { data: "2026-05-31", saldo: 27108.16 },
      { data: "2026-06-30", saldo: 27373.33 },
    ],
  },
];

// FGTS: extraído da aba "FGTS" (mês/depósito/saldo acumulado oficial), últimos 13 lançamentos
// a partir de dez/2025, a pedido do usuário (histórico mais antigo tinha rótulos de ano
// inconsistentes na planilha e foi propositalmente deixado de fora).
const FGTS_SEED: { mes: string; deposito: number; saldo: number }[] = [
  { mes: "2025-12", deposito: 1550, saldo: 282628.88 },
  { mes: "2026-01", deposito: 3600, saldo: 286327.88 },
  { mes: "2026-02", deposito: 2500, saldo: 288942.88 },
  { mes: "2026-03", deposito: 1550, saldo: 290622.88 },
  { mes: "2026-04", deposito: 1550, saldo: 292317.88 },
  { mes: "2026-05", deposito: 1550, saldo: 294029.88 },
  { mes: "2026-06", deposito: 1550, saldo: 295759.88 },
  { mes: "2026-07", deposito: 1550, saldo: 297509.88 },
  { mes: "2026-08", deposito: 2550, saldo: 300279.88 },
  { mes: "2026-09", deposito: 1550, saldo: 302069.88 },
  { mes: "2026-10", deposito: 1550, saldo: 303879.88 },
  { mes: "2026-11", deposito: 1550, saldo: 305709.88 },
  { mes: "2026-12", deposito: 1550, saldo: 307559.88 },
];

// Extraído da tabela de FIIs da mesma aba (linhas com dados completos de aporte).
// HGBS11 e KNHF11 apareciam na planilha sem valores de aporte completos — não importados.
const FII_SEED: {
  ticker: string;
  segmento: string;
  dataAporte: string;
  qtdeCotas: number;
  precoCompra: number;
  valorAportado: number;
}[] = [
  { ticker: "KNCR11", segmento: "Papel CDI – defesa + renda alta", dataAporte: "2026-05-20", qtdeCotas: 34, precoCompra: 104.4, valorAportado: 3549.6 },
  { ticker: "HGLG11", segmento: "Tijolo logística – crescimento", dataAporte: "2026-05-20", qtdeCotas: 22, precoCompra: 154.91, valorAportado: 3408.02 },
  { ticker: "VISC11", segmento: "Tijolo Shopping", dataAporte: "2026-06-09", qtdeCotas: 5, precoCompra: 102.04, valorAportado: 510.2 },
  { ticker: "VISC11", segmento: "Tijolo Shopping", dataAporte: "2026-06-16", qtdeCotas: 32, precoCompra: 104.7, valorAportado: 3350.4 },
  { ticker: "HGRU11", segmento: "Tijolo Renda Urbana", dataAporte: "2026-06-16", qtdeCotas: 25, precoCompra: 129.1, valorAportado: 3227.5 },
  { ticker: "KNSC11", segmento: "Papel IPCA+CRI+CDI", dataAporte: "2026-07-20", qtdeCotas: 83, precoCompra: 9.17, valorAportado: 761.11 },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminName = process.env.ADMIN_NAME ?? "Admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: adminName, email: adminEmail, passwordHash },
  });
  console.log(`Usuário ${adminEmail} pronto.`);

  const instituicaoIds = new Map<string, string>();
  for (const nome of new Set(RENDA_FIXA_SEED.map((r) => r.instituicao))) {
    const instituicao = await prisma.instituicao.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    instituicaoIds.set(nome, instituicao.id);
  }

  for (const item of RENDA_FIXA_SEED) {
    const instituicaoId = instituicaoIds.get(item.instituicao)!;
    const produto = await prisma.rendaFixaProduto.upsert({
      where: { instituicaoId_nome: { instituicaoId, nome: item.produto } },
      update: {},
      create: { instituicaoId, nome: item.produto },
    });
    await prisma.rendaFixaSaldoDiario.upsert({
      where: { produtoId_data: { produtoId: produto.id, data: new Date(HOJE) } },
      update: { saldo: item.saldo },
      create: { produtoId: produto.id, data: new Date(HOJE), saldo: item.saldo },
    });
  }
  console.log(`${RENDA_FIXA_SEED.length} produtos de Renda Fixa importados.`);

  const produtoIdPorNome = new Map<string, string>();
  for (const item of RENDA_FIXA_SEED) {
    const instituicaoId = instituicaoIds.get(item.instituicao)!;
    const produto = await prisma.rendaFixaProduto.findUniqueOrThrow({
      where: { instituicaoId_nome: { instituicaoId, nome: item.produto } },
    });
    produtoIdPorNome.set(item.produto, produto.id);
  }

  let historicoCount = 0;
  for (const { produto, historico } of RENDA_FIXA_HISTORICO_SEED) {
    const produtoId = produtoIdPorNome.get(produto);
    if (!produtoId) continue;
    for (const { data, saldo } of historico) {
      await prisma.rendaFixaSaldoDiario.upsert({
        where: { produtoId_data: { produtoId, data: new Date(data) } },
        update: { saldo },
        create: { produtoId, data: new Date(data), saldo },
      });
      historicoCount++;
    }
  }
  console.log(`${historicoCount} saldos históricos de Renda Fixa importados (ago/2025–jun/2026).`);

  for (const item of FGTS_SEED) {
    const mesData = new Date(`${item.mes}-01`);
    await prisma.fgtsLancamento.upsert({
      where: { mes: mesData },
      update: { deposito: item.deposito, saldo: item.saldo },
      create: { mes: mesData, deposito: item.deposito, saldo: item.saldo },
    });
  }
  console.log(`${FGTS_SEED.length} lançamentos de FGTS importados (dez/2025–dez/2026).`);

  for (const item of FII_SEED) {
    const ativo = await prisma.fiiAtivo.upsert({
      where: { ticker: item.ticker },
      update: { segmento: item.segmento },
      create: { ticker: item.ticker, segmento: item.segmento },
    });

    const existing = await prisma.fiiAporte.findFirst({
      where: { ativoId: ativo.id, dataAporte: new Date(item.dataAporte), qtdeCotas: item.qtdeCotas },
    });
    if (!existing) {
      await prisma.fiiAporte.create({
        data: {
          ativoId: ativo.id,
          dataAporte: new Date(item.dataAporte),
          qtdeCotas: item.qtdeCotas,
          precoCompra: item.precoCompra,
          valorAportado: item.valorAportado,
        },
      });
    }
  }
  console.log(`${FII_SEED.length} aportes de FII importados.`);

  console.log(
    "Seed concluído. HGBS11 e KNHF11 apareciam na planilha sem dados completos de aporte — cadastre-os manualmente pela tela de FIIs."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
