"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamForm } from "@/components/team/team-form"
import { TeamList } from "@/components/team/team-list"
import { WorkloadChart } from "@/components/team/workload-chart"
import { BarChart3, Plus, Search, X } from "lucide-react"

interface UserWithHours {
  id: string
  name: string
  role: string
  createdAt: Date
  _count: { tasks: number }
  totalEstimatedHours: number
}

interface TaskInfo {
  assignedUserId: string | null
  estimatedHours: number
  dayOfWeek: number
}

interface TeamClientProps {
  users: UserWithHours[]
  tasks: TaskInfo[]
}

export function TeamClient({ users, tasks }: TeamClientProps) {
  const [open, setOpen] = useState(false)
  const [chartOpen, setChartOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const roles = useMemo(() => {
    const unique = new Set(users.map((u) => u.role))
    return Array.from(unique).sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      return true
    })
  }, [users, search, roleFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Equipe</h1>
          <p className="text-zinc-500 mt-1">{users.length} colaboradores</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setChartOpen(true)}>
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Colaborador</DialogTitle>
              </DialogHeader>
              <TeamForm onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
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
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os cargos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-zinc-400">
        {filteredUsers.length} de {users.length} colaboradores
      </div>

      <TeamList users={filteredUsers} />

      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carga de Trabalho</DialogTitle>
          </DialogHeader>
          <WorkloadChart users={filteredUsers} tasks={tasks} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
