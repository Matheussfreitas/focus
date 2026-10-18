import { TaskStatus } from '#/generated/prisma/enums.ts'
import { formatDDMMYYYY } from './taskForm'
import type { Task } from './types/task.type'

export type DueStatus = 'overdue' | 'today' | 'tomorrow' | 'later'

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

// Dias de calendário (local) entre hoje e o vencimento: negativo = atrasado.
function diffInDays(dueDate: Date | string, now: Date) {
  const due = startOfDay(new Date(dueDate))
  return Math.round((due.getTime() - startOfDay(now).getTime()) / 86_400_000)
}

export function getDueStatus(
  dueDate: Date | string | null | undefined,
  now = new Date(),
): DueStatus | null {
  if (!dueDate) return null
  const diff = diffInDays(dueDate, now)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return 'later'
}

export function getOverdueDays(
  dueDate: Date | string | null | undefined,
  now = new Date(),
) {
  if (!dueDate) return 0
  return Math.max(0, -diffInDays(dueDate, now))
}

export function formatDueLabel(dueDate: Date | string, now = new Date()) {
  switch (getDueStatus(dueDate, now)) {
    case 'today':
      return 'Hoje'
    case 'tomorrow':
      return 'Amanhã'
    default:
      return formatDDMMYYYY(new Date(dueDate))
  }
}

// Tarefa concluída nunca conta como atrasada.
export function isTaskOverdue(task: Pick<Task, 'status' | 'dueDate'>) {
  return (
    task.status !== TaskStatus.DONE && getDueStatus(task.dueDate) === 'overdue'
  )
}
