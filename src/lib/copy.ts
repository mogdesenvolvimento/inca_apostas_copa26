export const publicCopy = {
  home: {
    badge: "Palpites dos Jogos",
    title: "Dê seus palpites e entre no clima da Copa no Inca",
    subtitle: "Escolhe os placares dos jogos do dia e participa com a galera.",
    supporting: "Jogo grande, mesa cheia e torcida na pilha — do jeito que o Inca gosta.",
    legal: "* Participação promocional, sem pagamentos ou vínculo com apostas financeiras reais.",
    cta: "Quero participar"
  },
  register: {
    title: "Entra na jogada",
    subtitle: "Coloca teus dados rapidinho pra liberar os jogos.",
    hint: "Cadastre-se",
    supporting: "Teu CPF ajuda a garantir uma participação por pessoa.",
    submit: "Acessar",
    submitLoading: "Liberando teus jogos..."
  },
  bets: {
    greetingPrefix: "Olá",
    title: "Agora é com você. Manda teus palpites nos jogos de hoje.",
    subtitle: "Escolhe os placares e envia. Depois não dá pra mudar.",
    submit: "Enviar palpites",
    submitLoading: "Enviando palpites...",
    statusAvailable: "Aberto pra palpite",
    statusAlreadyBet: "Palpite enviado",
    statusClosed: "Fechado",
    emptyLoading: "Pera aí, já estamos puxando os jogos do dia...",
    needRegister: "Pra entrar no jogo, faz teu cadastro primeiro.",
    goToRegister: "Ir para cadastro",
    noTodayMatches: "Hoje não tem jogo liberado pra palpite.",
    allDone: "Você já mandou teus palpites.",
    confirmation: "Após clicar em OK não poderá ser alterada a sua aposta."
  },
  success: {
    badge: "Tudo certo",
    title: "Boa sorte. Agora é jogo.",
    subtitle: "Seus palpites já estão registrados e não dá mais pra mexer neles.",
    cta: "Voltar ao início"
  },
  participantFound:
    "Encontramos teu cadastro anterior. Dá pra ver o que você já mandou e seguir só nos jogos que ainda estão abertos."
};

export const stateMessages = {
  notOpenYet: "Ainda não abriu pra esses jogos.",
  closedToday: "A janela dos jogos de hoje já fechou.",
  noMatches: "Hoje não tem jogo liberado pra palpite.",
  alreadyRegistered: "Seu palpite pra esse jogo já foi registrado.",
  allDone: "Você já mandou teus palpites."
};

export const adminCopy = {
  login: {
    badge: "Área interna",
    title: "Painel admin",
    subtitle: "Entra aqui pra ver um resumo rápido dos palpites do dia.",
    emailLabel: "Email",
    passwordLabel: "Senha",
    emailPlaceholder: "admin@inca.local",
    passwordPlaceholder: "Sua senha",
    submit: "Entrar",
    submitLoading: "Entrando..."
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Resumo rápido das apostas.",
    todayMatchesTitle: "Apostas por jogo de hoje",
    empty: "Hoje não há jogos disponíveis para aposta."
  },
  bets: {
    title: "Apostas",
    subtitle: "Consulta rápida por jogo, participante, CPF, código ou telefone.",
    export: "Exportar CSV",
    filters: {
      allGroups: "Todos os grupos",
      allMatches: "Todos os jogos",
      searchPlaceholder: "Nome, CPF, código ou telefone",
      submit: "Filtrar"
    },
    table: {
      code: "Código",
      name: "Nome",
      cpf: "CPF",
      phone: "Telefone",
      matchup: "Confronto",
      score: "Placar",
      sentAt: "Envio"
    },
    empty: "Nenhuma aposta encontrada com os filtros atuais."
  }
};
