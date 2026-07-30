"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Field, Input } from "@/components/ui/form-field";
import { THEME_PRESETS } from "@/lib/theme-presets";

interface Settings {
  nomeSistema: string;
  logoBase64: string | null;
  temaPreset: string;
}

export function SettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const router = useRouter();
  const [nomeSistema, setNomeSistema] = useState(initialSettings.nomeSistema);
  const [logoBase64, setLogoBase64] = useState(initialSettings.logoBase64);
  const [temaPreset, setTemaPreset] = useState(initialSettings.temaPreset);
  const [savedMsg, setSavedMsg] = useState("");

  async function salvar(patch: Partial<Settings>) {
    setSavedMsg("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setSavedMsg("Salvo!");
      router.refresh();
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoBase64(base64);
      salvar({ logoBase64: base64 });
    };
    reader.readAsDataURL(file);
  }

  async function handleTemaClick(id: string) {
    setTemaPreset(id);
    await salvar({ temaPreset: id });
  }

  async function handleNomeBlur() {
    if (nomeSistema !== initialSettings.nomeSistema) await salvar({ nomeSistema });
  }

  return (
    <div>
      <PageHeader title="Configurações" description="Nome, logo e tema do sistema" />

      <div className="max-w-lg space-y-6">
        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Field label="Nome do sistema">
            <Input value={nomeSistema} onChange={(e) => setNomeSistema(e.target.value)} onBlur={handleNomeBlur} />
          </Field>

          <Field label="Logo">
            <div className="flex items-center gap-3">
              {logoBase64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoBase64}
                  alt="Logo"
                  className="h-10 w-10 rounded object-contain"
                  style={{ background: "var(--surface2)" }}
                />
              )}
              <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" style={{ color: "var(--text)" }} />
            </div>
          </Field>
        </div>

        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--text)" }}>
            Tema
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleTemaClick(preset.id)}
                className="rounded-lg p-3 border flex flex-col items-center gap-2 text-xs"
                style={{
                  borderColor: temaPreset === preset.id ? preset.accent : "var(--border)",
                  borderWidth: temaPreset === preset.id ? 2 : 1,
                  color: "var(--text)",
                }}
              >
                <span className="w-6 h-6 rounded-full" style={{ background: preset.accent }} />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {savedMsg && (
          <p className="text-sm" style={{ color: "var(--emerald)" }}>
            {savedMsg}
          </p>
        )}
      </div>
    </div>
  );
}
