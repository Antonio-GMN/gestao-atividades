import { prisma } from "@/lib/prisma"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { TaskList } from "@/components/tasks/task-list"
import { isOverdue, isAtRisk } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, Clock, Users, ListTodo } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const tasks = await prisma.task.findMany({
    include: { assignedUser: true },
    orderBy: { dueDate: "asc" },
  })

  const [users, activeTasks] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            tasks: { where: { status: { not: "DONE" } } },
          },
        },
      },
    }),
    prisma.task.findMany({
      where: { assignedUserId: { not: null }, status: { not: "DONE" } },
      select: { assignedUserId: true, estimatedHours: true },
    }),
  ])

  const hoursMap: Record<string, number> = {}
  for (const task of activeTasks) {
    if (task.assignedUserId) {
      hoursMap[task.assignedUserId] = (hoursMap[task.assignedUserId] ?? 0) + task.estimatedHours
    }
  }

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const weekTasks = tasks.filter(
    (t) => new Date(t.createdAt) >= weekStart && new Date(t.createdAt) < weekEnd
  )
  const weekDone = weekTasks.filter((t) => t.status === "DONE")
  const completionRate = weekTasks.length > 0 ? Math.round((weekDone.length / weekTasks.length) * 100) : 0

  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== "DONE")
  const riskTasks = tasks.filter((t) => isAtRisk(t.dueDate) && t.status !== "DONE" && !isOverdue(t.dueDate))
  const overloadedUsers = users.filter((u) => (hoursMap[u.id] ?? 0) >= 24)

  const recentTasks = tasks.slice(0, 8)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Visão geral da operação</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/atividades">
          <KpiCard
            title="Taxa de Conclusão (Semana)"
            value={`${completionRate}%`}
            description={`${weekDone.length} de ${weekTasks.length} tarefas concluídas`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant={completionRate >= 70 ? "success" : completionRate >= 40 ? "warning" : "destructive"}
          />
        </Link>
        <Link href="/atividades">
          <KpiCard
            title="Tarefas Atrasadas"
            value={overdueTasks.length}
            description="Precisam de atenção imediata"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={overdueTasks.length > 0 ? "destructive" : "success"}
          />
        </Link>
        <Link href="/risco">
          <KpiCard
            title="Tarefas em Risco"
            value={riskTasks.length}
            description="Vencem nos próximos 3 dias"
            icon={<Clock className="h-5 w-5" />}
            variant={riskTasks.length > 0 ? "warning" : "success"}
          />
        </Link>
        <Link href="/equipe">
          <KpiCard
            title="Sobrecarregados"
            value={overloadedUsers.length}
            description={`${overloadedUsers.length} de ${users.length} colaboradores`}
            icon={<Users className="h-5 w-5" />}
            variant={overloadedUsers.length > 0 ? "destructive" : "success"}
          />
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Atividades Recentes</h2>
          <Link href="/atividades" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            Ver todas
          </Link>
        </div>
        <TaskList tasks={recentTasks} users={users} />
      </div>
    </div>
  )
}
