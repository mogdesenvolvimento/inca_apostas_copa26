import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDateString } from "@/lib/timezone";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const today = getSaoPauloDateString();
  const [participants, bets, todayMatches] = await Promise.all([
    prisma.participant.count(),
    prisma.bet.count(),
    prisma.match.findMany({
      where: { matchDate: today },
      include: { _count: { select: { bets: true } } },
      orderBy: { kickoffAt: "asc" }
    })
  ]);

  return (
    <div className="min-h-screen">
      <AdminNav adminName={admin.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Dashboard</h1>
        <p className="text-ink/65">Resumo para conferência manual das apostas.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Participantes" value={participants} />
        <Metric label="Apostas" value={bets} />
        <Metric label="Jogos de hoje" value={todayMatches.length} />
      </div>
      <div className="rounded-[1.75rem] bg-white/85 p-5 shadow-card">
        <h2 className="font-display text-2xl font-bold">Apostas por jogo de hoje</h2>
        <div className="mt-4 grid gap-3">
          {todayMatches.length ? (
            todayMatches.map((match) => (
              <Link
                key={match.id}
                href={`/admin/jogos/${encodeURIComponent(match.id)}`}
                className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-field p-4 transition hover:border-leaf sm:flex-row sm:items-center"
              >
                <span>
                  <strong>{match.homeTeam} x {match.awayTeam}</strong>
                  <span className="ml-2 text-sm text-ink/60">{match.groupName} às {match.matchTime}</span>
                </span>
                <span className="mt-2 rounded-full bg-leaf px-3 py-1 text-sm font-bold text-white sm:mt-0">
                  {match._count.bets} apostas
                </span>
              </Link>
            ))
          ) : (
            <p className="rounded-2xl bg-ink/5 p-4 text-sm text-ink/70">Hoje não há jogos disponíveis para aposta.</p>
          )}
        </div>
      </div>
    </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] bg-white/85 p-5 shadow-card">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
    </div>
  );
}
