# Bolão Recreativo Copa 2026

Projeto web full stack para coleta recreativa/promocional de palpites de placar por jogo. Não há pagamentos, PIX, carteira, saldo, odds, saque, depósito, ranking monetário ou premiação em dinheiro.

## Stack

- Next.js com App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Vitest

## Estrutura

```txt
prisma/
  schema.prisma
  seed.ts
src/
  app/
    api/
      participants/
      matches/
      bets/
      admin/
    cadastro/
    apostas/
    sucesso/
    admin/
  components/
    public/
    admin/
  lib/
    auth.ts
    matches.ts
    phone.ts
    prisma.ts
    timezone.ts
    validation.ts
  services/
    bets.ts
    participants.ts
```

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie o `.env` com base no exemplo:

```bash
cp .env.example .env
```

Variáveis principais:

```env
DATABASE_URL="file:./dev.db"
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@inca.local"
ADMIN_PASSWORD="troque-esta-senha"
SESSION_SECRET="troque-por-uma-chave-longa-e-aleatoria"
```

## Banco e seed

Gere o client Prisma e crie o banco SQLite:

```bash
npm run prisma:generate
npm run prisma:push
```

Se o executável `schema-engine` do Prisma for bloqueado pelo ambiente local no Windows, use o fallback equivalente:

```bash
npm run db:init
```

Popule o banco com todos os jogos oficiais informados e o admin inicial:

```bash
npm run prisma:seed
```

As credenciais iniciais do admin vêm de `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

## Execução local

```bash
npm run dev
```

Rotas públicas:

- `/`
- `/cadastro`
- `/apostas`
- `/sucesso`

Rotas admin:

- `/admin/login`
- `/admin/dashboard`
- `/admin/apostas`
- `/admin/jogos/[id]`

## Testes

```bash
npm test
```

Os testes cobrem:

- `normalizePhone`
- `isMatchAvailableForBet`
- `findOrCreateParticipantByPhone`
- bloqueio de duplicidade de aposta por `participantId + matchId`

## Regras importantes

- O telefone é normalizado e usado como identificador único.
- Cada participante só pode apostar uma vez por jogo.
- O sistema lista jogos do dia atual em `America/Sao_Paulo`.
- A aposta fecha 30 minutos antes do horário oficial (`kickoffAt - 30min`).
- Após enviada, a aposta não pode ser editada.
- A conferência de vencedores é manual pelo painel administrativo.

## Limitações

- O sistema é recreativo/promocional e não implementa nenhuma funcionalidade financeira.
- Não há apuração automática de vencedores.
- A exportação CSV está disponível em `/api/admin/bets?export=csv` e também pelo botão da tela de apostas admin.
- O timezone padrão de regra de negócio é `America/Sao_Paulo`.
