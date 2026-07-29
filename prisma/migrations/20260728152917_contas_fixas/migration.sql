-- CreateTable
CREATE TABLE "contas_fixas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contas_fixas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conta_fixa_lancamentos" (
    "id" TEXT NOT NULL,
    "conta_fixa_id" TEXT NOT NULL,
    "mes" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "data_pagamento" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conta_fixa_lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contas_fixas_nome_key" ON "contas_fixas"("nome");

-- CreateIndex
CREATE INDEX "conta_fixa_lancamentos_mes_idx" ON "conta_fixa_lancamentos"("mes");

-- CreateIndex
CREATE UNIQUE INDEX "conta_fixa_lancamentos_conta_fixa_id_mes_key" ON "conta_fixa_lancamentos"("conta_fixa_id", "mes");

-- AddForeignKey
ALTER TABLE "conta_fixa_lancamentos" ADD CONSTRAINT "conta_fixa_lancamentos_conta_fixa_id_fkey" FOREIGN KEY ("conta_fixa_id") REFERENCES "contas_fixas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
