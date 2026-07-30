-- CreateTable
CREATE TABLE "fgts_lancamentos" (
    "id" TEXT NOT NULL,
    "mes" DATE NOT NULL,
    "deposito" DECIMAL(12,2) NOT NULL,
    "saldo" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fgts_lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fgts_lancamentos_mes_key" ON "fgts_lancamentos"("mes");
