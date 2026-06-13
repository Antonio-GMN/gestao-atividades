import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"

const prisma = new PrismaClient()

const teamMembers = [
  { name: "Ana Silva", role: "Designer" },
  { name: "Carlos Oliveira", role: "Desenvolvedor Frontend" },
  { name: "Mariana Santos", role: "Desenvolvedora Backend" },
  { name: "Pedro Costa", role: "Analista de QA" },
  { name: "Juliana Lima", role: "Product Manager" },
  { name: "Rafael Souza", role: "Desenvolvedor Fullstack" },
  { name: "Beatriz Rocha", role: "Analista de Dados" },
  { name: "Lucas Pereira", role: "DevOps" },
  { name: "Amanda Nunes", role: "UX Researcher" },
  { name: "Fernando Alves", role: "Tech Lead" },
]

const taskTemplates = [
  { title: "Criar protótipo do dashboard", description: "Projetar e prototipar a tela principal do sistema", priority: "HIGH" as const, assignee: 0 },
  { title: "Implementar autenticação", description: "Configurar login com email e senha", priority: "URGENT" as const, assignee: 2 },
  { title: "Corrigir bug no formulário", description: "Campo de data não está validando corretamente", priority: "HIGH" as const, assignee: 1 },
  { title: "Revisar PR do módulo de pagamentos", description: "Fazer code review das alterações", priority: "MEDIUM" as const, assignee: 9 },
  { title: "Escrever testes unitários", description: "Cobrir funções utilitárias com testes", priority: "MEDIUM" as const, assignee: 3 },
  { title: "Otimizar queries do banco", description: "Identificar e corrigir queries lentas", priority: "HIGH" as const, assignee: 5 },
  { title: "Atualizar documentação da API", description: "Documentar novos endpoints", priority: "LOW" as const, assignee: 4 },
  { title: "Configurar CI/CD", description: "Pipeline de deploy automático", priority: "HIGH" as const, assignee: 7 },
  { title: "Analisar métricas de uso", description: "Gerar relatório de métricas da semana", priority: "MEDIUM" as const, assignee: 6 },
  { title: "Pesquisa de usuários", description: "Entrevistar 5 usuários sobre a nova feature", priority: "LOW" as const, assignee: 8 },
  { title: "Implementar notificações", description: "Sistema de notificações no dashboard", priority: "MEDIUM" as const, assignee: 2 },
  { title: "Refatorar componente de tabela", description: "Quebrar tabela em componentes menores", priority: "LOW" as const, assignee: 1 },
  { title: "Criar script de migração", description: "Migrar dados do sistema antigo", priority: "URGENT" as const, assignee: 5 },
  { title: "Testar responsividade", description: "Verificar layout em dispositivos móveis", priority: "MEDIUM" as const, assignee: 3 },
  { title: "Ajustar cores do tema", description: "Corrigir contraste dos botões", priority: "LOW" as const, assignee: 0 },
  { title: "Configurar monitoramento", description: "Setup de alerts e logging", priority: "MEDIUM" as const, assignee: 7 },
  { title: "Otimizar imagens", description: "Comprimir e converter imagens para webp", priority: "LOW" as const, assignee: 1 },
  { title: "Implementar busca", description: "Campo de busca com filtros", priority: "HIGH" as const, assignee: 5 },
  { title: "Criar onboarding", description: "Tutorial interativo para novos usuários", priority: "MEDIUM" as const, assignee: 8 },
  { title: "Relatório de desempenho", description: "Criar dashboard de performance", priority: "MEDIUM" as const, assignee: 6 },
  { title: "Corrigir vulnerabilidade", description: "Atualizar dependências com falhas de segurança", priority: "URGENT" as const, assignee: 7 },
  { title: "Melhorar acessibilidade", description: "Adicionar aria-labels e navegação por teclado", priority: "HIGH" as const, assignee: 0 },
  { title: "Implementar cache", description: "Adicionar camada de cache nas consultas", priority: "MEDIUM" as const, assignee: 2 },
  { title: "Criar landing page", description: "Página inicial do produto", priority: "MEDIUM" as const, assignee: 1 },
  { title: "Sessão de planejamento", description: "Preparar pauta da sprint planning", priority: "HIGH" as const, assignee: 4 },
  { title: "Review de design system", description: "Revisar componentes do design system", priority: "LOW" as const, assignee: 0 },
  { title: "Automatizar testes E2E", description: "Criar testes com Cypress", priority: "HIGH" as const, assignee: 3 },
  { title: "Configurar variáveis de ambiente", description: "Organizar .env de produção e staging", priority: "MEDIUM" as const, assignee: 7 },
  { title: "Monitorar erros em produção", description: "Analisar logs de erro da última semana", priority: "HIGH" as const, assignee: 5 },
  { title: "Documentar decisões técnicas", description: "ADR para as principais decisões", priority: "LOW" as const, assignee: 9 },
]

function getDate(daysFromNow: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

async function main() {
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  const createdUsers = await Promise.all(
    teamMembers.map((member) =>
      prisma.user.create({ data: member })
    )
  )

  const now = new Date()

  for (let i = 0; i < taskTemplates.length; i++) {
    const template = taskTemplates[i]
    const daysOffset = i % 5

    let status: "TODO" | "IN_PROGRESS" | "DONE"
    let dueDate: Date

    if (i < 6) {
      status = "DONE"
      dueDate = getDate(-(3 + daysOffset))
    } else if (i < 11) {
      status = "IN_PROGRESS"
      dueDate = i < 8 ? getDate(-1) : getDate(1 + daysOffset)
    } else if (i < 15) {
      status = "IN_PROGRESS"
      dueDate = getDate(7 + daysOffset)
    } else if (i < 18) {
      status = "TODO"
      dueDate = i < 16 ? getDate(-1) : getDate(1)
    } else if (i < 23) {
      status = "TODO"
      dueDate = getDate(4 + daysOffset)
    } else if (i < 26) {
      status = "TODO"
      dueDate = getDate(14 + daysOffset)
    } else {
      status = "IN_PROGRESS"
      dueDate = getDate(5 + daysOffset)
    }

    const assigneeIdx = template.assignee
    const userId = assigneeIdx < createdUsers.length ? createdUsers[assigneeIdx].id : undefined

    await prisma.task.create({
      data: {
        title: template.title,
        description: template.description ?? null,
        status,
        priority: template.priority,
        dueDate,
        assignedUserId: userId,
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log("Seed concluído com sucesso!")
  console.log(`  - ${teamMembers.length} colaboradores`)
  console.log(`  - ${taskTemplates.length} tarefas`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
