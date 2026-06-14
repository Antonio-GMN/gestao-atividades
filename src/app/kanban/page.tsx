import { prisma } from "@/lib/prisma"
import { KanbanBoard } from "@/components/kanban/kanban-board"

export const dynamic = "force-dynamic"

export default async function KanbanPage() {
  const [tasks, users] = await Promise.all([
    prisma.task.findMany({
      include: { assignedUser: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.user.findMany(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Kanban</h1>
        <p className="text-zinc-500 mt-1">Arraste os cards para mudar o status</p>
      </div>
      <KanbanBoard tasks={tasks} users={users} />
    </div>
  )
}
