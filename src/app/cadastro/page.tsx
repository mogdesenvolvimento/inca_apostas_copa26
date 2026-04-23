import { PublicShell } from "@/components/PublicShell";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CadastroForm } from "@/components/public/CadastroForm";
import { publicCopy } from "@/lib/copy";

export default function CadastroPage() {
  return (
    <PublicShell>
      <PublicHeader eyebrow="Cadastro rápido pra liberar teus jogos do dia." />
      <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-card backdrop-blur sm:p-9">
        <p className="font-display-accent text-sm text-wine">{publicCopy.register.hint}</p>
        <h1 className="font-heading mt-3 text-3xl font-bold text-ink sm:text-5xl">{publicCopy.register.title}</h1>
        <p className="mt-3 max-w-xl text-ink/70">{publicCopy.register.subtitle}</p>
        <CadastroForm />
      </section>
    </PublicShell>
  );
}
