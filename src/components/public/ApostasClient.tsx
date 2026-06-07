"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { IncaLogo } from "@/components/public/IncaLogo";
import { ParticipantLogoutButton } from "@/components/public/ParticipantLogoutButton";
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

const awardsHighlights = [
  {
    title: "Combo FIL + Inca",
    description: "Na compra de uma cerveja FIL, você ganha uma Helles Inca.",
    note: "Consulte regras e disponibilidade diretamente no balcão."
  },
  {
    title: "Promo Trinca",
    description: "Na compra de uma trinca, ganhe 1 pint de cerveja FIL.",
    note: "Confirme a premiação no balcão antes do pedido."
  }
] as const;

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function getStatusPresentation(status: MatchStatus) {
  if (status === "available") {
    return {
      label: "Palpite aberto",
      disabled: false,
      className: "border border-teal/20 bg-teal/14 text-teal"
    };
  }

  return {
    label: "Palpite fechado",
    disabled: true,
    className: "border border-wine/18 bg-wine/12 text-wine"
  };
}

export function ApostasClient() {
  const router = useRouter();
  const [participantName, setParticipantName] = useState("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [showAwardsModal, setShowAwardsModal] = useState(false);

  useEffect(() => {
    setShowAwardsModal(true);
  }, []);

  useEffect(() => {
    if (!showAwardsModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAwardsModal]);

  useEffect(() => {
    async function loadData() {
      try {
        const meResponse = await fetch("/api/participant/me");
        if (meResponse.status === 401) {
          setAuthenticated(false);
          router.replace("/login");
          return;
        }

        const meData = await meResponse.json();
        setParticipantName(meData.name ?? "");

        const matchesResponse = await fetch("/api/matches");
        if (matchesResponse.status === 401) {
          setAuthenticated(false);
          router.replace("/login");
          return;
        }

        const data = await matchesResponse.json();
        setMatches(data.matches ?? []);
        if (!data.matches?.length) {
          setMessage(data.message ?? publicCopy.bets.noTodayMatches);
        } else if (data.message) {
          setMessage(data.message);
        }
      } catch {
        setError("Não deu pra carregar os jogos do dia. Tenta de novo.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router]);

  function closeAwardsModal() {
    setShowAwardsModal(false);
  }

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
      body: JSON.stringify({ bets })
    });
    const data = await response.json();
    setSubmitting(false);

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      setError(data.error ?? "Não deu pra registrar teus palpites.");
      return;
    }

    router.push("/sucesso");
  }

  if (loading) {
    return <StateMessage>{publicCopy.bets.emptyLoading}</StateMessage>;
  }

  if (!authenticated) {
    return (
      <StateMessage>
        {publicCopy.bets.needRegister}{" "}
        <Link href="/login" className="font-bold text-teal underline">
          {publicCopy.bets.goToRegister}
        </Link>
      </StateMessage>
    );
  }

  const availableCount = matches.filter((match) => match.status === "available").length;

  return (
    <>
      {showAwardsModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={closeAwardsModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="awards-modal-title"
            className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/95 p-6 text-center shadow-card sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="awards-modal-title" className="font-heading text-3xl font-bold text-ink sm:text-4xl">
              Premiações da Semana
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/72 sm:text-base">
              Confira os brindes disponíveis para os palpites dos jogos desta semana.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {awardsHighlights.map((award) => (
                <article
                  key={award.title}
                  className="rounded-[1.6rem] border border-teal/14 bg-field/80 p-5 text-left shadow-sm"
                >
                  <h3 className="font-heading text-2xl font-bold text-ink">{award.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80 sm:text-base">{award.description}</p>
                  <p className="mt-4 text-xs leading-relaxed text-ink/56">{award.note}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-teal/12 bg-white/75 px-4 py-3 text-sm leading-relaxed text-ink/64">
              As premiações podem variar conforme disponibilidade da semana.
            </div>

            <PrimaryButton type="button" onClick={closeAwardsModal} className="mx-auto mt-6 min-w-[180px]">
              Fechar
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal">
                {publicCopy.bets.greetingPrefix}, {participantName}
              </p>
              <h1 className="font-heading mt-3 text-3xl font-bold text-ink">{publicCopy.bets.title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-ink/70">{publicCopy.bets.subtitle}</p>
              <p className="mt-2 max-w-2xl text-[0.92rem] font-medium leading-relaxed text-[#b35b5b]">
                Apostas nos placares ficam liberadas até 30 minutos antes do início de cada jogo.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <ParticipantLogoutButton className="hidden sm:inline-flex" />
              <IncaLogo variant="hero" className="hidden sm:flex" priority />
            </div>
          </div>
          <ParticipantLogoutButton className="mt-4 sm:hidden" />
        </div>

        {message && matches.length ? <StateMessage>{message}</StateMessage> : null}
        {error ? <p className="rounded-2xl bg-wine/10 p-4 text-sm font-bold text-wine">{error}</p> : null}

        {!matches.length ? (
          <div className="rounded-3xl border border-teal/20 bg-white/80 p-5 text-sm leading-relaxed text-ink shadow-card backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p>{message || publicCopy.bets.noTodayMatches}</p>
              <Link
                href="/api/calendar"
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-5 py-3 text-center text-sm font-bold text-white shadow-card transition hover:brightness-110 md:shrink-0"
              >
                Veja o Calendário completo da Copa
              </Link>
            </div>
          </div>
        ) : null}
        {matches.length && !availableCount ? <StateMessage>{stateMessages.allDone}</StateMessage> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          {matches.map((match) => {
            const statusPresentation = getStatusPresentation(match.status);
            const disabled = statusPresentation.disabled;

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
                <p className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-bold ${statusPresentation.className}`}>
                  {statusPresentation.label}
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
    </>
  );
}
