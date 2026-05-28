import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { getCurrentParticipant } from "@/lib/auth";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ResetPasswordForm } from "@/components/public/ResetPasswordForm";
import { publicCopy } from "@/lib/copy";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams?: { token?: string };
}) {
  const participant = await getCurrentParticipant();
  if (participant) {
    redirect("/apostas");
  }

  const token = searchParams?.token ?? "";

  return (
    <PublicShell>
      <PublicHeader eyebrow="Teu acesso volta rapidinho assim que a senha nova entrar." />
      <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-card backdrop-blur sm:p-9">
        <p className="text-sm font-semibold text-wine">{publicCopy.resetPassword.hint}</p>
        <h1 className="font-heading mt-3 text-3xl font-bold text-ink sm:text-5xl">{publicCopy.resetPassword.title}</h1>
        <p className="mt-3 max-w-xl text-ink/70">{publicCopy.resetPassword.subtitle}</p>
        <p className="mt-2 max-w-xl text-sm text-ink/60">{publicCopy.resetPassword.supporting}</p>

        {!token ? (
          <div className="mt-6 rounded-2xl bg-wine/10 p-4 text-sm font-bold text-wine">
            Esse link de redefinição está incompleto.{" "}
            <Link href="/esqueci-senha" className="underline">
              Pede um novo por aqui.
            </Link>
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </section>
    </PublicShell>
  );
}
