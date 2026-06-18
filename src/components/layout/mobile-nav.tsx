"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  Users,
  AlertTriangle,
} from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/atividades", label: "Atividades", icon: ListTodo },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
  { href: "/equipe", label: "Equipe", icon: Users },
  { href: "/risco", label: "Em Risco", icon: AlertTriangle },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-w-0 flex-1",
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate w-full text-center">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
