"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { userSchema } from "@/lib/validations"

export async function getUsers() {
  return prisma.user.findMany({
    include: {
      _count: {
        select: {
          tasks: {
            where: {
              status: { not: "DONE" },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function createUser(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = userSchema.parse(raw)

  await prisma.user.create({
    data: {
      name: parsed.name,
      role: parsed.role,
    },
  })

  revalidatePath("/")
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } })
  revalidatePath("/")
}
