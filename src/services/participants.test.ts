import { describe, expect, it, vi } from "vitest";
import { findOrCreateParticipantByPhone } from "@/services/participants";

describe("findOrCreateParticipantByPhone", () => {
  it("retorna participante existente pelo telefone normalizado", async () => {
    const existing = {
      id: "p1",
      name: "Maria",
      phone: "5511999998888",
      createdAt: new Date()
    };
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValue(existing),
        create: vi.fn()
      }
    };

    const result = await findOrCreateParticipantByPhone("Maria Nova", "(11) 99999-8888", client as any);

    expect(result.created).toBe(false);
    expect(result.participant).toBe(existing);
    expect(client.participant.findUnique).toHaveBeenCalledWith({ where: { phone: "5511999998888" } });
    expect(client.participant.create).not.toHaveBeenCalled();
  });

  it("cria participante quando o telefone ainda não existe", async () => {
    const created = {
      id: "p2",
      name: "João Silva",
      phone: "5521987654321",
      createdAt: new Date()
    };
    const client = {
      participant: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created)
      }
    };

    const result = await findOrCreateParticipantByPhone(" João Silva ", "+55 (21) 98765-4321", client as any);

    expect(result.created).toBe(true);
    expect(client.participant.create).toHaveBeenCalledWith({
      data: { name: "João Silva", phone: "5521987654321" }
    });
  });
});
