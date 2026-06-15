"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/tasks/task-form"
import { getUserTasks } from "@/server/actions/tasks"
import { formatDate, formatEstimatedHours, isOverdue, isAtRisk } from "@/lib/utils"
import { Pencil } from "lucide-react"
import type { Task, User } from "@prisma/client"

interface UserInfo {
  id: string
  name: string
  role: string
  totalEstimatedHours: number
}

interface UserTasksDialogProps {
  user: UserInfo | null
  onClose: () => void
  usersList: { id: string; name: string; role: string; createdAt: Date }[]
}

const statusLabels: Record<string, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Andamento",
  DONE: "Concluído",
}

const statusColors: Record<string, "default" | "secondary" | "success"> = {
  TODO: "default",
  IN_PROGRESS: "secondary",
  DONE: "success",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const priorityColors: Record<string, "default" | "secondary" | "warning" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
}

function getSection(task: Task & { assignedUser?: User | null }): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.dueDate)
  due.setHours(0, 0, 0, 0)

  if (task.status === "DONE") return "Concluídas"
  if (isOverdue(task.dueDate)) return "Em Atraso"
  if (due.getTime() === today.getTime()) return "Hoje"

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (due.getTime() === tomorrow.getTime()) return "Amanhã"

  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  if (due <= weekEnd) return "Esta Semana"

  return "Próximos"
}

const sectionOrder = ["Em Atraso", "Hoje", "Amanhã", "Esta Semana", "Próximos", "Concluídas"]

export function UserTasksDialog({ user, onClose, usersList }: UserTasksDialogProps) {
  const [tasks, setTasks] = useState<(Task & { assignedUser?: User | null })[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<(Task & { assignedUser?: User | null }) | null>(null)

  const loadTasks = useCallback(() => {
    if (!user) return
    setLoading(true)
    getUserTasks(user.id).then(setTasks).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const sections = sectionOrder
    .map((section) => ({
      name: section,
      tasks: tasks.filter((t) => getSection(t) === section),
    }))
    .filter((s) => s.tasks.length > 0)

  const doneTasks = tasks.filter((t) => t.status === "DONE")
  const activeTasks = tasks.filter((t) => t.status !== "DONE")

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-lg">{user?.name}</p>
                <p className="text-sm font-normal text-zinc-500">{user?.role}</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm text-zinc-500 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <span>{activeTasks.length} atividades pendentes</span>
          <span>{doneTasks.length} concluídas</span>
          <span>{user?.totalEstimatedHours ?? 0}h estimadas</span>
        </div>

        {loading && (
          <p className="text-center text-zinc-500 py-8">Carregando...</p>
        )}

        {!loading && sections.length === 0 && (
          <p className="text-center text-zinc-500 py-8">Nenhuma atividade encontrada</p>
        )}

        {!loading && sections.map((section) => (
          <div key={section.name}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2 mt-4 first:mt-0">
              {section.name}
              <span className="text-zinc-400 font-normal ml-2">({section.tasks.length})</span>
            </h3>
            <div className="space-y-2">
              {section.tasks.map((task) => (
                <Card key={task.id} className={
                  section.name === "Em Atraso"
                    ? "border-red-300 dark:border-red-800"
                    : section.name === "Hoje"
                    ? "border-amber-300 dark:border-amber-800"
                    : undefined
                }>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant={statusColors[task.status]} className="text-[10px] px-1.5 py-0">
                            {statusLabels[task.status]}
                          </Badge>
                          <Badge variant={priorityColors[task.priority]} className="text-[10px] px-1.5 py-0">
                            {priorityLabels[task.priority]}
                          </Badge>
                          {task.status !== "DONE" && isOverdue(task.dueDate) && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Atrasada</Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 text-xs text-zinc-400">
                        {task.startDate && <p>Início: {formatDate(new Date(task.startDate))}</p>}
                        <p>Prazo: {formatDate(new Date(task.dueDate))}</p>
                        <p className="mt-0.5">{formatEstimatedHours(task.estimatedHours)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mt-1 ml-auto"
                          onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </DialogContent>

      <Dialog open={!!editingTask} onOpenChange={(open) => { if (!open) setEditingTask(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <TaskForm
            users={usersList}
            task={editingTask ?? undefined}
            onClose={() => { setEditingTask(null); loadTasks() }}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}