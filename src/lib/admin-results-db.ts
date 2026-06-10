import { prisma } from "@/lib/prisma";

type MatchWithId = {
  id: string;
};

type MatchResultRow = {
  id: string;
  officialScoreHome: number | null;
  officialScoreAway: number | null;
  resultRegisteredAt: string | Date | null;
  resultUpdatedAt: string | Date | null;
};

export async function attachMatchResults<T extends MatchWithId>(matches: T[]): Promise<Array<T & MatchResultRow>> {
  if (!matches.length) {
    return [];
  }

  const rows = await loadMatchResultRows(matches.map((match) => match.id));
  const results = new Map(rows.map((row) => [row.id, row]));

  return matches.map((match) => {
    const result = results.get(match.id) ?? {
      id: match.id,
      officialScoreHome: null,
      officialScoreAway: null,
      resultRegisteredAt: null,
      resultUpdatedAt: null
    };

    return {
      ...match,
      officialScoreHome: result.officialScoreHome,
      officialScoreAway: result.officialScoreAway,
      resultRegisteredAt: toDateOrNull(result.resultRegisteredAt),
      resultUpdatedAt: toDateOrNull(result.resultUpdatedAt)
    };
  });
}

export async function getMatchResultById(matchId: string) {
  const [row] = await loadMatchResultRows([matchId]);

  return (
    row ?? {
      id: matchId,
      officialScoreHome: null,
      officialScoreAway: null,
      resultRegisteredAt: null,
      resultUpdatedAt: null
    }
  );
}

export async function saveOfficialResult(params: {
  matchId: string;
  officialScoreHome: number;
  officialScoreAway: number;
  resultRegisteredAt: Date;
  resultUpdatedAt: Date;
}) {
  const { matchId, officialScoreHome, officialScoreAway, resultRegisteredAt, resultUpdatedAt } = params;

  await prisma.$executeRaw`
    UPDATE "Match"
    SET
      "officialScoreHome" = ${officialScoreHome},
      "officialScoreAway" = ${officialScoreAway},
      "resultRegisteredAt" = ${resultRegisteredAt.toISOString()},
      "resultUpdatedAt" = ${resultUpdatedAt.toISOString()}
    WHERE "id" = ${matchId}
  `;
}

async function loadMatchResultRows(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  const placeholders = ids.map(() => "?").join(", ");
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT "id", "officialScoreHome", "officialScoreAway", "resultRegisteredAt", "resultUpdatedAt"
     FROM "Match"
     WHERE "id" IN (${placeholders})`,
    ...ids
  )) as MatchResultRow[];

  return rows.map((row) => ({
    ...row,
    officialScoreHome: toNumberOrNull(row.officialScoreHome),
    officialScoreAway: toNumberOrNull(row.officialScoreAway)
  }));
}

function toDateOrNull(value: string | Date | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function toNumberOrNull(value: number | string | null) {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}
