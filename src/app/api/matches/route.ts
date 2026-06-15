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

export async function GET(request: Request) {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "Faz teu acesso para continuar." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get("date")?.trim() || undefined;
  const selectedGroup = searchParams.get("group")?.trim() || undefined;
  const hasFilters = Boolean(selectedDate || selectedGroup);

  const now = new Date();
  const today = getSaoPauloDateString(now);
  const yesterday = getSaoPauloDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const tomorrow = getSaoPauloDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const [allMatchesBase, groups] = await Promise.all([
    prisma.match.findMany({
      where: {
        isActive: true,
        ...(hasFilters ? {} : { matchDate: { in: [today, yesterday, tomorrow] } })
      },
      orderBy: [{ kickoffAt: "asc" }, { homeTeam: "asc" }]
    }),
    prisma.match.findMany({
      where: { isActive: true },
      distinct: ["groupName"],
      orderBy: { groupName: "asc" },
      select: { groupName: true }
    })
  ]);

  const scopedMatches = hasFilters
    ? allMatchesBase.filter((match) => {
        if (selectedDate && getMatchDisplayDate(match) !== selectedDate) {
          return false;
        }

        if (selectedGroup && match.groupName !== selectedGroup) {
          return false;
        }

        return true;
      })
    : filterMatchesForCurrentBolaoWindow(allMatchesBase, now).matches;

  const displayDate =
    hasFilters && selectedDate
      ? selectedDate
      : scopedMatches[0]
        ? getMatchDisplayDate(scopedMatches[0])
        : today;

  const existingBets = await prisma.bet.findMany({
    where: {
      participantId: participant.id,
      matchId: { in: scopedMatches.map((match) => match.id) }
    }
  });
  const betByMatch = new Map(existingBets.map((bet) => [bet.matchId, bet]));

  return NextResponse.json({
    today,
    displayDate,
    filtered: hasFilters,
    groups: groups.map((item) => item.groupName),
    message: hasFilters
      ? scopedMatches.length
        ? null
        : "Nenhum jogo encontrado com os filtros atuais."
      : buildMatchesMessage(
          today,
          scopedMatches.length,
          scopedMatches.some(
            (match) => getParticipantMatchBetStatusFromData(match, Boolean(betByMatch.get(match.id)), now) === "available"
          ),
          allMatchesBase.length ? getMatchDisplayDate(allMatchesBase[0]) : undefined
        ),
    matches: scopedMatches.map((match) => {
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
