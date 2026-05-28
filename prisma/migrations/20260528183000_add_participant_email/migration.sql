ALTER TABLE "Participant" ADD COLUMN "email" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Participant_email_key" ON "Participant"("email");
