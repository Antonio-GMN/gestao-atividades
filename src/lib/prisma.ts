import * as path from "node:path"
import { PrismaClient } from "@/generated/prisma/client"

const enginePath = path.join(
  process.cwd(),
  "src/generated/prisma/query_engine-windows.dll.node",
)
process.env.PRISMA_QUERY_ENGINE_LIBRARY ??= enginePath

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
