import { describe, expect, it } from "vitest";
import { isMatchAvailableForBet } from "@/lib/matches";
import { zonedDateTimeToUtc } from "@/lib/timezone";

const match = {
  matchDate: "2026-06-11",
  kickoffAt: zonedDateTimeToUtc("2026-06-11", "13:00"),
  isActive: true
};

describe("isMatchAvailableForBet", () => {
  it("permite aposta no dia do jogo até 10 minutos antes do início", () => {
    expect(isMatchAvailableForBet(match, new Date("2026-06-11T15:50:00.000Z"))).toBe(true);
  });

  it("bloqueia aposta após o cutoff", () => {
    expect(isMatchAvailableForBet(match, new Date("2026-06-11T15:51:00.000Z"))).toBe(false);
  });

  it("bloqueia aposta fora do dia atual em America/Sao_Paulo", () => {
    expect(isMatchAvailableForBet(match, new Date("2026-06-12T12:00:00.000Z"))).toBe(false);
  });
});
