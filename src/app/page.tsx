import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/components/PublicShell";
import { PublicHeader } from "@/components/public/PublicHeader";
import { publicCopy } from "@/lib/copy";

export default function HomePage() {
  return (
    <PublicShell>
      <PublicHeader eyebrow="A torcida do Inca também passa pelos teus palpites." />
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/78 shadow-card backdrop-blur">
        <div className="grid grid-cols-1 gap-8 p-7 sm:p-10 md:gap-10 md:px-12 md:py-10 lg:grid-cols-[minmax(0,640px)_auto] lg:items-center lg:justify-between lg:gap-16">
          <div className="flex max-w-[640px] flex-col items-start justify-center [&>*]:mb-3 [&>*:last-child]:mb-0">
            <p className="inline-flex rounded-full bg-teal/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#2A9D8F]">
              {publicCopy.home.badge}
            </p>
            <h1 className="font-heading max-w-[580px] text-[clamp(42px,4.5vw,64px)] font-bold leading-[1.05] text-[#1F2A37]">
              {publicCopy.home.title}
            </h1>
            <p className="max-w-[560px] text-lg font-medium leading-relaxed text-[#4B5563] sm:text-xl">
              {publicCopy.home.subtitle}
            </p>
            <p className="max-w-[540px] text-base font-normal leading-[1.6] text-[#6B7280]">{publicCopy.home.supporting}</p>
            <div className="mt-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-wine via-clay to-amber px-6 py-4 text-lg font-bold text-white shadow-card transition hover:brightness-110 sm:w-auto"
              >
                {publicCopy.home.cta}
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-teal/18 bg-white/82 px-6 py-4 text-lg font-bold text-teal shadow-card transition hover:bg-teal/5 sm:w-auto"
              >
                {publicCopy.home.secondaryCta}
              </Link>
            </div>
            <p className="max-w-[520px] text-[13px] leading-[1.4] text-[#6B7280] opacity-80">{publicCopy.home.legal}</p>
          </div>

          <Image
            src="/assets/llama-selo-home.png"
            alt="Selo da ação Copa do Inca Bar com lhama"
            width={320}
            height={320}
            sizes="(max-width: 768px) 260px, (max-width: 1280px) 22vw, 320px"
            className="h-auto w-[clamp(180px,60vw,260px)] justify-self-center object-contain md:w-[clamp(200px,32vw,280px)] lg:w-[clamp(220px,22vw,320px)] lg:justify-self-end lg:self-center lg:-translate-y-5"
            priority
          />
        </div>
      </section>
    </PublicShell>
  );
}
