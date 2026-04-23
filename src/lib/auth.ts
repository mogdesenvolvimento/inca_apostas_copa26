import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "inca_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  adminId: string;
  exp: number;
};

function getSecret() {
  return process.env.SESSION_SECRET ?? "dev-only-change-this-session-secret";
}

export function signAdminSession(adminId: string) {
  const payload: SessionPayload = {
    adminId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSession(token?: string) {
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

export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSession(token);

  if (!session) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, name: true, email: true, role: true }
  });
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}
