import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { submitBets } from "@/services/bets";

type Body = {
  bets?: Array<{
    matchId: string;
    homeScoreGuess: unknown;
    awayScoreGuess: unknown;
  }>;
};

export async function POST(request: Request) {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return jsonError("Faz teu acesso para continuar.", 401);
    }

    const body = await readJson<Body>(request);
    const created = await submitBets(participant.id, body.bets ?? []);

    return NextResponse.json({ bets: created });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível salvar tua aposta.");
  }
}
