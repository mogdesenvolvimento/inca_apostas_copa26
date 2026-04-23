import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { PublicHeader } from "@/components/public/PublicHeader";
import { publicCopy } from "@/lib/copy";

export default function HomePage() {
  return (
    <PublicShell>
      <PublicHeader eyebrow="A torcida do Inca também passa pelos seus palpites." />
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/78 p-7 shadow-card backdrop-blur sm:p-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="inline-flex rounded-full bg-teal/12 px-4 py-2 text-sm font-bold text-teal">
            {publicCopy.home.badge}
          </p>
          <div className="hidden h-12 w-12 rounded-2xl bg-gradient-to-br from-wine via-amber to-navy sm:block" />
        </div>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">
          {publicCopy.home.title}
        </h1>
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink/78">{publicCopy.home.subtitle}</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/68">{publicCopy.home.supporting}</p>
        <div className="mt-7 rounded-[1.5rem] border border-wine/10 bg-graphite px-5 py-4 text-sm leading-relaxed text-white/80">
          {publicCopy.home.legal}
        </div>
        <Link
          href="/cadastro"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-6 py-4 text-lg font-bold text-white shadow-card transition hover:brightness-110 sm:w-auto"
        >
          {publicCopy.home.cta}
        </Link>
      </section>
    </PublicShell>
  );
}
