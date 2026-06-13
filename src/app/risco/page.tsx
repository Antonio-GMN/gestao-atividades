import { prisma } from "@/lib/prisma"
import { TaskList } from "@/components/tasks/task-list"
import { isOverdue, isAtRisk } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function RiscoPage() {
  const tasks = await prisma.task.findMany({
    include: { assignedUser: true },
    orderBy: { dueDate: "asc" },
  })

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } })

  const riskTasks = tasks.filter(
    (t) => t.status !== "DONE" && (isOverdue(t.dueDate) || isAtRisk(t.dueDate))
  )

  const overdueTasks = riskTasks.filter((t) => isOverdue(t.dueDate))
  const atRiskTasks = riskTasks.filter((t) => isAtRisk(t.dueDate) && !isOverdue(t.dueDate))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Atividades em Risco</h1>
        <p className="text-zinc-500 mt-1">
          {riskTasks.length} atividades precisam de atenção
        </p>
      </div>

      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
            Atrasadas ({overdueTasks.length})
          </h2>
          <TaskList tasks={overdueTasks} users={users} />
        </div>
      )}

      {atRiskTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-3">
            Vencem nos próximos 3 dias ({atRiskTasks.length})
          </h2>
          <TaskList tasks={atRiskTasks} users={users} />
        </div>
      )}

      {riskTasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg">Nenhuma atividade em risco ou atrasada</p>
          <p className="text-zinc-400 text-sm mt-1">Tudo está sob controle!</p>
        </div>
      )}
    </div>
  )
}
