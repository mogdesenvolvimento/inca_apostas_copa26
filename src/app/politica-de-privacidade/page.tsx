import { LegalPageLayout } from "@/components/public/LegalPageLayout";

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageLayout title="Política de Privacidade" subtitle="Copa Inca Bar">
      <p>
        Esta Política de Privacidade explica como os dados informados na plataforma Copa Inca Bar são utilizados para
        validar a participação, organizar a ação promocional e permitir contato relacionado às ações do Inca Bar.
      </p>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">1. Dados coletados</h2>
        <p className="mt-2">Podemos coletar:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>nome completo;</li>
          <li>CPF;</li>
          <li>telefone celular;</li>
          <li>senha de acesso criptografada;</li>
          <li>código de participação;</li>
          <li>palpites enviados;</li>
          <li>data e horário de participação;</li>
          <li>informações técnicas básicas de acesso, quando aplicável.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">2. Como usamos seus dados</h2>
        <p className="mt-2">Os dados podem ser utilizados para:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>validar sua participação;</li>
          <li>identificar corretamente cada participante;</li>
          <li>evitar cadastros duplicados;</li>
          <li>conferir resultados da ação promocional;</li>
          <li>entrar em contato em caso de premiação;</li>
          <li>enviar comunicações futuras do Inca Bar.</li>
        </ul>
        <p className="mt-4">Essas comunicações podem incluir:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>convites para eventos;</li>
          <li>promoções;</li>
          <li>novidades;</li>
          <li>campanhas especiais;</li>
          <li>ações de relacionamento.</li>
        </ul>
        <p className="mt-4">
          Os contatos poderão ocorrer por telefone, WhatsApp, SMS ou canais digitais relacionados ao contato
          informado.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">3. Compartilhamento</h2>
        <p className="mt-2">
          O Inca Bar não comercializa dados pessoais dos participantes.
        </p>
        <p className="mt-2">
          Os dados poderão ser tratados por parceiros de tecnologia responsáveis pela operação da plataforma, apenas
          quando necessário para funcionamento do sistema.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">4. Segurança</h2>
        <p className="mt-2">
          Adotamos medidas razoáveis de segurança para proteger os dados contra acesso indevido, alteração ou uso não
          autorizado.
        </p>
        <p className="mt-2">A senha do participante deve ser armazenada de forma criptografada/hash, nunca em texto puro.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">5. Solicitações do participante</h2>
        <p className="mt-2">O participante poderá solicitar:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>correção de dados;</li>
          <li>atualização cadastral;</li>
          <li>interrupção de comunicações promocionais;</li>
          <li>exclusão de cadastro, quando aplicável.</li>
        </ul>
        <p className="mt-4">As solicitações devem ser feitas pelos canais oficiais do Inca Bar.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">6. Consentimento</h2>
        <p className="mt-2">
          Ao utilizar a plataforma e marcar o aceite no cadastro, o participante declara estar ciente e concordar com
          esta Política de Privacidade.
        </p>
      </section>
    </LegalPageLayout>
  );
}
