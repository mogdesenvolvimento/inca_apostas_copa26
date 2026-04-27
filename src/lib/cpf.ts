export function normalizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "").slice(0, 11);
}

export function isValidCpf(cpf: string) {
  const normalized = normalizeCpf(cpf);

  if (!/^\d{11}$/.test(normalized)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(normalized)) {
    return false;
  }

  const digits = normalized.split("").map(Number);
  const firstCheck = calculateCpfCheckDigit(digits.slice(0, 9), 10);
  const secondCheck = calculateCpfCheckDigit(digits.slice(0, 10), 11);

  return firstCheck === digits[9] && secondCheck === digits[10];
}

export function formatCpf(cpf: string) {
  const normalized = normalizeCpf(cpf);

  if (normalized.length !== 11) {
    return cpf;
  }

  return normalized.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function maskCpf(cpf: string) {
  const normalized = normalizeCpf(cpf);

  if (normalized.length !== 11) {
    return cpf;
  }

  return `***.***.***-${normalized.slice(-2)}`;
}

function calculateCpfCheckDigit(digits: number[], factor: number) {
  const total = digits.reduce((sum, digit) => sum + digit * factor--, 0);
  const remainder = total % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
