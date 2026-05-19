import { IncaLogo } from "@/components/public/IncaLogo";

export function PublicHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/12 bg-[linear-gradient(135deg,#0F3D2E_0%,#145A3F_100%)] p-4 text-white shadow-card sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,201,76,0.18),transparent_34%),linear-gradient(120deg,transparent_0%,transparent_42%,rgba(255,255,255,0.06)_42%,rgba(255,255,255,0.06)_44%,transparent_44%,transparent_100%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-beyno text-xs font-bold uppercase tracking-[0.28em] text-[#F2C94C]">INCA BAR</p>
          <p className="font-heading text-2xl font-bold leading-tight text-[#F5F5F5]">Ação especial dos dias de jogo</p>
          {eyebrow ? <p className="mt-1 text-sm text-[#E8E8E8]/95">{eyebrow}</p> : null}
        </div>
        <IncaLogo variant="header" priority />
      </div>
    </div>
  );
}
