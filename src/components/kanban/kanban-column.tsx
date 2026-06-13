"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  children: ReactNode
}

export function KanbanColumn({ id, title, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={cn("rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 transition-colors", isOver && "bg-zinc-100 dark:bg-zinc-800")}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{title}</h3>
        <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="p-3 space-y-3 min-h-[200px]">{children}</div>
    </div>
  )
}
