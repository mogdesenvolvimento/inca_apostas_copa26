import Link from "next/link";

export function PublicFooterLinks() {
  return (
    <div className="mt-6 space-y-3 text-center text-sm text-ink/65">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link href="/politica-de-privacidade" className="transition hover:text-teal hover:underline">
          Política de Privacidade
        </Link>
        <Link href="/termos-de-uso" className="transition hover:text-teal hover:underline">
          Termos de Uso
        </Link>
      </div>
      <p className="mx-auto max-w-2xl text-xs leading-relaxed text-ink/58">
        Esta é uma ação promocional independente do Inca Bar, sem vínculo, patrocínio, autorização ou associação
        oficial com FIFA, CBF ou qualquer entidade organizadora de competições esportivas.
      </p>
    </div>
  );
}
