import * as z from 'zod'

const DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/

export function parseDDMMYYYY(value: string): Date | null {
  const match = DATE_RE.exec(value)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isValid ? date : null
}

export function maskDDMMYYYY(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  return [day, month, year].filter(Boolean).join('/')
}

export const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine((value) => !value || parseDDMMYYYY(value) !== null, {
      message: 'Data inválida (dd/mm/aaaa)',
    }),
  tagId: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>

export function formatDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}
