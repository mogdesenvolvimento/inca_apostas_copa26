import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { buildParticipantRanking, getWinnersForMatch, hasOfficialResult } from "@/lib/admin-results";
import { attachMatchResults } from "@/lib/admin-results-db";
import { normalizeCpf } from "@/lib/cpf";
import { jsonError } from "@/lib/http";
import { resolveCurrentCompetitiveStage } from "@/lib/match-stages";
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
    const [filteredMatchesBase, allMatchesBase] = await Promise.all([
      prisma.match.findMany({
        where: {
          id: matchId,
          matchDate: date,
          groupName: group
        },
        include: {
          bets: {
            include: { participant: true },
            orderBy: { submittedAt: "desc" }
          }
        },
        orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }]
      }),
      prisma.match.findMany({
        include: {
          bets: {
            include: { participant: true }
          }
        },
        orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }]
      })
    ]);

    const [filteredMatches, allMatches] = await Promise.all([
      attachMatchResults(filteredMatchesBase),
      attachMatchResults(allMatchesBase)
    ]);

    const currentStage = resolveCurrentCompetitiveStage(allMatches);
    const stageMatches = currentStage ? allMatches.filter((match) => (match.stage ?? "group") === currentStage) : allMatches;
    const matchesWithResults = stageMatches.filter((match) => hasOfficialResult(match));
    const ranking = buildParticipantRanking(matchesWithResults);

    const sections = [
      buildCsvSection(
        "apostas",
        "codigo,nome,cpf,telefone,grupo,confronto,placar,data_envio",
        bets.map((bet) =>
          [
            bet.participant.registrationCode,
            bet.participant.name,
            bet.participant.cpf,
            bet.participant.phone,
            bet.match.groupName,
            `${bet.match.homeTeam} x ${bet.match.awayTeam}`,
            formatBetGuess(bet.homeScoreGuess, bet.awayScoreGuess, bet.penaltyWinnerSide, bet.match.homeTeam, bet.match.awayTeam),
            bet.submittedAt.toISOString()
          ]
            .map(csvCell)
            .join(",")
        )
      ),
      buildCsvSection(
        "resultados_oficiais",
        "grupo,data,hora,confronto,resultado_oficial",
        filteredMatches
          .filter((match) => hasOfficialResult(match))
          .map((match) =>
            [
              match.groupName,
              match.matchDate,
              match.matchTime,
              `${match.homeTeam} x ${match.awayTeam}`,
              formatOfficialResult(
                match.officialScoreHome,
                match.officialScoreAway,
                match.wentToPenalties,
                match.qualifiedTeam
              )
            ]
              .map(csvCell)
              .join(",")
          )
      ),
      buildCsvSection(
        "acertadores_por_jogo",
        "grupo,data,hora,confronto,codigo,nome,cpf,telefone,placar_enviado,horario_envio",
        filteredMatches.flatMap((match) =>
          getWinnersForMatch(match).map((winner) =>
            [
              match.groupName,
              match.matchDate,
              match.matchTime,
              `${match.homeTeam} x ${match.awayTeam}`,
              winner.registrationCode,
              winner.name,
              winner.cpf,
              winner.phone,
              formatBetGuess(
                winner.homeScoreGuess,
                winner.awayScoreGuess,
                winner.penaltyWinnerSide,
                match.homeTeam,
                match.awayTeam
              ),
              winner.submittedAt.toISOString()
            ]
              .map(csvCell)
              .join(",")
          )
        )
      ),
      buildCsvSection(
        "ranking_geral_de_acertos",
        "posicao,nome,cpf,telefone,codigo,total_acertos",
        ranking.map((item) =>
          [item.position, item.name, item.cpf, item.phone, item.registrationCode, item.correctCount]
            .map((value) => csvCell(String(value)))
            .join(",")
        )
      )
    ].filter(Boolean);

    return new NextResponse(sections.join("\n\n"), {
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

function buildCsvSection(title: string, header: string, rows: string[]) {
  return [`# ${title}`, header, ...rows].join("\n");
}

function formatBetGuess(
  homeScoreGuess: number,
  awayScoreGuess: number,
  penaltyWinnerSide: string | null | undefined,
  homeTeam: string,
  awayTeam: string
) {
  if (!penaltyWinnerSide) {
    return `${homeScoreGuess} x ${awayScoreGuess}`;
  }

  return `${homeScoreGuess} x ${awayScoreGuess} | ${penaltyWinnerSide === "home" ? homeTeam : awayTeam} nos pênaltis`;
}

function formatOfficialResult(
  officialScoreHome: number | null,
  officialScoreAway: number | null,
  wentToPenalties: boolean | undefined,
  qualifiedTeam: string | null | undefined
) {
  const base = `${officialScoreHome} x ${officialScoreAway}`;
  if (!wentToPenalties || !qualifiedTeam) {
    return base;
  }

  return `${base} | ${qualifiedTeam} nos pênaltis`;
}
