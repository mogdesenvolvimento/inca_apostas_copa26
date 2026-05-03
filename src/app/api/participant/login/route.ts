import { NextResponse } from "next/server";
import {
  PARTICIPANT_SESSION_COOKIE,
  participantCookieOptions,
  signParticipantSession
} from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { authenticateParticipant } from "@/services/participant-auth";
import { serializePublicParticipant } from "@/services/participants";

type Body = {
  cpf?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const participant = await authenticateParticipant(body.cpf ?? "", body.password ?? "");

    const response = NextResponse.json({
      ...serializePublicParticipant(participant),
      isExistingParticipant: true
    });
    response.cookies.set(
      PARTICIPANT_SESSION_COOKIE,
      signParticipantSession(participant.id),
      participantCookieOptions()
    );

    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível fazer teu acesso.", 401);
  }
}
