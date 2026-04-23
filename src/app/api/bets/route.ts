import { NextResponse } from "next/server";
import { submitBets } from "@/services/bets";
import { jsonError, readJson } from "@/lib/http";

type Body = {
  participantId?: string;
  bets?: Array<{
    matchId: string;
    homeScoreGuess: unknown;
    awayScoreGuess: unknown;
  }>;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const created = await submitBets(body.participantId ?? "", body.bets ?? []);

    return NextResponse.json({ bets: created });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível salvar sua aposta.");
  }
}
