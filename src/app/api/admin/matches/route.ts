import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return jsonError("Não autenticado.", 401);
  }

  const matches = await prisma.match.findMany({
    orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }]
  });

  return NextResponse.json({ matches });
}
