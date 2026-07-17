import { getSaoPauloDateString } from "@/lib/timezone";

const OVERALL_RANKING_STAGE_ORDER = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "bronze_final",
  "final"
] as const;
const INDIVIDUAL_RANKING_STAGE_ORDER = ["group", "round_of_32", "round_of_16", "quarter_final", "semi_final"] as const;
const KNOCKOUT_STAGE_ORDER = ["round_of_32", "round_of_16", "quarter_final", "semi_final", "bronze_final", "final"] as const;

type StageAwareMatch = {
  stage?: string | null;
  kickoffAt: Date;
  matchDate?: string | null;
};

export function isCompetitiveStage(stage: string | null | undefined) {
  return OVERALL_RANKING_STAGE_ORDER.includes((stage ?? "group") as (typeof OVERALL_RANKING_STAGE_ORDER)[number]);
}

export function isIndividualRankingStage(stage: string | null | undefined) {
  return INDIVIDUAL_RANKING_STAGE_ORDER.includes((stage ?? "group") as (typeof INDIVIDUAL_RANKING_STAGE_ORDER)[number]);
}

export function isKnockoutStage(stage: string | null | undefined) {
  return KNOCKOUT_STAGE_ORDER.includes((stage ?? "group") as (typeof KNOCKOUT_STAGE_ORDER)[number]);
}

export function getStageOrder(stage: string | null | undefined) {
  const normalized = stage ?? "group";
  const index = OVERALL_RANKING_STAGE_ORDER.indexOf(normalized as (typeof OVERALL_RANKING_STAGE_ORDER)[number]);
  return index === -1 ? -1 : index;
}

export function getStageLabel(stage: string | null | undefined) {
  switch (stage ?? "group") {
    case "round_of_32":
      return "16 Avos de Final";
    case "round_of_16":
      return "Oitavas de Final";
    case "quarter_final":
      return "Quartas de Final";
    case "semi_final":
      return "Semifinais";
    case "bronze_final":
      return "Disputa pelo bronze";
    case "final":
      return "Final";
    default:
      return "Fase de grupos";
  }
}

export function resolveCurrentCompetitiveStage<T extends StageAwareMatch>(matches: T[], now = new Date()) {
  const competitiveStages = Array.from(
    new Set(matches.map((match) => match.stage ?? "group").filter((stage) => isCompetitiveStage(stage)))
  );

  if (!competitiveStages.length) {
    return null;
  }

  const today = getSaoPauloDateString(now);
  const upcomingStages = Array.from(
    new Set(
      matches
        .filter((match) => isCompetitiveStage(match.stage) && (match.matchDate ?? getSaoPauloDateString(match.kickoffAt)) >= today)
        .map((match) => match.stage ?? "group")
    )
  );

  if (upcomingStages.length) {
    return upcomingStages.sort((a, b) => getStageOrder(a) - getStageOrder(b))[0] ?? null;
  }

  const startedStages = Array.from(
    new Set(
      matches
        .filter((match) => isCompetitiveStage(match.stage) && match.kickoffAt.getTime() <= now.getTime())
        .map((match) => match.stage ?? "group")
    )
  );

  if (!startedStages.length) {
    return competitiveStages.sort((a, b) => getStageOrder(a) - getStageOrder(b))[0] ?? null;
  }

  const sortedStartedStages = startedStages.sort((a, b) => getStageOrder(a) - getStageOrder(b));
  return sortedStartedStages[sortedStartedStages.length - 1] ?? null;
}

export function resolveCurrentIndividualRankingStage<T extends StageAwareMatch>(matches: T[], now = new Date()) {
  const individualStages = Array.from(
    new Set(matches.map((match) => match.stage ?? "group").filter((stage) => isIndividualRankingStage(stage)))
  );

  if (!individualStages.length) {
    return null;
  }

  const today = getSaoPauloDateString(now);
  const upcomingStages = Array.from(
    new Set(
      matches
        .filter(
          (match) =>
            isIndividualRankingStage(match.stage) &&
            (match.matchDate ?? getSaoPauloDateString(match.kickoffAt)) >= today
        )
        .map((match) => match.stage ?? "group")
    )
  );

  if (upcomingStages.length) {
    return upcomingStages.sort((a, b) => getStageOrder(a) - getStageOrder(b))[0] ?? null;
  }

  const startedStages = Array.from(
    new Set(
      matches
        .filter((match) => isIndividualRankingStage(match.stage) && match.kickoffAt.getTime() <= now.getTime())
        .map((match) => match.stage ?? "group")
    )
  );

  if (!startedStages.length) {
    return individualStages.sort((a, b) => getStageOrder(a) - getStageOrder(b))[0] ?? null;
  }

  const sortedStartedStages = startedStages.sort((a, b) => getStageOrder(a) - getStageOrder(b));
  return sortedStartedStages[sortedStartedStages.length - 1] ?? null;
}
