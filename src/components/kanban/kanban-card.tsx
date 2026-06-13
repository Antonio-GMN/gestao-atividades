"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { formatDate, isOverdue, isAtRisk } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Task, User } from "@/generated/prisma/client"

interface KanbanCardProps {
  task: Task & { assignedUser?: User | null }
  isDragOverlay?: boolean
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

export function KanbanCard({ task, isDragOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isDragOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow",
        isDragging && "opacity-50",
        isDragOverlay && "shadow-lg rotate-3",
        isOverdue(task.dueDate) && task.status !== "DONE" && "border-red-300 dark:border-red-800",
        isAtRisk(task.dueDate) && task.status !== "DONE" && !isOverdue(task.dueDate) && "border-amber-300 dark:border-amber-800"
      )}
    >
      <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">{task.title}</h4>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={priorityColors[task.priority]} className="text-[10px] px-1.5 py-0">{priorityLabels[task.priority]}</Badge>
        {task.assignedUser && (
          <span className="text-[10px] text-zinc-500">{task.assignedUser.name}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
        <span>{formatDate(new Date(task.dueDate))}</span>
        {task.estimatedHours != null && <span>· {task.estimatedHours}h</span>}
      </div>
    </div>
  )
}
