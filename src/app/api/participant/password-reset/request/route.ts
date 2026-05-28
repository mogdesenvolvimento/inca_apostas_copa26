import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { jsonError, readJson } from "@/lib/http";
import { createPasswordResetToken } from "@/lib/password-reset";
import { validatePasswordResetRequestInput } from "@/lib/validation";
import { findParticipantForPasswordReset } from "@/services/participant-auth";

type Body = {
  cpf?: string;
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const participant = await findParticipantForPasswordReset(body.cpf ?? "");

    if (!body.email) {
      return NextResponse.json({
        ok: true,
        participantFound: true,
        message: "Cadastro encontrado. Agora informa teu e-mail para receber o link de redefinição."
      });
    }

    const { email } = validatePasswordResetRequestInput(body.cpf ?? "", body.email);
    const token = createPasswordResetToken(participant.id, email);
    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/redefinir-senha?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: email,
      resetUrl
    });

    return NextResponse.json({
      ok: true,
      message: "Se o CPF estiver certo, o link de redefinição será enviado para o e-mail informado."
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível iniciar a redefinição de senha.");
  }
}
