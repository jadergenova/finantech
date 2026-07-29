export interface ThemePreset {
  id: string;
  label: string;
  accent: string;
  accent2: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "blue", label: "Azul", accent: "#3b82f6", accent2: "#60a5fa" },
  { id: "violet", label: "Violeta", accent: "#8b5cf6", accent2: "#a78bfa" },
  { id: "emerald", label: "Esmeralda", accent: "#10b981", accent2: "#34d399" },
  { id: "amber", label: "Âmbar", accent: "#f59e0b", accent2: "#fbbf24" },
  { id: "pink", label: "Rosa", accent: "#ec4899", accent2: "#f472b6" },
  { id: "cyan", label: "Ciano", accent: "#06b6d4", accent2: "#22d3ee" },
  { id: "orange", label: "Laranja", accent: "#f97316", accent2: "#fb923c" },
  { id: "red", label: "Vermelho", accent: "#ef4444", accent2: "#f87171" },
];

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}
