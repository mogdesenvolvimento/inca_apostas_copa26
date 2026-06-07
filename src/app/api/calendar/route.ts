import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { buildCalendarPdf } from "@/lib/calendar-pdf";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "Faz teu acesso para continuar." }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: {
      isActive: true,
      NOT: {
        groupName: "Grupo T"
      }
    },
    orderBy: [{ kickoffAt: "asc" }, { homeTeam: "asc" }],
    select: {
      groupName: true,
      matchDate: true,
      matchTime: true,
      homeTeam: true,
      awayTeam: true
    }
  });

  const pdf = await buildCalendarPdf(matches);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="calendario-completo-copa-inca.pdf"',
      "Cache-Control": "no-store"
    }
  });
}
