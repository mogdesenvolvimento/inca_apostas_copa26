import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { getCurrentParticipant } from "@/lib/auth";
import { ApostasClient } from "@/components/public/ApostasClient";

export default async function ApostasPage() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    redirect("/login");
  }

  return (
    <PublicShell>
      <ApostasClient />
    </PublicShell>
  );
}
