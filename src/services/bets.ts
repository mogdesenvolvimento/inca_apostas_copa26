import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getParticipantMatchBetStatusFromData } from "@/lib/matches";
import { validateScore } from "@/lib/validation";

type BetInput = {
  matchId: string;
  homeScoreGuess: unknown;
  awayScoreGuess: unknown;
};

type BetClient = Pick<typeof prisma, "match" | "bet" | "$transaction">;

export async function getParticipantMatchBetStatus(
  participantId: string,
  matchId: string,
  now = new Date(),
  client: Pick<typeof prisma, "match" | "bet"> = prisma
) {
  const [match, existingBet] = await Promise.all([
    client.match.findUnique({ where: { id: matchId } }),
    client.bet.findUnique({
      where: { participantId_matchId: { participantId, matchId } }
    })
  ]);

  if (!match) {
    throw new Error("Jogo não encontrado.");
  }

  return getParticipantMatchBetStatusFromData(match, Boolean(existingBet), now);
}

export async function submitBets(
  participantId: string,
  bets: BetInput[],
  now = new Date(),
  client: BetClient = prisma
) {
  if (!participantId) {
    throw new Error("Participante não identificado.");
  }

  if (!bets.length) {
    throw new Error("Selecione ao menos uma aposta válida.");
  }

  const normalizedBets = bets.map((bet) => ({
    matchId: bet.matchId,
    homeScoreGuess: validateScore(bet.homeScoreGuess),
    awayScoreGuess: validateScore(bet.awayScoreGuess)
  }));

  const matches = await client.match.findMany({
    where: { id: { in: normalizedBets.map((bet) => bet.matchId) } }
  });
  const matchById = new Map(matches.map((match) => [match.id, match]));

  for (const bet of normalizedBets) {
    const match = matchById.get(bet.matchId);
    if (!match) {
      throw new Error("Jogo não encontrado.");
    }

    const existing = await client.bet.findUnique({
      where: { participantId_matchId: { participantId, matchId: bet.matchId } }
    });

    const status = getParticipantMatchBetStatusFromData(match, Boolean(existing), now);
    if (status === "already_bet") {
      throw new Error("Sua aposta para este jogo já foi registrada.");
    }

    if (status === "closed") {
      throw new Error("As apostas para os jogos de hoje já foram encerradas.");
    }
  }

  try {
    return await client.$transaction(
      normalizedBets.map((bet) =>
        client.bet.create({
          data: {
            participantId,
            matchId: bet.matchId,
            homeScoreGuess: bet.homeScoreGuess,
            awayScoreGuess: bet.awayScoreGuess,
            submittedAt: now
          }
        })
      )
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Sua aposta para este jogo já foi registrada.");
    }

    throw error;
  }
}
