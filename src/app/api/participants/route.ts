import { NextResponse } from "next/server";
import { findOrCreateParticipantByPhone } from "@/services/participants";
import { jsonError, readJson } from "@/lib/http";

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
      message: result.created
        ? null
        : "Encontramos seu cadastro anterior. Você poderá visualizar suas apostas já registradas e apostar apenas nos jogos ainda disponíveis."
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível continuar.");
  }
}
