import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

ensureSqliteDirectory();
const prisma = new PrismaClient();

function ensureSqliteDirectory() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.startsWith("file:")) {
    return;
  }

  const filePath = databaseUrl.replace(/^file:/, "");
  if (!filePath || filePath === ":memory:") {
    return;
  }

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), "prisma", filePath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
}

async function main() {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys=OFF;");

  const participantColumns = (await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info('Participant');`)).map(
    (column) => column.name
  );

  const needsParticipantRebuild =
    participantColumns.length > 0 &&
    (!participantColumns.includes("cpf") ||
      !participantColumns.includes("registrationCode") ||
      !participantColumns.includes("passwordHash"));

  if (needsParticipantRebuild) {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS Bet;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS Participant;`);
    console.log("Schema antigo de Participant detectado. Participant e Bet foram recriados.");
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Participant (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      registrationCode TEXT NOT NULL UNIQUE,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Participant_phone_idx ON Participant(phone);`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Match (
      id TEXT NOT NULL PRIMARY KEY,
      groupName TEXT NOT NULL,
      matchDate TEXT NOT NULL,
      matchTime TEXT NOT NULL,
      kickoffAt DATETIME NOT NULL,
      homeTeam TEXT NOT NULL,
      awayTeam TEXT NOT NULL,
      isActive BOOLEAN NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Match_matchDate_idx ON Match(matchDate);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Match_groupName_idx ON Match(groupName);`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Bet (
      id TEXT NOT NULL PRIMARY KEY,
      participantId TEXT NOT NULL,
      matchId TEXT NOT NULL,
      homeScoreGuess INTEGER NOT NULL,
      awayScoreGuess INTEGER NOT NULL,
      submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT Bet_participantId_fkey FOREIGN KEY (participantId) REFERENCES Participant(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT Bet_matchId_fkey FOREIGN KEY (matchId) REFERENCES Match(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS Bet_participantId_matchId_key ON Bet(participantId, matchId);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Bet_matchId_idx ON Bet(matchId);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Bet_participantId_idx ON Bet(participantId);`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AdminUser (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys=ON;");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("SQLite inicializado com sucesso.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
