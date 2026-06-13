"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUser } from "@/server/actions/users"

interface TeamFormProps {
  onClose: () => void
}

export function TeamForm({ onClose }: TeamFormProps) {
  const [, formAction, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    await createUser(formData)
    onClose()
  }, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Cargo</Label>
        <Input id="role" name="role" required />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Adicionar"}
        </Button>
      </div>
    </form>
  )
}
