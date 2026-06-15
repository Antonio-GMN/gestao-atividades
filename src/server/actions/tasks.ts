"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations"

export async function getTasks() {
  return prisma.task.findMany({
    include: { assignedUser: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createTask(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = taskSchema.parse(raw)

  await prisma.task.create({
    data: {
      title: parsed.title,
      description: parsed.description ?? null,
      status: parsed.status,
      priority: parsed.priority,
      startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
      dueDate: new Date(parsed.dueDate),
      assignedUserId: parsed.assignedUserId ?? null,
      estimatedHours: parsed.estimatedHours,
    },
  })

  revalidatePath("/")
}

export async function createTaskFromJson(data: {
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  startDate?: string
  dueDate: string
  assignedUserId?: string
}) {
  const parsed = taskSchema.parse(data)

  await prisma.task.create({
    data: {
      title: parsed.title,
      description: parsed.description ?? null,
      status: parsed.status,
      priority: parsed.priority,
      startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
      dueDate: new Date(parsed.dueDate),
      assignedUserId: parsed.assignedUserId ?? null,
      estimatedHours: parsed.estimatedHours,
    },
  })

  revalidatePath("/")
}

export async function updateTask(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = taskSchema.parse(raw)

  await prisma.task.update({
    where: { id },
    data: {
      title: parsed.title,
      description: parsed.description ?? null,
      status: parsed.status,
      priority: parsed.priority,
      startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
      dueDate: new Date(parsed.dueDate),
      assignedUserId: parsed.assignedUserId ?? null,
      estimatedHours: parsed.estimatedHours,
    },
  })

  revalidatePath("/")
}

export async function updateTaskStatus(id: string, status: "TODO" | "IN_PROGRESS" | "DONE") {
  await prisma.task.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/")
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } })
  revalidatePath("/")
}

export async function getUserTasks(userId: string) {
  return prisma.task.findMany({
    where: { assignedUserId: userId },
    include: { assignedUser: true },
    orderBy: { dueDate: "asc" },
  })
}

export async function reorderTasks(
  updates: { id: string; status?: "TODO" | "IN_PROGRESS" | "DONE"; sortOrder: number }[],
) {
  if (updates.length === 0) return

  const values: (string | number | null)[] = []
  const placeholders = updates
    .map((u, i) => {
      values.push(u.id, u.sortOrder, u.status ?? null)
      return `($${i * 3 + 1}::text, $${i * 3 + 2}::int, $${i * 3 + 3}::"TaskStatus")`
    })
    .join(", ")

  await prisma.$executeRawUnsafe(
    `UPDATE "Task" SET
      "sortOrder" = v.sort_order,
      "status" = COALESCE(v.status, "Task"."status")
    FROM (VALUES ${placeholders}) AS v(id, sort_order, status)
    WHERE "Task"."id" = v.id`,
    ...values,
  )

  revalidatePath("/")
}
