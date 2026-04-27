import { NextResponse } from "next/server";
import { normalizeCpf } from "@/lib/cpf";
import { getCurrentAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { normalizePhone } from "@/lib/phone";
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
  const searchCpf = normalizeCpf(search);
  const searchPhone = normalizePhone(search);
  const searchCode = search.toUpperCase();
  const searchClauses = [
    { name: { contains: search } },
    ...(searchPhone ? [{ phone: { contains: searchPhone } }] : []),
    ...(searchCpf ? [{ cpf: { contains: searchCpf } }] : []),
    ...(searchCode ? [{ registrationCode: { contains: searchCode } }] : [])
  ];

  const bets = await prisma.bet.findMany({
    where: {
      matchId,
      match: {
        matchDate: date,
        groupName: group
      },
      participant: search
        ? {
            OR: searchClauses
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
    const header = "codigo,nome,cpf,telefone,grupo,confronto,placar,data_envio";
    const rows = bets.map((bet) =>
      [
        bet.participant.registrationCode,
        bet.participant.name,
        bet.participant.cpf,
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
