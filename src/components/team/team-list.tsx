"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteUser } from "@/server/actions/users"
import { Trash2, Circle } from "lucide-react"

interface UserWithCount {
  id: string
  name: string
  role: string
  createdAt: Date
  _count: { tasks: number }
}

interface TeamListProps {
  users: UserWithCount[]
}

export function TeamList({ users }: TeamListProps) {
  function getWorkload(count: number) {
    if (count >= 4) return { label: "Sobrecarregado", variant: "destructive" as const, color: "text-red-500" }
    if (count >= 2) return { label: "Equilibrado", variant: "success" as const, color: "text-emerald-500" }
    return { label: "Ocioso", variant: "warning" as const, color: "text-amber-500" }
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const workload = getWorkload(user._count.tasks)
        return (
          <Card key={user.id}>
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
                    <p className="text-sm font-medium">{user._count.tasks} tarefas</p>
                    <Badge variant={workload.variant}>{workload.label}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}>
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
