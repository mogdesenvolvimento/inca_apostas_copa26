import bcrypt from "bcryptjs";
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
  country?: string;
  status: string;
};

function loadMatches(fileName: string): SeedMatch[] {
  const filePath = path.join(process.cwd(), "prisma", "data", fileName);
  const rawContent = fs.readFileSync(filePath, "utf8");
  const normalizedContent = rawContent.replace(/^\uFEFF/, "");
  return JSON.parse(normalizedContent) as SeedMatch[];
}

function isKnockoutStage(stage: string) {
  return ["round_of_32", "round_of_16", "quarter_final", "semi_final", "final"].includes(stage);
}

function buildMatchId(match: SeedMatch) {
  if (isKnockoutStage(match.stage)) {
    return `${match.stage}-${String(match.matchNumber).padStart(3, "0")}-${match.matchDate}-${match.matchTime}-${match.homeTeam}-${match.awayTeam}`;
  }

  return `group-${String(match.matchNumber).padStart(3, "0")}-${match.group}-${match.matchDate}-${match.matchTime}-${match.homeTeam}-${match.awayTeam}`;
}

function getStageLabel(match: SeedMatch) {
  switch (match.stage) {
    case "round_of_32":
      return "16 Avos de Final";
    case "round_of_16":
      return "Oitavas de Final";
    case "quarter_final":
      return "Quartas de Final";
    case "semi_final":
      return "Semifinais";
    case "final":
      return "Final";
    default:
      return `Grupo ${match.group}`;
  }
}

function isActiveStatus(status: string) {
  return !["finished", "completed", "cancelled", "finalizado", "encerrado", "inactive"].includes(status.toLowerCase());
}

function shouldIncludeTestMatches() {
  if (process.env.INCLUDE_TEST_MATCHES === "YES") return true;
  if (process.env.INCLUDE_TEST_MATCHES === "NO") return false;
  return process.env.NODE_ENV !== "production";
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@inca.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const includeTestMatches = shouldIncludeTestMatches();
  const matches = [
    ...(includeTestMatches ? loadMatches("incaPredictionsTestMatches.seed.json") : []),
    ...loadMatches("internationalFootballSeasonGroupStage.seed.json"),
    ...loadMatches("internationalFootballSeasonRoundOf32.seed.json")
  ];

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
    select: { id: true }
  });

  const [preservedBets, preservedMatches, preservedParticipants] = await Promise.all([
    prisma.bet.count(),
    prisma.match.count(),
    prisma.participant.count()
  ]);

  console.log(`[seed] Bets preservadas: ${preservedBets}`);
  console.log(`[seed] Matches existentes antes do sync: ${preservedMatches}`);
  console.log(`[seed] Participants preservados: ${preservedParticipants}`);

  const matchIds = matches.map(buildMatchId);
  const existingSeedMatches = await prisma.match.findMany({
    where: { id: { in: matchIds } },
    select: { id: true }
  });
  const existingMatchIds = new Set(existingSeedMatches.map((match) => match.id));

  await prisma.$transaction(
    matches.map((match) =>
      prisma.match.upsert({
        where: { id: buildMatchId(match) },
        update: {
          matchNumber: match.matchNumber,
          stage: match.stage,
          groupName: getStageLabel(match),
          matchDate: match.matchDate,
          matchTime: match.matchTime,
          kickoffAt: new Date(match.kickoffAt),
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          city: match.city,
          country: match.country ?? null,
          status: match.status,
          isActive: isActiveStatus(match.status)
        },
        create: {
          id: buildMatchId(match),
          matchNumber: match.matchNumber,
          stage: match.stage,
          groupName: getStageLabel(match),
          matchDate: match.matchDate,
          matchTime: match.matchTime,
          kickoffAt: new Date(match.kickoffAt),
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          city: match.city,
          country: match.country ?? null,
          status: match.status,
          isActive: isActiveStatus(match.status)
        }
      })
    )
  );

  const createdMatches = matches.length - existingMatchIds.size;
  const updatedMatches = existingMatchIds.size;

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: "admin"
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin"
    }
  });

  console.log(`[seed] Matches criadas: ${createdMatches}`);
  console.log(`[seed] Matches atualizadas: ${updatedMatches}`);
  console.log(`[seed] Matches no arquivo de seed: ${matches.length}`);
  console.log(`[seed] Jogos de teste ${includeTestMatches ? "incluídos" : "ignorados"} neste ambiente.`);
  console.log(`[seed] Admin ${existingAdmin ? "preservado/atualizado" : "criado"}: ${adminEmail}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[seed] Falha ao popular a base:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
