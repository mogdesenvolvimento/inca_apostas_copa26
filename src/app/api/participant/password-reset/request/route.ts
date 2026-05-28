import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { jsonError, readJson } from "@/lib/http";
import { createPasswordResetToken } from "@/lib/password-reset";
import { validatePasswordResetRequestInput } from "@/lib/validation";
import { findParticipantForPasswordReset } from "@/services/participant-auth";

type Body = {
  cpf?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const { cpf } = validatePasswordResetRequestInput(body.cpf ?? "");
    const participant = await findParticipantForPasswordReset(cpf);
    const token = createPasswordResetToken(participant.id, participant.email);
    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/redefinir-senha?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: participant.email,
      resetUrl
    });

    return NextResponse.json({
      ok: true,
      message: `Se o CPF estiver certo, o link de redefinição será enviado para ${maskEmail(participant.email)}.`
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível iniciar a redefinição de senha.");
  }
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}
