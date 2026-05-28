"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { publicCopy } from "@/lib/copy";

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function ForgotPasswordForm() {
  const [cpf, setCpf] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/participant/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível iniciar tua recuperação.");
      return;
    }

    setMessage(data.message ?? publicCopy.forgotPassword.successMessage);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-2 block font-bold text-ink">CPF</span>
        <input
          value={cpf}
          onChange={(event) => setCpf(maskCpf(event.target.value))}
          required
          inputMode="numeric"
          className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
          placeholder="000.000.000-00"
        />
      </label>

      <p className="text-sm text-ink/60">{publicCopy.forgotPassword.emailHint}</p>

      {message ? <p className="rounded-2xl bg-teal/10 p-3 text-sm font-medium text-teal">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-wine/10 p-3 text-sm font-bold text-wine">{error}</p> : null}

      <PrimaryButton type="submit" disabled={loading} className="w-full">
        {loading ? publicCopy.forgotPassword.cpfSubmitLoading : publicCopy.forgotPassword.cpfSubmit}
      </PrimaryButton>

      <p className="text-center text-sm text-ink/65">
        <Link href="/login" className="font-semibold text-teal underline">
          {publicCopy.forgotPassword.backToLogin}
        </Link>
      </p>
    </form>
  );
}
