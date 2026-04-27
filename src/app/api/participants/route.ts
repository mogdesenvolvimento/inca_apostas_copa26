import { NextResponse } from "next/server";
import { maskCpf } from "@/lib/cpf";
import { publicCopy } from "@/lib/copy";
import { formatPhoneBR } from "@/lib/phone";
import { jsonError, readJson } from "@/lib/http";
import { findOrCreateParticipantByCpf } from "@/services/participants";

type Body = {
  name?: string;
  cpf?: string;
  phone?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const result = await findOrCreateParticipantByCpf(body.name ?? "", body.cpf ?? "", body.phone ?? "");

    return NextResponse.json({
      participantId: result.participant.id,
      name: result.participant.name,
      cpfMasked: maskCpf(result.participant.cpf),
      phone: formatPhoneBR(result.participant.phone),
      registrationCode: result.participant.registrationCode,
      isExistingParticipant: !result.created,
      message: result.created ? null : publicCopy.participantFound
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível continuar.");
  }
}
