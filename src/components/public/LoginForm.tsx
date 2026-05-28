"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { publicCopy } from "@/lib/copy";

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function LoginForm() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/participant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, password })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível fazer teu acesso.");
      return;
    }

    router.push("/apostas");
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
      <label className="block">
        <span className="mb-2 block font-bold text-ink">Senha</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          type="password"
          className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
          placeholder="Sua senha"
        />
      </label>
      {error ? <p className="rounded-2xl bg-wine/10 p-3 text-sm font-bold text-wine">{error}</p> : null}
      <PrimaryButton type="submit" disabled={loading} className="w-full">
        {loading ? publicCopy.login.submitLoading : publicCopy.login.submit}
      </PrimaryButton>
      <div className="flex items-center justify-center gap-4 text-sm text-ink/65">
        <Link href="/cadastro" className="font-semibold text-teal underline">
          {publicCopy.login.alternateCta}
        </Link>
        <Link href="/esqueci-senha" className="font-semibold text-teal underline">
          {publicCopy.login.forgotPasswordCta}
        </Link>
      </div>
    </form>
  );
}
