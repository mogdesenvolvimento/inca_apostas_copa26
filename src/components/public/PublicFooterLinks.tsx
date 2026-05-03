import Link from "next/link";

export function PublicFooterLinks() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink/65">
      <Link href="/politica-de-privacidade" className="transition hover:text-teal hover:underline">
        Política de Privacidade
      </Link>
      <Link href="/termos-de-uso" className="transition hover:text-teal hover:underline">
        Termos de Uso
      </Link>
    </div>
  );
}
