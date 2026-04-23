import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminCookieOptions, signAdminSession } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return jsonError("Informe email e senha.", 401);
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return jsonError("Credenciais inválidas.", 401);
    }

    const response = NextResponse.json({
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
    response.cookies.set(ADMIN_SESSION_COOKIE, signAdminSession(admin.id), adminCookieOptions());

    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível autenticar.", 401);
  }
}
