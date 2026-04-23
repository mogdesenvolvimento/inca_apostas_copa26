"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { adminCopy } from "@/lib/copy";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Credenciais inválidas.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-2 block font-bold">{adminCopy.login.emailLabel}</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="w-full rounded-2xl border border-leaf/20 bg-field px-4 py-3 outline-none ring-leaf/30 focus:ring-4"
          placeholder={adminCopy.login.emailPlaceholder}
        />
      </label>
      <label className="block">
        <span className="mb-2 block font-bold">{adminCopy.login.passwordLabel}</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          className="w-full rounded-2xl border border-leaf/20 bg-field px-4 py-3 outline-none ring-leaf/30 focus:ring-4"
          placeholder={adminCopy.login.passwordPlaceholder}
        />
      </label>
      {error ? <p className="rounded-2xl bg-clay/10 p-3 text-sm font-bold text-clay">{error}</p> : null}
      <PrimaryButton type="submit" disabled={loading} className="w-full">
        {loading ? adminCopy.login.submitLoading : adminCopy.login.submit}
      </PrimaryButton>
    </form>
  );
}
