import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdmin } from "@/lib/auth";
import { formatCpf } from "@/lib/cpf";
import { formatPhoneBR } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { formatDateBR, formatDateTimeBR } from "@/lib/timezone";

export default async function AdminMatchDetailPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      bets: {
        include: { participant: true },
        orderBy: { submittedAt: "desc" }
      },
      _count: { select: { bets: true } }
    }
  });

  if (!match) {
    notFound();
  }

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
              match.bets.map((bet) => (
                <div key={bet.id} className="grid gap-2 border-b border-ink/10 p-4 text-sm last:border-b-0 lg:grid-cols-[0.9fr_1.1fr_1fr_1fr_0.8fr_1fr] lg:gap-3">
                  <span className="font-bold text-leaf">{bet.participant.registrationCode}</span>
                  <strong>{bet.participant.name}</strong>
                  <span>{formatCpf(bet.participant.cpf)}</span>
                  <span>{formatPhoneBR(bet.participant.phone)}</span>
                  <span className="font-bold">
                    {bet.homeScoreGuess} x {bet.awayScoreGuess}
                  </span>
                  <span>{formatDateTimeBR(bet.submittedAt)}</span>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-ink/70">Ainda não há palpites para este jogo.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
