import { prisma } from "@/lib/prisma"
import { TeamClient } from "./client"

export const dynamic = "force-dynamic"

export default async function EquipePage() {
  const users = await prisma.user.findMany({
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
  })

  return <TeamClient users={users} />
}
