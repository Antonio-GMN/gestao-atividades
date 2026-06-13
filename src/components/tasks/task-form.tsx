"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { createTask, updateTask } from "@/server/actions/tasks"
import type { Task, User } from "@/generated/prisma/client"

interface TaskFormProps {
  users: User[]
  task?: Task & { assignedUser?: User | null }
  onClose: () => void
}

export function TaskForm({ users, task, onClose }: TaskFormProps) {
  const action = task ? updateTask.bind(null, task.id) : createTask

  const [status, setStatus] = useState(task?.status ?? "TODO")
  const [priority, setPriority] = useState(task?.priority ?? "MEDIUM")
  const [assignedUserId, setAssignedUserId] = useState(task?.assignedUserId ?? "none")

  const [hours, setHours] = useState(task ? Math.floor(task.estimatedHours) : "")
  const [minutes, setMinutes] = useState(task ? Math.round((task.estimatedHours % 1) * 60) : "")

  const [, formAction, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    formData.set("status", status)
    formData.set("priority", priority)
    formData.set("assignedUserId", assignedUserId === "none" ? "" : assignedUserId)
    const h = Number(hours) || 0
    const m = Number(minutes) || 0
    formData.set("estimatedHours", String(h + m / 60))
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
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">A Fazer</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="DONE">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Responsável</Label>
        <Select value={assignedUserId} onValueChange={setAssignedUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Sem responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem responsável</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label>Estimativa</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              placeholder="Horas"
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="Min"
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>
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
