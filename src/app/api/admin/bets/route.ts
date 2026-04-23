import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return jsonError("Não autenticado.", 401);
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const group = searchParams.get("group") ?? undefined;
  const matchId = searchParams.get("matchId") ?? undefined;
  const search = searchParams.get("search")?.trim() ?? "";
  const exportCsv = searchParams.get("export") === "csv";

  const bets = await prisma.bet.findMany({
    where: {
      matchId,
      match: {
        matchDate: date,
        groupName: group
      },
      participant: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search.replace(/\D/g, "") } }
            ]
          }
        : undefined
    },
    include: {
      participant: true,
      match: true
    },
    orderBy: { submittedAt: "desc" }
  });

  if (exportCsv) {
    const header = "nome,telefone,grupo,confronto,placar,data_envio";
    const rows = bets.map((bet) =>
      [
        bet.participant.name,
        bet.participant.phone,
        bet.match.groupName,
        `${bet.match.homeTeam} x ${bet.match.awayTeam}`,
        `${bet.homeScoreGuess} x ${bet.awayScoreGuess}`,
        bet.submittedAt.toISOString()
      ]
        .map(csvCell)
        .join(",")
    );

    return new NextResponse([header, ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=apostas.csv"
      }
    });
  }

  return NextResponse.json({ bets });
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
