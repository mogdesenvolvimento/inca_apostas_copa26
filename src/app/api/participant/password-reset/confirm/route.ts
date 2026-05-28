import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/http";
import { resetParticipantPassword } from "@/services/participant-auth";

type Body = {
  token?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    await resetParticipantPassword(body.token ?? "", body.password ?? "", body.confirmPassword ?? "");

    return NextResponse.json({
      ok: true,
      message: "Senha atualizada com sucesso. Agora é só fazer teu acesso."
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Não foi possível redefinir tua senha.");
  }
}
