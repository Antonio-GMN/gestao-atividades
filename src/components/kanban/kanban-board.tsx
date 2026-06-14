"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection, type DragStartEvent, type DragEndEvent, type DragOverEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskForm } from "@/components/tasks/task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { reorderTasks } from "@/server/actions/tasks"
import { Search, X } from "lucide-react"
import type { Task, User } from "@/generated/prisma/client"

interface KanbanBoardProps {
  tasks: (Task & { assignedUser?: User | null })[]
  users: User[]
}

const columns = [
  { id: "TODO", title: "A Fazer" },
  { id: "IN_PROGRESS", title: "Em Andamento" },
  { id: "DONE", title: "Concluído" },
]

export function KanbanBoard({ tasks, users }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<(Task & { assignedUser?: User | null }) | null>(null)
  const [editingTask, setEditingTask] = useState<(Task & { assignedUser?: User | null }) | null>(null)
  const [optimisticTasks, setOptimisticTasks] = useState(tasks)
  const pendingOps = useRef(0)

  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")

  useEffect(() => {
    if (pendingOps.current === 0) {
      setOptimisticTasks(tasks)
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return optimisticTasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false
      if (userFilter !== "all") {
        if (userFilter === "none" && t.assignedUserId !== null) return false
        if (userFilter !== "none" && t.assignedUserId !== userFilter) return false
      }
      return true
    })
  }, [optimisticTasks, search, priorityFilter, userFilter])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const priorityWeight: Record<string, number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  }

  const tasksByColumn = useMemo(() => {
    const map: Record<string, (Task & { assignedUser?: User | null })[]> = {}
    for (const col of columns) {
      map[col.id] = optimisticTasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => {
          const pw = (priorityWeight[a.priority] ?? 99) - (priorityWeight[b.priority] ?? 99)
          if (pw !== 0) return pw
          return a.sortOrder - b.sortOrder
        })
    }
    return map
  }, [optimisticTasks])

  const filteredTasksByColumn = useMemo(() => {
    const map: Record<string, (Task & { assignedUser?: User | null })[]> = {}
    for (const col of columns) {
      map[col.id] = filteredTasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => {
          const pw = (priorityWeight[a.priority] ?? 99) - (priorityWeight[b.priority] ?? 99)
          if (pw !== 0) return pw
          return a.sortOrder - b.sortOrder
        })
    }
    return map
  }, [filteredTasks])

  const findColumn = useCallback((id: string): string | undefined => {
    if (columns.find((c) => c.id === id)) return id
    const task = optimisticTasks.find((t) => t.id === id)
    return task?.status
  }, [optimisticTasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = optimisticTasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }, [optimisticTasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
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
  }, [findColumn])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
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

    // Use the original server prop to determine if the card actually changed columns
    // (findColumn may return stale or already-flushed state depending on React batching)
    const originalTask = tasks.find((t) => t.id === activeId)
    const changedColumn = originalTask ? originalTask.status !== overCol : activeCol !== overCol

    // Compute column tasks from fresh optimisticTasks, not memoized tasksByColumn
    // (handleDragOver's state update may not have flushed yet)
    const sortByPriorityAndOrder = (a: Task & { assignedUser?: User | null }, b: Task & { assignedUser?: User | null }) => {
      const pw = (priorityWeight[a.priority] ?? 99) - (priorityWeight[b.priority] ?? 99)
      if (pw !== 0) return pw
      return a.sortOrder - b.sortOrder
    }

    const overColumnTasks = [...optimisticTasks]
      .filter((t) => t.status === overCol)
      .sort(sortByPriorityAndOrder)

    const activeIndex = overColumnTasks.findIndex((t) => t.id === activeId)
    const overIndex = overColumnTasks.findIndex((t) => t.id === overId)

    let reordered: (Task & { assignedUser?: User | null })[]
    if (activeIndex >= 0) {
      // Card already in target column (handleDragOver may have already moved it)
      reordered = arrayMove(overColumnTasks, activeIndex, overIndex >= 0 ? overIndex : overColumnTasks.length - 1)
    } else {
      // Card not yet in target column — insert and mark status change
      const movedTask = optimisticTasks.find((t) => t.id === activeId)!
      const updated = { ...movedTask, status: newStatus }
      const insertAt = overIndex >= 0 ? overIndex : overColumnTasks.length
      reordered = [...overColumnTasks.slice(0, insertAt), updated, ...overColumnTasks.slice(insertAt)]
    }

    const updates = reordered.map((t, i) => ({
      id: t.id,
      ...(changedColumn && t.id === activeId ? { status: newStatus } : {}),
      sortOrder: i,
    }))

    setOptimisticTasks((prev) => {
      const others = prev.filter((t) => !reordered.find((r) => r.id === t.id))
      return [...others, ...reordered]
    })

    pendingOps.current++
    try {
      await reorderTasks(updates)
    } finally {
      pendingOps.current--
    }
  }, [optimisticTasks, findColumn, tasks])

  const hasActiveFilters = search || priorityFilter !== "all" || userFilter !== "all"

  function clearFilters() {
    setSearch("")
    setPriorityFilter("all")
    setUserFilter("all")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px] max-w-sm">
          <Label htmlFor="kanban-search">Busca</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <Input
              id="kanban-search"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Prioridade</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Responsável</Label>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="none">Sem responsável</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn key={column.id} id={column.id} title={column.title} count={filteredTasksByColumn[column.id].length}>
            {/* Use unfiltered items so @dnd-kit tracks every card regardless of filter state */}
            <SortableContext items={tasksByColumn[column.id].map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {filteredTasksByColumn[column.id].map((task) => (
                <KanbanCard key={task.id} task={task} onEdit={setEditingTask} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
      <Dialog open={!!editingTask} onOpenChange={(open) => { if (!open) setEditingTask(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <TaskForm users={users} task={editingTask ?? undefined} onClose={() => setEditingTask(null)} />
        </DialogContent>
      </Dialog>
    </DndContext>
    </div>
  )
}
