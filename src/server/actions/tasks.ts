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
      dueDate: new Date(parsed.dueDate),
      assignedUserId: parsed.assignedUserId ?? null,
    },
  })

  revalidatePath("/")
}

export async function createTaskFromJson(data: {
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
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
      dueDate: new Date(parsed.dueDate),
      assignedUserId: parsed.assignedUserId ?? null,
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
      dueDate: new Date(parsed.dueDate),
      assignedUserId: parsed.assignedUserId ?? null,
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
