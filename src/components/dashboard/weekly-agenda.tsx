"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/tasks/task-form"
import { formatEstimatedHours } from "@/lib/utils"
import { AlertTriangle, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import type { Task, User } from "@/generated/prisma/client"

interface WeeklyAgendaProps {
  tasks: (Task & { assignedUser?: User | null })[]
  users: User[]
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

const dayNames = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]

function normalizeDate(d: Date) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  date.setHours(0, 0, 0, 0)
  return date
}

export function WeeklyAgenda({ tasks, users }: WeeklyAgendaProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [editingTask, setEditingTask] = useState<(Task & { assignedUser?: User | null }) | null>(null)

  const now = new Date()
  const today = normalizeDate(now)
  const baseMonday = getMonday(now)
  const weekStart = new Date(baseMonday)
  weekStart.setDate(baseMonday.getDate() + weekOffset * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const overdue = tasks.filter(
    (t) => t.status !== "DONE" && normalizeDate(t.dueDate) < today,
  )

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const nd = normalizeDate(date)
    return {
      date: nd,
      label: dayNames[date.getDay()],
      isToday: nd.getTime() === today.getTime(),
      tasks: tasks.filter((t) => {
        const td = normalizeDate(t.dueDate)
        return td.getTime() === nd.getTime() && (t.status === "DONE" || td >= today)
      }),
    }
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Agenda Semanal
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {weekOffset !== 0 && (
              <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                Hoje
              </Button>
            )}
            <span className="text-xs text-zinc-400">
              {weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} —{" "}
              {weekEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {overdue.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Atrasadas ({overdue.length})
              </h3>
            </div>
            <div className="space-y-2">
              {overdue.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950/20 cursor-pointer"
                  onClick={() => setEditingTask(task)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {task.title}
                    </span>
                    <Badge variant={priorityColors[task.priority]}>
                      {priorityLabels[task.priority]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500">
                    {task.assignedUser && <span>{task.assignedUser.name}</span>}
                    {task.estimatedHours != null && (
                      <span>{formatEstimatedHours(task.estimatedHours)}</span>
                    )}
                    <Badge variant="destructive">Atrasada</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <div key={day.date.toISOString()} className="min-w-0">
              <div className="text-center mb-2">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}
                >
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][day.date.getDay()]}
                </p>
                <p
                  className={`text-lg font-bold ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-200"}`}
                >
                  {day.date.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {day.tasks.length === 0 && (
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 text-center leading-5">
                    —
                  </p>
                )}
                {day.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group rounded-md border px-2 py-1.5 cursor-pointer ${task.status === "DONE" ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900" : task.status === "TODO" ? "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950" : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"}`}
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-[11px] font-medium leading-tight truncate ${task.status === "DONE" ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-50"}`}
                      >
                        {task.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-0.5"
                        onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <Badge
                        variant={priorityColors[task.priority]}
                        className="text-[8px] px-1 py-0 leading-none"
                      >
                        {priorityLabels[task.priority]}
                      </Badge>
                      {task.assignedUser && (
                        <span className="text-[9px] text-zinc-400 truncate max-w-[60px]">
                          {task.assignedUser.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!editingTask} onOpenChange={(open) => { if (!open) setEditingTask(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <TaskForm users={users} task={editingTask ?? undefined} onClose={() => setEditingTask(null)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
