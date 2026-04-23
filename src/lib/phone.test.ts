import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/phone";

describe("normalizePhone", () => {
  it("remove espaços, parênteses, hífens e caracteres não numéricos", () => {
    expect(normalizePhone("(11) 99999-8888")).toBe("5511999998888");
    expect(normalizePhone(" 11 98888-7777 ")).toBe("5511988887777");
  });

  it("preserva telefones já salvos com prefixo 55", () => {
    expect(normalizePhone("+55 (21) 98765-4321")).toBe("5521987654321");
  });
});
