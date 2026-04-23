import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf">Acesso restrito</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">Admin</h1>
        <p className="mt-2 text-sm text-ink/65">Entre para consultar visualmente os palpites por jogo.</p>
        <LoginForm />
      </section>
    </main>
  );
}
