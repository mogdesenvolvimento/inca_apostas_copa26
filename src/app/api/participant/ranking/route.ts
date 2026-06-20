import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getParticipantClassificationSummary, buildParticipantRanking, hasOfficialResult } from "@/lib/admin-results";
import { jsonError } from "@/lib/http";
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

  const matchesWithResults = matches.filter((match) => hasOfficialResult(match));
  const ranking = buildParticipantRanking(matchesWithResults);
  const summary = getParticipantClassificationSummary(ranking, participant.id, matchesWithResults.length);

  return NextResponse.json({
    available: Boolean(summary),
    summary
  });
}
