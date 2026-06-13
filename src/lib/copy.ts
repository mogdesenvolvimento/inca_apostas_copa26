export const publicCopy = {
  home: {
    badge: "Desafio de Palpites",
    title: "Entre no clima dos jogos e manda teus palpites no Inca",
    subtitle: "Escolhe os placares do dia e acompanha a rodada com a galera.",
    supporting: "Ação promocional do Inca Bar para dos dias de jogos ficarem ainda mais divertidos.",
    legal: "* Participação promocional, sem pagamentos ou vínculo com apostas financeiras reais.",
    cta: "Criar cadastro",
    secondaryCta: "Já tenho cadastro"
  },
  register: {
    title: "Entra na jogada",
    subtitle: "Cria teu cadastro rapidinho pra liberar os jogos do dia.",
    hint: "Cadastre-se",
    supporting: "Teu CPF ajuda a garantir uma participação por pessoa.",
    emailHint: "Esse e-mail será usado para recuperar tua senha se você precisar voltar aos teus palpites.",
    passwordHint: "Você vai usar essa senha para voltar aos seus palpites.",
    submit: "Criar cadastro",
    submitLoading: "Salvando teu cadastro...",
    successMessage: "Cadastro confirmado. Agora é só seguir pros teus palpites."
  },
  login: {
    title: "Acessar cadastro",
    subtitle: "Usa teu CPF e senha para continuar.",
    hint: "Já tem cadastro",
    supporting: "Entra de novo pra ver teus palpites e seguir nos jogos abertos.",
    submit: "Acessar meus palpites",
    submitLoading: "Entrando...",
    alternateCta: "Ainda não tenho cadastro",
    forgotPasswordCta: "Esqueci senha"
  },
  forgotPassword: {
    title: "Recuperar senha",
    subtitle: "Confirma teu CPF para enviarmos o link de redefinição ao e-mail cadastrado.",
    hint: "Acesso rápido",
    supporting: "O link vai sempre para o e-mail salvo no teu cadastro, sem precisar informar outro endereço aqui.",
    cpfSubmit: "Enviar link de redefinição",
    cpfSubmitLoading: "Enviando link...",
    emailHint: "Usamos apenas o e-mail já cadastrado para recuperar a senha com segurança.",
    successMessage: "Se o CPF estiver certo, o link de redefinição será enviado para o e-mail cadastrado.",
    backToLogin: "Voltar para o login"
  },
  resetPassword: {
    title: "Redefinir senha",
    subtitle: "Escolhe uma senha nova pra voltar aos teus palpites.",
    hint: "Nova senha",
    supporting: "Usa uma senha simples de lembrar e confirma abaixo.",
    submit: "Salvar nova senha",
    submitLoading: "Salvando nova senha...",
    successMessage: "Senha atualizada com sucesso. Agora é só fazer teu acesso."
  },
  bets: {
    greetingPrefix: "Olá",
    title: "Agora é com você. Manda teus palpites nos jogos de hoje.",
    subtitle: "Escolhe os placares e envia. Depois não dá pra mudar.",
    submit: "Enviar palpites",
    submitLoading: "Enviando palpites...",
    emptyLoading: "Pera aí, já estamos puxando os jogos do dia...",
    needRegister: "Pra seguir nos palpites, faz teu acesso primeiro.",
    goToRegister: "Ir para o acesso",
    noTodayMatches: "Hoje não tem jogo liberado pra palpite.",
    allDone: "Você já mandou teus palpites.",
    confirmation: "Depois de confirmar, não dá mais pra alterar teus palpites.",
    logout: "Sair",
    logoutConfirm: "Deseja sair da sua participação?"
  },
  success: {
    badge: "PALPITES ENVIADOS",
    title: "Boa sorte\nAgora é Jogo",
    subtitle: "* Seus palpites já estão registrados e não dá mais pra mexer neles.",
    cta: "Voltar ao início"
  }
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
