import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdmin } from "@/lib/auth";
import { attachMatchResults } from "@/lib/admin-results-db";
import { prisma } from "@/lib/prisma";
import { formatDateBR } from "@/lib/timezone";

type Props = {
  searchParams?: {
    date?: string;
    group?: string;
  };
};

export default async function AdminMatchesPage({ searchParams }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const date = searchParams?.date || undefined;
  const group = searchParams?.group || undefined;

  const where = {
    ...(date ? { matchDate: date } : {}),
    ...(group ? { groupName: group } : {})
  };

  const [matchesBase, groups] = await Promise.all([
    prisma.match.findMany({
      where,
      include: {
        _count: {
          select: {
            bets: true
          }
        }
      },
      orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }]
    }),
    prisma.match.findMany({
      distinct: ["groupName"],
      orderBy: { groupName: "asc" },
      select: { groupName: true }
    })
  ]);

  const matches = await attachMatchResults(matchesBase);

  return (
    <div className="min-h-screen bg-page">
      <AdminNav adminName={admin.name} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 px-5 py-6 shadow-card sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf">Jogos</p>
            <h1 className="mt-3 font-beyno text-4xl text-ink sm:text-5xl">Todos os jogos cadastrados</h1>
            <p className="mt-3 max-w-3xl text-sm text-ink/65 sm:text-base">
              Acompanhe a lista completa de partidas e acesse a apuração do resultado oficial de cada jogo.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-card sm:p-6">
            <div className="mb-4 flex flex-col gap-2 border-b border-ink/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">Lista de jogos</h2>
                <p className="text-sm text-ink/60">{matches.length} jogo(s) encontrado(s).</p>
              </div>
            </div>

            <form className="mb-5 grid gap-3 rounded-[1.5rem] bg-page/65 p-4 md:grid-cols-[1fr_1fr_auto]">
              <input
                name="date"
                type="date"
                defaultValue={date}
                className="min-w-0 w-full rounded-2xl border border-ink/10 bg-white px-3 py-3"
              />
              <select
                name="group"
                defaultValue={group ?? ""}
                className="min-w-0 w-full rounded-2xl border border-ink/10 bg-white px-3 py-3"
              >
                <option value="">Todos os grupos</option>
                {groups.map((item) => (
                  <option key={item.groupName} value={item.groupName}>
                    {item.groupName}
                  </option>
                ))}
              </select>
              <button className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-clay md:w-auto">
                Filtrar
              </button>
            </form>

            <div className="space-y-3">
              {matches.length ? (
                matches.map((match) => {
                  const hasOfficialResult = match.officialScoreHome !== null && match.officialScoreAway !== null;

                  return (
                    <article
                      key={match.id}
                      className="rounded-[1.5rem] border border-ink/10 bg-page/60 px-4 py-4 shadow-sm transition hover:border-leaf/20 hover:bg-page/80 sm:px-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink/55">
                            <span>{formatDateBR(match.matchDate)}</span>
                            <span aria-hidden="true">•</span>
                            <span>{match.matchTime}</span>
                            <span aria-hidden="true">•</span>
                            <span>{match.groupName}</span>
                          </div>
                          <h3 className="break-words font-display text-2xl font-bold text-ink">
                            {match.homeTeam} x {match.awayTeam}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="rounded-full bg-leaf px-3 py-1 font-bold text-white">
                              {match._count.bets} aposta{match._count.bets === 1 ? "" : "s"}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 font-bold ${
                                hasOfficialResult ? "bg-leaf/15 text-leaf" : "bg-ink/10 text-ink/65"
                              }`}
                            >
                              {hasOfficialResult
                                ? `Resultado: ${match.officialScoreHome} x ${match.officialScoreAway}`
                                : "Aguardando resultado oficial"}
                            </span>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                          <Link
                            href={`/admin/jogos/${encodeURIComponent(match.id)}`}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-clay sm:w-auto"
                          >
                            Acessar apuração
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-ink/15 bg-page/60 px-4 py-6 text-sm text-ink/65">
                  Nenhum jogo encontrado com os filtros atuais.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
