"use client";

import { ClipboardPaste } from "lucide-react";
import { parseTextoColado, type DadosColados } from "@/lib/paste-parser";

export function PasteFillButton({ onParsed }: { onParsed: (dados: DadosColados) => void }) {
  async function handleClick() {
    try {
      const texto = await navigator.clipboard.readText();
      if (!texto) return;
      onParsed(parseTextoColado(texto));
    } catch {
      // Área de transferência indisponível (permissão negada, contexto não seguro) — ignora silenciosamente.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border p-1.5"
      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      title="Colar da área de transferência"
      aria-label="Colar da área de transferência"
    >
      <ClipboardPaste size={14} />
    </button>
  );
}
