"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskForm } from "./task-form"
import { deleteTask, updateTaskStatus } from "@/server/actions/tasks"
import { formatDate, isOverdue, isAtRisk } from "@/lib/utils"
import { Pencil, Trash2, ChevronRight } from "lucide-react"
import type { Task, User } from "@/generated/prisma/client"

interface TaskListProps {
  tasks: (Task & { assignedUser?: User | null })[]
  users: User[]
}

const statusLabels: Record<string, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Andamento",
  DONE: "Concluído",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const statusColors: Record<string, "default" | "secondary" | "success"> = {
  TODO: "default",
  IN_PROGRESS: "secondary",
  DONE: "success",
}

const priorityColors: Record<string, "default" | "secondary" | "warning" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
}

export function TaskList({ tasks, users }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<(Task & { assignedUser?: User | null }) | null>(null)

  const nextStatus = (current: string) => {
    if (current === "TODO") return "IN_PROGRESS"
    if (current === "IN_PROGRESS") return "DONE"
    return "TODO"
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 && (
        <p className="text-center text-zinc-500 py-8">Nenhuma atividade encontrada</p>
      )}
      {tasks.map((task) => (
        <Card key={task.id} className={isOverdue(task.dueDate) && task.status !== "DONE" ? "border-red-300 dark:border-red-800" : isAtRisk(task.dueDate) && task.status !== "DONE" ? "border-amber-300 dark:border-amber-800" : undefined}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                    {task.title}
                  </h3>
                  <Badge variant={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
                  <Badge variant={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
                  {isOverdue(task.dueDate) && task.status !== "DONE" && (
                    <Badge variant="destructive">Atrasada</Badge>
                  )}
                  {isAtRisk(task.dueDate) && task.status !== "DONE" && !isOverdue(task.dueDate) && (
                    <Badge variant="warning">Em Risco</Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                  <span>Prazo: {formatDate(new Date(task.dueDate))}</span>
                  {task.assignedUser && <span>Responsável: {task.assignedUser.name}</span>}
                  {task.estimatedHours != null && <span>Estimativa: {task.estimatedHours}h</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {task.status !== "DONE" && (
                  <Button variant="ghost" size="icon" onClick={() => updateTaskStatus(task.id, nextStatus(task.status) as "TODO" | "IN_PROGRESS" | "DONE")} title={statusLabels[nextStatus(task.status)]}>
                    {task.status === "TODO" ? <ChevronRight className="h-4 w-4" /> : task.status === "IN_PROGRESS" ? <ChevronRight className="h-4 w-4" /> : null}
                  </Button>
                )}
                <Dialog open={editingTask?.id === task.id} onOpenChange={(open) => { if (!open) setEditingTask(null) }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Atividade</DialogTitle>
                    </DialogHeader>
                    <TaskForm users={users} task={editingTask ?? undefined} onClose={() => setEditingTask(null)} />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
