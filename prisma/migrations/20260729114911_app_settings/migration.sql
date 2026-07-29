-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'current',
    "nome_sistema" TEXT NOT NULL DEFAULT 'FinanTech',
    "logo_base64" TEXT,
    "tema_preset" TEXT NOT NULL DEFAULT 'blue',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
