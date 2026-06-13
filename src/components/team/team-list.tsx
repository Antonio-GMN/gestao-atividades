"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TeamForm } from "./team-form"
import { UserTasksDialog } from "./user-tasks-dialog"
import { deleteUser } from "@/server/actions/users"
import { Pencil, Trash2, Circle } from "lucide-react"

interface UserWithHours {
  id: string
  name: string
  role: string
  createdAt: Date
  _count: { tasks: number }
  totalEstimatedHours: number
}

interface TeamListProps {
  users: UserWithHours[]
}

export function TeamList({ users }: TeamListProps) {
  const [editingUser, setEditingUser] = useState<UserWithHours | null>(null)
  const [viewingUser, setViewingUser] = useState<UserWithHours | null>(null)

  function getWorkload(hours: number) {
    if (hours >= 24) return { label: "Sobrecarregado", variant: "destructive" as const, color: "text-red-500" }
    if (hours >= 8) return { label: "Equilibrado", variant: "success" as const, color: "text-emerald-500" }
    return { label: "Ocioso", variant: "warning" as const, color: "text-amber-500" }
  }

  return (
    <div className="space-y-3">
      <UserTasksDialog user={viewingUser} onClose={() => setViewingUser(null)} />

      {users.map((user) => {
        const workload = getWorkload(user.totalEstimatedHours)
        return (
          <Card
            key={user.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setViewingUser(user)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Circle className={`h-3 w-3 fill-current ${workload.color}`} />
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{user.name}</h3>
                    <p className="text-sm text-zinc-500">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.totalEstimatedHours}h estimadas</p>
                    <p className="text-xs text-zinc-400">{user._count.tasks} tarefas</p>
                    <Badge variant={workload.variant}>{workload.label}</Badge>
                  </div>
                  <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => { if (!open) setEditingUser(null) }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingUser(user) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Colaborador</DialogTitle>
                      </DialogHeader>
                      <TeamForm user={editingUser ?? undefined} onClose={() => setEditingUser(null)} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteUser(user.id) }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
