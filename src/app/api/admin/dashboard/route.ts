import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { filterMatchesForCurrentBolaoWindow, getMatchDisplayTime } from "@/lib/matches";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDateString } from "@/lib/timezone";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return jsonError("Não autenticado.", 401);
  }

  const today = getSaoPauloDateString();
  const yesterday = getSaoPauloDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const tomorrow = getSaoPauloDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [participants, bets, todayMatchesBase] = await Promise.all([
    prisma.participant.count(),
    prisma.bet.count(),
    prisma.match.findMany({
      where: { matchDate: { in: [today, yesterday, tomorrow] } },
      include: { _count: { select: { bets: true } } },
      orderBy: { kickoffAt: "asc" }
    })
  ]);
  const todayMatches = filterMatchesForCurrentBolaoWindow(todayMatchesBase).matches;

  return NextResponse.json({
    participants,
    bets,
    todayMatches: todayMatches.length,
    betsByTodayMatch: todayMatches.map((match) => ({
      id: match.id,
      groupName: match.groupName,
      confrontation: `${match.homeTeam} x ${match.awayTeam}`,
      matchTime: getMatchDisplayTime(match),
      total: match._count.bets
    }))
  });
}
