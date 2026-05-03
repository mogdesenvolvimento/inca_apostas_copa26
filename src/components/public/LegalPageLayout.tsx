import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { PublicHeader } from "@/components/public/PublicHeader";

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  return (
    <PublicShell>
      <PublicHeader eyebrow="Informações importantes sobre tua participação." />
      <section className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-card backdrop-blur sm:p-9">
        <Link href="/" className="text-sm font-semibold text-teal transition hover:underline">
          Voltar
        </Link>
        <h1 className="font-heading mt-4 text-3xl font-bold text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg font-medium text-ink/70">{subtitle}</p>
        <div className="mt-6 space-y-6 text-sm leading-7 text-ink/78 sm:text-base">{children}</div>
      </section>
    </PublicShell>
  );
}
