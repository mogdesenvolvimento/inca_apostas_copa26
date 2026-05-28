"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { publicCopy } from "@/lib/copy";

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed ? <path d="M4 4 20 20" /> : null}
    </svg>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/participant/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar tua nova senha.");
      return;
    }

    setMessage(data.message ?? publicCopy.resetPassword.successMessage);
    window.setTimeout(() => router.push("/login"), 1400);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-2 block font-bold text-ink">Senha</span>
        <div className="relative">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 pr-14 text-lg outline-none ring-teal/30 transition focus:ring-4"
            placeholder="Crie uma nova senha"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex w-14 cursor-pointer items-center justify-center text-ink/50 transition hover:text-ink"
          >
            <EyeIcon crossed={!showPassword} />
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block font-bold text-ink">Confirmar senha</span>
        <div className="relative">
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            type={showConfirmPassword ? "text" : "password"}
            className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 pr-14 text-lg outline-none ring-teal/30 transition focus:ring-4"
            placeholder="Repita a nova senha"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowConfirmPassword((current) => !current)}
            aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
            className="absolute inset-y-0 right-0 flex w-14 cursor-pointer items-center justify-center text-ink/50 transition hover:text-ink"
          >
            <EyeIcon crossed={!showConfirmPassword} />
          </button>
        </div>
      </label>

      {message ? <p className="rounded-2xl bg-teal/10 p-3 text-sm font-medium text-teal">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-wine/10 p-3 text-sm font-bold text-wine">{error}</p> : null}

      <PrimaryButton type="submit" disabled={loading} className="w-full">
        {loading ? publicCopy.resetPassword.submitLoading : publicCopy.resetPassword.submit}
      </PrimaryButton>

      <p className="text-center text-sm text-ink/65">
        <Link href="/login" className="font-semibold text-teal underline">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}
