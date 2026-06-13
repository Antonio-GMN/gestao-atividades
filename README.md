# Gestão de Atividades - PME

Ferramenta de gestão operacional para pequenas empresas com aproximadamente 10 colaboradores.

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Radix UI, Lucide React
- **Backend**: Next.js Server Actions, Route Handlers
- **Database**: PostgreSQL via Supabase, Prisma ORM
- **Validação**: Zod

## Funcionalidades

### Dashboard
Visão geral com KPIs que respondem:
- Taxa de conclusão da semana
- Tarefas atrasadas
- Tarefas em risco
- Colaboradores sobrecarregados

Cada KPI é um link para a ação gerencial correspondente.

### Gestão de Atividades
CRUD completo com campos: título, descrição, responsável, prioridade, prazo e status (A Fazer, Em Andamento, Concluído).

### Kanban
Quadro visual com drag and drop utilizando @dnd-kit. Arraste cards entre colunas para atualizar o status.

### Gestão de Equipe
Cadastro de colaboradores com indicador de carga de trabalho:
- **Sobrecarregado**: 4+ tarefas ativas
- **Equilibrado**: 2-3 tarefas ativas
- **Ocioso**: 0-1 tarefas ativas

### Atividades em Risco
Lista filtrada de atividades com prazo nos próximos 3 dias ou já atrasadas.

## Arquitetura

### Estrutura de Pastas

```
src/
  app/              # Páginas (App Router)
  components/
    ui/             # Componentes base (shadcn)
    layout/         # Sidebar, Header
    dashboard/      # KPIs
    tasks/          # Formulário e lista de tarefas
    kanban/         # Board, colunas e cards
    team/           # Formulário e lista de equipe
  lib/
    prisma.ts       # Cliente Prisma singleton
    utils.ts        # Utilitários (formatação, datas)
    validations.ts  # Schemas Zod
  server/actions/   # Server Actions
prisma/
  schema.prisma     # Modelo de dados
  seed.ts           # Dados fictícios
```

### Decisões de Produto

1. **Dashboard primeiro**: O usuário cai direto no dashboard, onde vê os indicadores mais importantes acima da dobra.

2. **Server Components por padrão**: Páginas são Server Components que buscam dados diretamente no banco. Componentes interativos (formulários, drag and drop) são Client Components isolados.

3. **Server Actions**: Operações de escrita usam Server Actions com `useActionState` para feedback de loading e tratamento de erro.

4. **Feature-based folders**: Componentes organizados por funcionalidade (dashboard, tasks, kanban, team) em vez de por tipo (components, containers).

5. **Tipagem forte**: Typescript estrito, componentes tipados, validação Zod compartilhada entre formulários e Server Actions.

6. **Sem autenticação complexa**: Foco no problema de negócio, sem overhead de login, permissões ou multi-tenancy.

7. **KPIs acionáveis**: Cada indicador no dashboard é um link que leva à tela de ação correspondente.

8. **Atividades em risco**: Regra de negócio implementada (prazo ≤ 3 dias + não concluída = em risco).

### Decisões de Arquitetura

- **Prisma com Supabase**: Schema versionado, typesafety do banco ao frontend, seed script para dados iniciais.
- **@dnd-kit**: Biblioteca leve e acessível para drag and drop no Kanban.
- **Tailwind CSS**: Estilização rápida sem contexto de CSS global.
- **Zod**: Validação compartilhada entre cliente e servidor.

## Como Executar

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular com dados fictícios
npm run prisma:seed

# Iniciar dev server
npm run dev
```

## Banco de Dados

### Schema SQL para Supabase

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Users table
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE "Task" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    description TEXT,
    status "TaskStatus" NOT NULL DEFAULT 'TODO',
    priority "Priority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedUserId" TEXT REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Index for performance
CREATE INDEX "Task_assignedUserId_idx" ON "Task"("assignedUserId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
```

### Configuração do Supabase

1. Crie um projeto no Supabase
2. Copie a `DATABASE_URL` do Supabase (formato PostgreSQL padrão)
3. Adicione ao `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
   ```
4. Execute `npm run prisma:migrate` para criar as tabelas
5. Execute `npm run prisma:seed` para popular dados

## Seed

O seed cria automaticamente:
- 10 colaboradores com cargos diversos
- 30 tarefas em vários estados (concluídas, atrasadas, em risco, em andamento, a fazer)
- Colaboradores sobrecarregados e ociosos
- Nenhuma tela vazia ao iniciar
