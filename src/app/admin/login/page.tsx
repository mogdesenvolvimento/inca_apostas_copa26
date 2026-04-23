import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/auth";
import { adminCopy } from "@/lib/copy";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf">{adminCopy.login.badge}</p>
        <h1 className="font-beyno mt-3 text-4xl text-ink">{adminCopy.login.title}</h1>
        <p className="mt-2 text-sm text-ink/65">{adminCopy.login.subtitle}</p>
        <LoginForm />
      </section>
    </main>
  );
}
