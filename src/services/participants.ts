import { maskCpf } from "@/lib/cpf";
import { formatPhoneBR } from "@/lib/phone";

type PublicParticipant = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  registrationCode: string;
};

export function serializePublicParticipant(participant: PublicParticipant) {
  return {
    participantId: participant.id,
    name: participant.name,
    cpfMasked: maskCpf(participant.cpf),
    phone: formatPhoneBR(participant.phone),
    registrationCode: participant.registrationCode
  };
}
