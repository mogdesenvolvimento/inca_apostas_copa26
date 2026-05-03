import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { serializePublicParticipant } from "@/services/participants";

export async function GET() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    return jsonError("Participante não autenticado.", 401);
  }

  return NextResponse.json(serializePublicParticipant(participant));
}
