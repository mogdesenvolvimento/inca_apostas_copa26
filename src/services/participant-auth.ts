import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { verifyPasswordResetToken } from "@/lib/password-reset";
import { generateRegistrationCode } from "@/lib/registration-code";
import {
  validateParticipantLoginInput,
  validateParticipantRegistrationInput,
  validatePasswordResetConfirmInput,
  validatePasswordResetRequestInput
} from "@/lib/validation";

type ParticipantClient = Pick<typeof prisma, "participant">;

export async function createParticipantAccount(
  name: string,
  cpf: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean,
  client: ParticipantClient = prisma
) {
  const data = validateParticipantRegistrationInput(name, cpf, email, phone, password, confirmPassword, acceptedTerms);

  const existing = await client.participant.findUnique({
    where: { cpf: data.cpf }
  });

  if (existing) {
    throw new Error("Já existe cadastro com esse CPF. Faz teu acesso para continuar.");
  }

  const registrationCode = await generateUniqueRegistrationCode(client);
  const passwordHash = await hashPassword(data.password);
  const acceptedAt = new Date();

  return client.participant.create({
    data: {
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      passwordHash,
      registrationCode,
      termsAcceptedAt: acceptedAt,
      privacyAcceptedAt: acceptedAt
    }
  });
}

export async function authenticateParticipant(cpf: string, password: string, client: ParticipantClient = prisma) {
  const credentials = validateParticipantLoginInput(cpf, password);
  const participant = await client.participant.findUnique({
    where: { cpf: credentials.cpf }
  });

  if (!participant) {
    throw new Error("Não encontramos cadastro com esse CPF.");
  }

  const passwordMatches = await verifyPassword(credentials.password, participant.passwordHash);
  if (!passwordMatches) {
    throw new Error("CPF ou senha inválidos.");
  }

  return participant;
}

export async function findParticipantForPasswordReset(cpf: string, client: ParticipantClient = prisma) {
  const data = validatePasswordResetRequestInput(cpf);
  const participant = await client.participant.findUnique({
    where: { cpf: data.cpf },
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true
    }
  });

  if (!participant) {
    throw new Error("Não encontramos cadastro com esse CPF.");
  }

  if (!participant.email) {
    throw new Error("Esse cadastro ainda não tem e-mail de recuperação configurado. Fala com o Inca Bar para atualizar teu acesso.");
  }

  return {
    ...participant,
    email: participant.email
  };
}

export async function resetParticipantPassword(
  token: string,
  password: string,
  confirmPassword: string,
  client: ParticipantClient = prisma
) {
  const tokenPayload = verifyPasswordResetToken(token);
  const credentials = validatePasswordResetConfirmInput(password, confirmPassword);
  const participant = await client.participant.findUnique({
    where: { id: tokenPayload.participantId },
    select: { id: true, email: true }
  });

  if (!participant) {
    throw new Error("Não encontramos esse cadastro para redefinir a senha.");
  }

  if (!participant.email || participant.email !== tokenPayload.email) {
    throw new Error("Esse link de redefinição não é mais válido para este cadastro.");
  }

  const passwordHash = await hashPassword(credentials.password);

  await client.participant.update({
    where: { id: tokenPayload.participantId },
    data: { passwordHash }
  });
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

  throw new Error("Não foi possível gerar teu código de participação. Tenta de novo.");
}
