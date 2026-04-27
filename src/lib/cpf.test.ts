import { describe, expect, it } from "vitest";
import { formatCpf, isValidCpf, maskCpf, normalizeCpf } from "@/lib/cpf";

describe("cpf helpers", () => {
  it("normaliza CPF removendo máscara", () => {
    expect(normalizeCpf("123.456.789-09")).toBe("12345678909");
  });

  it("valida CPF pelos dígitos verificadores", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123.456.789-00")).toBe(false);
  });

  it("formata e mascara CPF", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(maskCpf("52998224725")).toBe("***.***.***-25");
  });
});
