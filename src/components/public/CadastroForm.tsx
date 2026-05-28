"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { publicCopy } from "@/lib/copy";

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

type ConfirmState = {
  name: string;
  cpfMasked: string;
  email: string | null;
  phone: string;
  registrationCode: string;
  message: string | null;
};

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed ? <path d="M4 4 20 20" /> : null}
    </svg>
  );
}

export function CadastroForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const isModalOpen = useMemo(() => Boolean(confirmState), [confirmState]);
  const shouldShowLoginShortcut = error.toLowerCase().includes("já existe cadastro com esse cpf");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Você precisa aceitar os termos para continuar.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/participant/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cpf, email, phone, password, confirmPassword, acceptedTerms })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível continuar.");
      return;
    }

    setCopied(false);
    setConfirmState({
      name: data.name,
      cpfMasked: data.cpfMasked,
      email: data.email,
      phone: data.phone,
      registrationCode: data.registrationCode,
      message: data.message ?? null
    });
  }

  async function handleCopyCode() {
    if (!confirmState?.registrationCode) {
      return;
    }

    await navigator.clipboard.writeText(confirmState.registrationCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleContinue() {
    setConfirmState(null);
    router.push("/apostas");
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block font-bold text-ink">Nome completo</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
            placeholder="Como você quer aparecer na torcida"
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold text-ink">CPF</span>
          <input
            value={cpf}
            onChange={(event) => setCpf(maskCpf(event.target.value))}
            required
            inputMode="numeric"
            className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
            placeholder="000.000.000-00"
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold text-ink">E-mail</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
            placeholder="seuemail@exemplo.com"
          />
        </label>
        <p className="text-sm text-ink/60">{publicCopy.register.emailHint}</p>
        <label className="block">
          <span className="mb-2 block font-bold text-ink">Telefone celular</span>
          <input
            value={phone}
            onChange={(event) => setPhone(maskPhone(event.target.value))}
            required
            inputMode="tel"
            className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 text-lg outline-none ring-teal/30 transition focus:ring-4"
            placeholder="(11) 99999-9999"
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-bold text-ink">Senha</span>
          <div className="relative">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 pr-14 text-lg outline-none ring-teal/30 transition focus:ring-4"
              placeholder="Crie uma senha"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex w-14 cursor-pointer items-center justify-center text-ink/50 transition hover:text-ink"
            >
              <EyeIcon crossed={!showPassword} />
            </button>
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block font-bold text-ink">Confirmar senha</span>
          <div className="relative">
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              type={showConfirmPassword ? "text" : "password"}
              className="w-full rounded-2xl border border-teal/20 bg-field px-4 py-4 pr-14 text-lg outline-none ring-teal/30 transition focus:ring-4"
              placeholder="Repita sua senha"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
              className="absolute inset-y-0 right-0 flex w-14 cursor-pointer items-center justify-center text-ink/50 transition hover:text-ink"
            >
              <EyeIcon crossed={!showConfirmPassword} />
            </button>
          </div>
        </label>
        <p className="text-sm text-ink/60">{publicCopy.register.passwordHint}</p>

        <label className="flex items-start gap-3 rounded-2xl border border-teal/12 bg-white/70 p-4 text-sm leading-relaxed text-ink/75">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-teal/40 text-teal focus:ring-teal"
          />
          <span>
            Li e concordo com os{" "}
            <Link href="/termos-de-uso" target="_blank" className="font-semibold text-teal underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/politica-de-privacidade" target="_blank" className="font-semibold text-teal underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        {error ? (
          <div className="rounded-2xl bg-wine/10 p-3 text-sm text-wine">
            <p className="font-bold">{error}</p>
            {shouldShowLoginShortcut ? (
              <Link href="/login" className="mt-2 inline-flex font-semibold text-teal underline underline-offset-2">
                Ir para a tela de login
              </Link>
            ) : null}
          </div>
        ) : null}
        <PrimaryButton type="submit" disabled={loading} className="w-full">
          {loading ? publicCopy.register.submitLoading : publicCopy.register.submit}
        </PrimaryButton>
      </form>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/55 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-[1.9rem] bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal">Cadastro confirmado</p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-ink/80">
              Salve o código ou o print desta tela para apresentar no caso de acertos nas apostas.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink/55">Esse código identifica sua participação no sistema.</p>

            <div className="mt-5 rounded-[1.6rem] border border-teal/20 bg-gradient-to-br from-field via-white to-teal/10 px-4 py-5 shadow-sm sm:px-5">
              <p className="text-center text-xs font-medium uppercase tracking-[0.14em] text-teal/80">Seu código</p>
              <p className="mt-2 max-w-full whitespace-nowrap break-normal text-center font-mono text-[clamp(1.75rem,8vw,3rem)] font-bold tracking-[0.08em] text-navy [overflow-wrap:normal] [word-break:keep-all]">
                {confirmState?.registrationCode}
              </p>
              <p className="mt-2 text-center text-xs text-ink/60">Guarde este código</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="rounded-2xl border border-teal/25 bg-white px-4 py-3 text-sm font-semibold text-teal transition hover:bg-teal/5"
                >
                  Copiar código
                </button>
                {copied ? <span className="text-sm font-medium text-teal">Código copiado</span> : null}
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-[1.4rem] bg-field p-4 text-sm text-ink/80">
              <p>
                <strong className="text-ink">Nome:</strong> {confirmState?.name}
              </p>
              <p>
                <strong className="text-ink">CPF:</strong> {confirmState?.cpfMasked}
              </p>
              <p>
                <strong className="text-ink">E-mail:</strong> {confirmState?.email}
              </p>
              <p>
                <strong className="text-ink">Telefone:</strong> {confirmState?.phone}
              </p>
            </div>

            <PrimaryButton type="button" onClick={handleContinue} className="mt-5 w-full">
              Salvar e continuar
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </>
  );
}
