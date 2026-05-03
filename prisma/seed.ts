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
  status: string;
};

function loadMatches(fileName: string): SeedMatch[] {
  const filePath = path.join(process.cwd(), "prisma", "data", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as SeedMatch[];
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@inca.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const matches = [
    ...loadMatches("worldCup2026ProductionTestMatches.seed.json"),
    ...loadMatches("worldCup2026GroupStage.seed.json")
  ];

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
    select: { id: true }
  });

  const deletedBets = await prisma.bet.deleteMany();
  const deletedMatches = await prisma.match.deleteMany();
  const deletedParticipants = await prisma.participant.deleteMany();

  console.log(`[seed] Bets removidas: ${deletedBets.count}`);
  console.log(`[seed] Matches removidas: ${deletedMatches.count}`);
  console.log(`[seed] Participants removidos: ${deletedParticipants.count}`);

  const insertedMatches = await prisma.$transaction(
    matches.map((match) =>
      prisma.match.create({
        data: {
          id: `group-${String(match.matchNumber).padStart(3, "0")}-${match.group}-${match.matchDate}-${match.matchTime}-${match.homeTeam}-${match.awayTeam}`,
          groupName: `Grupo ${match.group}`,
          matchDate: match.matchDate,
          matchTime: match.matchTime,
          kickoffAt: new Date(match.kickoffAt),
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          isActive: match.status === "scheduled"
        }
      })
    )
  );

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

  console.log(`[seed] Matches inseridas: ${insertedMatches.length}`);
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
