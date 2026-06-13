"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { createTask, updateTask } from "@/server/actions/tasks"
import type { Task, User } from "@/generated/prisma/client"

interface TaskFormProps {
  users: User[]
  task?: Task & { assignedUser?: User | null }
  onClose: () => void
}

export function TaskForm({ users, task, onClose }: TaskFormProps) {
  const action = task ? updateTask.bind(null, task.id) : createTask

  const [, formAction, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    formData.set("status", formData.get("status")?.toString() || "TODO")
    formData.set("priority", formData.get("priority")?.toString() || "MEDIUM")
    await action(formData)
    onClose()
  }, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={task?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={task?.description ?? ""} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={task?.status ?? "TODO"}
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm dark:border-zinc-800"
          >
            <option value="TODO">A Fazer</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="DONE">Concluído</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? "MEDIUM"}
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm dark:border-zinc-800"
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedUserId">Responsável</Label>
        <select
          id="assignedUserId"
          name="assignedUserId"
          defaultValue={task?.assignedUserId ?? ""}
          className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm dark:border-zinc-800"
        >
          <option value="">Sem responsável</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Prazo</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : task ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  )
}
