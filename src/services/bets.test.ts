import { describe, expect, it, vi } from "vitest";
import { submitBets } from "@/services/bets";
import { zonedDateTimeToUtc } from "@/lib/timezone";

const openMatch = {
  id: "m1",
  groupName: "Grupo A",
  matchDate: "2026-06-11",
  matchTime: "16:00",
  kickoffAt: zonedDateTimeToUtc("2026-06-11", "16:00"),
  homeTeam: "México",
  awayTeam: "África do Sul",
  isActive: true,
  createdAt: new Date()
};

describe("submitBets", () => {
  it("bloqueia duplicidade de bet por participantId + matchId", async () => {
    const client = {
      match: {
        findMany: vi.fn().mockResolvedValue([openMatch])
      },
      bet: {
        findUnique: vi.fn().mockResolvedValue({ id: "bet-existente" }),
        create: vi.fn()
      },
      $transaction: vi.fn()
    };

    await expect(
      submitBets(
        "p1",
        [{ matchId: "m1", homeScoreGuess: 2, awayScoreGuess: 1 }],
        new Date("2026-06-11T18:00:00.000Z"),
        client as any
      )
    ).rejects.toThrow("Seu palpite pra esse jogo já foi registrado.");

    expect(client.bet.create).not.toHaveBeenCalled();
    expect(client.$transaction).not.toHaveBeenCalled();
  });

  it("exige seleção de pênaltis para empate no mata-mata", async () => {
    const client = {
      match: {
        findMany: vi.fn().mockResolvedValue([
          {
            ...openMatch,
            stage: "round_of_32"
          }
        ])
      },
      bet: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn()
      },
      $transaction: vi.fn()
    };

    await expect(
      submitBets(
        "p1",
        [{ matchId: "m1", homeScoreGuess: 1, awayScoreGuess: 1 }],
        new Date("2026-06-11T18:00:00.000Z"),
        client as any
      )
    ).rejects.toThrow("Se o palpite terminar empatado, escolha quem avança nos pênaltis.");
  });
});
