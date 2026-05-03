import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "inca_admin_session";
export const PARTICIPANT_SESSION_COOKIE = "inca_participant_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
const PARTICIPANT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  subjectId: string;
  exp: number;
};

function getSecret() {
  return process.env.SESSION_SECRET ?? "dev-only-change-this-session-secret";
}

export function signAdminSession(adminId: string) {
  return signSession(adminId, ADMIN_SESSION_TTL_SECONDS);
}

export function signParticipantSession(participantId: string) {
  return signSession(participantId, PARTICIPANT_SESSION_TTL_SECONDS);
}

function signSession(subjectId: string, ttlSeconds: number) {
  const payload: SessionPayload = {
    subjectId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySession(token?: string) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  if (signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminSession(token?: string) {
  return verifySession(token);
}

export function verifyParticipantSession(token?: string) {
  return verifySession(token);
}

export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSession(token);

  if (!session) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: { id: session.subjectId },
    select: { id: true, name: true, email: true, role: true }
  });
}

export function adminCookieOptions() {
  return cookieOptions(ADMIN_SESSION_TTL_SECONDS);
}

export async function getCurrentParticipant() {
  const token = cookies().get(PARTICIPANT_SESSION_COOKIE)?.value;
  const session = verifyParticipantSession(token);

  if (!session) {
    return null;
  }

  return prisma.participant.findUnique({
    where: { id: session.subjectId },
    select: {
      id: true,
      name: true,
      cpf: true,
      phone: true,
      registrationCode: true,
      createdAt: true
    }
  });
}

export function participantCookieOptions() {
  return cookieOptions(PARTICIPANT_SESSION_TTL_SECONDS);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}
