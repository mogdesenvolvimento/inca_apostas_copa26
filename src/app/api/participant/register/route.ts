import { NextResponse } from "next/server";
import {
  PARTICIPANT_SESSION_COOKIE,
  participantCookieOptions,
  signParticipantSession
} from "@/lib/auth";
import { publicCopy } from "@/lib/copy";
import { jsonError, readJson } from "@/lib/http";
import { createParticipantAccount } from "@/services/participant-auth";
import { serializePublicParticipant } from "@/services/participants";

type Body = {
  name?: string;
  cpf?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const participant = await createParticipantAccount(
      body.name ?? "",
      body.cpf ?? "",
      body.phone ?? "",
      body.password ?? "",
      body.confirmPassword ?? "",
      Boolean(body.acceptedTerms)
    );

    const response = NextResponse.json({
      ...serializePublicParticipant(participant),
      isExistingParticipant: false,
      message: publicCopy.register.successMessage
    });
    response.cookies.set(
      PARTICIPANT_SESSION_COOKIE,
      signParticipantSession(participant.id),
      participantCookieOptions()
    );

    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível concluir teu cadastro.");
  }
}
