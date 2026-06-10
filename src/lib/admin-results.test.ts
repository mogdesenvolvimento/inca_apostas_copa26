import { describe, expect, it } from "vitest";
import { buildParticipantRanking, getPodium, getWinnersForMatch } from "@/lib/admin-results";

const baseMatch = {
  id: "match-1",
  groupName: "Grupo A",
  matchDate: "2026-06-11",
  matchTime: "16:00",
  homeTeam: "Time A",
  awayTeam: "Time B",
  resultRegisteredAt: new Date(),
  resultUpdatedAt: new Date()
};

describe("admin results", () => {
  it("identifica acertadores exatos de um jogo", () => {
    const winners = getWinnersForMatch({
      ...baseMatch,
      officialScoreHome: 2,
      officialScoreAway: 1,
      bets: [
        {
          id: "bet-1",
          homeScoreGuess: 2,
          awayScoreGuess: 1,
          submittedAt: new Date(),
          participant: {
            id: "p1",
            name: "João",
            cpf: "123",
            phone: "51999999999",
            registrationCode: "INCA-1"
          }
        },
        {
          id: "bet-2",
          homeScoreGuess: 1,
          awayScoreGuess: 1,
          submittedAt: new Date(),
          participant: {
            id: "p2",
            name: "Maria",
            cpf: "456",
            phone: "51888888888",
            registrationCode: "INCA-2"
          }
        }
      ]
    });

    expect(winners).toHaveLength(1);
    expect(winners[0]?.name).toBe("João");
  });

  it("monta ranking com empate respeitando posição", () => {
    const ranking = buildParticipantRanking([
      {
        ...baseMatch,
        officialScoreHome: 2,
        officialScoreAway: 1,
        bets: [
          {
            id: "bet-1",
            homeScoreGuess: 2,
            awayScoreGuess: 1,
            submittedAt: new Date(),
            participant: {
              id: "p1",
              name: "João",
              cpf: "123",
              phone: "51999999999",
              registrationCode: "INCA-1"
            }
          },
          {
            id: "bet-2",
            homeScoreGuess: 2,
            awayScoreGuess: 1,
            submittedAt: new Date(),
            participant: {
              id: "p2",
              name: "Maria",
              cpf: "456",
              phone: "51888888888",
              registrationCode: "INCA-2"
            }
          }
        ]
      },
      {
        ...baseMatch,
        id: "match-2",
        officialScoreHome: 1,
        officialScoreAway: 0,
        bets: [
          {
            id: "bet-3",
            homeScoreGuess: 1,
            awayScoreGuess: 0,
            submittedAt: new Date(),
            participant: {
              id: "p1",
              name: "João",
              cpf: "123",
              phone: "51999999999",
              registrationCode: "INCA-1"
            }
          },
          {
            id: "bet-4",
            homeScoreGuess: 1,
            awayScoreGuess: 0,
            submittedAt: new Date(),
            participant: {
              id: "p3",
              name: "Ana",
              cpf: "789",
              phone: "51777777777",
              registrationCode: "INCA-3"
            }
          }
        ]
      }
    ]);

    expect(ranking.map((item) => [item.name, item.position, item.correctCount])).toEqual([
      ["João", 1, 2],
      ["Ana", 2, 1],
      ["Maria", 2, 1]
    ]);

    const podium = getPodium(ranking);
    expect(podium[0]?.participants).toHaveLength(1);
    expect(podium[1]?.participants).toHaveLength(2);
  });
});
