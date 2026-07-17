import { describe, expect, it } from "vitest";
import { getStageLabel, resolveCurrentCompetitiveStage, resolveCurrentIndividualRankingStage } from "@/lib/match-stages";

describe("match stages", () => {
  it("retorna o rotulo esperado para 16 avos", () => {
    expect(getStageLabel("round_of_32")).toBe("16 Avos de Final");
  });

  it("considera a fase futura ja aberta na agenda do dia", () => {
    const stage = resolveCurrentCompetitiveStage(
      [
        { stage: "group", matchDate: "2026-06-27", kickoffAt: new Date("2026-06-27T20:00:00.000Z") },
        { stage: "round_of_32", matchDate: "2026-06-28", kickoffAt: new Date("2026-06-28T19:00:00.000Z") }
      ],
      new Date("2026-06-28T12:00:00.000Z")
    );

    expect(stage).toBe("round_of_32");
  });

  it("mantem a fase de grupos enquanto ainda houver jogos dela na agenda atual", () => {
    const stage = resolveCurrentCompetitiveStage(
      [
        { stage: "group", matchDate: "2026-06-27", kickoffAt: new Date("2026-06-27T20:00:00.000Z") },
        { stage: "round_of_32", matchDate: "2026-06-28", kickoffAt: new Date("2026-06-28T19:00:00.000Z") }
      ],
      new Date("2026-06-27T15:00:00.000Z")
    );

    expect(stage).toBe("group");
  });

  it("avanca automaticamente para quartas quando as oitavas ja passaram e a nova fase esta na agenda", () => {
    const stage = resolveCurrentCompetitiveStage(
      [
        { stage: "round_of_16", matchDate: "2026-07-07", kickoffAt: new Date("2026-07-07T16:00:00.000Z") },
        { stage: "quarter_final", matchDate: "2026-07-09", kickoffAt: new Date("2026-07-09T20:00:00.000Z") }
      ],
      new Date("2026-07-08T15:00:00.000Z")
    );

    expect(stage).toBe("quarter_final");
  });

  it("retorna o rotulo esperado para disputa pelo bronze", () => {
    expect(getStageLabel("bronze_final")).toBe("Disputa pelo bronze");
  });

  it("mantem o ranking individual encerrado nas semifinais mesmo com bronze e final na agenda", () => {
    const stage = resolveCurrentIndividualRankingStage(
      [
        { stage: "semi_final", matchDate: "2026-07-15", kickoffAt: new Date("2026-07-15T19:00:00.000Z") },
        { stage: "bronze_final", matchDate: "2026-07-18", kickoffAt: new Date("2026-07-18T21:00:00.000Z") },
        { stage: "final", matchDate: "2026-07-19", kickoffAt: new Date("2026-07-19T19:00:00.000Z") }
      ],
      new Date("2026-07-17T15:00:00.000Z")
    );

    expect(stage).toBe("semi_final");
  });
});
