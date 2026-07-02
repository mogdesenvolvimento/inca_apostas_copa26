import type { Match } from "@prisma/client";
import { formatDateBR, formatTimeBR, getSaoPauloDateString } from "@/lib/timezone";

export type BetStatus = "available" | "already_bet" | "closed";

const BETTING_CUTOFF_MINUTES = 10;

type MatchScheduleContext = Pick<
  Match,
  "matchDate" | "matchTime" | "kickoffAt" | "isActive" | "homeTeam" | "awayTeam"
>;

type TimezoneOverride = {
  localDate: string;
  localTime: string;
  brasiliaKickoffAt: Date;
};

const TIMEZONE_OVERRIDES = new Map<string, TimezoneOverride>([
  [
    "australia|turquia",
    {
      localDate: "2026-06-13",
      localTime: "21:00",
      brasiliaKickoffAt: new Date("2026-06-14T01:00:00-03:00")
    }
  ],
  [
    "austria|jordania",
    {
      localDate: "2026-06-16",
      localTime: "21:00",
      brasiliaKickoffAt: new Date("2026-06-17T01:00:00-03:00")
    }
  ],
  [
    "turquia|paraguai",
    {
      localDate: "2026-06-19",
      localTime: "20:00",
      brasiliaKickoffAt: new Date("2026-06-20T00:00:00-03:00")
    }
  ],
  [
    "tunisia|japao",
    {
      localDate: "2026-06-20",
      localTime: "22:00",
      brasiliaKickoffAt: new Date("2026-06-21T01:00:00-03:00")
    }
  ],
  [
    "jordania|argelia",
    {
      localDate: "2026-06-22",
      localTime: "20:00",
      brasiliaKickoffAt: new Date("2026-06-23T00:00:00-03:00")
    }
  ],
  [
    "egito|ira",
    {
      localDate: "2026-06-26",
      localTime: "20:00",
      brasiliaKickoffAt: new Date("2026-06-27T00:00:00-03:00")
    }
  ],
  [
    "novazelandia|belgica",
    {
      localDate: "2026-06-26",
      localTime: "20:00",
      brasiliaKickoffAt: new Date("2026-06-27T00:00:00-03:00")
    }
  ],
  [
    "suica|argelia",
    {
      localDate: "2026-07-02",
      localTime: "20:00",
      brasiliaKickoffAt: new Date("2026-07-03T00:00:00-03:00")
    }
  ]
]);

function normalizeTeamKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function getMatchOverride(match: Pick<Match, "homeTeam" | "awayTeam">) {
  return TIMEZONE_OVERRIDES.get(`${normalizeTeamKey(match.homeTeam)}|${normalizeTeamKey(match.awayTeam)}`) ?? null;
}

export function getMatchDisplayDate(match: MatchScheduleContext) {
  return getMatchOverride(match)?.localDate ?? match.matchDate;
}

export function getMatchDisplayTime(match: MatchScheduleContext) {
  return getMatchOverride(match)?.localTime ?? match.matchTime;
}

export function getMatchKickoffAtInBrasilia(match: MatchScheduleContext) {
  return getMatchOverride(match)?.brasiliaKickoffAt ?? match.kickoffAt;
}

export function isMatchShiftedToNextDayInBrazil(match: MatchScheduleContext) {
  return getSaoPauloDateString(getMatchKickoffAtInBrasilia(match)) > getMatchDisplayDate(match);
}

export function getMatchBetDeadline(match: MatchScheduleContext) {
  if (isMatchShiftedToNextDayInBrazil(match)) {
    return getMatchKickoffAtInBrasilia(match);
  }

  return new Date(getMatchKickoffAtInBrasilia(match).getTime() - BETTING_CUTOFF_MINUTES * 60 * 1000);
}

export function isCarryoverMatchVisible(match: MatchScheduleContext, now = new Date()) {
  if (!match.isActive || !isMatchShiftedToNextDayInBrazil(match)) {
    return false;
  }

  const kickoffAtBrasilia = getMatchKickoffAtInBrasilia(match);
  const yesterday = getSaoPauloDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  return (
    getMatchDisplayDate(match) === yesterday &&
    getSaoPauloDateString(kickoffAtBrasilia) === getSaoPauloDateString(now) &&
    now.getTime() < kickoffAtBrasilia.getTime()
  );
}

export function filterMatchesForCurrentBolaoWindow<T extends MatchScheduleContext>(matches: T[], now = new Date()) {
  const today = getSaoPauloDateString(now);
  const carryoverMatches = matches.filter((match) => isCarryoverMatchVisible(match, now));
  const carryoverDisplayDate = carryoverMatches.length ? getMatchDisplayDate(carryoverMatches[0]!) : null;

  return {
    displayDate: carryoverDisplayDate ?? today,
    matches: matches.filter((match) => {
      if (!match.isActive) {
        return false;
      }

      if (carryoverDisplayDate) {
        return getMatchDisplayDate(match) === carryoverDisplayDate && isCarryoverMatchVisible(match, now);
      }

      return getMatchDisplayDate(match) === today;
    })
  };
}

export function isMatchAvailableForBet(match: MatchScheduleContext, now = new Date()) {
  if (!match.isActive) {
    return false;
  }

  const today = getSaoPauloDateString(now);
  const visibleToday = getMatchDisplayDate(match) === today;
  const visibleAsCarryover = isCarryoverMatchVisible(match, now);

  if (!visibleToday && !visibleAsCarryover) {
    return false;
  }

  return now.getTime() <= getMatchBetDeadline(match).getTime();
}

export function getMatchTimezoneNotice(match: MatchScheduleContext) {
  if (!isMatchShiftedToNextDayInBrazil(match)) {
    return null;
  }

  return `Este jogo possui diferença de fuso horário. Os palpites permanecem abertos até ${formatTimeBR(
    getMatchKickoffAtInBrasilia(match)
  )} de ${formatDateBR(getSaoPauloDateString(getMatchKickoffAtInBrasilia(match)))}.`;
}

export function getMatchTimezoneDisplayInfo(match: MatchScheduleContext) {
  if (!isMatchShiftedToNextDayInBrazil(match)) {
    return null;
  }

  const kickoffAtBrasilia = getMatchKickoffAtInBrasilia(match);

  return {
    localLabel: `${formatDateBR(getMatchDisplayDate(match))} às ${getMatchDisplayTime(match)} (Horário Local)`,
    brasiliaLabel: `${formatDateBR(getSaoPauloDateString(kickoffAtBrasilia))} às ${formatTimeBR(
      kickoffAtBrasilia
    )} (Horário Brasília)`
  };
}

export function getParticipantMatchBetStatusFromData(
  match: MatchScheduleContext,
  hasBet: boolean,
  now = new Date()
): BetStatus {
  if (hasBet) {
    return "already_bet";
  }

  return isMatchAvailableForBet(match, now) ? "available" : "closed";
}
