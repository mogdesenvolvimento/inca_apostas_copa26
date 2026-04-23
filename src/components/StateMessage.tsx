export function StateMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gold/40 bg-white/80 p-5 text-sm leading-relaxed text-ink shadow-card">
      {children}
    </div>
  );
}
