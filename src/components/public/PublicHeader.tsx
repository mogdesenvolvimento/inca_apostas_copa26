import { IncaLogo } from "@/components/public/IncaLogo";

export function PublicHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/15 bg-graphite/55 p-4 text-white shadow-card backdrop-blur">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber/90">Inca Bar</p>
        <p className="font-beyno text-2xl leading-tight">Copa 2026</p>
        {eyebrow ? <p className="mt-1 text-sm text-white/70">{eyebrow}</p> : null}
      </div>
      <div className="flex h-[92px] w-[92px] items-center justify-center rounded-[1.6rem] bg-white/98 p-2.5 shadow-lg ring-1 ring-black/5">
        <IncaLogo size={72} className="max-h-full max-w-full" />
      </div>
    </div>
  );
}
