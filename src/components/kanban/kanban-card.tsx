"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatEstimatedHours, isOverdue, isAtRisk } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"
import type { Task, User } from "@/generated/prisma/client"

interface KanbanCardProps {
  task: Task & { assignedUser?: User | null }
  isDragOverlay?: boolean
  onEdit?: (task: Task & { assignedUser?: User | null }) => void
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

export function KanbanCard({ task, isDragOverlay, onEdit }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isDragOverlay,
    animateLayoutChanges: () => false,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow group",
        isDragging && "opacity-50",
        isDragOverlay && "shadow-lg rotate-3",
        isOverdue(task.dueDate) && task.status !== "DONE" && "border-red-300 dark:border-red-800",
        isAtRisk(task.dueDate) && task.status !== "DONE" && !isOverdue(task.dueDate) && "border-amber-300 dark:border-amber-800"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{task.title}</h4>
        {onEdit && !isDragOverlay && (
          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onEdit(task) }}>
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={priorityColors[task.priority]} className="text-[10px] px-1.5 py-0">{priorityLabels[task.priority]}</Badge>
        {task.assignedUser && (
          <span className="text-[10px] text-zinc-500">{task.assignedUser.name}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
        {task.startDate && <span>Início: {formatDate(new Date(task.startDate))}</span>}
        <span>Prazo: {formatDate(new Date(task.dueDate))}</span>
        {task.estimatedHours != null && <span>· {formatEstimatedHours(task.estimatedHours)}</span>}
      </div>
    </div>
  )
}
