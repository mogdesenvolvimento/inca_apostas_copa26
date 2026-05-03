import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { stateMessages } from "@/lib/copy";
import { getParticipantMatchBetStatusFromData } from "@/lib/matches";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDateString } from "@/lib/timezone";

export async function GET() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "Faz teu acesso para continuar." }, { status: 401 });
  }
  const today = getSaoPauloDateString();

  const matches = await prisma.match.findMany({
    where: {
      matchDate: today,
      isActive: true
    },
    orderBy: [{ kickoffAt: "asc" }, { homeTeam: "asc" }]
  });

  const firstMatch = await prisma.match.findFirst({
    where: { isActive: true },
    orderBy: { matchDate: "asc" }
  });

  const existingBets = await prisma.bet.findMany({
    where: {
      participantId: participant.id,
      matchId: { in: matches.map((match) => match.id) }
    }
  });
  const betByMatch = new Map(existingBets.map((bet) => [bet.matchId, bet]));

  return NextResponse.json({
    today,
    message: buildMatchesMessage(
      today,
      matches.length,
      matches.some((match) => getParticipantMatchBetStatusFromData(match, Boolean(betByMatch.get(match.id))) === "available"),
      firstMatch?.matchDate
    ),
    matches: matches.map((match) => {
      const existingBet = betByMatch.get(match.id);
      return {
        ...match,
        status: getParticipantMatchBetStatusFromData(match, Boolean(existingBet)),
        existingBet
      };
    })
  });
}

function buildMatchesMessage(today: string, matchCount: number, hasAvailable: boolean, firstMatchDate?: string) {
  if (!matchCount && firstMatchDate && today < firstMatchDate) {
    return stateMessages.notOpenYet;
  }

  if (!matchCount) {
    return stateMessages.noMatches;
  }

  if (!hasAvailable) {
    return stateMessages.closedToday;
  }

  return null;
}
