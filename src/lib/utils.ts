import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function isOverdue(dueDate: Date) {
  return new Date(dueDate) < new Date() && dueDate.toDateString() !== new Date().toDateString()
}

export function isAtRisk(dueDate: Date) {
  const now = new Date()
  const diffMs = new Date(dueDate).getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 3
}
