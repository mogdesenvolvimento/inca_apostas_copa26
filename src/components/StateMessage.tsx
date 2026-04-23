export function StateMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-teal/20 bg-white/80 p-5 text-sm leading-relaxed text-ink shadow-card backdrop-blur">
      {children}
    </div>
  );
}
