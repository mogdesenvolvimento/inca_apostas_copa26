"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { publicCopy } from "@/lib/copy";

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function CadastroForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível continuar.");
      return;
    }

    window.localStorage.setItem("participantId", data.participant.id);
    window.localStorage.setItem("participantName", data.participant.name);
    if (data.message) {
      window.sessionStorage.setItem("participantMessage", data.message);
    }

    router.push("/apostas");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-2 block font-bold text-ink">Seu nome</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
          placeholder="Como você quer aparecer na torcida"
        />
      </label>
      <label className="block">
        <span className="mb-2 block font-bold text-ink">Telefone celular</span>
        <input
          value={phone}
          onChange={(event) => setPhone(maskPhone(event.target.value))}
          required
          inputMode="tel"
          className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
          placeholder="(11) 99999-9999"
        />
      </label>
      {error ? <p className="rounded-2xl bg-wine/10 p-3 text-sm font-bold text-wine">{error}</p> : null}
      <PrimaryButton type="submit" disabled={loading} className="w-full">
        {loading ? "Liberando seus jogos..." : publicCopy.home.cta}
      </PrimaryButton>
    </form>
  );
}
