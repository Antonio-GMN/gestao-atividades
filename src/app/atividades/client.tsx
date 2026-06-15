"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskForm } from "@/components/tasks/task-form"
import { TaskList } from "@/components/tasks/task-list"
import { Plus, Search, X } from "lucide-react"
import type { Task, User } from "@prisma/client"

interface TasksClientProps {
  tasks: (Task & { assignedUser?: User | null })[]
  users: User[]
}

export function TasksClient({ tasks, users }: TasksClientProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
      if (userFilter !== "all" && task.assignedUserId !== userFilter) return false
      if (dateFrom) {
        const taskDate = new Date(task.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)
        if (taskDate < from) return false
      }
      if (dateTo) {
        const taskDate = new Date(task.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (taskDate > to) return false
      }
      return true
    })
  }, [tasks, search, statusFilter, priorityFilter, userFilter, dateFrom, dateTo])

  const hasActiveFilters = search || statusFilter !== "all" || priorityFilter !== "all" || userFilter !== "all" || dateFrom || dateTo

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setUserFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Atividades</h1>
          <p className="text-zinc-500 mt-1">{filteredTasks.length} de {tasks.length} atividades</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Atividade</DialogTitle>
            </DialogHeader>
            <TaskForm users={users} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px] max-w-sm">
          <Label htmlFor="search">Busca</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              id="search"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="TODO">A Fazer</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="DONE">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Prioridade</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Responsável</Label>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="none">Sem responsável</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="dateFrom">Data início</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="dateTo">Data fim</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <TaskList tasks={filteredTasks} users={users} />
    </div>
  )
}
