"use client";

import { useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, keyField, emptyMessage = "Nenhum registro encontrado." }: DataTableProps<T>) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div
      className="rounded-xl border overflow-hidden overflow-x-auto"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2.5 text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--muted)", textAlign: col.align ?? "left" }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row) => {
            const key = keyField(row);
            return (
              <tr
                key={key}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className="border-b last:border-b-0"
                style={{
                  background: hoveredKey === key ? "rgba(255,255,255,.02)" : "transparent",
                  borderColor: "var(--border)",
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 whitespace-nowrap" style={{ textAlign: col.align ?? "left" }}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  const color = active ? "var(--emerald)" : "var(--muted)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
