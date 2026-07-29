import { getAppSettings } from "@/lib/app-settings";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  return <SettingsClient initialSettings={settings} />;
}
