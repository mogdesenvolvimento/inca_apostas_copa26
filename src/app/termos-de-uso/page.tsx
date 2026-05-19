import { LegalPageLayout } from "@/components/public/LegalPageLayout";

export default function TermosDeUsoPage() {
  return (
    <LegalPageLayout title="Termos de Uso" subtitle="Desafio de Palpites do Inca Bar">
      <p>
        A plataforma Desafio de Palpites do Inca Bar é uma experiência promocional criada para interação do público com
        os jogos disponíveis na plataforma.
      </p>
      <p>
        Esta é uma ação promocional independente do Inca Bar, sem vínculo, patrocínio, autorização ou associação
        oficial com FIFA, CBF ou qualquer entidade organizadora de competições esportivas.
      </p>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">1. Natureza da plataforma</h2>
        <p className="mt-2">Esta plataforma:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>não opera apostas financeiras;</li>
          <li>não possui odds;</li>
          <li>não possui saldo;</li>
          <li>não possui carteira;</li>
          <li>não possui compra de créditos;</li>
          <li>não possui saques ou depósitos;</li>
          <li>não caracteriza casa de apostas;</li>
          <li>não constitui jogo de azar com aposta monetária.</li>
        </ul>
        <p className="mt-4">A participação é promocional e vinculada a uma ação independente do Inca Bar.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">2. Cadastro</h2>
        <p className="mt-2">Para participar, o usuário deve informar dados verdadeiros:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>nome completo;</li>
          <li>CPF;</li>
          <li>telefone celular;</li>
          <li>senha de acesso.</li>
        </ul>
        <p className="mt-4">Cada CPF poderá manter apenas um cadastro ativo.</p>
        <p className="mt-2">O participante é responsável por manter seus dados corretos e guardar seu código de participação.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">3. Participação nos palpites</h2>
        <p className="mt-2">Os palpites estarão disponíveis apenas para os jogos liberados no dia.</p>
        <p className="mt-2">Cada palpite poderá ser enviado somente até 30 minutos antes do início da partida.</p>
        <p className="mt-2">Após o envio, o palpite não poderá ser alterado.</p>
        <p className="mt-2">Cada participante poderá enviar apenas um palpite por jogo.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">4. Código de participação</h2>
        <p className="mt-2">Após o cadastro, o sistema gera um código de participação.</p>
        <p className="mt-2">O participante deve salvar o código ou o print da tela para apresentar em caso de acerto nos palpites.</p>
        <p className="mt-2">O Inca Bar poderá solicitar esse código para conferência e validação da participação.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">5. Premiação promocional</h2>
        <p className="mt-2">Caso exista premiação, o Inca Bar poderá solicitar:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>documento;</li>
          <li>CPF;</li>
          <li>telefone cadastrado;</li>
          <li>código de participação;</li>
          <li>print da tela de confirmação.</li>
        </ul>
        <p className="mt-4">A ausência de comprovação poderá impedir a validação do prêmio.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">6. Uso indevido</h2>
        <p className="mt-2">O Inca Bar poderá bloquear ou desconsiderar participações com indícios de:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>fraude;</li>
          <li>dados falsos;</li>
          <li>múltiplos cadastros irregulares;</li>
          <li>automação indevida;</li>
          <li>tentativa de manipulação do sistema.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">7. Comunicações futuras</h2>
        <p className="mt-2">
          Ao participar, o usuário concorda que o Inca Bar poderá utilizar os dados fornecidos para contato futuro,
          incluindo:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>promoções;</li>
          <li>convites;</li>
          <li>campanhas;</li>
          <li>novidades;</li>
          <li>ações promocionais.</li>
        </ul>
        <p className="mt-4">
          Esses contatos poderão ocorrer por telefone, WhatsApp, SMS ou canais digitais relacionados ao contato
          informado.
        </p>
        <p className="mt-2">O participante poderá solicitar a interrupção dessas comunicações pelos canais oficiais do Inca Bar.</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-ink">8. Alterações</h2>
        <p className="mt-2">
          O Inca Bar poderá atualizar estes Termos de Uso quando necessário para melhor funcionamento da plataforma ou
          adequação da ação promocional.
        </p>
      </section>
    </LegalPageLayout>
  );
}
