import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { buildParticipantRanking, getWinnersForMatch, hasOfficialResult } from "@/lib/admin-results";
import { attachMatchResults } from "@/lib/admin-results-db";
import { normalizeCpf } from "@/lib/cpf";
import { jsonError } from "@/lib/http";
import { getStageLabel, getStageOrder, isCompetitiveStage, isIndividualRankingStage } from "@/lib/match-stages";
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
  const exportPhaseSummaryCsv = searchParams.get("export") === "phase-summary";
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

  if (exportCsv || exportPhaseSummaryCsv) {
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

    const competitiveMatches = allMatches.filter((match) => isCompetitiveStage(match.stage ?? "group"));
    const matchesWithResults = competitiveMatches.filter((match) => hasOfficialResult(match));
    const ranking = buildParticipantRanking(matchesWithResults);

    if (exportPhaseSummaryCsv) {
      const individualStages = Array.from(
        new Set(competitiveMatches.map((match) => match.stage ?? "group").filter((stage) => isIndividualRankingStage(stage)))
      ).sort((a, b) => getStageOrder(a) - getStageOrder(b));

      const podiumByPhaseRows = individualStages.flatMap((stage) => {
        const stageLabel = getStageLabel(stage);
        const stageMatches = competitiveMatches.filter((match) => (match.stage ?? "group") === stage);
        const stageRanking = buildParticipantRanking(stageMatches.filter((match) => hasOfficialResult(match)));

        return stageRanking
          .filter((item) => item.position >= 1 && item.position <= 3)
          .map((item) =>
            [
              stageLabel,
              item.position,
              item.name,
              item.phone,
              item.email ?? ""
            ]
              .map((value) => csvCell(String(value)))
              .join(",")
          );
      });

      const overallRankingRows = ranking
        .filter((item) => item.position >= 1 && item.position <= 3)
        .map((item) =>
          [item.position, item.name, item.phone, item.email ?? ""]
          .map((value) => csvCell(String(value)))
          .join(",")
        );

      const sections = [
        buildCsvSection(
          "colocados_por_fase",
          "fase,posicao,nome,telefone,email",
          podiumByPhaseRows
        ),
        buildCsvSection(
          "ranking_geral_final",
          "posicao,nome,telefone,email",
          overallRankingRows
        )
      ].filter(Boolean);

      return new NextResponse(sections.join("\n\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="colocados-por-fase-e-geral.csv"'
        }
      });
    }

    const sections = [
      buildCsvSection(
        "apostas",
        "codigo,nome,cpf,telefone,email,grupo,confronto,placar,data_envio",
        bets.map((bet) =>
          [
            bet.participant.registrationCode,
            bet.participant.name,
            bet.participant.cpf,
            bet.participant.phone,
            bet.participant.email ?? "",
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
        "grupo,data,hora,confronto,codigo,nome,cpf,telefone,email,placar_enviado,horario_envio",
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
              winner.email ?? "",
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
        "posicao,nome,cpf,telefone,email,codigo,total_acertos",
        ranking.map((item) =>
          [item.position, item.name, item.cpf, item.phone, item.email ?? "", item.registrationCode, item.correctCount]
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
