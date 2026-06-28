ALTER TABLE "Match" ADD COLUMN "wentToPenalties" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Match" ADD COLUMN "penaltyWinnerSide" TEXT;
ALTER TABLE "Match" ADD COLUMN "qualifiedTeam" TEXT;

ALTER TABLE "Bet" ADD COLUMN "goesToPenalties" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Bet" ADD COLUMN "penaltyWinnerSide" TEXT;
