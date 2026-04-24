"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { IncaLogo } from "@/components/public/IncaLogo";
import { publicCopy, stateMessages } from "@/lib/copy";

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
  if (status === "available") return publicCopy.bets.statusAvailable;
  if (status === "already_bet") return publicCopy.bets.statusAlreadyBet;
  return publicCopy.bets.statusClosed;
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
          setMessage(data.message ?? publicCopy.bets.noTodayMatches);
        }
      })
      .catch(() => setError("Não deu pra carregar os jogos do dia. Tenta de novo."))
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
      .filter(
        (bet) =>
          bet.homeScoreGuess !== undefined &&
          bet.homeScoreGuess !== "" &&
          bet.awayScoreGuess !== undefined &&
          bet.awayScoreGuess !== ""
      );

    if (!bets.length) {
      setError(stateMessages.allDone);
      return;
    }

    if (!window.confirm(publicCopy.bets.confirmation)) {
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
      setError(data.error ?? "Não deu pra registrar teus palpites.");
      return;
    }

    router.push("/sucesso");
  }

  if (loading) {
    return <StateMessage>{publicCopy.bets.emptyLoading}</StateMessage>;
  }

  if (!participantId) {
    return (
      <StateMessage>
        {publicCopy.bets.needRegister}{" "}
        <Link href="/cadastro" className="font-bold text-teal underline">
          {publicCopy.bets.goToRegister}
        </Link>
      </StateMessage>
    );
  }

  const availableCount = matches.filter((match) => match.status === "available").length;

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal">{publicCopy.bets.greetingPrefix}, {participantName}</p>
            <h1 className="font-heading mt-3 text-3xl font-bold text-ink">{publicCopy.bets.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-ink/70">{publicCopy.bets.subtitle}</p>
          </div>
          <IncaLogo variant="hero" className="hidden sm:flex" priority />
        </div>
      </div>

      {message && matches.length ? <StateMessage>{message}</StateMessage> : null}
      {error ? <p className="rounded-2xl bg-wine/10 p-4 text-sm font-bold text-wine">{error}</p> : null}

      {!matches.length ? <StateMessage>{message || publicCopy.bets.noTodayMatches}</StateMessage> : null}
      {matches.length && !availableCount ? <StateMessage>{stateMessages.allDone}</StateMessage> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {matches.map((match) => {
          const disabled = match.status !== "available";
          return (
            <article key={match.id} className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-card">
              <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-wine via-amber to-teal" />
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="rounded-full bg-teal/12 px-3 py-1 font-bold text-teal">{match.groupName}</span>
                <span className="font-bold text-ink/70">
                  {formatDate(match.matchDate)} às {match.matchTime}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <strong className="text-right text-lg">{match.homeTeam}</strong>
                <span className="text-xl font-bold text-amber">x</span>
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
                  className="h-16 w-full rounded-2xl border border-teal/20 bg-field text-center text-3xl font-bold outline-none ring-teal/30 focus:ring-4 disabled:opacity-60"
                  aria-label={`Placar ${match.homeTeam}`}
                />
                <span className="font-bold text-amber">x</span>
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
                  className="h-16 w-full rounded-2xl border border-teal/20 bg-field text-center text-3xl font-bold outline-none ring-teal/30 focus:ring-4 disabled:opacity-60"
                  aria-label={`Placar ${match.awayTeam}`}
                />
              </div>
              <p className="mt-4 rounded-2xl bg-navy/10 px-4 py-3 text-center text-sm font-bold text-ink/70">
                {match.status === "already_bet" ? stateMessages.alreadyRegistered : statusLabel(match.status)}
              </p>
            </article>
          );
        })}

        {availableCount ? (
          <PrimaryButton type="submit" disabled={submitting} className="w-full">
            {submitting ? publicCopy.bets.submitLoading : publicCopy.bets.submit}
          </PrimaryButton>
        ) : null}
      </form>
    </section>
  );
}
