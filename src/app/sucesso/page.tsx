import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { getCurrentParticipant } from "@/lib/auth";
import { ParticipantLogoutButton } from "@/components/public/ParticipantLogoutButton";
import { PublicHeader } from "@/components/public/PublicHeader";
import { publicCopy } from "@/lib/copy";

export default async function SuccessPage() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    redirect("/login");
  }

  return (
    <PublicShell>
      <PublicHeader eyebrow="Agora é acompanhar os jogos e curtir a torcida." />
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 text-center shadow-card sm:p-8">
        <div className="flex justify-end">
          <ParticipantLogoutButton />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-teal">{publicCopy.success.badge}</p>
        <Image
          src="/assets/llama-selo-home-v2.png"
          alt="Selo da ação Copa do Inca Bar com lhama"
          width={220}
          height={220}
          sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 220px"
          className="mx-auto mt-4 h-auto w-[clamp(120px,38vw,180px)] object-contain sm:w-[clamp(160px,26vw,220px)]"
          priority
        />
        <h1 className="font-heading mx-auto mt-4 max-w-[12ch] text-[clamp(2rem,7vw,3.25rem)] font-bold leading-[1.08] text-ink">
          {publicCopy.success.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70 sm:text-base">{publicCopy.success.subtitle}</p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-6 py-4 font-bold text-white">
          {publicCopy.success.cta}
        </Link>
      </section>
    </PublicShell>
  );
}
