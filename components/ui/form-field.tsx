"use client";

import { forwardRef } from "react";

export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1" style={{ color: "var(--text)" }}>
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function Input({ error, className, style, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg px-3 py-2.5 text-sm border outline-none ${className ?? ""}`}
      style={{
        borderColor: error ? "var(--red)" : "var(--border)",
        background: "var(--bg)",
        color: "var(--text)",
        ...style,
      }}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
>(function Select({ error, className, style, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg px-3 py-2.5 text-sm border outline-none ${className ?? ""}`}
      style={{
        borderColor: error ? "var(--red)" : "var(--border)",
        background: "var(--bg)",
        color: "var(--text)",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
});

type BtnVariant = "primary" | "ghost" | "danger";

export function Btn({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
    ghost: { background: "transparent", color: "var(--text)", borderColor: "var(--border)" },
    danger: { background: "rgba(239,68,68,.1)", color: "var(--red)", borderColor: "rgba(239,68,68,.3)" },
  };
  return (
    <button
      disabled={disabled || loading}
      className={`rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity ${className ?? ""}`}
      style={styles[variant]}
      {...props}
    >
      {loading ? <span className="inline-block animate-spin">⟳</span> : children}
    </button>
  );
}
