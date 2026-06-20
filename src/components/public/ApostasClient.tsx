"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { IncaLogo } from "@/components/public/IncaLogo";
import { ParticipantLogoutButton } from "@/components/public/ParticipantLogoutButton";
import { publicCopy, stateMessages } from "@/lib/copy";

type MatchStatus = "available" | "already_bet" | "closed";

type MatchFilters = {
  date: string;
  group: string;
};

type MatchItem = {
  id: string;
  groupName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  timezoneNotice?: string | null;
  timezoneDisplay?: {
    localLabel: string;
    brasiliaLabel: string;
  } | null;
  existingBet?: {
    homeScoreGuess: number;
    awayScoreGuess: number;
  } | null;
};

type ClassificationSummary = {
  position: number;
  correctCount: number;
  top3Distance: number;
  leaderDistance: number;
  progressPercent: number;
  totalResultsCount: number;
  leaderCount: number;
};

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

function formatMissingAccertos(value: number) {
  if (value <= 0) {
    return "";
  }

  return value === 1 ? "Falta 1 acerto" : `Faltam ${value} acertos`;
}

export function ApostasClient() {
  const router = useRouter();
  const closeClassificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [showAwardsModal, setShowAwardsModal] = useState(false);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [classificationSummary, setClassificationSummary] = useState<ClassificationSummary | null>(null);
  const [classificationAvailable, setClassificationAvailable] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<MatchFilters>({ date: "", group: "" });
  const [dateInputType, setDateInputType] = useState<"text" | "date">("text");

  useEffect(() => {
    setShowAwardsModal(true);
  }, []);

  useEffect(() => {
    if (!showClassificationModal) {
      return;
    }

    closeClassificationButtonRef.current?.focus();
  }, [showClassificationModal]);

  useEffect(() => {
    if (!showClassificationModal) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowClassificationModal(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showClassificationModal]);

  useEffect(() => {
    if (!showAwardsModal && !showClassificationModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAwardsModal, showClassificationModal]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const meResponse = await fetch("/api/participant/me");
        if (meResponse.status === 401) {
          setAuthenticated(false);
          router.replace("/login");
          return;
        }

        const meData = await meResponse.json();
        setParticipantName(meData.name ?? "");

        const query = new URLSearchParams();
        if (appliedFilters.date) {
          query.set("date", appliedFilters.date);
        }
        if (appliedFilters.group) {
          query.set("group", appliedFilters.group);
        }

        const [matchesResponse, rankingResponse] = await Promise.all([
          fetch(`/api/matches${query.toString() ? `?${query.toString()}` : ""}`),
          fetch("/api/participant/ranking")
        ]);

        if (matchesResponse.status === 401 || rankingResponse.status === 401) {
          setAuthenticated(false);
          router.replace("/login");
          return;
        }

        const matchesData = await matchesResponse.json();
        setMatches(matchesData.matches ?? []);
        setGroups(matchesData.groups ?? []);
        setFiltersApplied(Boolean(matchesData.filtered));

        if (!matchesData.matches?.length) {
          setMessage(matchesData.message ?? publicCopy.bets.noTodayMatches);
        } else {
          setMessage(matchesData.message ?? "");
        }

        if (rankingResponse.ok) {
          const rankingData = await rankingResponse.json();
          setClassificationSummary(rankingData.summary ?? null);
          setClassificationAvailable(Boolean(rankingData.available && rankingData.summary));
        } else {
          setClassificationSummary(null);
          setClassificationAvailable(false);
        }
      } catch {
        setError("Não deu pra carregar os dados da tua rodada. Tenta de novo.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router, appliedFilters]);

  const availableCount = matches.filter((match) => match.status === "available").length;
  const allTodayAlreadyBet = matches.length > 0 && matches.every((match) => match.status === "already_bet");

  const classificationTop3Text = useMemo(() => {
    if (!classificationSummary) {
      return "";
    }

    if (classificationSummary.position <= 3) {
      return "Você já está no Top 3";
    }

    return formatMissingAccertos(classificationSummary.top3Distance);
  }, [classificationSummary]);

  const classificationLeaderText = useMemo(() => {
    if (!classificationSummary) {
      return "";
    }

    if (classificationSummary.position === 1) {
      return classificationSummary.leaderCount > 1 ? "Empatado na liderança" : "Você é o líder atual";
    }

    return formatMissingAccertos(classificationSummary.leaderDistance);
  }, [classificationSummary]);

  const classificationStatusText = useMemo(() => {
    if (!classificationSummary) {
      return "";
    }

    if (classificationSummary.position === 1) {
      return "👑 Você está liderando o ranking atual.";
    }

    if (classificationSummary.position <= 3) {
      return "🚀 Você está entre os melhores participantes.";
    }

    return `📈 ${formatMissingAccertos(classificationSummary.top3Distance)} para entrar no Top 3.`;
  }, [classificationSummary]);

  function closeAwardsModal() {
    setShowAwardsModal(false);
  }

  function closeClassificationModal() {
    setShowClassificationModal(false);
  }

  function onFilterSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setScores({});
    setAppliedFilters({
      date: filterDate,
      group: filterGroup
    });
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
      setError("Preenche ao menos um placar para enviar teu palpite.");
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
            aria-label="Premiações da semana"
            className="max-h-[92vh] w-[92vw] max-w-3xl overflow-y-auto rounded-[2rem] border border-white/70 bg-white/95 p-4 shadow-card sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-2 text-center sm:px-4">
              <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">Quem acerta mais, ganha!</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink/72 sm:text-base">
                Faça seus palpites e concorra aos prêmios da fase.
              </p>
            </div>

            <div className="mx-auto mt-5 w-full max-w-[520px] overflow-hidden rounded-[1.5rem]">
              <Image
                src="/assets/awards-modal-2026-06-10.jpeg"
                alt="Premiações da fase de grupos da Copa Inca"
                width={1080}
                height={1440}
                priority
                className="mx-auto block h-auto w-full max-w-[520px]"
              />
            </div>

            <div className="mt-5 flex justify-center">
              <PrimaryButton type="button" onClick={closeAwardsModal} className="min-w-[180px]">
                Fechar
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      {showClassificationModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/58 px-4 py-6 backdrop-blur-[4px]"
          onClick={closeClassificationModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Minha Classificação"
            className="w-[92vw] max-w-md rounded-[1.75rem] border border-[#ead7b7] bg-[#f7ead6] p-5 shadow-[0_18px_45px_rgba(31,42,55,0.18)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-ink">🏆 Minha Classificação</h2>
                <p className="mt-1 text-sm text-ink/60">Desempenho atual na rodada</p>
              </div>
              <button
                ref={closeClassificationButtonRef}
                type="button"
                onClick={closeClassificationModal}
                aria-label="Fechar modal de classificação"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-lg font-bold text-ink/70 shadow-sm transition hover:bg-white/90"
              >
                ×
              </button>
            </div>

            {classificationAvailable && classificationSummary ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="rounded-[1.5rem] bg-white px-5 py-5 shadow-sm">
                  <p className="font-heading text-[clamp(32px,7vw,42px)] font-bold leading-none text-ink">
                    #{classificationSummary.position}º Lugar
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-sm">
                  <p className="text-lg font-bold text-ink">
                    ✅ {classificationSummary.correctCount}{" "}
                    {classificationSummary.correctCount === 1 ? "Acerto" : "Acertos"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm font-semibold text-ink/62">🥉 Para entrar no Top 3</p>
                    <p className="mt-2 text-base font-bold text-ink">{classificationTop3Text}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm font-semibold text-ink/62">🥇 Para assumir a liderança</p>
                    <p className="mt-2 text-base font-bold text-ink">{classificationLeaderText}</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-ink/62">📊 Desempenho da Rodada</p>
                  <p className="mt-2 text-sm text-ink/72">
                    {classificationSummary.correctCount} de {classificationSummary.totalResultsCount}{" "}
                    {classificationSummary.totalResultsCount === 1 ? "resultado acertado" : "resultados acertados"}
                  </p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-page/95">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-wine via-clay to-amber transition-[width]"
                      style={{ width: `${classificationSummary.progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold text-ink/72">{classificationSummary.progressPercent}%</p>
                </div>

                <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold leading-relaxed text-ink">{classificationStatusText}</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] bg-white px-5 py-6 text-center text-sm leading-relaxed text-ink/72 shadow-sm">
                Sua classificação ainda não está disponível nesta rodada.
              </div>
            )}
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
              <h1 className="mt-3 font-heading text-3xl font-bold text-ink">{publicCopy.bets.title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-ink/70">{publicCopy.bets.subtitle}</p>
              <p className="mt-2 max-w-2xl text-[0.92rem] font-medium leading-relaxed text-[#b35b5b]">
                Apostas nos placares ficam liberadas até 10 minutos antes do início de cada jogo.
              </p>
              <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                <a
                  href="https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/copa-mundo-2026-tabela-jogos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-teal/18 bg-white/82 px-6 py-3 text-center text-sm font-bold text-teal shadow-card transition hover:bg-teal/5 sm:w-auto"
                >
                  Veja tabela oficial da FIFA
                </a>
                <PrimaryButton
                  type="button"
                  onClick={() => setShowClassificationModal(true)}
                  className="w-full sm:w-auto lg:hidden"
                >
                  🏆 Ver Minha Classificação
                </PrimaryButton>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <ParticipantLogoutButton className="hidden sm:inline-flex" />
              <IncaLogo variant="hero" className="hidden sm:flex" priority />
              <PrimaryButton
                type="button"
                onClick={() => setShowClassificationModal(true)}
                className="hidden w-full max-w-[260px] self-end lg:inline-flex"
              >
                🏆 Ver Minha Classificação
              </PrimaryButton>
            </div>
          </div>
          <ParticipantLogoutButton className="mt-4 sm:hidden" />
        </div>

        <form
          onSubmit={onFilterSubmit}
          className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/86 p-4 shadow-card md:grid-cols-[1fr_1fr_auto]"
        >
          <div className="md:col-span-full">
            <p className="text-sm font-semibold text-ink/72">Pesquise os jogos por data ou grupo</p>
          </div>
          <input
            type={dateInputType}
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
            onFocus={() => setDateInputType("date")}
            onBlur={() => {
              if (!filterDate) {
                setDateInputType("text");
              }
            }}
            placeholder="dd/mm/aaaa"
            aria-label="Filtrar jogos por data"
            className="min-w-0 w-full rounded-2xl border border-ink/10 bg-field px-4 py-3"
          />
          <select
            value={filterGroup}
            onChange={(event) => setFilterGroup(event.target.value)}
            className="min-w-0 w-full rounded-2xl border border-ink/10 bg-field px-4 py-3"
          >
            <option value="">Todos os grupos</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <PrimaryButton type="submit" className="w-full md:w-auto" disabled={loading}>
            Filtrar
          </PrimaryButton>
        </form>

        {message && matches.length ? <StateMessage>{message}</StateMessage> : null}
        {error ? <p className="rounded-2xl bg-wine/10 p-4 text-sm font-bold text-wine">{error}</p> : null}

        {!matches.length ? (
          <div className="rounded-3xl border border-teal/20 bg-white/80 p-5 text-sm leading-relaxed text-ink shadow-card backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p>{message || publicCopy.bets.noTodayMatches}</p>
              {!filtersApplied ? (
                <Link
                  href="/api/calendar"
                  target="_blank"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-5 py-3 text-center text-sm font-bold text-white shadow-card transition hover:brightness-110 md:shrink-0"
                >
                  Veja o Calendário completo da Copa
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        {allTodayAlreadyBet && !filtersApplied ? <StateMessage>{stateMessages.allDone}</StateMessage> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          {matches.map((match) => {
            const statusPresentation = getStatusPresentation(match.status);
            const disabled = statusPresentation.disabled;

            return (
              <article
                key={match.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-card"
              >
                <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-wine via-amber to-teal" />
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="rounded-full bg-teal/12 px-3 py-1 font-bold text-teal">{match.groupName}</span>
                  {match.timezoneDisplay ? (
                    <div className="text-right text-xs font-bold leading-relaxed text-ink/70 sm:text-sm">
                      <p>{match.timezoneDisplay.localLabel}</p>
                      <p>{match.timezoneDisplay.brasiliaLabel}</p>
                    </div>
                  ) : (
                    <span className="font-bold text-ink/70">
                      {formatDate(match.matchDate)} às {match.matchTime}
                    </span>
                  )}
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
                      setScores((current) => ({
                        ...current,
                        [match.id]: { ...current[match.id], home: event.target.value }
                      }))
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
                      setScores((current) => ({
                        ...current,
                        [match.id]: { ...current[match.id], away: event.target.value }
                      }))
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
                {match.timezoneNotice ? (
                  <p className="mt-3 rounded-2xl border border-teal/12 bg-teal/8 px-4 py-3 text-center text-xs leading-relaxed text-ink/70">
                    {match.timezoneNotice}
                  </p>
                ) : null}
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
