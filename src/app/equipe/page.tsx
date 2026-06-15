import { prisma } from "@/lib/prisma"
import { TeamClient } from "./client"

export const dynamic = "force-dynamic"

function nextWorkDay(d: Date): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + 1)
  while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() + 1)
  return next
}

function distributeHours(
  start: Date | null,
  due: Date,
  estimatedHours: number,
): [number, number, number, number, number] {
  const byDay = [0, 0, 0, 0, 0] as [number, number, number, number, number]

  const rangeStart = start ? new Date(start) : new Date(due)
  const rangeEnd = new Date(due)
  rangeStart.setHours(0, 0, 0, 0)
  rangeEnd.setHours(0, 0, 0, 0)

  const workDays: Date[] = []
  const cur = new Date(rangeStart)
  while (cur <= rangeEnd) {
    const d = cur.getDay()
    if (d >= 1 && d <= 5) workDays.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }

  if (workDays.length === 0) {
    let remaining = estimatedHours
    let spill = nextWorkDay(rangeEnd)
    while (remaining > 0) {
      const alloc = Math.min(remaining, 8)
      byDay[spill.getDay() - 1] += alloc
      remaining -= alloc
      if (remaining > 0) spill = nextWorkDay(spill)
    }
    return byDay
  }

  let remaining = estimatedHours
  for (const d of workDays) {
    if (remaining <= 0) break
    const alloc = Math.min(remaining, 8)
    byDay[d.getDay() - 1] += alloc
    remaining -= alloc
  }

  let spill = nextWorkDay(rangeEnd)
  while (remaining > 0) {
    const alloc = Math.min(remaining, 8)
    byDay[spill.getDay() - 1] += alloc
    remaining -= alloc
    if (remaining > 0) spill = nextWorkDay(spill)
  }

  return byDay
}

export default async function EquipePage() {
  const [users, rawTasks] = await Promise.all([
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
      select: { assignedUserId: true, estimatedHours: true, startDate: true, dueDate: true },
    }),
  ])

  const hoursMap: Record<string, number> = {}
  const tasks = rawTasks.map((t) => ({
    assignedUserId: t.assignedUserId,
    estimatedHours: t.estimatedHours,
    dayDistribution: distributeHours(t.startDate, t.dueDate, t.estimatedHours),
  }))

  for (const task of tasks) {
    if (task.assignedUserId) {
      hoursMap[task.assignedUserId] = (hoursMap[task.assignedUserId] ?? 0) + task.estimatedHours
    }
  }

  const usersWithHours = users.map((u) => ({
    ...u,
    totalEstimatedHours: hoursMap[u.id] ?? 0,
  }))

  const usersList = users.map((u) => ({ id: u.id, name: u.name, role: u.role, createdAt: u.createdAt }))

  return <TeamClient users={usersWithHours} tasks={tasks} usersList={usersList} />
}
