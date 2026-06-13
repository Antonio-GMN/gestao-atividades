"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TeamForm } from "@/components/team/team-form"
import { TeamList } from "@/components/team/team-list"
import { Plus } from "lucide-react"

interface UserWithCount {
  id: string
  name: string
  role: string
  createdAt: Date
  _count: { tasks: number }
}

interface TeamClientProps {
  users: UserWithCount[]
}

export function TeamClient({ users }: TeamClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Equipe</h1>
          <p className="text-zinc-500 mt-1">{users.length} colaboradores</p>
        </div>
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

      <TeamList users={users} />
    </div>
  )
}
