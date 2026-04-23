"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";

type MatchStatus = "available" | "already_bet" | "closed";

type MatchItem = {
  id: string;
  groupName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  existingBet?: {
    homeScoreGuess: number;
    awayScoreGuess: number;
  } | null;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function statusLabel(status: MatchStatus) {
  if (status === "available") return "disponível para apostar";
  if (status === "already_bet") return "aposta já enviada";
  return "encerrado";
}

export function ApostasClient() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = window.localStorage.getItem("participantId") ?? "";
    const name = window.localStorage.getItem("participantName") ?? "";
    const previousMessage = window.sessionStorage.getItem("participantMessage") ?? "";
    window.sessionStorage.removeItem("participantMessage");
    setParticipantId(id);
    setParticipantName(name);
    setMessage(previousMessage);

    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`/api/matches?participantId=${encodeURIComponent(id)}`)
      .then((response) => response.json())
      .then((data) => {
        setMatches(data.matches ?? []);
        if (!data.matches?.length) {
          setMessage(data.message ?? "Hoje não há jogos disponíveis para aposta.");
        }
      })
      .catch(() => setError("Não foi possível carregar os jogos. Tente novamente."))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const bets = matches
      .filter((match) => match.status === "available")
      .map((match) => ({
        matchId: match.id,
        homeScoreGuess: scores[match.id]?.home,
        awayScoreGuess: scores[match.id]?.away
      }))
      .filter((bet) => bet.homeScoreGuess !== undefined && bet.homeScoreGuess !== "" && bet.awayScoreGuess !== undefined && bet.awayScoreGuess !== "");

    if (!bets.length) {
      setError("Você já realizou suas apostas disponíveis para hoje ou o prazo já foi encerrado.");
      return;
    }

    if (!window.confirm("Após clicar em OK não poderá ser alterada a sua aposta.")) {
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, bets })
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar sua aposta.");
      return;
    }

    router.push("/sucesso");
  }

  if (loading) {
    return <StateMessage>Carregando jogos disponíveis...</StateMessage>;
  }

  if (!participantId) {
    return (
      <StateMessage>
        Para apostar, faça seu cadastro primeiro.{" "}
        <Link href="/cadastro" className="font-bold text-leaf underline">
          Ir para cadastro
        </Link>
      </StateMessage>
    );
  }

  const availableCount = matches.filter((match) => match.status === "available").length;

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">Olá, {participantName}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Agora, faça a aposta nos seguintes jogos:</h1>
        <p className="mt-3 text-sm text-ink/70">Palpites são recreativos, sem vínculo financeiro, e não podem ser editados após envio.</p>
      </div>

      {message && matches.length ? <StateMessage>{message}</StateMessage> : null}
      {error ? <p className="rounded-2xl bg-clay/10 p-4 text-sm font-bold text-clay">{error}</p> : null}

      {!matches.length ? <StateMessage>{message || "Hoje não há jogos disponíveis para aposta."}</StateMessage> : null}
      {matches.length && !availableCount ? (
        <StateMessage>Você já realizou suas apostas disponíveis para hoje ou o prazo já foi encerrado.</StateMessage>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {matches.map((match) => {
          const disabled = match.status !== "available";
          return (
            <article key={match.id} className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="rounded-full bg-gold/25 px-3 py-1 font-bold text-leaf">{match.groupName}</span>
                <span className="font-bold text-ink/70">
                  {formatDate(match.matchDate)} às {match.matchTime}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <strong className="text-right text-lg">{match.homeTeam}</strong>
                <span className="text-ink/40">x</span>
                <strong className="text-lg">{match.awayTeam}</strong>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <input
                  disabled={disabled}
                  value={disabled ? match.existingBet?.homeScoreGuess ?? "" : scores[match.id]?.home ?? ""}
                  onChange={(event) =>
                    setScores((current) => ({ ...current, [match.id]: { ...current[match.id], home: event.target.value } }))
                  }
                  min={0}
                  max={99}
                  inputMode="numeric"
                  type="number"
                  className="h-16 w-full rounded-2xl border border-leaf/20 bg-field text-center text-3xl font-bold outline-none ring-leaf/30 focus:ring-4 disabled:opacity-60"
                  aria-label={`Placar ${match.homeTeam}`}
                />
                <span className="font-bold text-ink/40">x</span>
                <input
                  disabled={disabled}
                  value={disabled ? match.existingBet?.awayScoreGuess ?? "" : scores[match.id]?.away ?? ""}
                  onChange={(event) =>
                    setScores((current) => ({ ...current, [match.id]: { ...current[match.id], away: event.target.value } }))
                  }
                  min={0}
                  max={99}
                  inputMode="numeric"
                  type="number"
                  className="h-16 w-full rounded-2xl border border-leaf/20 bg-field text-center text-3xl font-bold outline-none ring-leaf/30 focus:ring-4 disabled:opacity-60"
                  aria-label={`Placar ${match.awayTeam}`}
                />
              </div>
              <p className="mt-4 rounded-2xl bg-ink/5 px-4 py-3 text-center text-sm font-bold text-ink/70">
                {match.status === "already_bet" ? "Sua aposta para este jogo já foi registrada." : statusLabel(match.status)}
              </p>
            </article>
          );
        })}

        {availableCount ? (
          <PrimaryButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Enviando..." : "Enviar aposta"}
          </PrimaryButton>
        ) : null}
      </form>
    </section>
  );
}
