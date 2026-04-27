const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRegistrationCode() {
  let suffix = "";

  for (let index = 0; index < 6; index += 1) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }

  return `INCA-${suffix}`;
}
