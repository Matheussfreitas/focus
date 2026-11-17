// Utilitários do dashboard compartilhados entre servidor e navegador.
// Os dias são contados no fuso de São Paulo (UTC-3 fixo, sem horário de
// verão desde 2019), o mesmo usado na data do header.

export const DASHBOARD_RANGES = ['7d', '30d', '90d', 'all'] as const
export type DashboardRange = (typeof DASHBOARD_RANGES)[number]
export const DEFAULT_DASHBOARD_RANGE: DashboardRange = '30d'

export const RANGE_LABEL: Record<DashboardRange, string> = {
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  all: 'TUDO',
}

export const NO_TAG_KEY = '__none'

const TIME_ZONE = 'America/Sao_Paulo'
const SP_OFFSET = '-03:00'

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  weekday: 'short',
})

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function zonedParts(date: Date) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((p) => [p.type, p.value]),
  )
  return {
    key: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour) % 24,
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
  }
}

/** 'YYYY-MM-DD' do dia em São Paulo. */
export function dayKey(date: Date) {
  return zonedParts(date).key
}

/** Soma dias a uma chave 'YYYY-MM-DD'. */
export function addDays(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Segunda-feira da semana da chave. */
export function weekKey(key: string) {
  const weekday = new Date(`${key}T12:00:00Z`).getUTCDay()
  return addDays(key, -((weekday + 6) % 7))
}

/** Meia-noite (São Paulo) da chave, como instante. */
export function startOfDayInstant(key: string) {
  return new Date(`${key}T00:00:00${SP_OFFSET}`)
}

export function formatDuration(ms: number) {
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}min`
  return minutes === 0
    ? `${hours}h`
    : `${hours}h${String(minutes).padStart(2, '0')}`
}

export function formatLead(ms: number) {
  const hours = ms / 3_600_000
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60000))}min`
  if (hours < 48) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}
