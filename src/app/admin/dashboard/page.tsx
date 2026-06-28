import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { buildParticipantRanking, getPodium, hasOfficialResult } from "@/lib/admin-results";
import { attachMatchResults } from "@/lib/admin-results-db";
import { getCurrentAdmin } from "@/lib/auth";
import { adminCopy } from "@/lib/copy";
import { formatCpf } from "@/lib/cpf";
import { getStageLabel, resolveCurrentCompetitiveStage } from "@/lib/match-stages";
import { filterMatchesForCurrentBolaoWindow, getMatchDisplayTime } from "@/lib/matches";
import { formatPhoneBR } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDateString } from "@/lib/timezone";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const today = getSaoPauloDateString();
  const yesterday = getSaoPauloDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const tomorrow = getSaoPauloDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const [participants, bets, todayMatchesBase, allMatchesBase] = await Promise.all([
    prisma.participant.count(),
    prisma.bet.count(),
    prisma.match.findMany({
      where: { matchDate: { in: [today, yesterday, tomorrow] } },
      include: { _count: { select: { bets: true } } },
      orderBy: { kickoffAt: "asc" }
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

  const [dashboardMatches, allMatches] = await Promise.all([
    attachMatchResults(todayMatchesBase),
    attachMatchResults(allMatchesBase)
  ]);

  const visibleMatches = filterMatchesForCurrentBolaoWindow(dashboardMatches).matches;
  const currentStage = resolveCurrentCompetitiveStage(allMatches);
  const stageMatches = currentStage ? allMatches.filter((match) => (match.stage ?? "group") === currentStage) : allMatches;
  const matchesWithResults = stageMatches.filter((match) => hasOfficialResult(match));

  const ranking = buildParticipantRanking(matchesWithResults);
  const podium = getPodium(ranking);
  const totalCorrectPredictions = ranking.reduce((sum, item) => sum + item.correctCount, 0);

  return (
    <div className="min-h-screen">
      <AdminNav adminName={admin.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="space-y-6">
          <div>
            <h1 className="font-display-accent text-4xl text-ink">{adminCopy.dashboard.title}</h1>
            <p className="text-ink/65">{adminCopy.dashboard.subtitle}</p>
            <p className="mt-1 text-sm text-ink/55">Classificação atual: {getStageLabel(currentStage)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Participantes" value={participants} />
            <Metric label="Apostas" value={bets} />
            <Metric label="Jogos de hoje" value={visibleMatches.length} />
            <Metric label="Jogos apurados" value={matchesWithResults.length} />
            <Metric label="Acertos totais" value={totalCorrectPredictions} />
            <Metric label="Acertadores únicos" value={ranking.length} />
          </div>

          <div className="rounded-[1.75rem] bg-white/85 p-5 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Ranking geral de acertos</h2>
            <p className="mt-2 text-sm text-ink/65">
              Participantes agrupados por CPF/código de participação com base nos resultados oficiais já cadastrados.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {podium.map((entry) => (
                <div key={entry.position} className="rounded-[1.5rem] border border-ink/10 bg-field p-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-leaf">{entry.position}º lugar</p>
                  {entry.participants.length ? (
                    <div className="mt-3 space-y-3">
                      {entry.participants.map((participant) => (
                        <div key={participant.registrationCode} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <p className="font-bold text-ink">{participant.name}</p>
                          <p className="mt-1 text-sm text-ink/65">{participant.correctCount} acertos</p>
                          <p className="mt-1 text-xs text-ink/55">
                            {formatCpf(participant.cpf)} | {participant.registrationCode}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ink/60">Ainda sem participantes nesta colocação.</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] bg-white/85 shadow-card">
            <div className="border-b border-ink/10 p-5">
              <h2 className="font-heading text-2xl font-bold text-ink">Maiores acertadores</h2>
            </div>
            {ranking.length ? (
              <>
                <div className="hidden grid-cols-[0.5fr_1.1fr_1fr_1fr_1fr_0.7fr] gap-3 border-b border-ink/10 p-4 text-sm font-bold text-leaf lg:grid">
                  <span>Posição</span>
                  <span>Nome</span>
                  <span>CPF</span>
                  <span>Telefone</span>
                  <span>Código</span>
                  <span>Acertos</span>
                </div>
                {ranking.map((participant) => (
                  <div
                    key={participant.registrationCode}
                    className="grid gap-2 border-b border-ink/10 p-4 text-sm last:border-b-0 lg:grid-cols-[0.5fr_1.1fr_1fr_1fr_1fr_0.7fr] lg:gap-3"
                  >
                    <span className="font-bold text-leaf">{participant.position}º</span>
                    <strong>{participant.name}</strong>
                    <span>{formatCpf(participant.cpf)}</span>
                    <span>{formatPhoneBR(participant.phone)}</span>
                    <span className="font-bold text-leaf">{participant.registrationCode}</span>
                    <span className="font-bold">{participant.correctCount}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="p-5 text-sm text-ink/70">Ainda não há jogos com resultado oficial cadastrado nesta fase.</p>
            )}
          </div>

          <div className="rounded-[1.75rem] bg-white/85 p-5 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">{adminCopy.dashboard.todayMatchesTitle}</h2>
            <div className="mt-4 grid gap-3">
              {visibleMatches.length ? (
                visibleMatches.map((match: any) => (
                  <div
                    key={match.id}
                    className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-field p-4 sm:flex-row sm:items-center"
                  >
                    <span>
                      <strong>
                        {match.homeTeam} x {match.awayTeam}
                      </strong>
                      <span className="ml-2 text-sm text-ink/60">
                        {match.groupName} às {getMatchDisplayTime(match)}
                      </span>
                    </span>
                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
                      <span className="rounded-full bg-leaf px-3 py-1 text-sm font-bold text-white">
                        {match._count.bets} apostas
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          hasOfficialResult(match) ? "bg-teal text-white" : "bg-ink/8 text-ink/70"
                        }`}
                      >
                        {hasOfficialResult(match) ? "Resultado lançado" : "Aguardando resultado"}
                      </span>
                      <Link
                        className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-white"
                        href={`/admin/jogos/${encodeURIComponent(match.id)}`}
                      >
                        Ver jogo
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-ink/5 p-4 text-sm text-ink/70">{adminCopy.dashboard.empty}</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/85 p-5 shadow-card">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{label}</p>
      <p className="font-heading mt-3 text-4xl font-bold leading-none text-ink">{String(value)}</p>
    </div>
  );
}
