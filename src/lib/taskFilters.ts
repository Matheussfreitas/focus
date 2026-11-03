export const DONE_RANGE_COOKIE = 'done-range'
export const TODO_SORT_COOKIE = 'todo-sort'

// Período em que tasks concluídas continuam visíveis no painel (null = sempre).
export const DONE_RANGES = [
  { id: '1d', label: 'Último dia', days: 1 },
  { id: '7d', label: '7 dias', days: 7 },
  { id: '30d', label: '30 dias', days: 30 },
  { id: 'all', label: 'Tudo', days: null },
] as const

export type DoneRange = (typeof DONE_RANGES)[number]['id']
export const DEFAULT_DONE_RANGE: DoneRange = '7d'

export function isDoneRange(value: unknown): value is DoneRange {
  return DONE_RANGES.some((range) => range.id === value)
}

export const TODO_SORTS = [
  { id: 'created', label: 'Criação' },
  { id: 'priority', label: 'Prioridade' },
] as const

export type TodoSort = (typeof TODO_SORTS)[number]['id']
export const DEFAULT_TODO_SORT: TodoSort = 'created'

export function isTodoSort(value: unknown): value is TodoSort {
  return TODO_SORTS.some((sort) => sort.id === value)
}

export const PRIORITY_WEIGHT = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const

export const PRIORITY_LABEL = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
} as const

// Data de corte da coluna "Feito"; null = sem corte.
export function doneCutoff(range: DoneRange, now = Date.now()): number | null {
  const days = DONE_RANGES.find((r) => r.id === range)?.days ?? null
  return days === null ? null : now - days * 24 * 60 * 60 * 1000
}
