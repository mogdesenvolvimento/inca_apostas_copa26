import { prisma } from "@/lib/prisma";
import { validateParticipantInput } from "@/lib/validation";

type ParticipantClient = Pick<typeof prisma, "participant">;

export async function findOrCreateParticipantByPhone(
  name: string,
  phone: string,
  client: ParticipantClient = prisma
) {
  const data = validateParticipantInput(name, phone);
  const existing = await client.participant.findUnique({
    where: { phone: data.phone }
  });

  if (existing) {
    return { participant: existing, created: false };
  }

  const participant = await client.participant.create({
    data
  });

  return { participant, created: true };
}
