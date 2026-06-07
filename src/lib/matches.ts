import type { Match } from "@prisma/client";
import { getSaoPauloDateString } from "@/lib/timezone";

export type BetStatus = "available" | "already_bet" | "closed";

const BETTING_CUTOFF_MINUTES = 10;

export function isMatchAvailableForBet(
  match: Pick<Match, "matchDate" | "kickoffAt" | "isActive">,
  now = new Date()
) {
  if (!match.isActive) {
    return false;
  }

  const today = getSaoPauloDateString(now);
  if (today !== match.matchDate) {
    return false;
  }

  const cutoff = new Date(match.kickoffAt.getTime() - BETTING_CUTOFF_MINUTES * 60 * 1000);
  return now.getTime() <= cutoff.getTime();
}

export function getParticipantMatchBetStatusFromData(
  match: Pick<Match, "matchDate" | "kickoffAt" | "isActive">,
  hasBet: boolean,
  now = new Date()
): BetStatus {
  if (hasBet) {
    return "already_bet";
  }

  return isMatchAvailableForBet(match, now) ? "available" : "closed";
}
