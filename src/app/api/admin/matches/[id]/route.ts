import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return jsonError("Não autenticado.", 401);
  }

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      bets: {
        include: { participant: true },
        orderBy: { submittedAt: "desc" }
      },
      _count: { select: { bets: true } }
    }
  });

  if (!match) {
    return jsonError("Jogo não encontrado.", 404);
  }

  return NextResponse.json({ match });
}
