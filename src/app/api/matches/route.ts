import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { stateMessages } from "@/lib/copy";
import {
  filterMatchesForCurrentBolaoWindow,
  getMatchDisplayDate,
  getMatchDisplayTime,
  getMatchTimezoneDisplayInfo,
  getMatchTimezoneNotice,
  getParticipantMatchBetStatusFromData
} from "@/lib/matches";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDateString } from "@/lib/timezone";

export async function GET() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "Faz teu acesso para continuar." }, { status: 401 });
  }
  const now = new Date();
  const today = getSaoPauloDateString(now);
  const yesterday = getSaoPauloDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const tomorrow = getSaoPauloDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const candidateMatches = await prisma.match.findMany({
    where: {
      matchDate: { in: [today, yesterday, tomorrow] },
      isActive: true
    },
    orderBy: [{ kickoffAt: "asc" }, { homeTeam: "asc" }]
  });
  const { displayDate, matches } = filterMatchesForCurrentBolaoWindow(candidateMatches, now);

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
    displayDate,
    message: buildMatchesMessage(
      today,
      matches.length,
      matches.some(
        (match) => getParticipantMatchBetStatusFromData(match, Boolean(betByMatch.get(match.id)), now) === "available"
      ),
      firstMatch?.matchDate
    ),
    matches: matches.map((match) => {
      const existingBet = betByMatch.get(match.id);
      return {
        ...match,
        matchDate: getMatchDisplayDate(match),
        matchTime: getMatchDisplayTime(match),
        status: getParticipantMatchBetStatusFromData(match, Boolean(existingBet), now),
        existingBet,
        timezoneNotice: getMatchTimezoneNotice(match),
        timezoneDisplay: getMatchTimezoneDisplayInfo(match)
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
