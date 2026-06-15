# Gestão de Atividades

## Metodologia

A solução foi inspirada principalmente em **Kanban**, complementada por conceitos de **Matriz de Eisenhower** para priorização e gestão visual do trabalho.

### Por que Kanban?

Entre as metodologias pesquisadas, Kanban foi a que melhor atacou as dores apresentadas:

- Permite visualizar rapidamente tudo que está em andamento.
- Facilita a identificação de gargalos e tarefas paradas.
- Ajuda a acompanhar o fluxo de trabalho sem exigir cerimônias complexas.
- Funciona bem para equipes pequenas com demandas contínuas.

O quadro Kanban foi implementado com três estados principais: **A Fazer**, **Em Andamento** e **Concluído**. Essa estrutura permite que o gestor compreenda instantaneamente o status operacional da equipe.

### Priorização

Além do Kanban, cada atividade possui um nível de prioridade (Baixa, Média, Alta, Urgente). A ideia foi incorporar conceitos da Matriz de Eisenhower de forma simplificada, permitindo diferenciar tarefas mais urgentes ou importantes sem adicionar complexidade excessiva à interface.

### Justificativa dos Indicadores (KPIs)

#### Taxa de Conclusão da Semana
- **O que mede**: percentual de tarefas concluídas durante a semana.
- **Qual decisão gera**: permite avaliar se a equipe está entregando o volume de trabalho esperado e identificar quedas de produtividade ao longo do tempo.

#### Tarefas Atrasadas
- **O que mede**: quantidade de atividades cujo prazo expirou e ainda não foram concluídas.
- **Qual decisão gera**: indica necessidade de renegociar prazos, redistribuir tarefas ou investigar gargalos operacionais.

#### Tarefas em Risco
- **O que mede**: quantidade de atividades com prazo próximo (até 3 dias) e ainda não concluídas.
- **Qual decisão gera**: permite agir preventivamente antes que ocorram atrasos, aumentando a previsibilidade das entregas.

#### Colaboradores Sobrecarregados
- **O que mede**: colaboradores com mais de 40 horas estimadas em tarefas ativas.
- **Qual decisão gera**: permite redistribuir trabalho entre a equipe, reduzindo riscos de atraso, retrabalho e sobrecarga.

### O que foi cortado para caber no prazo

Para priorizar a entrega do fluxo principal de gestão operacional, algumas funcionalidades foram propositalmente deixadas de fora:

- Sistema de autenticação e autorização.
- Gestão de múltiplas empresas ou equipes.
- Comentários em tarefas.
- Histórico de alterações.
- Notificações automáticas.
- Upload de arquivos e anexos.
- Relatórios avançados.
- Integrações com WhatsApp, e-mail ou calendário.

### O que faria com mais tempo

#### Limite de trabalho em andamento (WIP)
Implementar limites por colaborador ou coluna Kanban para evitar sobrecarga e seguir mais fielmente os princípios do Kanban.

#### Histórico e auditoria
Registrar alterações de status, responsáveis e prazos para aumentar a rastreabilidade das atividades.

#### Notificações proativas
Alertar automaticamente responsáveis e gestores sobre atividades em risco ou atrasadas.

#### Planejamento por ciclos
Adicionar funcionalidades inspiradas em Scrum, permitindo organizar atividades em sprints e acompanhar velocidade da equipe.

#### Gestão de múltiplas equipes
Permitir a criação de equipes independentes dentro da mesma organização, possibilitando que diferentes áreas acompanhem suas próprias atividades e indicadores.

#### Perfis de gestor
Implementar diferentes níveis de acesso, permitindo que líderes acompanhem apenas suas equipes enquanto gestores gerais tenham uma visão consolidada da empresa.

#### Planejamento de capacidade
Criar previsões de carga de trabalho futura com base nas horas já comprometidas, ajudando o gestor a identificar possíveis gargalos antes que ocorram atrasos.

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- **UI**: shadcn/ui, Radix UI, Lucide React, Recharts
- **Backend**: Next.js Server Actions, Route Handlers
- **Database**: PostgreSQL via Supabase, Prisma ORM 6
- **Validação**: Zod
- **Drag and Drop**: @dnd-kit

## Funcionalidades

### Dashboard
Visão geral com KPIs acionáveis (cada um é link para a tela correspondente):
- **Taxa de Conclusão da Semana** — percentual de tarefas concluídas no período
- **Tarefas Atrasadas** — atividades com prazo vencido e não concluídas
- **Tarefas em Risco** — atividades com prazo ≤ 3 dias e não concluídas
- **Sobrecarregados** — colaboradores com mais de 40h estimadas em tarefas ativas

