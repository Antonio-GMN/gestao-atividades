import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().min(1, "Prazo é obrigatório"),
  assignedUserId: z.string().optional(),
  estimatedHours: z.coerce.number().min(0.25, "Estimativa deve ser no mínimo 15 minutos"),
})

export type TaskFormData = z.infer<typeof taskSchema>

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
})

export type UserFormData = z.infer<typeof userSchema>
