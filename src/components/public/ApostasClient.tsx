"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ParticipantLogoutButton } from "@/components/public/ParticipantLogoutButton";
import { publicCopy } from "@/lib/copy";

type ParticipantResponse = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string | null;
  registrationCode: string;
};

type ExistingBet = {
  id: string;
  homeScoreGuess: number;
  awayScoreGuess: number;
  goesToPenalties?: boolean;
  penaltyWinnerSide?: "home" | "away" | null;
};

type MatchResponse = {
  id: string;
  stage?: string | null;
  groupName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: string;
  awayTeam: string;
  status: "available" | "already_bet" | "closed";
  existingBet: ExistingBet | null;
  timezoneNotice: string | null;
  timezoneDisplay: {
    localLabel: string;
    brasiliaLabel: string;
  } | null;
};

type MatchesResponse = {
  today: string;
  displayDate: string;
  filtered: boolean;
  groups: string[];
  message: string | null;
  matches: MatchResponse[];
};

type ClassificationSummary = {
  position: number | null;
  inRanking: boolean;
  correctCount: number;
  top3Distance: number;
  leaderDistance: number;
  progressPercent: number;
  totalResultsCount: number;
  leaderCount: number;
};

type ClassificationPhaseSummary = {
  stage: string | null;
  stageLabel: string;
  available: boolean;
  summary: ClassificationSummary | null;
};

type RankingResponse = {
  available: boolean;
  stage: string | null;
  stageLabel: string;
  summary: ClassificationSummary | null;
  phases: ClassificationPhaseSummary[];
};

const EMPTY_SCORE = "";

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatFilterDateValue(value: string) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function formatClassificationDistance(value: number) {
  if (value <= 0) {
    return "Você já alcançou esta faixa";
  }

  return value === 1 ? "Falta 1 acerto" : `Faltam ${value} acertos`;
}

