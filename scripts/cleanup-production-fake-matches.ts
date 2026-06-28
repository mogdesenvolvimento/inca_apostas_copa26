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
};

type SuspectMatch = {
  id: string;
  stage: string;
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
const OFFICIAL_FILES = [
  "internationalFootballSeasonGroupStage.seed.json",
  "internationalFootballSeasonRoundOf32.seed.json"
];

function loadMatches(fileName: string): SeedMatch[] {
  const filePath = path.join(process.cwd(), "prisma", "data", fileName);
  const rawContent = fs.readFileSync(filePath, "utf8");
  const normalizedContent = rawContent.replace(/^\uFEFF/, "");
  return JSON.parse(normalizedContent) as SeedMatch[];
}

function isKnockoutStage(stage: string) {
  return ["round_of_32", "round_of_16", "quarter_final", "semi_final", "final"].includes(stage);
}

function buildOfficialMatchId(match: SeedMatch) {
  if (isKnockoutStage(match.stage)) {
    return `${match.stage}-${String(match.matchNumber).padStart(3, "0")}-${match.matchDate}-${match.matchTime}-${match.homeTeam}-${match.awayTeam}`;
  }

  return `group-${String(match.matchNumber).padStart(3, "0")}-${match.group}-${match.matchDate}-${match.matchTime}-${match.homeTeam}-${match.awayTeam}`;
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function classifyTestReasons(
  match: {
    id: string;
    stage: string | null;
    groupName: string;
    kickoffAt: Date;
    homeTeam: string;
    awayTeam: string;
  },
  officialMatchIds: Set<string>
) {
  const reasons: string[] = [];
  const haystack = normalize(`${match.homeTeam} ${match.awayTeam} ${match.groupName} ${match.stage ?? ""}`);
  const keywords = [
    "teste",
    "mock",
    "fake",
    "debug",
    "placeholder",
    "sandbox",
    "modelo",
    "piloto",
    "simulado",
    "cenario",
    "rodada",
    "virada",
    "ultimo",
    "noite",
    "beta",
    "alpha",
    "borough",
    "athletic",
    "united",
    "lance final",
    "esquadra",
    "classifica ja",
    "penaltis",
    "empate"
  ];

  const stage = match.stage ?? "group";

  if (stage === "test") {
    reasons.push("stage marcado como test");
  }

  if (stage === "friendly") {
    reasons.push("stage marcado como friendly");
  }

  if (match.groupName === "T" || match.groupName === "Grupo T") {
    reasons.push("grupo inexistente na tabela oficial (Grupo T)");
  }

  if (!officialMatchIds.has(match.id)) {
    reasons.push("não pertence à tabela oficial cadastrada");
  }

  if (keywords.some((keyword) => haystack.includes(keyword))) {
    reasons.push("nomes genéricos/de teste no confronto");
  }

  if (match.kickoffAt < REFERENCE_DATE && stage !== "group") {
    reasons.push("jogo não oficial anterior à abertura da Copa");
  }

  return Array.from(new Set(reasons));
}

function shouldExecuteCleanup() {
  return process.env.CONFIRM_DELETE_PRODUCTION_FAKE_MATCHES === EXECUTION_CONFIRMATION;
}

async function main() {
  const officialMatchIds = new Set(
    OFFICIAL_FILES.flatMap((fileName) => loadMatches(fileName).map(buildOfficialMatchId))
  );
  const shouldExecute = shouldExecuteCleanup();

  const matches = await prisma.match.findMany({
    include: {
      bets: {
        select: { id: true }
      }
    },
    orderBy: [{ kickoffAt: "asc" }, { homeTeam: "asc" }]
  });

  const suspects: SuspectMatch[] = matches
    .map((match) => ({
      id: match.id,
      stage: match.stage ?? "group",
      matchDate: match.matchDate,
      matchTime: match.matchTime,
      groupName: match.groupName,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      betCount: match.bets.length,
      reasons: classifyTestReasons(match, officialMatchIds)
    }))
    .filter((match) => match.reasons.length > 0);

  const totalMatches = matches.length;
  const pastMatches = matches.filter((match) => match.kickoffAt < REFERENCE_DATE).length;
  const futureMatches = matches.filter((match) => match.kickoffAt >= REFERENCE_DATE).length;
  const gamesWithBets = matches.filter((match) => match.bets.length > 0).length;
  const gamesWithoutBets = matches.filter((match) => match.bets.length === 0).length;

  console.log(`[cleanup-production-fake-matches] DATABASE_URL: ${process.env.DATABASE_URL ?? "não definido"}`);
  console.log(`[cleanup-production-fake-matches] Modo: ${shouldExecute ? "EXECUÇÃO" : "PRÉVIA"}`);
  console.log(`[cleanup-production-fake-matches] Jogos totais: ${totalMatches}`);
  console.log(`[cleanup-production-fake-matches] Jogos futuros: ${futureMatches}`);
  console.log(`[cleanup-production-fake-matches] Jogos passados: ${pastMatches}`);
  console.log(`[cleanup-production-fake-matches] Jogos com apostas: ${gamesWithBets}`);
  console.log(`[cleanup-production-fake-matches] Jogos sem apostas: ${gamesWithoutBets}`);
  console.log(`[cleanup-production-fake-matches] Jogos suspeitos/fake: ${suspects.length}`);
  console.log("[cleanup-production-fake-matches] Lista dos jogos classificados como fake:");
  console.log(JSON.stringify(suspects, null, 2));

  if (!shouldExecute) {
    console.log(
      "[cleanup-production-fake-matches] Nenhuma exclusão foi executada. Defina CONFIRM_DELETE_PRODUCTION_FAKE_MATCHES=YES para remover apostas dependentes e jogos fake."
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

  console.log(`[cleanup-production-fake-matches] Jogos removidos: ${suspectIds.length}`);
  console.log(`[cleanup-production-fake-matches] Apostas removidas junto com jogos fake: ${betsToDelete.length}`);
  console.log(`[cleanup-production-fake-matches] Jogos restantes: ${remainingMatches}`);
  console.log(`[cleanup-production-fake-matches] Apostas restantes: ${remainingBets}`);
  console.log(`[cleanup-production-fake-matches] Participantes preservados: ${remainingParticipants}`);
  console.log("[cleanup-production-fake-matches] IDs removidos:");
  console.log(JSON.stringify(suspectIds, null, 2));
}

main()
  .catch(async (error) => {
    console.error("[cleanup-production-fake-matches] Falha na auditoria/limpeza:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
