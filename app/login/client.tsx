"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (!res || res.error) {
      setError("E-mail ou senha inválidos");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border p-6"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <h1 className="text-xl font-bold mb-1" style={{ color: "var(--bright)" }}>
        FinanTech
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Entre para continuar
      </p>

      <label className="block text-sm mb-1" style={{ color: "var(--text)" }}>
        E-mail
      </label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm mb-4 border outline-none"
        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
      />

      <label className="block text-sm mb-1" style={{ color: "var(--text)" }}>
        Senha
      </label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm mb-4 border outline-none"
        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
      />

      {error && (
        <p className="text-sm mb-4" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