function ClassificationModalPhaseContent({
  classificationAvailable,
  classificationSummary,
  classificationStage,
  classificationStageLabel,
  classificationTop3Text,
  classificationLeaderText,
  classificationProgressText,
  classificationStatusText,
  classificationPhaseCards,
  currentClassificationPhase,
  noRankingYetText
}: {
  classificationAvailable: boolean;
  classificationSummary: ClassificationSummary | null;
  classificationStage: string | null;
  classificationStageLabel: string;
  classificationTop3Text: string;
  classificationLeaderText: string;
  classificationProgressText: string;
  classificationStatusText: string;
  classificationPhaseCards: Array<ClassificationPhaseSummary & { isCurrent: boolean }>;
  currentClassificationPhase: (ClassificationPhaseSummary & { isCurrent: boolean }) | null;
  noRankingYetText: string;
}) {
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Fase em apuracao</p>
        <p className="mt-2 font-heading text-[clamp(1.15rem,3vw,1.5rem)] font-bold text-ink">
          {currentClassificationPhase?.stageLabel ??
            classificationPhaseCards.find((phase) => phase.stage === classificationStage)?.stageLabel ??
            classificationStageLabel}
        </p>
      </div>

      {classificationAvailable && classificationSummary ? (
        <>
          <div className="rounded-[1.45rem] bg-white px-5 py-5 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
            <p className="font-heading text-[clamp(2rem,6vw,3.25rem)] font-bold leading-none text-ink">
              {classificationSummary.inRanking && classificationSummary.position !== null
                ? `#${classificationSummary.position}o Lugar`
                : "Fora do ranking"}
            </p>
          </div>

          <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
            <p className="text-lg font-semibold text-ink">
              {classificationSummary.correctCount} {classificationSummary.correctCount === 1 ? "Acerto" : "Acertos"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
              <p className="text-sm font-semibold text-ink">Para entrar no Top 3</p>
              <p className="mt-2 text-base font-bold text-ink">{classificationTop3Text}</p>
            </div>

            <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
              <p className="text-sm font-semibold text-ink">Para assumir a lideranca</p>
              <p className="mt-2 text-base font-bold text-ink">{classificationLeaderText}</p>
            </div>
          </div>

          <div className="rounded-[1.35rem] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
            <div className="text-center">
              <p className="text-sm font-semibold text-ink">Desempenho da rodada</p>
              <p className="mt-2 text-sm text-ink/70">{classificationProgressText}</p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E7DABF]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-wine via-clay to-amber transition-[width] duration-500"
                style={{ width: `${classificationSummary.progressPercent}%` }}
              />
            </div>

            <p className="mt-3 text-center text-sm font-semibold text-ink/72">
              {classificationSummary.progressPercent}%
            </p>
          </div>

          <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
            <p className="text-sm font-medium leading-relaxed text-ink">{classificationStatusText}</p>
          </div>
        </>
      ) : (
        <div className="rounded-[1.35rem] bg-white px-5 py-6 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
          <p className="text-base leading-relaxed text-ink">{noRankingYetText}</p>
        </div>
      )}

      {classificationPhaseCards.length ? (
        <div className="rounded-[1.35rem] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">Resultados por fase</p>
            <p className="mt-1 text-sm text-ink/70">Seu desempenho fica separado em cada etapa da competicao.</p>
          </div>

          <div className="mt-4 space-y-3">
            {classificationPhaseCards.map((phase, index) => (
              <details
                key={phase.stage ?? phase.stageLabel}
                className={`group overflow-hidden rounded-[1.15rem] border ${
                  phase.isCurrent ? "border-[#E7DABF] bg-[#FCF7EC]" : "border-[#EFE4CB] bg-[#FFFDFC]"
                }`}
                open={phase.isCurrent || index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:hidden">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink">{phase.stageLabel}</p>
                    <p className="mt-1 text-sm text-ink/70">
                      {phase.available && phase.summary
                        ? `${phase.summary.correctCount} ${
                            phase.summary.correctCount === 1 ? "acerto" : "acertos"
                          } nesta fase`
                        : "Aguardando resultados oficiais desta fase"}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7DABF] bg-white text-xl font-bold text-ink">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">-</span>
                  </span>
                </summary>

                <div className="border-t border-[#EFE4CB] px-4 py-4 text-left">
                  <p className="text-base font-bold text-ink">
                    {phase.available && phase.summary
                      ? phase.summary.inRanking && phase.summary.position !== null
                        ? `#${phase.summary.position}o lugar`
                        : "Fora do ranking"
                      : "Sem classificacao"}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-ink/72">
                    {phase.available && phase.summary
                      ? `${phase.summary.correctCount} ${
                          phase.summary.correctCount === 1 ? "resultado acertado" : "resultados acertados"
                        } nesta fase.`
                      : "Aguardando resultados oficiais para exibir sua posicao nesta fase."}
                  </p>

                  {phase.isCurrent ? (
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-teal">
                      Fase atual exibida acima
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ApostasClient() {
  const router = useRouter();
  const closeClassificationButtonRef = useRef<HTMLButtonElement | null>(null);

  const [participant, setParticipant] = useState<ParticipantResponse | null>(null);
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAwardsModal, setShowAwardsModal] = useState(true);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [classificationAvailable, setClassificationAvailable] = useState(false);
  const [classificationStage, setClassificationStage] = useState<string | null>(null);
  const [classificationStageLabel, setClassificationStageLabel] = useState("Fase atual");
  const [classificationSummary, setClassificationSummary] = useState<ClassificationSummary | null>(null);
  const [classificationPhases, setClassificationPhases] = useState<ClassificationPhaseSummary[]>([]);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [penaltySelections, setPenaltySelections] = useState<Record<string, "home" | "away" | "">>({});
  const [filterDate, setFilterDate] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [appliedGroup, setAppliedGroup] = useState("");
  const [dateInputType, setDateInputType] = useState<"text" | "date">("text");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (appliedDate) {
          query.set("date", appliedDate);
        }
        if (appliedGroup) {
          query.set("group", appliedGroup);
        }

        const suffix = query.toString() ? `?${query.toString()}` : "";

        const [participantResponse, matchesResponse, rankingResponse] = await Promise.all([
          fetch("/api/participant/me", { cache: "no-store" }),
          fetch(`/api/matches${suffix}`, { cache: "no-store" }),
          fetch("/api/participant/ranking", { cache: "no-store" })
        ]);

        if (!participantResponse.ok) {
          throw new Error(publicCopy.bets.needRegister);
        }

        if (!matchesResponse.ok) {
          throw new Error("Não deu pra carregar os dados da tua rodada. Tenta de novo.");
        }

        const participantData = (await participantResponse.json()) as ParticipantResponse;
        const matchesData = (await matchesResponse.json()) as MatchesResponse;

        let rankingData: RankingResponse = {
          available: false,
          stage: null,
          stageLabel: "Fase atual",
          summary: null,
          phases: []
        };
        if (rankingResponse.ok) {
          rankingData = (await rankingResponse.json()) as RankingResponse;
        }

        if (cancelled) {
          return;
        }

        setParticipant(participantData);
        setMatches(matchesData.matches);
        setGroups(matchesData.groups);
        setMessage(matchesData.message);
        setClassificationAvailable(rankingData.available);
        setClassificationStage(rankingData.stage ?? null);
        setClassificationStageLabel(rankingData.stageLabel || "Fase atual");
        setClassificationSummary(rankingData.summary);
        setClassificationPhases(rankingData.phases ?? []);
        setPenaltySelections(
          Object.fromEntries(
            matchesData.matches.map((match) => [
              match.id,
              match.existingBet?.goesToPenalties && match.existingBet.penaltyWinnerSide ? match.existingBet.penaltyWinnerSide : ""
            ])
          )
        );
        setScores(
          Object.fromEntries(
            matchesData.matches.map((match) => [
              match.id,
              {
                home: match.existingBet ? String(match.existingBet.homeScoreGuess) : EMPTY_SCORE,
                away: match.existingBet ? String(match.existingBet.awayScoreGuess) : EMPTY_SCORE
              }
            ])
          )
        );
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Não deu pra carregar os dados da tua rodada. Tenta de novo.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [appliedDate, appliedGroup]);

  useEffect(() => {
    if (!showClassificationModal) {
      return;
    }

    closeClassificationButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowClassificationModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showClassificationModal]);

  useEffect(() => {
    if (!showAwardsModal && !showClassificationModal) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [showAwardsModal, showClassificationModal]);

  const availableMatches = useMemo(() => matches.filter((match) => match.status === "available"), [matches]);

  const allVisibleMatchesAlreadyBet = useMemo(
    () => matches.length > 0 && matches.every((match) => match.status === "already_bet"),
    [matches]
  );

  const hasAtLeastOneFilledScore = useMemo(
    () =>
      availableMatches.some((match) => {
        const current = scores[match.id];
        return current && current.home !== EMPTY_SCORE && current.away !== EMPTY_SCORE;
      }),
    [availableMatches, scores]
  );

  const classificationTop3Text = useMemo(() => {
    if (!classificationSummary) {
      return "";
    }

    if (!classificationSummary.inRanking) {
      return formatClassificationDistance(classificationSummary.top3Distance);
    }

    if (classificationSummary.position !== null && classificationSummary.position <= 3) {
      return "Você já está no Top 3";
    }

    return formatClassificationDistance(classificationSummary.top3Distance);
  }, [classificationSummary]);

  const classificationLeaderText = useMemo(() => {
    if (!classificationSummary) {
      return "";
    }

    if (!classificationSummary.inRanking) {
      return formatClassificationDistance(classificationSummary.leaderDistance);
    }

    if (classificationSummary.position === 1) {
      return classificationSummary.leaderCount > 1 ? "Empatado na liderança" : "Você é o líder atual";
    }

    return formatClassificationDistance(classificationSummary.leaderDistance);
  }, [classificationSummary]);

  const classificationStatusText = useMemo(() => {
    if (!classificationSummary) {
      return publicCopy.bets.noRankingYet;
    }

    if (!classificationSummary.inRanking) {
      return `📉 Você ainda está fora do ranking atual. Faltam ${classificationSummary.top3Distance} acertos para entrar no Top 3.`;
    }

    if (classificationSummary.position === 1) {
      return "👑 Você está liderando o ranking atual.";
    }

    if (classificationSummary.position !== null && classificationSummary.position <= 3) {
      return "🚀 Você está entre os melhores participantes.";
    }

    return `📈 Faltam ${classificationSummary.top3Distance} acertos para entrar no Top 3.`;
  }, [classificationSummary]);

  const classificationProgressText = useMemo(() => {
    if (!classificationSummary) {
      return "";
    }

    return `${classificationSummary.correctCount} de ${classificationSummary.totalResultsCount} resultado${
      classificationSummary.totalResultsCount === 1 ? "" : "s"
    } acertado${classificationSummary.correctCount === 1 ? "" : "s"}`;
  }, [classificationSummary]);

  const classificationPhaseCards = useMemo(
    () =>
      classificationPhases.map((phase) => ({
        ...phase,
        isCurrent: phase.stage === classificationStage
      })),
    [classificationPhases, classificationStage]
  );

  const currentClassificationPhase = useMemo(
    () => classificationPhaseCards.find((phase) => phase.isCurrent) ?? classificationPhaseCards[0] ?? null,
    [classificationPhaseCards]
  );

  function handleScoreChange(matchId: string, side: "home" | "away", value: string) {
    if (value !== EMPTY_SCORE && !/^\d+$/.test(value)) {
      return;
    }

    setScores((current) => {
      const next = {
        home: current[matchId]?.home ?? EMPTY_SCORE,
        away: current[matchId]?.away ?? EMPTY_SCORE,
        [side]: value
      };

      const isDraw = next.home !== EMPTY_SCORE && next.away !== EMPTY_SCORE && next.home === next.away;
      if (!isDraw) {
        setPenaltySelections((currentSelections) => ({
          ...currentSelections,
          [matchId]: ""
        }));
      }

      return {
        ...current,
        [matchId]: next
      };
    });
  }

  function handlePenaltySelection(matchId: string, value: "home" | "away") {
    setPenaltySelections((current) => ({
      ...current,
      [matchId]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (!hasAtLeastOneFilledScore) {
      setError("Preenche ao menos um placar para enviar teu palpite.");
      return;
    }

    for (const match of availableMatches) {
      const current = scores[match.id];
      if (!current || current.home === EMPTY_SCORE || current.away === EMPTY_SCORE) {
        continue;
      }

      const isKnockout = ["round_of_32", "round_of_16", "quarter_final", "semi_final", "bronze_final", "final"].includes(
        match.stage ?? "group"
      );
      const isDraw = current.home === current.away;
      const penaltyWinnerSide = penaltySelections[match.id] || "";

      if (isKnockout && isDraw && !penaltyWinnerSide) {
        setError(`Se você apostar em empate em ${match.homeTeam} x ${match.awayTeam}, escolha também quem avança nos pênaltis.`);
        return;
      }
    }

    const bets = availableMatches
      .map((match) => {
        const current = scores[match.id];
        if (!current || current.home === EMPTY_SCORE || current.away === EMPTY_SCORE) {
          return null;
        }

        const isKnockout = ["round_of_32", "round_of_16", "quarter_final", "semi_final", "bronze_final", "final"].includes(
          match.stage ?? "group"
        );
        const isDraw = current.home === current.away;
        const penaltyWinnerSide = penaltySelections[match.id] || "";

        return {
          matchId: match.id,
          homeScoreGuess: Number(current.home),
          awayScoreGuess: Number(current.away),
          penaltyWinnerSide: isKnockout && isDraw ? penaltyWinnerSide : null
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (!bets.length) {
      setError("Preenche ao menos um placar para enviar teu palpite.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Não deu pra registrar teus palpites.");
      }

      router.push("/sucesso");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não deu pra registrar teus palpites.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedDate(filterDate);
    setAppliedGroup(filterGroup);
  }

  const classificationButton = (
    <button
      type="button"
      onClick={() => setShowClassificationModal(true)}
      className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-6 py-4 text-center text-base font-bold text-white shadow-card transition hover:brightness-105"
      aria-label="Abrir minha classificação"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        🏆
      </span>
      <span>Ver Minha Classificação</span>
    </button>
  );

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 text-center shadow-card sm:p-8">
        <p className="text-base text-ink/70">{publicCopy.bets.emptyLoading}</p>
      </section>
    );
  }

  return (
    <>
      {showAwardsModal ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#1F2A37]/45 px-4 py-6 backdrop-blur-[4px]"
          onClick={() => setShowAwardsModal(false)}
        >
          <div
            className="relative w-full max-w-[720px] rounded-[2rem] bg-[#F8EFD9] p-5 shadow-[0_30px_80px_rgba(31,42,55,0.24)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAwardsModal(false)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/18 bg-white/92 text-xl text-ink transition hover:bg-white"
              aria-label="Fechar modal de premiações"
            >
              ×
            </button>

            <div className="pr-12 text-center">
              <h2 className="font-heading text-[clamp(1.7rem,4vw,2.4rem)] font-bold text-ink">
                Quem acerta mais, ganha!
              </h2>
              <p className="mt-2 text-sm text-ink/70 sm:text-base">
                Faça seus palpites e concorra aos prêmios da fase.
              </p>
            </div>

            <Image
              src="/assets/awards-modal-2026-06-10.jpeg"
              alt="Premiações da fase de grupos da Copa Inca"
              width={1080}
              height={1350}
              className="mx-auto mt-5 block h-auto w-full max-w-[520px] rounded-[1.6rem] object-contain"
              priority
            />

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAwardsModal(false)}
                className="inline-flex min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-8 py-4 text-lg font-bold text-white shadow-card transition hover:brightness-105"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showClassificationModal ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#1F2A37]/48 px-4 py-4 backdrop-blur-[5px] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-6"
          onClick={() => setShowClassificationModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Minha Classificação"
            className="relative mx-auto w-full max-w-[540px] rounded-[1.75rem] border border-[#E9DCC0] bg-[#F8EFD9] p-4 shadow-[0_26px_70px_rgba(31,42,55,0.20)] max-sm:my-4 max-sm:max-h-[calc(100dvh-2rem)] max-sm:overflow-y-auto sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeClassificationButtonRef}
              type="button"
              onClick={() => setShowClassificationModal(false)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/18 bg-white/92 text-xl text-ink transition hover:bg-white"
              aria-label="Fechar minha classificação"
            >
              ×
            </button>

            <div className="pr-12 text-center sm:pr-14">
              <div className="inline-flex max-w-full items-center justify-center gap-2 text-center">
                <span aria-hidden="true" className="text-xl leading-none">
                  🏆
                </span>
                <h2 className="font-heading text-[clamp(1.7rem,4vw,2.4rem)] font-bold leading-tight text-ink">
                  Minha Classificação
                </h2>
              </div>
              <p className="mt-1 text-sm text-ink/68">
                Desempenho atual em {currentClassificationPhase?.stageLabel ?? classificationStageLabel}
              </p>
            </div>

            <ClassificationModalPhaseContent
              classificationAvailable={classificationAvailable}
              classificationSummary={classificationSummary}
              classificationStage={classificationStage}
              classificationStageLabel={classificationStageLabel}
              classificationTop3Text={classificationTop3Text}
              classificationLeaderText={classificationLeaderText}
              classificationProgressText={classificationProgressText}
              classificationStatusText={classificationStatusText}
              classificationPhaseCards={classificationPhaseCards}
              currentClassificationPhase={currentClassificationPhase}
              noRankingYetText={publicCopy.bets.noRankingYet}
            />

            <div className="hidden">
              <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Fase em apuração</p>
                <p className="mt-2 font-heading text-[clamp(1.15rem,3vw,1.5rem)] font-bold text-ink">
                  {classificationStageLabel}
                </p>
              </div>

              {classificationAvailable && classificationSummary ? (
                <>
                <div className="rounded-[1.45rem] bg-white px-5 py-5 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                  <p className="font-heading text-[clamp(2rem,6vw,3.25rem)] font-bold leading-none text-ink">
                    {classificationSummary.inRanking && classificationSummary.position !== null
                      ? `#${classificationSummary.position}º Lugar`
                      : "Fora do ranking"}
                  </p>
                </div>

                <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                  <p className="text-lg font-semibold text-ink">
                    ✅ {classificationSummary.correctCount}{" "}
                    {classificationSummary.correctCount === 1 ? "Acerto" : "Acertos"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                    <p className="text-sm font-semibold text-ink">🥉 Para entrar no Top 3</p>
                    <p className="mt-2 text-base font-bold text-ink">{classificationTop3Text}</p>
                  </div>

                  <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                    <p className="text-sm font-semibold text-ink">🥇 Para assumir a liderança</p>
                    <p className="mt-2 text-base font-bold text-ink">{classificationLeaderText}</p>
                  </div>
                </div>

                <div className="rounded-[1.35rem] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-ink">📊 Desempenho da Rodada</p>
                    <p className="mt-2 text-sm text-ink/70">{classificationProgressText}</p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E7DABF]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-wine via-clay to-amber transition-[width] duration-500"
                      style={{ width: `${classificationSummary.progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-3 text-center text-sm font-semibold text-ink/72">
                    {classificationSummary.progressPercent}%
                  </p>
                </div>

                <div className="rounded-[1.35rem] bg-white px-5 py-4 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                  <p className="text-sm font-medium leading-relaxed text-ink">{classificationStatusText}</p>
                </div>

                {classificationPhaseCards.length ? (
                  <div className="rounded-[1.35rem] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-ink">Resultados por fase</p>
                      <p className="mt-1 text-sm text-ink/70">Seu desempenho fica separado em cada etapa da competição.</p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {classificationPhaseCards.map((phase) => (
                        <div
                          key={phase.stage ?? phase.stageLabel}
                          className={`rounded-[1.15rem] border px-4 py-4 text-left ${
                            phase.isCurrent ? "border-[#E7DABF] bg-[#FCF7EC]" : "border-[#EFE4CB] bg-[#FFFDFC]"
                          }`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-ink">{phase.stageLabel}</p>
                              <p className="mt-1 text-sm text-ink/70">
                                {phase.available && phase.summary
                                  ? `${phase.summary.correctCount} ${
                                      phase.summary.correctCount === 1 ? "acerto" : "acertos"
                                    } nesta fase`
                                  : "Aguardando resultados oficiais desta fase"}
                              </p>
                            </div>

                            <div className="text-sm font-bold text-ink">
                              {phase.available && phase.summary
                                ? phase.summary.inRanking && phase.summary.position !== null
                                  ? `#${phase.summary.position}º lugar`
                                  : "Fora do ranking"
                                : "Sem classificação"}
                            </div>
                          </div>

                          {phase.isCurrent ? (
                            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-teal">
                              Fase atual exibida acima
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                </>
              ) : (
                <>
                  <div className="rounded-[1.35rem] bg-white px-5 py-6 text-center shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                    <p className="text-base leading-relaxed text-ink">{publicCopy.bets.noRankingYet}</p>
                  </div>

                  {classificationPhaseCards.length ? (
                    <div className="rounded-[1.35rem] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(31,42,55,0.08)]">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-ink">Resultados por fase</p>
                        <p className="mt-1 text-sm text-ink/70">Seu desempenho fica separado em cada etapa da competição.</p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {classificationPhaseCards.map((phase) => (
                          <div
                            key={phase.stage ?? phase.stageLabel}
                            className={`rounded-[1.15rem] border px-4 py-4 text-left ${
                              phase.isCurrent ? "border-[#E7DABF] bg-[#FCF7EC]" : "border-[#EFE4CB] bg-[#FFFDFC]"
                            }`}
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-ink">{phase.stageLabel}</p>
                                <p className="mt-1 text-sm text-ink/70">
                                  {phase.available && phase.summary
                                    ? `${phase.summary.correctCount} ${
                                        phase.summary.correctCount === 1 ? "acerto" : "acertos"
                                      } nesta fase`
                                    : "Aguardando resultados oficiais desta fase"}
                                </p>
                              </div>

                              <div className="text-sm font-bold text-ink">
                                {phase.available && phase.summary
                                  ? phase.summary.inRanking && phase.summary.position !== null
                                    ? `#${phase.summary.position}º lugar`
                                    : "Fora do ranking"
                                  : "Sem classificação"}
                              </div>
                            </div>

                            {phase.isCurrent ? (
                              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-teal">
                                Fase atual exibida acima
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-card sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-teal">
              {publicCopy.bets.greetingPrefix}, {participant?.name ?? "participante"}
            </p>
            <h1 className="font-heading max-w-[16ch] text-[clamp(2.2rem,6vw,3.8rem)] font-bold leading-[0.95] text-ink">
              {publicCopy.bets.title}
            </h1>
            <p className="text-base text-ink/74 sm:text-lg">{publicCopy.bets.subtitle}</p>
            <p className="text-base font-medium text-[#D85C45]">
              Apostas nos placares ficam liberadas até 10 minutos antes do início de cada jogo.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row lg:hidden">
              <a
                href="https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/copa-mundo-2026-tabela-jogos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-teal/20 bg-white px-6 py-4 text-center text-base font-semibold text-teal shadow-card transition hover:bg-teal/5"
              >
                Veja tabela oficial da FIFA
              </a>
              {classificationButton}
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <ParticipantLogoutButton />
            <div className="hidden lg:flex lg:flex-col lg:items-end lg:gap-4">
              <div className="rounded-[1.75rem] border border-[#E7DABF] bg-[#F8EFD9] p-4 shadow-card">
                <Image
                  src="/assets/inca-logo.png"
                  alt="Logo do Inca Bar"
                  width={110}
                  height={110}
                  className="h-auto w-[92px] object-contain sm:w-[110px]"
                  priority
                />
              </div>
              <div className="w-full">{classificationButton}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.7rem] border border-white/70 bg-[#F8EFD9]/92 p-4 shadow-card sm:p-5">
          <p className="mb-3 text-sm font-semibold text-ink">Pesquise os jogos por data ou grupo</p>
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px]" onSubmit={handleFilterSubmit}>
            <input
              type={dateInputType}
              value={filterDate}
              onChange={(event) => setFilterDate(formatFilterDateValue(event.target.value))}
              onFocus={() => setDateInputType("date")}
              onBlur={() => {
                if (!filterDate) {
                  setDateInputType("text");
                }
              }}
              placeholder="dd/mm/aaaa"
              className="min-h-[56px] rounded-2xl border border-[#D7EAE6] bg-white px-5 text-base text-ink outline-none transition focus:border-teal"
            />

            <select
              value={filterGroup}
              onChange={(event) => setFilterGroup(event.target.value)}
              className="min-h-[56px] rounded-2xl border border-[#D7EAE6] bg-white px-5 text-base text-ink outline-none transition focus:border-teal"
            >
              <option value="">Todos os grupos</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-6 py-4 text-lg font-bold text-white shadow-card transition hover:brightness-105"
            >
              Filtrar
            </button>
          </form>
        </div>
      </section>

      {error ? (
        <section className="mt-5 rounded-[1.6rem] border border-[#EAB8B8] bg-[#FFF1F1] px-5 py-4 text-center text-sm font-medium text-[#B54747] shadow-card">
          {error}
        </section>
      ) : null}

      {!error && message ? (
        <section className="mt-5 rounded-[1.6rem] border border-[#D7EAE6] bg-white px-5 py-5 text-center text-base text-ink shadow-card">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <p>{message}</p>
            {!matches.length ? (
              <a
                href="/api/calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-teal/20 bg-white px-5 py-3 text-center text-sm font-semibold text-teal shadow-card transition hover:bg-teal/5"
              >
                Veja o Calendário completo da Copa
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {matches.length ? (
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {matches.map((match) => {
            const current = scores[match.id] ?? { home: EMPTY_SCORE, away: EMPTY_SCORE };
            const readOnly = match.status !== "available";
            const isKnockout = ["round_of_32", "round_of_16", "quarter_final", "semi_final", "final"].includes(
              match.stage ?? "group"
            );
            const shouldShowPenaltyChoice =
              isKnockout && current.home !== EMPTY_SCORE && current.away !== EMPTY_SCORE && current.home === current.away;
            const selectedPenaltyWinner = penaltySelections[match.id] ?? "";

            return (
              <article
                key={match.id}
                className="rounded-[2rem] border border-[#D7EAE6] bg-white px-4 py-5 shadow-card sm:px-6 sm:py-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="h-1 w-24 rounded-full bg-gradient-to-r from-wine via-amber to-teal" />
                    <p className="mt-4 text-base font-semibold text-teal">{match.groupName}</p>
                  </div>
                  <div className="text-right text-sm font-semibold text-ink/75">
                    {match.timezoneDisplay ? (
                      <div className="space-y-1">
                        <p>{match.timezoneDisplay.localLabel}</p>
                        <p>{match.timezoneDisplay.brasiliaLabel}</p>
                      </div>
                    ) : (
                      <p>
                        {formatDate(match.matchDate)} às {match.matchTime}
                      </p>
                    )}
                  </div>
                </div>

                <h2 className="mt-5 text-center text-[clamp(1.5rem,4vw,2rem)] font-semibold text-ink">
                  {match.homeTeam} <span className="mx-2 text-clay">x</span> {match.awayTeam}
                </h2>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={current.home}
                    onChange={(event) => handleScoreChange(match.id, "home", event.target.value)}
                    readOnly={readOnly}
                    aria-label={`Placar de ${match.homeTeam}`}
                    className="min-h-[54px] rounded-2xl border border-[#D7EAE6] bg-[#FCF7EC] px-5 text-center text-lg font-semibold text-ink outline-none transition focus:border-teal read-only:cursor-not-allowed read-only:bg-white"
                  />
                  <span className="text-center text-lg font-semibold text-clay">x</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={current.away}
                    onChange={(event) => handleScoreChange(match.id, "away", event.target.value)}
                    readOnly={readOnly}
                    aria-label={`Placar de ${match.awayTeam}`}
                    className="min-h-[54px] rounded-2xl border border-[#D7EAE6] bg-[#FCF7EC] px-5 text-center text-lg font-semibold text-ink outline-none transition focus:border-teal read-only:cursor-not-allowed read-only:bg-white"
                  />
                </div>

                {shouldShowPenaltyChoice ? (
                  <div className="mt-4 rounded-2xl border border-[#E7DABF] bg-[#FFF9EF] px-5 py-4">
                    <p className="text-sm font-semibold text-ink">
                      Se você apostar em empate, escolha também qual seleção avança nos pênaltis.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">
                      Nesse caso, sua pontuação será validada pelo time classificado, e não pelo placar exato do empate.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-3 rounded-2xl border border-[#D7EAE6] bg-white px-4 py-3">
                        <input
                          type="radio"
                          name={`penalties-${match.id}`}
                          value="home"
                          checked={selectedPenaltyWinner === "home"}
                          onChange={() => handlePenaltySelection(match.id, "home")}
                          disabled={readOnly}
                        />
                        <span className="font-semibold text-ink">{match.homeTeam}</span>
                      </label>
                      <label className="flex items-center gap-3 rounded-2xl border border-[#D7EAE6] bg-white px-4 py-3">
                        <input
                          type="radio"
                          name={`penalties-${match.id}`}
                          value="away"
                          checked={selectedPenaltyWinner === "away"}
                          onChange={() => handlePenaltySelection(match.id, "away")}
                          disabled={readOnly}
                        />
                        <span className="font-semibold text-ink">{match.awayTeam}</span>
                      </label>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl border border-[#D7EAE6] bg-white px-5 py-4 text-center text-base font-semibold shadow-[inset_0_0_0_1px_rgba(215,234,230,0.35)]">
                  {match.status === "available" ? (
                    <span className="text-teal">Palpite aberto</span>
                  ) : match.status === "already_bet" ? (
                    <span className="text-[#D85C45]">Palpite já enviado</span>
                  ) : (
                    <span className="text-[#D1495B]">Palpite fechado</span>
                  )}
                </div>

                {match.timezoneNotice ? (
                  <p className="mt-4 rounded-2xl border border-[#E7DABF] bg-[#FFF9EF] px-5 py-4 text-center text-sm leading-relaxed text-ink/72">
                    {match.timezoneNotice}
                  </p>
                ) : null}
              </article>
            );
          })}

          {availableMatches.length ? (
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[58px] min-w-[240px] items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-8 py-4 text-lg font-bold text-white shadow-card transition hover:brightness-105 disabled:cursor-wait disabled:opacity-80"
              >
                {submitting ? publicCopy.bets.submitLoading : publicCopy.bets.submit}
              </button>
            </div>
          ) : null}
        </form>
      ) : null}

      {!matches.length && !message ? (
        <section className="mt-5 rounded-[1.6rem] border border-[#D7EAE6] bg-white px-5 py-5 text-center text-base text-ink shadow-card">
          {allVisibleMatchesAlreadyBet ? publicCopy.bets.allDone : publicCopy.bets.noTodayMatches}
        </section>
      ) : null}
    </>
  );
}
