import { LoginForm } from "./client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <LoginForm />
    </div>
  );
}
