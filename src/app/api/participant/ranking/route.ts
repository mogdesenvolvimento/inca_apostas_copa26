import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { buildParticipantRanking, getParticipantClassificationSummary, hasOfficialResult } from "@/lib/admin-results";
import { jsonError } from "@/lib/http";
import { getStageLabel, getStageOrder, isCompetitiveStage, resolveCurrentCompetitiveStage } from "@/lib/match-stages";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    return jsonError("Participante não autenticado.", 401);
  }

  const matches = await prisma.match.findMany({
    include: {
      bets: {
        include: {
          participant: true
        }
      }
    },
    orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }]
  });

  const currentStage = resolveCurrentCompetitiveStage(matches);
  const stageMatches = currentStage ? matches.filter((match) => (match.stage ?? "group") === currentStage) : matches;
  const matchesWithResults = stageMatches.filter((match) => hasOfficialResult(match));
  const ranking = buildParticipantRanking(matchesWithResults);
  const summary = getParticipantClassificationSummary(ranking, participant.id, matchesWithResults.length);
  const availableStages = Array.from(
    new Set(matches.map((match) => match.stage ?? "group").filter((stage) => isCompetitiveStage(stage)))
  ).sort((a, b) => getStageOrder(a) - getStageOrder(b));

  const phases = availableStages.map((stage) => {
    const phaseMatches = matches.filter((match) => (match.stage ?? "group") === stage);
    const phaseMatchesWithResults = phaseMatches.filter((match) => hasOfficialResult(match));
    const phaseRanking = buildParticipantRanking(phaseMatchesWithResults);
    const phaseSummary = getParticipantClassificationSummary(phaseRanking, participant.id, phaseMatchesWithResults.length);

    return {
      stage,
      stageLabel: getStageLabel(stage),
      available: Boolean(phaseSummary),
      summary: phaseSummary
    };
  });

  return NextResponse.json({
    available: Boolean(summary),
    stage: currentStage,
    stageLabel: getStageLabel(currentStage),
    summary,
    phases
  });
}