Inclui também uma **agenda semanal** com as tarefas da semana.

### Gestão de Atividades
CRUD completo com campos: título, descrição, responsável, prioridade, prazo, horas estimadas, data de início e status (A Fazer, Em Andamento, Concluído).

### Kanban
Quadro visual com drag and drop utilizando @dnd-kit. Arraste cards entre colunas para atualizar o status e a ordenação.

### Gestão de Equipe
Cadastro e remoção de colaboradores com indicador de carga de trabalho baseado em **horas estimadas**:
- **Sobrecarregado**: > 40h (mais de uma semana cheia)
- **Equilibrado**: 8h – 40h (de 1 a 5 dias de trabalho)
- **Ocioso**: < 8h (menos de 1 dia)

Cada card de colaborador mostra as horas estimadas totais, contagem de tarefas ativas e um badge de carga. Clique no card para ver a lista de tarefas do colaborador.

### Carga de Trabalho (Gráficos)
Modal com duas visualizações:
- **Carga por Funcionário** — gráfico de barras com linhas de referência (1 a 5 dias de 8h)
- **Heatmap** — distribuição de horas por dia da semana por colaborador

### Atividades em Risco
Lista filtrada de atividades com prazo nos próximos 3 dias (em risco) ou já atrasadas.

## Arquitetura

### Estrutura de Pastas

```
src/
  app/                  # Páginas (App Router)
    dashboard/          # Dashboard com KPIs
    atividades/         # CRUD de tarefas
    kanban/             # Board drag-and-drop
    equipe/             # Gestão de equipe + gráficos
    risco/              # Atividades em risco/atrasadas
  components/
    ui/                 # Componentes base (shadcn)
    layout/             # Sidebar
    dashboard/          # KPI cards, Weekly Agenda
    tasks/              # Formulário e lista de tarefas
    kanban/             # Board, colunas e cards
    team/               # Lista, formulário, tasks dialog, gráficos
  lib/
    prisma.ts           # Cliente Prisma singleton
    utils.ts            # Utilitários (formatação, datas)
    validations.ts      # Schemas Zod
  server/actions/       # Server Actions (tasks, users)
prisma/
  schema.prisma         # Modelo de dados
  migrations/           # Migrações versionadas
  seed.ts               # Dados fictícios
```

### Modelo de Dados

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  role      String
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id              String     @id @default(cuid())
  title           String
  description     String?
  status          TaskStatus @default(TODO)
  priority        Priority   @default(MEDIUM)
  startDate       DateTime   @default(now())
  dueDate         DateTime
  createdAt       DateTime   @default(now())
  assignedUserId  String?
  assignedUser    User?      @relation(fields: [assignedUserId], references: [id])
  sortOrder       Int        @default(0)
  estimatedHours  Float
}
```

### Decisões de Produto

1. **Dashboard primeiro**: O usuário cai direto no dashboard com indicadores acima da dobra.
2. **Server Components por padrão**: Páginas buscam dados diretamente no banco. Componentes interativos são Client Components isolados.
3. **Server Actions**: Operações de escrita usam Server Actions com `revalidatePath` para atualização de dados.
4. **Feature-based folders**: Componentes organizados por funcionalidade (dashboard, tasks, kanban, team).
5. **Tipagem forte**: TypeScript estrito, componentes tipados, validação Zod compartilhada.
6. **Sem autenticação**: Foco no problema de negócio sem overhead de login.
7. **KPIs acionáveis**: Cada indicador no dashboard linka para a tela de ação correspondente.
8. **Carga baseada em horas**: Optei por medir carga através de horas estimadas em vez da simples contagem de tarefas, pois duas tarefas podem possuir complexidades muito diferentes. Essa abordagem fornece uma visão mais realista da capacidade operacional da equipe.

## Como Executar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com a DATABASE_URL do seu PostgreSQL/Supabase

# Executar migrations
npm run prisma:migrate

# Popular com dados fictícios
npm run prisma:seed

# Iniciar dev server
npm run dev
```

## Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run lint` | Executa ESLint |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Executa migrations pendentes |
| `npm run prisma:seed` | Popula banco com dados fictícios |

## Seed

O seed cria automaticamente:
- 10 colaboradores com cargos diversos
- 30 tarefas em vários estados (concluídas, atrasadas, em risco, em andamento, a fazer)
- Colaboradores sobrecarregados e ociosos (variação de 0.5h a 24h por tarefa)
- Nenhuma tela vazia ao iniciar
