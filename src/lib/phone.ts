export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

export function isValidBrazilPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return /^55\d{10,11}$/.test(normalized);
}

export function formatPhoneBR(phone: string) {
  const normalized = normalizePhone(phone);
  const withoutCountry = normalized.startsWith("55") ? normalized.slice(2) : normalized;

  if (withoutCountry.length === 11) {
    return withoutCountry.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  if (withoutCountry.length === 10) {
    return withoutCountry.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return phone;
}
