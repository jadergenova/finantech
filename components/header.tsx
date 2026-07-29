"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header({
  userName,
  nomeSistema,
  logoBase64,
}: {
  userName: string;
  nomeSistema: string;
  logoBase64: string | null;
}) {
  return (
    <header
      className="h-14 border-b flex items-center justify-between px-4 sm:px-6"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <span className="font-semibold md:hidden flex items-center gap-2" style={{ color: "var(--bright)" }}>
        {logoBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoBase64} alt={nomeSistema} className="h-6 w-6 rounded object-contain" />
        ) : null}
        {nomeSistema}
      </span>
      <span className="hidden md:block text-sm" style={{ color: "var(--muted)" }}>
        Olá, {userName}
      </span>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/settings"
          className="hidden md:flex rounded-lg border p-1.5"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
          aria-label="Configurações"
        >
          <Settings size={16} />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg border px-3 py-1.5 text-sm flex items-center gap-1.5"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </header>
  );
}
