import type { Match } from "@prisma/client";
import { getSaoPauloDateString } from "@/lib/timezone";

export type BetStatus = "available" | "already_bet" | "closed";

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

  const cutoff = new Date(match.kickoffAt.getTime() - 30 * 60 * 1000);
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
