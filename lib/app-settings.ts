import { prisma } from "@/lib/prisma";

export interface AppSettingsData {
  nomeSistema: string;
  logoBase64: string | null;
  temaPreset: string;
}

const DEFAULT_SETTINGS: AppSettingsData = {
  nomeSistema: "FinanTech",
  logoBase64: null,
  temaPreset: "blue",
};

/**
 * Chamada a partir do layout raiz — precisa de fallback seguro porque o passo de
 * build do Railway roda isolado da rede privada do Postgres (mesmo gotcha do
 * lib/studio-settings.ts do beauty-tech).
 */
export async function getAppSettings(): Promise<AppSettingsData> {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: "current" } });
    return settings ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
