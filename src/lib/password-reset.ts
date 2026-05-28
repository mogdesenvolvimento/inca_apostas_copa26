import crypto from "node:crypto";

type PasswordResetPayload = {
  participantId: string;
  email: string;
  exp: number;
};

const PASSWORD_RESET_TTL_SECONDS = 60 * 30;

function getSecret() {
  return process.env.SESSION_SECRET ?? "dev-only-change-this-session-secret";
}

export function createPasswordResetToken(participantId: string, email: string) {
  const payload: PasswordResetPayload = {
    participantId,
    email,
    exp: Math.floor(Date.now() / 1000) + PASSWORD_RESET_TTL_SECONDS
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyPasswordResetToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    throw new Error("Link de redefinição inválido.");
  }

  const expected = crypto.createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
  if (signature.length !== expected.length) {
    throw new Error("Link de redefinição inválido.");
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Link de redefinição inválido.");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString()) as PasswordResetPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Esse link de redefinição já expirou.");
  }

  return payload;
}
