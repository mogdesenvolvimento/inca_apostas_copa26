import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedMatch = {
  matchNumber: number;
  stage: string;
  group: string;
  matchDate: string;
  matchTime: string;
  kickoffAt: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  city: string;
  status: string;
};

type SuspectMatch = {
  id: string;
  matchDate: string;
  matchTime: string;
  groupName: string;
  homeTeam: string;
  awayTeam: string;
  betCount: number;
  reasons: string[];
};

const REFERENCE_DATE = new Date("2026-06-11T00:00:00-03:00");
const EXECUTION_CONFIRMATION = "YES";

function loadMatches(fileName: string): SeedMatch[] {
  const filePath = path.join(process.cwd(), "prisma", "data", fileName);
  const rawContent = fs.readFileSync(filePath, "utf8");
  const normalizedContent = rawContent.replace(/^\uFEFF/, "");

  return JSON.parse(normalizedContent) as SeedMatch[];
}

function buildMatchId(match: SeedMatch) {
  return `group-${String(match.matchNumber).padStart(3, "0")}-${match.group}-${match.matchDate}-${match.matchTime}-${match.homeTeam}-${match.awayTeam}`;
}

function classifyTestReasons(
  match: {
    id: string;
    groupName: string;
    matchDate: string;
    matchTime: string;
    kickoffAt: Date;
    homeTeam: string;
    awayTeam: string;
  },
  officialMatchIds: Set<string>
) {
  const reasons: string[] = [];
  const haystack = `${match.homeTeam} ${match.awayTeam} ${match.groupName}`.toLowerCase();
  const keywords = [
    "teste",
    "mock",
    "fake",
    "debug",
    "placeholder",
    "sandbox",
    "time ",
    "equipe ",
    "demo",
    "modelo",
    "piloto",
    "simulado",
    "cenario",
    "cenário",
    "rodada",
    "virada",
    "ultimo",
    "último",
    "noite",
    "beta",
    "alpha",
    "borough",
    "athletic",
    "united",
    "clube ",
    " fc",
    "lance final",
    "esquadra"
  ];

  if (match.kickoffAt < REFERENCE_DATE) {
    reasons.push("data anterior a 11/06/2026");
  }

  if (match.groupName === "Grupo T") {
    reasons.push("grupo inexistente na fase oficial (Grupo T)");
  }

  if (!officialMatchIds.has(match.id)) {
    reasons.push("não pertence à tabela oficial da Copa cadastrada");
  }

  if (keywords.some((keyword) => haystack.includes(keyword))) {
    reasons.push("nomes genéricos/de teste no confronto");
  }

  return reasons;
}

function ensureExecutionConfirmation() {
  if (process.env.CONFIRM_DELETE_TEST_MATCHES !== EXECUTION_CONFIRMATION) {
    return false;
  }

  return true;
}

async function main() {
  const officialMatches = loadMatches("internationalFootballSeasonGroupStage.seed.json");
  const officialMatchIds = new Set(officialMatches.map(buildMatchId));
  const shouldExecute = ensureExecutionConfirmation();

  const matches = await prisma.match.findMany({
    include: {
      bets: {
        select: { id: true }
      }
    },
    orderBy: [{ kickoffAt: "asc" }, { homeTeam: "asc" }]
  });

  const suspects: SuspectMatch[] = matches
    .map((match) => {
      const reasons = classifyTestReasons(match, officialMatchIds);

      return {
        id: match.id,
        matchDate: match.matchDate,
        matchTime: match.matchTime,
        groupName: match.groupName,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        betCount: match.bets.length,
        reasons
      };
    })
    .filter((match) => match.reasons.length > 0);

  const totalMatches = matches.length;
  const pastMatches = matches.filter((match) => match.kickoffAt < REFERENCE_DATE).length;
  const futureMatches = matches.filter((match) => match.kickoffAt >= REFERENCE_DATE).length;
  const gamesWithBets = matches.filter((match) => match.bets.length > 0).length;
  const gamesWithoutBets = matches.filter((match) => match.bets.length === 0).length;

  console.log(`[cleanup-test-matches] DATABASE_URL: ${process.env.DATABASE_URL ?? "não definido"}`);
  console.log(`[cleanup-test-matches] Modo: ${shouldExecute ? "EXECUÇÃO" : "PRÉVIA"}`);
  console.log(`[cleanup-test-matches] Jogos totais: ${totalMatches}`);
  console.log(`[cleanup-test-matches] Jogos futuros: ${futureMatches}`);
  console.log(`[cleanup-test-matches] Jogos passados: ${pastMatches}`);
  console.log(`[cleanup-test-matches] Jogos com apostas: ${gamesWithBets}`);
  console.log(`[cleanup-test-matches] Jogos sem apostas: ${gamesWithoutBets}`);
  console.log(`[cleanup-test-matches] Jogos suspeitos/fake: ${suspects.length}`);
  console.log("[cleanup-test-matches] Lista dos jogos classificados como teste:");
  console.log(JSON.stringify(suspects, null, 2));

  if (!shouldExecute) {
    console.log(
      "[cleanup-test-matches] Nenhuma exclusão foi executada. Defina CONFIRM_DELETE_TEST_MATCHES=YES para remover apostas dependentes e jogos fake."
    );
    return;
  }

  const suspectIds = suspects.map((match) => match.id);
  const betsToDelete = await prisma.bet.findMany({
    where: {
      matchId: { in: suspectIds }
    },
    select: {
      id: true
    }
  });

  await prisma.$transaction(async (tx) => {
    if (betsToDelete.length > 0) {
      await tx.bet.deleteMany({
        where: {
          matchId: { in: suspectIds }
        }
      });
    }

    await tx.match.deleteMany({
      where: {
        id: { in: suspectIds }
      }
    });
  });

  const [remainingMatches, remainingBets, remainingParticipants] = await Promise.all([
    prisma.match.count(),
    prisma.bet.count(),
    prisma.participant.count()
  ]);

  console.log(`[cleanup-test-matches] Jogos removidos: ${suspectIds.length}`);
  console.log(`[cleanup-test-matches] Apostas removidas junto com jogos fake: ${betsToDelete.length}`);
  console.log(`[cleanup-test-matches] Jogos restantes: ${remainingMatches}`);
  console.log(`[cleanup-test-matches] Apostas restantes: ${remainingBets}`);
  console.log(`[cleanup-test-matches] Participantes preservados: ${remainingParticipants}`);
  console.log("[cleanup-test-matches] IDs removidos:");
  console.log(JSON.stringify(suspectIds, null, 2));
}

main()
  .catch(async (error) => {
    console.error("[cleanup-test-matches] Falha na auditoria/limpeza:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
