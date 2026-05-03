import { describe, expect, it, vi } from "vitest";
import { authenticateParticipant, createParticipantAccount } from "@/services/participant-auth";

vi.mock("@/lib/registration-code", () => ({
  generateRegistrationCode: vi.fn(() => "INCA-7F3K9D")
}));

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn(async () => "hashed-password"),
  verifyPassword: vi.fn(async (password: string, passwordHash: string) => password === "senha123" && passwordHash === "hashed-password")
}));

describe("createParticipantAccount", () => {
  it("bloqueia CPF já cadastrado", async () => {
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValue({ id: "p1" }),
        create: vi.fn()
      }
    };

    await expect(
      createParticipantAccount("Maria", "529.982.247-25", "(11) 99999-8888", "senha123", "senha123", client as any)
    ).rejects.toThrow("Já existe cadastro com esse CPF. Faz teu acesso para continuar.");
  });

  it("cria participante com hash de senha e código único", async () => {
    const created = {
      id: "p2",
      name: "João Silva",
      cpf: "52998224725",
      phone: "5521987654321",
      passwordHash: "hashed-password",
      registrationCode: "INCA-7F3K9D",
      createdAt: new Date()
    };
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: vi.fn().mockResolvedValue(created)
      }
    };

    const result = await createParticipantAccount(
      " João Silva ",
      "529.982.247-25",
      "+55 (21) 98765-4321",
      "senha123",
      "senha123",
      client as any
    );

    expect(result).toBe(created);
    expect(client.participant.create).toHaveBeenCalledWith({
      data: {
        name: "João Silva",
        cpf: "52998224725",
        phone: "5521987654321",
        passwordHash: "hashed-password",
        registrationCode: "INCA-7F3K9D"
      }
    });
  });
});

describe("authenticateParticipant", () => {
  it("retorna erro quando o CPF não existe", async () => {
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValue(null)
      }
    };

    await expect(authenticateParticipant("529.982.247-25", "senha123", client as any)).rejects.toThrow(
      "Não encontramos cadastro com esse CPF."
    );
  });

  it("retorna participante autenticado com CPF e senha válidos", async () => {
    const participant = {
      id: "p3",
      name: "Lucas",
      cpf: "52998224725",
      phone: "5511999998888",
      passwordHash: "hashed-password",
      registrationCode: "INCA-AAAA11",
      createdAt: new Date()
    };
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValue(participant)
      }
    };

    const result = await authenticateParticipant("529.982.247-25", "senha123", client as any);

    expect(result).toBe(participant);
    expect(client.participant.findUnique).toHaveBeenCalledWith({ where: { cpf: "52998224725" } });
  });
});
