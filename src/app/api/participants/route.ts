import { NextResponse } from "next/server";
import { publicCopy } from "@/lib/copy";
import { jsonError, readJson } from "@/lib/http";
import { findOrCreateParticipantByPhone } from "@/services/participants";

type Body = {
  name?: string;
  phone?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const result = await findOrCreateParticipantByPhone(body.name ?? "", body.phone ?? "");

    return NextResponse.json({
      participant: result.participant,
      created: result.created,
      message: result.created ? null : publicCopy.participantFound
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível continuar.");
  }
}
