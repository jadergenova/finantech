"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ nomeSistema, logoBase64 }: { nomeSistema: string; logoBase64: string | null }) {
  const pathname = usePathname();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <aside
      className="w-52 flex-shrink-0 border-r hidden md:flex md:flex-col"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b" style={{ borderColor: "var(--border)" }}>
        {logoBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoBase64} alt={nomeSistema} className="h-7 w-7 rounded object-contain" />
        ) : null}
        <span className="font-bold text-lg truncate" style={{ color: "var(--bright)" }}>
          {nomeSistema}
        </span>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "transparent",
                color: active ? "var(--accent2)" : "var(--muted)",
                background: active ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="py-2 border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 transition-colors"
          style={{
            borderColor: settingsActive ? "var(--accent)" : "transparent",
            color: settingsActive ? "var(--accent2)" : "var(--muted)",
            background: settingsActive ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
          }}
        >
          <Settings size={18} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
