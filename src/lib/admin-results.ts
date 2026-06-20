type ParticipantSummary = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  registrationCode: string;
};

type BetSummary = {
  id: string;
  homeScoreGuess: number;
  awayScoreGuess: number;
  submittedAt: Date;
  participant: ParticipantSummary;
};

type MatchResultSummary = {
  id: string;
  groupName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: string;
  awayTeam: string;
  officialScoreHome: number | null;
  officialScoreAway: number | null;
  resultRegisteredAt?: Date | null;
  resultUpdatedAt?: Date | null;
  bets: BetSummary[];
};

export type MatchWinner = {
  id: string;
  participantId: string;
  name: string;
  cpf: string;
  phone: string;
  registrationCode: string;
  homeScoreGuess: number;
  awayScoreGuess: number;
  submittedAt: Date;
};

export type ParticipantRankingItem = {
  position: number;
  participantId: string;
  name: string;
  cpf: string;
  phone: string;
  registrationCode: string;
  correctCount: number;
};

export function hasOfficialResult(match: Pick<MatchResultSummary, "officialScoreHome" | "officialScoreAway">) {
  return match.officialScoreHome !== null && match.officialScoreAway !== null;
}

export function getWinnersForMatch(match: MatchResultSummary): MatchWinner[] {
  if (!hasOfficialResult(match)) {
    return [];
  }

  return match.bets
    .filter(
      (bet) => bet.homeScoreGuess === match.officialScoreHome && bet.awayScoreGuess === match.officialScoreAway
    )
    .map((bet) => ({
      id: bet.id,
      participantId: bet.participant.id,
      name: bet.participant.name,
      cpf: bet.participant.cpf,
      phone: bet.participant.phone,
      registrationCode: bet.participant.registrationCode,
      homeScoreGuess: bet.homeScoreGuess,
      awayScoreGuess: bet.awayScoreGuess,
      submittedAt: bet.submittedAt
    }));
}

export function buildParticipantRanking(matches: MatchResultSummary[]): ParticipantRankingItem[] {
  const counters = new Map<
    string,
    {
      participantId: string;
      name: string;
      cpf: string;
      phone: string;
      registrationCode: string;
      correctCount: number;
    }
  >();

  for (const match of matches) {
    for (const winner of getWinnersForMatch(match)) {
      const current = counters.get(winner.registrationCode);
      if (current) {
        current.correctCount += 1;
        continue;
      }

      counters.set(winner.registrationCode, {
        participantId: winner.participantId,
        name: winner.name,
        cpf: winner.cpf,
        phone: winner.phone,
        registrationCode: winner.registrationCode,
        correctCount: 1
      });
    }
  }

  const sorted = Array.from(counters.values()).sort((a, b) => {
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return a.name.localeCompare(b.name, "pt-BR");
  });

  let currentPosition = 0;
  let previousCount: number | null = null;

  return sorted.map((item) => {
    if (previousCount !== item.correctCount) {
      currentPosition += 1;
      previousCount = item.correctCount;
    }

    return {
      position: currentPosition,
      participantId: item.participantId,
      name: item.name,
      cpf: item.cpf,
      phone: item.phone,
      registrationCode: item.registrationCode,
      correctCount: item.correctCount
    };
  });
}

export function getPodium(ranking: ParticipantRankingItem[]) {
  const podium = new Map<number, ParticipantRankingItem[]>();

  for (const item of ranking) {
    if (item.position > 3) {
      continue;
    }

    const current = podium.get(item.position) ?? [];
    current.push(item);
    podium.set(item.position, current);
  }

  return [1, 2, 3].map((position) => ({
    position,
    participants: podium.get(position) ?? []
  }));
}
