import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { getCurrentParticipant } from "@/lib/auth";
import { publicCopy } from "@/lib/copy";
import { CadastroForm } from "@/components/public/CadastroForm";
import { PublicHeader } from "@/components/public/PublicHeader";

export default async function CadastroPage() {
  const participant = await getCurrentParticipant();
  if (participant) {
    redirect("/apostas");
  }

  return (
    <PublicShell>
      <PublicHeader eyebrow="Cadastro rápido pra liberar teus jogos do dia." />
      <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-card backdrop-blur sm:p-9">
        <p className="text-sm font-semibold text-wine">{publicCopy.register.hint}</p>
        <h1 className="font-heading mt-3 text-3xl font-bold text-ink sm:text-5xl">{publicCopy.register.title}</h1>
        <p className="mt-3 max-w-xl text-ink/70">{publicCopy.register.subtitle}</p>
        <p className="mt-2 max-w-xl text-sm text-ink/60">{publicCopy.register.supporting}</p>
        <CadastroForm />
      </section>
    </PublicShell>
  );
}
