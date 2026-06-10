import { NextResponse } from "next/server";
import { attachMatchResults, getMatchResultById, saveOfficialResult } from "@/lib/admin-results-db";
import { getWinnersForMatch } from "@/lib/admin-results";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Body = {
  officialScoreHome?: unknown;
  officialScoreAway?: unknown;
};

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return jsonError("Não autenticado.", 401);
  }

  const baseMatch = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      bets: {
        include: { participant: true },
        orderBy: { submittedAt: "desc" }
      },
      _count: { select: { bets: true } }
    }
  });

  if (!baseMatch) {
    return jsonError("Jogo não encontrado.", 404);
  }

  const [match] = await attachMatchResults([baseMatch]);
  const winners = getWinnersForMatch(match);

  return NextResponse.json({
    match,
    summary: {
      totalBets: match._count.bets,
      totalWinners: winners.length,
      winners
    }
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return jsonError("Não autenticado.", 401);
    }

    const body = await readJson<Body>(request);
    const officialScoreHome = parseScore(body.officialScoreHome, "Placar oficial do mandante inválido.");
    const officialScoreAway = parseScore(body.officialScoreAway, "Placar oficial do visitante inválido.");

    const existingMatch = await prisma.match.findUnique({
      where: { id: params.id },
      select: { id: true }
    });

    if (!existingMatch) {
      return jsonError("Jogo não encontrado.", 404);
    }

    const existingResult = await getMatchResultById(params.id);
    const now = new Date();
    const isUpdate = existingResult.officialScoreHome !== null && existingResult.officialScoreAway !== null;

    await saveOfficialResult({
      matchId: params.id,
      officialScoreHome,
      officialScoreAway,
      resultRegisteredAt: isUpdate ? existingResult.resultRegisteredAt ?? now : now,
      resultUpdatedAt: now
    });

    const refreshedBaseMatch = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        bets: {
          include: { participant: true },
          orderBy: { submittedAt: "desc" }
        },
        _count: { select: { bets: true } }
      }
    });

    if (!refreshedBaseMatch) {
      return jsonError("Jogo não encontrado.", 404);
    }

    const [match] = await attachMatchResults([refreshedBaseMatch]);
    const winners = getWinnersForMatch(match);

    return NextResponse.json({
      message: isUpdate ? "Resultado oficial atualizado." : "Resultado oficial salvo com sucesso.",
      match,
      summary: {
        totalBets: match._count.bets,
        totalWinners: winners.length,
        winners
      }
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível salvar o resultado oficial.");
  }
}

function parseScore(value: unknown, message: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(message);
  }

  return value;
}
