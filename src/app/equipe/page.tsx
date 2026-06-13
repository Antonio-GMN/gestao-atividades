import { prisma } from "@/lib/prisma"
import { TeamClient } from "./client"

export const dynamic = "force-dynamic"

export default async function EquipePage() {
  const [users, activeTasks] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            tasks: {
              where: { status: { not: "DONE" } },
            },
          },
        },
      },
      orderBy: { name: "asc" },
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

  const usersWithHours = users.map((u) => ({
    ...u,
    totalEstimatedHours: hoursMap[u.id] ?? 0,
  }))

  return <TeamClient users={usersWithHours} />
}
