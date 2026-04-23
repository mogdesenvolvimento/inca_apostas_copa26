import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { PublicHeader } from "@/components/public/PublicHeader";
import { publicCopy } from "@/lib/copy";

export default function SuccessPage() {
  return (
    <PublicShell>
      <PublicHeader eyebrow="Agora é acompanhar os jogos e curtir a torcida." />
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal">{publicCopy.success.badge}</p>
        <h1 className="mt-4 font-display text-5xl font-bold text-ink">{publicCopy.success.title}</h1>
        <p className="mt-4 text-ink/70">{publicCopy.success.subtitle}</p>
        <Link href="/" className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-6 py-4 font-bold text-white">
          {publicCopy.success.cta}
        </Link>
      </section>
    </PublicShell>
  );
}
