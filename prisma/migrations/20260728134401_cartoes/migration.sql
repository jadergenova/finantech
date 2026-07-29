-- CreateTable
CREATE TABLE "cartoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartao_transacoes" (
    "id" TEXT NOT NULL,
    "cartao_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "parcela_atual" INTEGER,
    "parcela_total" INTEGER,
    "chave_dedup" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartao_transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cartoes_nome_key" ON "cartoes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "cartao_transacoes_chave_dedup_key" ON "cartao_transacoes"("chave_dedup");

-- CreateIndex
CREATE INDEX "cartao_transacoes_cartao_id_data_idx" ON "cartao_transacoes"("cartao_id", "data");

-- AddForeignKey
ALTER TABLE "cartao_transacoes" ADD CONSTRAINT "cartao_transacoes_cartao_id_fkey" FOREIGN KEY ("cartao_id") REFERENCES "cartoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
