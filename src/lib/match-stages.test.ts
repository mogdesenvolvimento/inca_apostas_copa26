import { describe, expect, it } from "vitest";
import { getStageLabel, resolveCurrentCompetitiveStage } from "@/lib/match-stages";

describe("match stages", () => {
  it("retorna o rótulo esperado para 16 avos", () => {
    expect(getStageLabel("round_of_32")).toBe("16 Avos de Final");
  });

  it("considera a fase futura já aberta na agenda do dia", () => {
    const stage = resolveCurrentCompetitiveStage(
      [
        { stage: "group", matchDate: "2026-06-27", kickoffAt: new Date("2026-06-27T20:00:00.000Z") },
        { stage: "round_of_32", matchDate: "2026-06-28", kickoffAt: new Date("2026-06-28T19:00:00.000Z") }
      ],
      new Date("2026-06-28T12:00:00.000Z")
    );

    expect(stage).toBe("round_of_32");
  });

  it("mantém a fase de grupos enquanto ainda houver jogos dela na agenda atual", () => {
    const stage = resolveCurrentCompetitiveStage(
      [
        { stage: "group", matchDate: "2026-06-27", kickoffAt: new Date("2026-06-27T20:00:00.000Z") },
        { stage: "round_of_32", matchDate: "2026-06-28", kickoffAt: new Date("2026-06-28T19:00:00.000Z") }
      ],
      new Date("2026-06-27T15:00:00.000Z")
    );

    expect(stage).toBe("group");
  });
});
