"use client"

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  CartesianGrid, ResponsiveContainer, Cell, Legend,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatEstimatedHours } from "@/lib/utils"

interface UserWithHours {
  id: string
  name: string
  totalEstimatedHours: number
}

interface TaskInfo {
  assignedUserId: string | null
  estimatedHours: number
  dayOfWeek: number
}

interface WorkloadChartProps {
  users: UserWithHours[]
  tasks: TaskInfo[]
}

type ChartView = "bars" | "weekdays" | "heatmap"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const WORK_DAYS = [1, 2, 3, 4, 5]

export function WorkloadChart({ users, tasks }: WorkloadChartProps) {
  const [view, setView] = useState<ChartView>("bars")

  const barData = useMemo(() =>
    users.map((u) => ({
      name: u.name,
      hours: u.totalEstimatedHours,
    })),
    [users]
  )

  const colors = useMemo(() => {
    const palette = [
      "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
      "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
      "#f97316", "#6366f1",
    ]
    const result: Record<string, string> = {}
    users.forEach((u, i) => {
      result[u.name] = palette[i % palette.length]
    })
    return result
  }, [users])

  const dayTasks = useMemo(() => {
    const byDay: Record<number, Record<string, number>> = {}
    for (const d of WORK_DAYS) {
      byDay[d] = {}
      for (const u of users) {
        byDay[d][u.name] = 0
      }
    }

    for (const task of tasks) {
      if (!task.assignedUserId) continue
      const user = users.find((u) => u.id === task.assignedUserId)
      if (!user) continue
      const workDay = task.dayOfWeek === 0 || task.dayOfWeek === 6
        ? (task.dayOfWeek === 0 ? 1 : 5)
        : task.dayOfWeek
      byDay[workDay][user.name] = (byDay[workDay][user.name] ?? 0) + task.estimatedHours
    }
    return byDay
  }, [tasks, users])

  const weekDayData = useMemo(() =>
    WORK_DAYS.map((d) => {
      const entry: Record<string, string | number> = { day: DAYS[d] }
      for (const u of users) {
        entry[u.name] = dayTasks[d][u.name] ?? 0
      }
      return entry
    }),
    [dayTasks, users]
  )

  function getHeatColor(hours: number) {
    const max = Math.max(...WORK_DAYS.flatMap((d) => Object.values(dayTasks[d])), 1)
    const intensity = Math.min(hours / max, 1)
    const g = Math.round(68 + (239 - 68) * (1 - intensity))
    const b = Math.round(68 + (68 - 68) * (1 - intensity))
    return { bg: `rgb(239, ${g}, ${b})`, text: hours > max * 0.5 ? "white" : undefined }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant={view === "bars" ? "default" : "outline"} size="sm" onClick={() => setView("bars")}>
          Carga por Funcionário
        </Button>
        <Button variant={view === "weekdays" ? "default" : "outline"} size="sm" onClick={() => setView("weekdays")}>
          Horas por Dia
        </Button>
        <Button variant={view === "heatmap" ? "default" : "outline"} size="sm" onClick={() => setView("heatmap")}>
          Heatmap
        </Button>
      </div>

      {view === "bars" && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${formatEstimatedHours(Number(value))}`, "Horas"]} />
            <ReferenceLine y={8} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "1 dia (8h)", position: "right", fontSize: 11 }} />
            <ReferenceLine y={16} stroke="#84cc16" strokeDasharray="5 5" label={{ value: "2 dias (16h)", position: "right", fontSize: 11 }} />
            <ReferenceLine y={24} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "3 dias (24h)", position: "right", fontSize: 11 }} />
            <ReferenceLine y={32} stroke="#f97316" strokeDasharray="5 5" label={{ value: "4 dias (32h)", position: "right", fontSize: 11 }} />
            <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "5 dias (40h)", position: "right", fontSize: 11 }} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {barData.map((entry) => (
                <Cell key={entry.name} fill={colors[entry.name] ?? "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === "weekdays" && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={weekDayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {users.map((u) => (
              <Bar key={u.id} dataKey={u.name} stackId="a" fill={colors[u.name]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === "heatmap" && (
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Funcionário</th>
                  {WORK_DAYS.map((d) => (
                    <th key={d} className="text-center py-2 px-2 text-zinc-500 font-medium min-w-[90px]">
                      {DAYS[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">{u.name}</td>
                    {WORK_DAYS.map((d) => {
                      const hours = dayTasks[d][u.name] ?? 0
                      const { bg, text } = getHeatColor(hours)
                      return (
                        <td
                          key={d}
                          className="text-center py-2 px-2 rounded"
                          style={{
                            backgroundColor: hours > 0 ? bg : undefined,
                            color: text,
                          }}
                        >
                          {hours > 0 ? formatEstimatedHours(hours) : "—"}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
