"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminNav({ adminName }: { adminName: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-ink/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf">Admin</p>
          <p className="font-display text-2xl font-bold text-ink">Palpites Inca</p>
        </div>
        <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold">
          <Link className="rounded-full bg-ink/5 px-4 py-2 hover:bg-gold/30" href="/admin/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-full bg-ink/5 px-4 py-2 hover:bg-gold/30" href="/admin/apostas">
            Apostas
          </Link>
          <span className="max-w-full break-words px-2 text-ink/50">{adminName}</span>
          <button onClick={logout} className="rounded-full bg-clay px-4 py-2 text-white">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
