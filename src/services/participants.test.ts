import { describe, expect, it, vi } from "vitest";
import { findOrCreateParticipantByCpf } from "@/services/participants";

vi.mock("@/lib/registration-code", () => ({
  generateRegistrationCode: vi.fn(() => "INCA-7F3K9D")
}));

describe("findOrCreateParticipantByCpf", () => {
  it("retorna participante existente pelo CPF normalizado", async () => {
    const existing = {
      id: "p1",
      name: "Maria",
      cpf: "52998224725",
      phone: "5511999998888",
      registrationCode: "INCA-AAAA11",
      createdAt: new Date()
    };
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValueOnce(existing),
        create: vi.fn()
      }
    };

    const result = await findOrCreateParticipantByCpf("Maria Nova", "529.982.247-25", "(11) 99999-8888", client as any);

    expect(result.created).toBe(false);
    expect(result.participant).toBe(existing);
    expect(client.participant.findUnique).toHaveBeenCalledWith({ where: { cpf: "52998224725" } });
    expect(client.participant.create).not.toHaveBeenCalled();
  });

  it("cria participante com código quando o CPF ainda não existe", async () => {
    const created = {
      id: "p2",
      name: "João Silva",
      cpf: "52998224725",
      phone: "5521987654321",
      registrationCode: "INCA-7F3K9D",
      createdAt: new Date()
    };
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: vi.fn().mockResolvedValue(created)
      }
    };

    const result = await findOrCreateParticipantByCpf(" João Silva ", "529.982.247-25", "+55 (21) 98765-4321", client as any);

    expect(result.created).toBe(true);
    expect(client.participant.create).toHaveBeenCalledWith({
      data: {
        name: "João Silva",
        cpf: "52998224725",
        phone: "5521987654321",
        registrationCode: "INCA-7F3K9D"
      }
    });
  });
});
