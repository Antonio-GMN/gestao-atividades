"use client"

import { useEffect, useMemo, useState } from "react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners, type DragStartEvent, type DragEndEvent, type DragOverEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { reorderTasks } from "@/server/actions/tasks"
import type { Task, User } from "@/generated/prisma/client"

interface KanbanBoardProps {
  tasks: (Task & { assignedUser?: User | null })[]
}

const columns = [
  { id: "TODO", title: "A Fazer" },
  { id: "IN_PROGRESS", title: "Em Andamento" },
  { id: "DONE", title: "Concluído" },
]

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<(Task & { assignedUser?: User | null }) | null>(null)
  const [optimisticTasks, setOptimisticTasks] = useState(tasks)

  useEffect(() => {
    setOptimisticTasks(tasks)
  }, [tasks])

  const displayedTasks = optimisticTasks

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const tasksByColumn = useMemo(() => {
    const map: Record<string, (Task & { assignedUser?: User | null })[]> = {}
    for (const col of columns) {
      map[col.id] = displayedTasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
    return map
  }, [displayedTasks])

  function findColumn(id: string): string | undefined {
    if (columns.find((c) => c.id === id)) return id
    const task = displayedTasks.find((t) => t.id === id)
    return task?.status
  }

  function handleDragStart(event: DragStartEvent) {
    const task = displayedTasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeCol = findColumn(active.id as string)
    const overCol = findColumn(over.id as string)
    if (!activeCol || !overCol || activeCol === overCol) return

    setOptimisticTasks((prev) => {
      const activeTask = prev.find((t) => t.id === active.id)
      if (!activeTask) return prev

      return prev.map((t) =>
        t.id === active.id ? { ...t, status: overCol as "TODO" | "IN_PROGRESS" | "DONE" } : t,
      )
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over || active.id === over.id) {
      setOptimisticTasks(tasks)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(activeId)
    const overCol = findColumn(overId)
    if (!activeCol || !overCol) {
      setOptimisticTasks(tasks)
      return
    }

    const newStatus = overCol as "TODO" | "IN_PROGRESS" | "DONE"

    let columnTasks = tasksByColumn[overCol]

    const activeIndex = columnTasks.findIndex((t) => t.id === activeId)
    const overIndex = columnTasks.findIndex((t) => t.id === overId)

    let reordered: typeof columnTasks
    if (activeCol === overCol) {
      reordered = arrayMove(columnTasks, activeIndex, overIndex)
    } else {
      columnTasks = tasksByColumn[overCol]
      const movedTask = displayedTasks.find((t) => t.id === activeId)!
      const updated = { ...movedTask, status: newStatus }
      const insertAt = overIndex >= 0 ? overIndex : columnTasks.length
      reordered = [...columnTasks.slice(0, insertAt), updated, ...columnTasks.slice(insertAt)]
    }

    const updates = reordered.map((t, i) => ({
      id: t.id,
      status: newStatus,
      sortOrder: i,
    })) as { id: string; status: "TODO" | "IN_PROGRESS" | "DONE"; sortOrder: number }[]

    setOptimisticTasks((prev) => {
      const others = prev.filter((t) => !reordered.find((r) => r.id === t.id))
      return [...others, ...reordered]
    })

    await reorderTasks(updates)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn key={column.id} id={column.id} title={column.title} count={tasksByColumn[column.id].length}>
            <SortableContext items={tasksByColumn[column.id].map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasksByColumn[column.id].map((task) => (
                <KanbanCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
