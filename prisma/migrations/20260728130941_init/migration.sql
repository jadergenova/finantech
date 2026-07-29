-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instituicoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instituicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renda_fixa_produtos" (
    "id" TEXT NOT NULL,
    "instituicao_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "indexador" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "renda_fixa_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renda_fixa_saldos_diarios" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "saldo" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "renda_fixa_saldos_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fii_ativos" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "nome" TEXT,
    "segmento" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fii_ativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fii_aportes" (
    "id" TEXT NOT NULL,
    "ativo_id" TEXT NOT NULL,
    "data_aporte" DATE NOT NULL,
    "qtde_cotas" DECIMAL(12,4) NOT NULL,
    "preco_compra" DECIMAL(10,2) NOT NULL,
    "valor_aportado" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fii_aportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fii_cotacoes" (
    "id" TEXT NOT NULL,
    "ativo_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "dy_mes" DECIMAL(6,4),
    "fonte" TEXT NOT NULL DEFAULT 'brapi',

    CONSTRAINT "fii_cotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxas_mercado" (
    "id" TEXT NOT NULL,
    "indice" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(8,4) NOT NULL,

    CONSTRAINT "taxas_mercado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "instituicoes_nome_key" ON "instituicoes"("nome");

-- CreateIndex
CREATE INDEX "renda_fixa_produtos_instituicao_id_idx" ON "renda_fixa_produtos"("instituicao_id");

-- CreateIndex
CREATE UNIQUE INDEX "renda_fixa_produtos_instituicao_id_nome_key" ON "renda_fixa_produtos"("instituicao_id", "nome");

-- CreateIndex
CREATE INDEX "renda_fixa_saldos_diarios_data_idx" ON "renda_fixa_saldos_diarios"("data");

-- CreateIndex
CREATE UNIQUE INDEX "renda_fixa_saldos_diarios_produto_id_data_key" ON "renda_fixa_saldos_diarios"("produto_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "fii_ativos_ticker_key" ON "fii_ativos"("ticker");

-- CreateIndex
CREATE INDEX "fii_aportes_ativo_id_idx" ON "fii_aportes"("ativo_id");

-- CreateIndex
CREATE UNIQUE INDEX "fii_cotacoes_ativo_id_data_key" ON "fii_cotacoes"("ativo_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "taxas_mercado_indice_data_key" ON "taxas_mercado"("indice", "data");

-- AddForeignKey
ALTER TABLE "renda_fixa_produtos" ADD CONSTRAINT "renda_fixa_produtos_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renda_fixa_saldos_diarios" ADD CONSTRAINT "renda_fixa_saldos_diarios_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "renda_fixa_produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fii_aportes" ADD CONSTRAINT "fii_aportes_ativo_id_fkey" FOREIGN KEY ("ativo_id") REFERENCES "fii_ativos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fii_cotacoes" ADD CONSTRAINT "fii_cotacoes_ativo_id_fkey" FOREIGN KEY ("ativo_id") REFERENCES "fii_ativos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
