import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdmin } from "@/lib/auth";
import { formatCpf } from "@/lib/cpf";
import { adminCopy } from "@/lib/copy";
import { formatPhoneBR, normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { formatDateBR, formatDateTimeBR } from "@/lib/timezone";

type Props = {
  searchParams?: {
    date?: string;
    group?: string;
    matchId?: string;
    search?: string;
  };
};

export default async function AdminBetsPage({ searchParams }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const date = searchParams?.date || undefined;
  const group = searchParams?.group || undefined;
  const matchId = searchParams?.matchId || undefined;
  const search = searchParams?.search?.trim() || "";
  const searchCpf = search.replace(/\D/g, "");
  const searchPhone = normalizePhone(search);
  const searchCode = search.toUpperCase();
  const searchClauses = [
    { name: { contains: search } },
    ...(searchPhone ? [{ phone: { contains: searchPhone } }] : []),
    ...(searchCpf ? [{ cpf: { contains: searchCpf } }] : []),
    ...(searchCode ? [{ registrationCode: { contains: searchCode } }] : [])
  ];

  const [matches, groups, bets] = await Promise.all([
    prisma.match.findMany({ orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }] }),
    prisma.match.findMany({ distinct: ["groupName"], orderBy: { groupName: "asc" }, select: { groupName: true } }),
    prisma.bet.findMany({
      where: {
        matchId,
        match: { matchDate: date, groupName: group },
        participant: search
          ? {
              OR: searchClauses
            }
          : undefined
      },
      include: { participant: true, match: true },
      orderBy: { submittedAt: "desc" }
    })
  ]);

  const query = new URLSearchParams();
  if (date) query.set("date", date);
  if (group) query.set("group", group);
  if (matchId) query.set("matchId", matchId);
  if (search) query.set("search", search);
  query.set("export", "csv");

  const phaseSummaryQuery = new URLSearchParams();
  phaseSummaryQuery.set("export", "phase-summary");

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AdminNav adminName={admin.name} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 box-border">
        <section className="min-w-0 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-beyno text-4xl text-ink">{adminCopy.bets.title}</h1>
              <p className="text-ink/65">{adminCopy.bets.subtitle}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href={`/api/admin/bets?${query.toString()}`}
                className="w-full rounded-2xl bg-leaf px-4 py-3 text-center font-bold text-white sm:w-auto"
              >
                {adminCopy.bets.export}
              </a>
              <a
                href={`/api/admin/bets?${phaseSummaryQuery.toString()}`}
                className="w-full rounded-2xl bg-ink px-4 py-3 text-center font-bold text-white sm:w-auto"
              >
                Exportar ranking por fase
              </a>
            </div>
          </div>

          <form className="grid min-w-0 gap-3 rounded-[1.75rem] bg-white/85 p-4 shadow-card sm:p-5 md:grid-cols-5">
            <input
              name="date"
              type="date"
              defaultValue={date}
              className="min-w-0 w-full rounded-2xl border border-ink/10 bg-field px-3 py-3 box-border"
            />
            <select
              name="group"
              defaultValue={group ?? ""}
              className="min-w-0 w-full rounded-2xl border border-ink/10 bg-field px-3 py-3 box-border"
            >
              <option value="">{adminCopy.bets.filters.allGroups}</option>
              {groups.map((item) => (
                <option key={item.groupName} value={item.groupName}>
                  {item.groupName}
                </option>
              ))}
            </select>
            <select
              name="matchId"
              defaultValue={matchId ?? ""}
              className="min-w-0 w-full rounded-2xl border border-ink/10 bg-field px-3 py-3 box-border md:col-span-2"
            >
              <option value="">{adminCopy.bets.filters.allMatches}</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {formatDateBR(match.matchDate)} {match.matchTime} - {match.homeTeam} x {match.awayTeam}
                </option>
              ))}
            </select>
            <input
              name="search"
              defaultValue={search}
              placeholder={adminCopy.bets.filters.searchPlaceholder}
              className="min-w-0 w-full rounded-2xl border border-ink/10 bg-field px-3 py-3 box-border"
            />
            <button className="w-full rounded-2xl bg-ink px-4 py-3 font-bold text-white md:col-span-5">
              {adminCopy.bets.filters.submit}
            </button>
          </form>

          <div className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white/85 shadow-card">
            <div className="hidden grid-cols-[1fr_1.2fr_1fr_1fr_1.4fr_0.8fr_1fr] gap-3 border-b border-ink/10 p-4 text-sm font-bold text-leaf lg:grid">
              <span>{adminCopy.bets.table.code}</span>
              <span>{adminCopy.bets.table.name}</span>
              <span>{adminCopy.bets.table.cpf}</span>
              <span>{adminCopy.bets.table.phone}</span>
              <span>{adminCopy.bets.table.matchup}</span>
              <span>{adminCopy.bets.table.score}</span>
              <span>{adminCopy.bets.table.sentAt}</span>
            </div>
            {bets.length ? (
              bets.map((bet) => (
                <div
                  key={bet.id}
                  className="grid min-w-0 gap-3 border-b border-ink/10 p-4 text-sm last:border-b-0 lg:grid-cols-[1fr_1.2fr_1fr_1fr_1.4fr_0.8fr_1fr] lg:gap-3"
                >
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:contents">
                    <div className="min-w-0 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.code}
                      </span>
                      <span className="block truncate font-bold text-leaf lg:whitespace-normal">{bet.participant.registrationCode}</span>
                    </div>
                    <div className="min-w-0 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.name}
                      </span>
                      <strong className="block break-words">{bet.participant.name}</strong>
                    </div>
                    <div className="min-w-0 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.cpf}
                      </span>
                      <span className="block break-words">{formatCpf(bet.participant.cpf)}</span>
                    </div>
                    <div className="min-w-0 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.phone}
                      </span>
                      <span className="block break-words">{formatPhoneBR(bet.participant.phone)}</span>
                    </div>
                    <div className="min-w-0 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.matchup}
                      </span>
                      <Link
                        className="block break-words font-bold text-leaf underline"
                        href={`/admin/jogos/${encodeURIComponent(bet.match.id)}`}
                      >
                        {bet.match.homeTeam} x {bet.match.awayTeam}
                      </Link>
                    </div>
                    <div className="min-w-0 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.score}
                      </span>
                      <span className="block font-bold">
                        {bet.homeScoreGuess} x {bet.awayScoreGuess}
                      </span>
                    </div>
                    <div className="min-w-0 sm:col-span-2 lg:contents">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45 lg:hidden">
                        {adminCopy.bets.table.sentAt}
                      </span>
                      <span className="block break-words">{formatDateTimeBR(bet.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-ink/70">{adminCopy.bets.empty}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
