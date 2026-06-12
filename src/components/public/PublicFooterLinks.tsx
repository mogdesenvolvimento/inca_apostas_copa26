import Image from "next/image";
import Link from "next/link";

export function PublicFooterLinks() {
  return (
    <div className="mt-6 space-y-4 text-center text-sm text-ink/65">
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
      <div className="rounded-[1.5rem] border border-white/60 bg-white/70 px-4 py-3 shadow-card backdrop-blur">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <p className="text-[11px] leading-relaxed text-ink/70 sm:flex-1 sm:text-xs">
            © 2026 Inca Bar de Cervejas. Todos os direitos reservados.
          </p>
          <div className="flex max-w-full flex-col items-center justify-center gap-2 text-center sm:flex-[0_0_auto] sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-right">
            <span className="text-[11px] leading-relaxed text-ink/68 sm:text-xs">Desenvolvido por</span>
            <a
              href="https://www.mogsistemasdigitais.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Acessar site da MOG Sistemas Digitais"
              className="inline-flex items-center justify-center"
            >
              <Image
                src="/assets/mog-logo.png"
                alt="Logo da MOG Sistemas Digitais"
                width={180}
                height={56}
                sizes="(max-width: 640px) 160px, 220px"
                className="h-[42px] w-auto max-w-full object-contain sm:h-[48px] lg:h-[52px]"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
