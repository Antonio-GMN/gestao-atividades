import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface KpiCardProps {
  title: string
  value: string | number
  description: string
  icon: ReactNode
  variant?: "default" | "destructive" | "warning" | "success"
}

const variantStyles = {
  default: "border-zinc-200",
  destructive: "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800",
  warning: "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800",
  success: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800",
}

export function KpiCard({ title, value, description, icon, variant = "default" }: KpiCardProps) {
  return (
    <Card className={cn(variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className={cn("text-3xl font-bold", variant === "destructive" && "text-red-600 dark:text-red-400", variant === "warning" && "text-amber-600 dark:text-amber-400", variant === "success" && "text-emerald-600 dark:text-emerald-400")}>{value}</p>
          </div>
          <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  )
}
