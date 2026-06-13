"use client"

import { useState } from "react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { updateTaskStatus } from "@/server/actions/tasks"
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const tasksByColumn = (status: string) =>
    tasks.filter((t) => t.status === status)

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const overColumn = columns.find((c) => c.id === over.id)
    if (overColumn && overColumn.id !== task.status) {
      updateTaskStatus(taskId, overColumn.id as "TODO" | "IN_PROGRESS" | "DONE")
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn key={column.id} id={column.id} title={column.title} count={tasksByColumn(column.id).length}>
            <SortableContext items={tasksByColumn(column.id).map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasksByColumn(column.id).map((task) => (
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
