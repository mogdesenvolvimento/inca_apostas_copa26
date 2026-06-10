"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  initialHomeScore: number | null;
  initialAwayScore: number | null;
};

export function AdminMatchResultForm({
  matchId,
  homeTeam,
  awayTeam,
  initialHomeScore,
  initialAwayScore
}: Props) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(initialHomeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(initialAwayScore?.toString() ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (homeScore === "" || awayScore === "") {
      setError("Informe os dois placares oficiais.");
      return;
    }

    setSubmitting(true);
    const response = await fetch(`/api/admin/matches/${encodeURIComponent(matchId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        officialScoreHome: Number(homeScore),
        officialScoreAway: Number(awayScore)
      })
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar o resultado oficial.");
      return;
    }

    setMessage(data.message ?? "Resultado oficial salvo com sucesso.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[1.75rem] bg-white/85 p-6 shadow-card">
      <div>
        <h2 className="font-heading text-2xl font-bold text-ink">Resultado oficial</h2>
        <p className="mt-2 text-sm text-ink/65">
          Informe o placar final para apurar automaticamente quem acertou o resultado deste jogo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="space-y-2">
          <span className="block text-sm font-bold text-ink">{homeTeam}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
            className="h-14 w-full rounded-2xl border border-ink/10 bg-field px-4 text-lg font-bold text-ink outline-none ring-teal/20 focus:ring-4"
          />
        </label>
        <span className="pb-4 text-center text-2xl font-bold text-amber">x</span>
        <label className="space-y-2">
          <span className="block text-sm font-bold text-ink">{awayTeam}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            className="h-14 w-full rounded-2xl border border-ink/10 bg-field px-4 text-lg font-bold text-ink outline-none ring-teal/20 focus:ring-4"
          />
        </label>
      </div>

      {message ? <p className="rounded-2xl bg-leaf/12 px-4 py-3 text-sm font-bold text-leaf">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-wine/10 px-4 py-3 text-sm font-bold text-wine">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-2xl bg-leaf px-5 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-70"
      >
        {submitting ? "Salvando..." : "Salvar resultado oficial"}
      </button>
    </form>
  );
}
