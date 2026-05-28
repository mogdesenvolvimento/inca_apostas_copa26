import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function ensureConfirmation() {
  if (process.env.CONFIRM_CLEAR_PARTICIPANTS !== "YES") {
    throw new Error(
      "Operação bloqueada. Defina CONFIRM_CLEAR_PARTICIPANTS=YES para limpar participantes e apostas."
    );
  }
}

async function main() {
  ensureConfirmation();

  const [betCount, participantCount] = await Promise.all([
    prisma.bet.count(),
    prisma.participant.count()
  ]);

  const result = await prisma.$transaction(async (tx) => {
    const deletedBets = await tx.bet.deleteMany();
    const deletedParticipants = await tx.participant.deleteMany();

    return {
      deletedBets: deletedBets.count,
      deletedParticipants: deletedParticipants.count
    };
  });

  console.log(`[clear-participants] Bets encontradas: ${betCount}`);
  console.log(`[clear-participants] Participants encontrados: ${participantCount}`);
  console.log(`[clear-participants] Bets removidas: ${result.deletedBets}`);
  console.log(`[clear-participants] Participants removidos: ${result.deletedParticipants}`);
  console.log("[clear-participants] Jogos e admins foram preservados.");
}

main()
  .catch(async (error) => {
    console.error("[clear-participants] Falha ao limpar participantes:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
