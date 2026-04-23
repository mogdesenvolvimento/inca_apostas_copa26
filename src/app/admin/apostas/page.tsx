import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateBR, formatDateTimeBR } from "@/lib/timezone";
import { formatPhoneBR } from "@/lib/phone";

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

  const [matches, groups, bets] = await Promise.all([
    prisma.match.findMany({ orderBy: [{ matchDate: "asc" }, { kickoffAt: "asc" }] }),
    prisma.match.findMany({ distinct: ["groupName"], orderBy: { groupName: "asc" }, select: { groupName: true } }),
    prisma.bet.findMany({
      where: {
        matchId,
        match: { matchDate: date, groupName: group },
        participant: search
          ? {
              OR: [
                { name: { contains: search } },
                { phone: { contains: search.replace(/\D/g, "") } }
              ]
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

  return (
    <div className="min-h-screen">
      <AdminNav adminName={admin.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Apostas</h1>
          <p className="text-ink/65">Filtros para conferência visual por jogo, participante ou telefone.</p>
        </div>
        <a href={`/api/admin/bets?${query.toString()}`} className="rounded-2xl bg-leaf px-4 py-3 text-center font-bold text-white">
          Exportar CSV
        </a>
      </div>

      <form className="grid gap-3 rounded-[1.75rem] bg-white/85 p-5 shadow-card md:grid-cols-5">
        <input name="date" type="date" defaultValue={date} className="rounded-2xl border border-ink/10 bg-field px-3 py-3" />
        <select name="group" defaultValue={group ?? ""} className="rounded-2xl border border-ink/10 bg-field px-3 py-3">
          <option value="">Todos os grupos</option>
          {groups.map((item) => (
            <option key={item.groupName} value={item.groupName}>{item.groupName}</option>
          ))}
        </select>
        <select name="matchId" defaultValue={matchId ?? ""} className="rounded-2xl border border-ink/10 bg-field px-3 py-3 md:col-span-2">
          <option value="">Todos os jogos</option>
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {formatDateBR(match.matchDate)} {match.matchTime} - {match.homeTeam} x {match.awayTeam}
            </option>
          ))}
        </select>
        <input name="search" defaultValue={search} placeholder="Nome ou telefone" className="rounded-2xl border border-ink/10 bg-field px-3 py-3" />
        <button className="rounded-2xl bg-ink px-4 py-3 font-bold text-white md:col-span-5">Filtrar</button>
      </form>

      <div className="overflow-hidden rounded-[1.75rem] bg-white/85 shadow-card">
        <div className="hidden grid-cols-[1.3fr_1fr_1.4fr_0.7fr_1fr] gap-3 border-b border-ink/10 p-4 text-sm font-bold text-leaf md:grid">
          <span>Nome</span>
          <span>Telefone</span>
          <span>Confronto</span>
          <span>Placar</span>
          <span>Envio</span>
        </div>
        {bets.length ? bets.map((bet) => (
          <div key={bet.id} className="grid gap-2 border-b border-ink/10 p-4 text-sm last:border-b-0 md:grid-cols-[1.3fr_1fr_1.4fr_0.7fr_1fr] md:gap-3">
            <strong>{bet.participant.name}</strong>
            <span>{formatPhoneBR(bet.participant.phone)}</span>
            <Link className="font-bold text-leaf underline" href={`/admin/jogos/${encodeURIComponent(bet.match.id)}`}>
              {bet.match.homeTeam} x {bet.match.awayTeam}
            </Link>
            <span className="font-bold">{bet.homeScoreGuess} x {bet.awayScoreGuess}</span>
            <span>{formatDateTimeBR(bet.submittedAt)}</span>
          </div>
        )) : (
          <p className="p-5 text-sm text-ink/70">Nenhuma aposta encontrada com os filtros atuais.</p>
        )}
      </div>
    </section>
      </main>
    </div>
  );
}
