import { isValidBrazilPhone, normalizePhone } from "@/lib/phone";

export function validateParticipantInput(name: string, phone: string) {
  const trimmedName = name.trim();
  const normalizedPhone = normalizePhone(phone);

  if (!trimmedName) {
    throw new Error("Nome completo é obrigatório.");
  }

  if (!phone.trim()) {
    throw new Error("Telefone celular é obrigatório.");
  }

  if (!isValidBrazilPhone(normalizedPhone)) {
    throw new Error("Informe um telefone celular brasileiro válido.");
  }

  return {
    name: trimmedName,
    phone: normalizedPhone
  };
}

export function validateScore(score: unknown) {
  const value = Number(score);

  if (!Number.isInteger(value) || value < 0 || value > 99) {
    throw new Error("O placar deve ser um número inteiro entre 0 e 99.");
  }

  return value;
}
