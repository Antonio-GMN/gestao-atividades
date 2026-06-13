import { prisma } from "@/lib/prisma"
import { TasksClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AtividadesPage() {
  const [tasks, users] = await Promise.all([
    prisma.task.findMany({
      include: { assignedUser: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ])

  return <TasksClient tasks={tasks} users={users} />
}
