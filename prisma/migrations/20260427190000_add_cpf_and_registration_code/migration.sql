PRAGMA foreign_keys=OFF;

DELETE FROM "Bet";
DELETE FROM "Participant";

CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";

CREATE UNIQUE INDEX "Participant_cpf_key" ON "Participant"("cpf");
CREATE UNIQUE INDEX "Participant_registrationCode_key" ON "Participant"("registrationCode");
CREATE INDEX "Participant_phone_idx" ON "Participant"("phone");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
