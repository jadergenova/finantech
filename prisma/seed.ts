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
