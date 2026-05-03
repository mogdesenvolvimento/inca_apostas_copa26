import { isValidCpf, normalizeCpf } from "@/lib/cpf";
import { isValidBrazilPhone, normalizePhone } from "@/lib/phone";

export function validateParticipantInput(name: string, cpf: string, phone: string) {
  const trimmedName = name.trim();
  const normalizedCpf = normalizeCpf(cpf);
  const normalizedPhone = normalizePhone(phone);

  if (!trimmedName) {
    throw new Error("Nome completo é obrigatório.");
  }

  if (!cpf.trim()) {
    throw new Error("CPF é obrigatório.");
  }

  if (!isValidCpf(normalizedCpf)) {
    throw new Error("Informe um CPF válido.");
  }

  if (!phone.trim()) {
    throw new Error("Telefone celular é obrigatório.");
  }

  if (!isValidBrazilPhone(normalizedPhone)) {
    throw new Error("Informe um telefone celular brasileiro válido.");
  }

  return {
    name: trimmedName,
    cpf: normalizedCpf,
    phone: normalizedPhone
  };
}

export function validateParticipantRegistrationInput(
  name: string,
  cpf: string,
  phone: string,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean
) {
  const participant = validateParticipantInput(name, cpf, phone);
  const normalizedPassword = password.trim();
  const normalizedConfirmPassword = confirmPassword.trim();

  if (!normalizedPassword) {
    throw new Error("Senha é obrigatória.");
  }

  if (normalizedPassword.length < 6) {
    throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  }

  if (!normalizedConfirmPassword) {
    throw new Error("Confirma tua senha pra continuar.");
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    throw new Error("As senhas não conferem.");
  }

  if (!acceptedTerms) {
    throw new Error("Você precisa aceitar os termos para continuar.");
  }

  return {
    ...participant,
    password: normalizedPassword,
    acceptedTerms
  };
}

export function validateParticipantLoginInput(cpf: string, password: string) {
  const normalizedCpf = normalizeCpf(cpf);
  const normalizedPassword = password.trim();

  if (!cpf.trim()) {
    throw new Error("CPF é obrigatório.");
  }

  if (!isValidCpf(normalizedCpf)) {
    throw new Error("Informe um CPF válido.");
  }

  if (!normalizedPassword) {
    throw new Error("Senha é obrigatória.");
  }

  return {
    cpf: normalizedCpf,
    password: normalizedPassword
  };
}

export function validateScore(score: unknown) {
  const value = Number(score);

  if (!Number.isInteger(value) || value < 0 || value > 99) {
    throw new Error("O placar deve ser um número inteiro entre 0 e 99.");
  }

  return value;
}
