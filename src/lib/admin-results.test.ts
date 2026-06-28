import { describe, expect, it } from "vitest";
import {
  buildParticipantRanking,
  getParticipantClassificationSummary,
  getPodium,
  isWinningBet,
  getWinnersForMatch
} from "@/lib/admin-results";

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

  it("monta ranking denso, sem pular a próxima colocação após empate", () => {
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
            id: "bet-2",
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
            id: "bet-3",
            homeScoreGuess: 1,
            awayScoreGuess: 0,
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
        id: "match-3",
        officialScoreHome: 3,
        officialScoreAway: 2,
        bets: [
          {
            id: "bet-4",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
            submittedAt: new Date(),
            participant: {
              id: "p2",
              name: "Maria",
              cpf: "456",
              phone: "51888888888",
              registrationCode: "INCA-2"
            }
          },
          {
            id: "bet-5",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
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
      },
      {
        ...baseMatch,
        id: "match-4",
        officialScoreHome: 0,
        officialScoreAway: 0,
        bets: [
          {
            id: "bet-6",
            homeScoreGuess: 0,
            awayScoreGuess: 0,
            submittedAt: new Date(),
            participant: {
              id: "p4",
              name: "Carlos",
              cpf: "999",
              phone: "51666666666",
              registrationCode: "INCA-4"
            }
          }
        ]
      }
    ]);

    expect(ranking.map((item) => [item.name, item.position, item.correctCount])).toEqual([
      ["João", 1, 2],
      ["Maria", 1, 2],
      ["Ana", 2, 1],
      ["Carlos", 2, 1]
    ]);
  });

  it("mantém o terceiro lugar vazio quando só existem duas faixas de pontuação", () => {
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
            id: "bet-2",
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
            id: "bet-3",
            homeScoreGuess: 1,
            awayScoreGuess: 0,
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
        id: "match-3",
        officialScoreHome: 3,
        officialScoreAway: 2,
        bets: [
          {
            id: "bet-4",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
            submittedAt: new Date(),
            participant: {
              id: "p2",
              name: "Maria",
              cpf: "456",
              phone: "51888888888",
              registrationCode: "INCA-2"
            }
          },
          {
            id: "bet-5",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
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
      },
      {
        ...baseMatch,
        id: "match-4",
        officialScoreHome: 0,
        officialScoreAway: 0,
        bets: [
          {
            id: "bet-6",
            homeScoreGuess: 0,
            awayScoreGuess: 0,
            submittedAt: new Date(),
            participant: {
              id: "p4",
              name: "Carlos",
              cpf: "999",
              phone: "51666666666",
              registrationCode: "INCA-4"
            }
          }
        ]
      },
      {
        ...baseMatch,
        id: "match-5",
        officialScoreHome: 4,
        officialScoreAway: 3,
        bets: [
          {
            id: "bet-7",
            homeScoreGuess: 4,
            awayScoreGuess: 3,
            submittedAt: new Date(),
            participant: {
              id: "p5",
              name: "Bruno",
              cpf: "654",
              phone: "51555555555",
              registrationCode: "INCA-5"
            }
          }
        ]
      }
    ]);

    const podium = getPodium(ranking);
    expect(podium[0]?.participants.map((participant) => participant.name)).toEqual(["João", "Maria"]);
    expect(podium[1]?.participants.map((participant) => participant.name)).toEqual(["Ana", "Bruno", "Carlos"]);
    expect(podium[2]?.participants).toHaveLength(0);
  });

  it("usa terceiro lugar quando existe uma terceira faixa de pontuação", () => {
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
            id: "bet-2",
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
            id: "bet-3",
            homeScoreGuess: 1,
            awayScoreGuess: 0,
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
        id: "match-3",
        officialScoreHome: 3,
        officialScoreAway: 2,
        bets: [
          {
            id: "bet-4",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
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
            id: "bet-5",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
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
        id: "match-4",
        officialScoreHome: 0,
        officialScoreAway: 0,
        bets: [
          {
            id: "bet-6",
            homeScoreGuess: 0,
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
      ["João", 1, 3],
      ["Maria", 2, 2],
      ["Ana", 3, 1]
    ]);

    const podium = getPodium(ranking);
    expect(podium[0]?.participants.map((participant) => participant.name)).toEqual(["João"]);
    expect(podium[1]?.participants.map((participant) => participant.name)).toEqual(["Maria"]);
    expect(podium[2]?.participants.map((participant) => participant.name)).toEqual(["Ana"]);
  });

  it("gera resumo da classificação do participante com distância para top 3 e líder", () => {
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
            id: "bet-2",
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
            id: "bet-3",
            homeScoreGuess: 1,
            awayScoreGuess: 0,
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
        id: "match-3",
        officialScoreHome: 3,
        officialScoreAway: 2,
        bets: [
          {
            id: "bet-4",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
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
            id: "bet-5",
            homeScoreGuess: 3,
            awayScoreGuess: 2,
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
        id: "match-4",
        officialScoreHome: 0,
        officialScoreAway: 0,
        bets: [
          {
            id: "bet-6",
            homeScoreGuess: 0,
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

    expect(getParticipantClassificationSummary(ranking, "p3", 4)).toEqual({
      position: 3,
      inRanking: true,
      correctCount: 1,
      top3Distance: 0,
      leaderDistance: 2,
      progressPercent: 25,
      totalResultsCount: 4,
      leaderCount: 1
    });

    expect(getParticipantClassificationSummary(ranking, "missing", 4)).toEqual({
      position: null,
      inRanking: false,
      correctCount: 0,
      top3Distance: 1,
      leaderDistance: 3,
      progressPercent: 0,
      totalResultsCount: 4,
      leaderCount: 1
    });
  });
  it("considera acerto em empate no mata-mata pelo classificado nos pênaltis", () => {
    expect(
      isWinningBet(
        {
          stage: "round_of_32",
          officialScoreHome: 2,
          officialScoreAway: 2,
          wentToPenalties: true,
          penaltyWinnerSide: "home"
        },
        {
          homeScoreGuess: 1,
          awayScoreGuess: 1,
          goesToPenalties: true,
          penaltyWinnerSide: "home"
        }
      )
    ).toBe(true);
  });

  it("não considera acerto quando o empate no mata-mata escolhe classificado errado", () => {
    expect(
      isWinningBet(
        {
          stage: "round_of_32",
          officialScoreHome: 2,
          officialScoreAway: 2,
          wentToPenalties: true,
          penaltyWinnerSide: "home"
        },
        {
          homeScoreGuess: 1,
          awayScoreGuess: 1,
          goesToPenalties: true,
          penaltyWinnerSide: "away"
        }
      )
    ).toBe(false);
  });

  it("considera acerto no mata-mata com vencedor no placar pelo vencedor da partida", () => {
    expect(
      isWinningBet(
        {
          stage: "round_of_32",
          officialScoreHome: 2,
          officialScoreAway: 0,
          wentToPenalties: false,
          penaltyWinnerSide: null
        },
        {
          homeScoreGuess: 3,
          awayScoreGuess: 1,
          goesToPenalties: false,
          penaltyWinnerSide: null
        }
      )
    ).toBe(true);
  });
});
