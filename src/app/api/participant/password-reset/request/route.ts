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
    const origin = resolvePublicOrigin(request);
    const resetUrl = `${origin}/redefinir-senha?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: participant.email,
      resetUrl
    });

    return NextResponse.json({
      ok: true,
      message: `Email foi enviado para ${maskEmail(participant.email)}.`
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível iniciar a redefinição de senha.");
  }
}

function resolvePublicOrigin(request: Request) {
  const configuredOrigin =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.RAILWAY_PUBLIC_DOMAIN;

  if (configuredOrigin) {
    if (configuredOrigin.startsWith("http://") || configuredOrigin.startsWith("https://")) {
      return configuredOrigin.replace(/\/$/, "");
    }

    return `https://${configuredOrigin.replace(/\/$/, "")}`;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
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
