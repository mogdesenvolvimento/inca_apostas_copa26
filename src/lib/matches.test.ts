import { describe, expect, it } from "vitest";
import {
  filterMatchesForCurrentBolaoWindow,
  getMatchDisplayDate,
  getMatchDisplayTime,
  getMatchTimezoneNotice,
  isMatchAvailableForBet
} from "@/lib/matches";
import { zonedDateTimeToUtc } from "@/lib/timezone";

const match = {
  matchDate: "2026-06-11",
  matchTime: "13:00",
  kickoffAt: zonedDateTimeToUtc("2026-06-11", "13:00"),
  isActive: true,
  homeTeam: "Time A",
  awayTeam: "Time B"
};

describe("isMatchAvailableForBet", () => {
  it("permite aposta no dia do jogo ate 10 minutos antes do inicio", () => {
    expect(isMatchAvailableForBet(match, new Date("2026-06-11T15:50:00.000Z"))).toBe(true);
  });

  it("bloqueia aposta apos o cutoff", () => {
    expect(isMatchAvailableForBet(match, new Date("2026-06-11T15:51:00.000Z"))).toBe(false);
  });

  it("bloqueia aposta fora do dia atual em America/Sao_Paulo", () => {
    expect(isMatchAvailableForBet(match, new Date("2026-06-12T12:00:00.000Z"))).toBe(false);
  });

  it("mantem jogo com virada de fuso visivel e aberto ate o inicio oficial em Brasilia", () => {
    const shiftedMatch = {
      matchDate: "2026-06-13",
      matchTime: "01:00",
      kickoffAt: new Date("2026-06-13T04:00:00.000Z"),
      isActive: true,
      homeTeam: "Australia",
      awayTeam: "Turquia"
    };

    expect(getMatchDisplayDate(shiftedMatch)).toBe("2026-06-13");
    expect(getMatchDisplayTime(shiftedMatch)).toBe("21:00");
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-13T15:00:00.000Z"))).toBe(true);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-14T03:59:59.000Z"))).toBe(true);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-14T04:00:00.000Z"))).toBe(false);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-14T04:00:01.000Z"))).toBe(false);
  });

  it("aplica a excecao de fuso para Tunisia x Japao mantendo a data local e o bloqueio em Brasilia", () => {
    const shiftedMatch = {
      matchDate: "2026-06-21",
      matchTime: "01:00",
      kickoffAt: new Date("2026-06-21T04:00:00.000Z"),
      isActive: true,
      homeTeam: "Tunisia",
      awayTeam: "Japao"
    };

    expect(getMatchDisplayDate(shiftedMatch)).toBe("2026-06-20");
    expect(getMatchDisplayTime(shiftedMatch)).toBe("22:00");
    expect(getMatchTimezoneNotice(shiftedMatch)).toContain("01:00 de 21/06/2026");
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-20T22:00:00.000Z"))).toBe(true);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-21T03:59:59.000Z"))).toBe(true);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-06-21T04:00:00.000Z"))).toBe(false);
  });

  it("aplica a excecao de fuso para Suica x Argelia mantendo a data local e o bloqueio em Brasilia", () => {
    const shiftedMatch = {
      matchDate: "2026-07-03",
      matchTime: "00:00",
      kickoffAt: new Date("2026-07-03T03:00:00.000Z"),
      isActive: true,
      homeTeam: "Suica",
      awayTeam: "Argelia"
    };

    expect(getMatchDisplayDate(shiftedMatch)).toBe("2026-07-02");
    expect(getMatchDisplayTime(shiftedMatch)).toBe("20:00");
    expect(getMatchTimezoneNotice(shiftedMatch)).toContain("00:00 de 03/07/2026");
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-07-02T22:00:00.000Z"))).toBe(true);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-07-03T02:59:59.000Z"))).toBe(true);
    expect(isMatchAvailableForBet(shiftedMatch, new Date("2026-07-03T03:00:00.000Z"))).toBe(false);
  });

  it("prioriza a data local da partida no calendario quando houver jogo carregado pela madrugada", () => {
    const shiftedMatch = {
      matchDate: "2026-06-13",
      matchTime: "01:00",
      kickoffAt: new Date("2026-06-13T04:00:00.000Z"),
      isActive: true,
      homeTeam: "Australia",
      awayTeam: "Turquia"
    };

    const regularNextDayMatch = {
      matchDate: "2026-06-14",
      matchTime: "16:00",
      kickoffAt: new Date("2026-06-14T19:00:00.000Z"),
      isActive: true,
      homeTeam: "Time C",
      awayTeam: "Time D"
    };

    const result = filterMatchesForCurrentBolaoWindow(
      [shiftedMatch, regularNextDayMatch],
      new Date("2026-06-13T15:00:00.000Z")
    );

    expect(result.displayDate).toBe("2026-06-13");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]?.matchDate).toBe("2026-06-13");
  });

  it("gera aviso de fuso horario apenas para jogos que avancam para o dia seguinte no Brasil", () => {
    const shiftedMatch = {
      matchDate: "2026-06-13",
      matchTime: "01:00",
      kickoffAt: new Date("2026-06-13T04:00:00.000Z"),
      isActive: true,
      homeTeam: "Australia",
      awayTeam: "Turquia"
    };

    expect(getMatchTimezoneNotice(shiftedMatch)).toContain("14/06/2026");
    expect(getMatchTimezoneNotice(match)).toBeNull();
  });
});
