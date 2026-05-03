PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_Participant" ("createdAt", "cpf", "id", "name", "passwordHash", "phone", "registrationCode")
SELECT "createdAt", "cpf", "id", "name", '' AS "passwordHash", "phone", "registrationCode"
FROM "Participant";

DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";

CREATE UNIQUE INDEX "Participant_cpf_key" ON "Participant"("cpf");
CREATE UNIQUE INDEX "Participant_registrationCode_key" ON "Participant"("registrationCode");
CREATE INDEX "Participant_phone_idx" ON "Participant"("phone");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
