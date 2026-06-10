import { notFound, redirect } from "next/navigation";
import { AdminMatchResultForm } from "@/components/admin/AdminMatchResultForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { attachMatchResults } from "@/lib/admin-results-db";
import { getWinnersForMatch, hasOfficialResult } from "@/lib/admin-results";
import { getCurrentAdmin } from "@/lib/auth";
import { formatCpf } from "@/lib/cpf";
import { formatPhoneBR } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { formatDateBR, formatDateTimeBR } from "@/lib/timezone";

export default async function AdminMatchDetailPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const matchId = decodeURIComponent(params.id);

  const baseMatch = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      bets: {
        include: { participant: true },
        orderBy: { submittedAt: "desc" }
      },
      _count: { select: { bets: true } }
    }
  });

  if (!baseMatch) {
    notFound();
  }

  const [match] = await attachMatchResults([baseMatch]);

  const winners = getWinnersForMatch(match);
  const resultReady = hasOfficialResult(match);

  return (
    <div className="min-h-screen">
      <AdminNav adminName={admin.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="space-y-6">
          <div className="rounded-[1.75rem] bg-white/85 p-6 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">{match.groupName}</p>
            <h1 className="mt-3 font-display text-4xl font-bold">
              {match.homeTeam} x {match.awayTeam}
            </h1>
            <p className="mt-2 text-ink/65">
              {formatDateBR(match.matchDate)} às {match.matchTime} | {match._count.bets} apostas recebidas
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {resultReady ? (
                <span className="rounded-full bg-leaf px-3 py-1 font-bold text-white">
                  Resultado oficial: {match.officialScoreHome} x {match.officialScoreAway}
                </span>
              ) : (
                <span className="rounded-full bg-ink/8 px-3 py-1 font-bold text-ink/70">
                  Este jogo ainda não possui resultado oficial cadastrado.
                </span>
              )}
              {match.resultUpdatedAt ? (
                <span className="text-ink/55">Atualizado em {formatDateTimeBR(match.resultUpdatedAt)}</span>
              ) : null}
            </div>
          </div>

          <AdminMatchResultForm
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            initialHomeScore={match.officialScoreHome}
            initialAwayScore={match.officialScoreAway}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Palpites enviados" value={match._count.bets} />
            <Metric label="Acertadores" value={winners.length} />
            <Metric label="Status" value={resultReady ? "Resultado lançado" : "Aguardando resultado"} />
          </div>

          <div className="rounded-[1.75rem] bg-white/85 p-6 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Apuração do jogo</h2>
            <p className="mt-2 text-sm text-ink/65">
              {resultReady
                ? `${winners.length} participantes acertaram o placar deste jogo.`
                : "A apuração aparece automaticamente assim que o resultado oficial for salvo."}
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] bg-white/85 shadow-card">
            <div className="hidden grid-cols-[0.9fr_1.1fr_1fr_1fr_0.8fr_1fr] gap-3 border-b border-ink/10 p-4 text-sm font-bold text-leaf lg:grid">
              <span>Código</span>
              <span>Nome</span>
              <span>CPF</span>
              <span>Telefone</span>
              <span>Palpite</span>
              <span>Enviado em</span>
            </div>
            {match.bets.length ? (
              match.bets.map((bet) => {
                const isWinner =
                  resultReady &&
                  bet.homeScoreGuess === match.officialScoreHome &&
                  bet.awayScoreGuess === match.officialScoreAway;

                return (
                  <div
                    key={bet.id}
                    className={`grid gap-2 border-b border-ink/10 p-4 text-sm last:border-b-0 lg:grid-cols-[0.9fr_1.1fr_1fr_1fr_0.8fr_1fr] lg:gap-3 ${
                      isWinner ? "bg-leaf/8" : ""
                    }`}
                  >
                    <span className="font-bold text-leaf">{bet.participant.registrationCode}</span>
                    <strong>{bet.participant.name}</strong>
                    <span>{formatCpf(bet.participant.cpf)}</span>
                    <span>{formatPhoneBR(bet.participant.phone)}</span>
                    <span className="font-bold">
                      {bet.homeScoreGuess} x {bet.awayScoreGuess}
                    </span>
                    <span>{formatDateTimeBR(bet.submittedAt)}</span>
                  </div>
                );
              })
            ) : (
              <p className="p-5 text-sm text-ink/70">Ainda não há palpites para este jogo.</p>
            )}
          </div>

          {resultReady ? (
            <div className="overflow-hidden rounded-[1.75rem] bg-white/85 shadow-card">
              <div className="border-b border-ink/10 p-5">
                <h2 className="font-heading text-2xl font-bold text-ink">Acertadores do placar</h2>
              </div>
              {winners.length ? (
                <>
                  <div className="hidden grid-cols-[0.9fr_1.1fr_1fr_1fr_0.8fr_1fr] gap-3 border-b border-ink/10 p-4 text-sm font-bold text-leaf lg:grid">
                    <span>Código</span>
                    <span>Nome</span>
                    <span>CPF</span>
                    <span>Telefone</span>
                    <span>Palpite</span>
                    <span>Enviado em</span>
                  </div>
                  {winners.map((winner) => (
                    <div
                      key={winner.id}
                      className="grid gap-2 border-b border-ink/10 bg-leaf/8 p-4 text-sm last:border-b-0 lg:grid-cols-[0.9fr_1.1fr_1fr_1fr_0.8fr_1fr] lg:gap-3"
                    >
                      <span className="font-bold text-leaf">{winner.registrationCode}</span>
                      <strong>{winner.name}</strong>
                      <span>{formatCpf(winner.cpf)}</span>
                      <span>{formatPhoneBR(winner.phone)}</span>
                      <span className="font-bold">
                        {winner.homeScoreGuess} x {winner.awayScoreGuess}
                      </span>
                      <span>{formatDateTimeBR(winner.submittedAt)}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="p-5 text-sm text-ink/70">Nenhum participante acertou exatamente o placar deste jogo.</p>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/85 p-5 shadow-card">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
