import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";

export default function HomePage() {
  return (
    <PublicShell>
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-card backdrop-blur sm:p-10">
        <p className="mb-3 inline-flex rounded-full bg-gold/25 px-4 py-2 text-sm font-bold text-leaf">
          Ação promocional e recreativa
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">
          Bolão Recreativo Copa 2026
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/75">
          Informe seus dados, escolha os placares dos jogos disponíveis no dia e participe da brincadeira. Este sistema
          não possui pagamentos, odds, saldo, premiação em dinheiro ou qualquer vínculo financeiro.
        </p>
        <Link
          href="/cadastro"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-white shadow-card transition hover:bg-ink sm:w-auto"
        >
          Participar agora
        </Link>
      </section>
    </PublicShell>
  );
}
