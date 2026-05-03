import { jsonError } from "@/lib/http";

export async function POST() {
  return jsonError("Esse endpoint foi substituído por /api/participant/register.", 410);
}
