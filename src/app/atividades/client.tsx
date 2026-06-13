"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskForm } from "@/components/tasks/task-form"
import { TaskList } from "@/components/tasks/task-list"
import { Plus } from "lucide-react"
import type { Task, User } from "@/generated/prisma/client"

interface TasksClientProps {
  tasks: (Task & { assignedUser?: User | null })[]
  users: User[]
}

export function TasksClient({ tasks, users }: TasksClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Atividades</h1>
          <p className="text-zinc-500 mt-1">{tasks.length} atividades cadastradas</p>
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

      <TaskList tasks={tasks} users={users} />
    </div>
  )
}
