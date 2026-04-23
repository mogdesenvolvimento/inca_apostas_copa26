import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDateString } from "@/lib/timezone";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return jsonError("Não autenticado.", 401);
  }

  const today = getSaoPauloDateString();
  const [participants, bets, todayMatches] = await Promise.all([
    prisma.participant.count(),
    prisma.bet.count(),
    prisma.match.findMany({
      where: { matchDate: today },
      include: { _count: { select: { bets: true } } },
      orderBy: { kickoffAt: "asc" }
    })
  ]);

  return NextResponse.json({
    participants,
    bets,
    todayMatches: todayMatches.length,
    betsByTodayMatch: todayMatches.map((match) => ({
      id: match.id,
      groupName: match.groupName,
      confrontation: `${match.homeTeam} x ${match.awayTeam}`,
      matchTime: match.matchTime,
      total: match._count.bets
    }))
  });
}
