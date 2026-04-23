import { PublicShell } from "@/components/PublicShell";
import { CadastroForm } from "@/components/public/CadastroForm";

export default function CadastroPage() {
  return (
    <PublicShell>
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur sm:p-9">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-5xl">Cadastro</h1>
        <p className="mt-3 text-ink/70">
          Usaremos seu telefone apenas para identificar seu cadastro e impedir palpites duplicados.
        </p>
        <CadastroForm />
      </section>
    </PublicShell>
  );
}
