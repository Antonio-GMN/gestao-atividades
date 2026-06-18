"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/tasks/task-form"
import { formatDate, formatEstimatedHours } from "@/lib/utils"
import { AlertTriangle, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import type { Task, User } from "@prisma/client"

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
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
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
                  className="group rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950/20 cursor-pointer"
                  onClick={() => setEditingTask(task)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <Badge variant={priorityColors[task.priority]} className="text-[10px] px-1.5 py-0">
                      {priorityLabels[task.priority]}
                    </Badge>
                    {task.assignedUser && (
                      <span className="text-xs text-zinc-500">{task.assignedUser.name}</span>
                    )}
                    {task.estimatedHours != null && (
                      <span className="text-xs text-zinc-500">{formatEstimatedHours(task.estimatedHours)}</span>
                    )}
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Atrasada</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="hidden lg:grid lg:grid-cols-7 gap-3">
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
                    {task.startDate && (
                      <p className="text-[8px] text-zinc-300 dark:text-zinc-500 mt-0.5 leading-none">
                        Início {formatDate(new Date(task.startDate))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex lg:hidden flex-col gap-3">
          {weekDays.map((day) => (
            <div key={day.date.toISOString()} className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div
                className={`flex items-center justify-between px-4 py-2 ${day.isToday ? "bg-blue-50 dark:bg-blue-950/20" : "bg-zinc-50 dark:bg-zinc-900"}`}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-200"}`}
                  >
                    {dayNames[day.date.getDay()]}
                  </p>
                  <p className={`text-xs ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}>
                    {day.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <span className={`text-xs font-medium ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}>
                  {day.tasks.length} atividade{day.tasks.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {day.tasks.length === 0 && (
                  <p className="text-sm text-zinc-300 dark:text-zinc-600 text-center py-4">
                    Nenhuma atividade
                  </p>
                )}
                {day.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer ${task.status === "DONE" ? "bg-zinc-50/50 dark:bg-zinc-900/50" : task.status === "TODO" ? "bg-white dark:bg-zinc-950" : "bg-blue-50/50 dark:bg-blue-950/10"}`}
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${task.status === "DONE" ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-50"}`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={priorityColors[task.priority]}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {priorityLabels[task.priority]}
                        </Badge>
                        {task.assignedUser && (
                          <span className="text-xs text-zinc-400">{task.assignedUser.name}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
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
