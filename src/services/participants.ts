import { prisma } from "@/lib/prisma";
import { generateRegistrationCode } from "@/lib/registration-code";
import { validateParticipantInput } from "@/lib/validation";

type ParticipantClient = Pick<typeof prisma, "participant">;

export async function findOrCreateParticipantByCpf(
  name: string,
  cpf: string,
  phone: string,
  client: ParticipantClient = prisma
) {
  const data = validateParticipantInput(name, cpf, phone);
  const existing = await client.participant.findUnique({
    where: { cpf: data.cpf }
  });

  if (existing) {
    return { participant: existing, created: false };
  }

  const registrationCode = await generateUniqueRegistrationCode(client);
  const participant = await client.participant.create({
    data: {
      ...data,
      registrationCode
    }
  });

  return { participant, created: true };
}

async function generateUniqueRegistrationCode(client: ParticipantClient) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateRegistrationCode();
    const existing = await client.participant.findUnique({
      where: { registrationCode: code }
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Não foi possível gerar um código de participação. Tenta de novo.");
}
