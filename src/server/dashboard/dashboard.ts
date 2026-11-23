import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db.ts'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import type { TagsColor, TaskPriority } from '#/generated/prisma/enums.ts'
import { authMiddleware } from '../middleware/auth'
import {
  DASHBOARD_RANGES,
  NO_TAG_KEY,
  addDays,
  dayKey,
  startOfDayInstant,
  weekKey,
  zonedParts,
} from '#/lib/dashboard.ts'
import type { DashboardRange } from '#/lib/dashboard.ts'

const DAY_MS = 24 * 60 * 60 * 1000

export interface DashboardTagRow {
  key: string
  name: string
  color: TagsColor | null
  focusMs: number
  sessions: number
  tasksDone: number
  focusPerTaskMs: number | null
  avgLeadMs: number | null
  onTimeRate: number | null
  open: number
  overdue: number
}

export interface DashboardBucket {
  key: string
  label: string
  focus: Record<string, number>
  done: number
}

export interface DashboardKpis {
  focusMs: number
  prevFocusMs: number | null
  tasksDone: number
  prevTasksDone: number | null
  sessions: number
  prevSessions: number | null
  completionRate: number | null
  prevCompletionRate: number | null
  avgSessionMs: number | null
  streak: number
  bestStreak: number
}

export interface DashboardData {
  range: DashboardRange
  granularity: 'day' | 'week'
  hasHistory: boolean
  kpis: DashboardKpis
  tags: DashboardTagRow[]
  timeline: DashboardBucket[]
  // foco por tag em grade dia-da-semana (seg=0) × hora
  rhythm: Record<string, number[][]>
  priority: Record<TaskPriority, number>
}

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

function rate(part: number, total: number) {
  return total > 0 ? part / total : null
}

// Dias seguidos com foco: a sequência atual vale até hoje (ou até ontem, se
// hoje ainda não teve foco) e a melhor é a maior de todo o histórico.
function computeStreaks(days: Set<string>, today: string) {
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const key of sorted) {
    run = prev && addDays(prev, 1) === key ? run + 1 : 1
    best = Math.max(best, run)
    prev = key
  }

  let cursor = days.has(today) ? today : addDays(today, -1)
  let current = 0
  while (days.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }
  return { current, best }
}

export const getDashboardData = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ range: z.enum(DASHBOARD_RANGES) }))
  .handler(async ({ data, context }): Promise<DashboardData> => {
    const { userId } = context
    const now = new Date()
    const today = dayKey(now)

    const [tags, allSessionDays, firstSession, firstDone] = await Promise.all([
      prisma.tags.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.focusSession.findMany({
        where: { userId },
        select: { startedAt: true },
      }),
      prisma.focusSession.findFirst({
        where: { userId },
        orderBy: { startedAt: 'asc' },
        select: { startedAt: true },
      }),
      prisma.task.findFirst({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'asc' },
        select: { completedAt: true },
      }),
    ])

    // Janela atual e a anterior de mesmo tamanho (para os deltas).
    const spanDays =
      data.range === '7d'
        ? 7
        : data.range === '30d'
          ? 30
          : data.range === '90d'
            ? 90
            : null
    const earliest = [firstSession?.startedAt, firstDone?.completedAt]
      .filter((d): d is Date => !!d)
      .sort((a, b) => a.getTime() - b.getTime())
      .at(0)
    const firstDay =
      spanDays !== null
        ? addDays(today, -(spanDays - 1))
        : earliest
          ? dayKey(earliest)
          : today
    const from = startOfDayInstant(firstDay)
    const prevFrom =
      spanDays !== null ? new Date(from.getTime() - spanDays * DAY_MS) : null

    const [sessions, doneTasks, openTasks] = await Promise.all([
      prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: prevFrom ?? from } },
        select: {
          startedAt: true,
          focusedMs: true,
          completed: true,
          tagId: true,
        },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: TaskStatus.DONE,
          completedAt: { gte: prevFrom ?? from },
        },
        select: {
          completedAt: true,
          createdAt: true,
          dueDate: true,
          tagId: true,
          priority: true,
        },
      }),
      prisma.task.findMany({
        where: { userId, status: { not: TaskStatus.DONE } },
        select: { tagId: true, dueDate: true },
      }),
    ])

    const inRange = (d: Date) => d >= from
    const current = sessions.filter((s) => inRange(s.startedAt))
    const previous = sessions.filter((s) => !inRange(s.startedAt))
    const doneCurrent = doneTasks.filter((t) => inRange(t.completedAt!))
    const donePrevious = doneTasks.filter((t) => !inRange(t.completedAt!))

    // ---------- KPIs ----------
    const sumFocus = (list: typeof sessions) =>
      list.reduce((total, s) => total + s.focusedMs, 0)
    const focusMs = sumFocus(current)
    const completedCount = current.filter((s) => s.completed).length
    const streaks = computeStreaks(
      new Set(allSessionDays.map((s) => dayKey(s.startedAt))),
      today,
    )

    const kpis: DashboardKpis = {
      focusMs,
      prevFocusMs: prevFrom ? sumFocus(previous) : null,
      tasksDone: doneCurrent.length,
      prevTasksDone: prevFrom ? donePrevious.length : null,
      sessions: current.length,
      prevSessions: prevFrom ? previous.length : null,
      completionRate: rate(completedCount, current.length),
      prevCompletionRate: prevFrom
        ? rate(previous.filter((s) => s.completed).length, previous.length)
        : null,
      avgSessionMs: current.length ? focusMs / current.length : null,
      streak: streaks.current,
      bestStreak: streaks.best,
    }

    // ---------- Por tag ----------
    const rows = new Map<string, DashboardTagRow>()
    const lead = new Map<string, { total: number; count: number }>()
    const due = new Map<string, { onTime: number; count: number }>()
    const row = (tagId: string | null) => {
      const key = tagId ?? NO_TAG_KEY
      let entry = rows.get(key)
      if (!entry) {
        const tag = tags.find((t) => t.id === tagId)
        entry = {
          key,
          name: tag?.name ?? 'Sem tag',
          color: tag?.color ?? null,
          focusMs: 0,
          sessions: 0,
          tasksDone: 0,
          focusPerTaskMs: null,
          avgLeadMs: null,
          onTimeRate: null,
          open: 0,
          overdue: 0,
        }
        rows.set(key, entry)
      }
      return entry
    }

    for (const s of current) {
      const entry = row(s.tagId)
      entry.focusMs += s.focusedMs
      entry.sessions++
    }
    for (const t of doneCurrent) {
      const entry = row(t.tagId)
      entry.tasksDone++
      const l = lead.get(entry.key) ?? { total: 0, count: 0 }
      l.total += t.completedAt!.getTime() - t.createdAt.getTime()
      l.count++
      lead.set(entry.key, l)
      if (t.dueDate) {
        const d = due.get(entry.key) ?? { onTime: 0, count: 0 }
        d.count++
        if (dayKey(t.completedAt!) <= dayKey(t.dueDate)) d.onTime++
        due.set(entry.key, d)
      }
    }
    for (const t of openTasks) {
      const entry = row(t.tagId)
      entry.open++
      if (t.dueDate && dayKey(t.dueDate) < today) entry.overdue++
    }
    for (const entry of rows.values()) {
      if (entry.tasksDone > 0 && entry.focusMs > 0) {
        entry.focusPerTaskMs = entry.focusMs / entry.tasksDone
      }
      const l = lead.get(entry.key)
      if (l) entry.avgLeadMs = l.total / l.count
      const d = due.get(entry.key)
      if (d) entry.onTimeRate = d.onTime / d.count
    }
    const tagRows = [...rows.values()].sort(
      (a, b) => b.focusMs - a.focusMs || b.tasksDone - a.tasksDone,
    )

    // ---------- Linha do tempo ----------
    const totalDays =
      Math.round(
        (startOfDayInstant(today).getTime() - from.getTime()) / DAY_MS,
      ) + 1
    const granularity = totalDays > 120 ? 'week' : 'day'
    const bucketOf = (d: Date) =>
      granularity === 'week' ? weekKey(dayKey(d)) : dayKey(d)

    const timeline: DashboardBucket[] = []
    const byKey = new Map<string, DashboardBucket>()
    for (let i = 0; i < totalDays; i++) {
      const day = addDays(firstDay, i)
      const key = granularity === 'week' ? weekKey(day) : day
      if (byKey.has(key)) continue
      const [, m, d] = key.split('-')
      const weekday = new Date(`${key}T12:00:00Z`).getUTCDay()
      const bucket: DashboardBucket = {
        key,
        label:
          granularity === 'day' && totalDays <= 14
            ? `${WEEKDAYS[weekday]} ${Number(d)}`
            : `${d}/${m}`,
        focus: {},
        done: 0,
      }
      byKey.set(key, bucket)
      timeline.push(bucket)
    }
    for (const s of current) {
      const bucket = byKey.get(bucketOf(s.startedAt))
      if (!bucket) continue
      const tagKey = s.tagId ?? NO_TAG_KEY
      bucket.focus[tagKey] = (bucket.focus[tagKey] ?? 0) + s.focusedMs
    }
    for (const t of doneCurrent) {
      const bucket = byKey.get(bucketOf(t.completedAt!))
      if (bucket) bucket.done++
    }

    // ---------- Ritmo (dia da semana × hora, segunda primeiro) ----------
    const rhythm: Record<string, number[][]> = {}
    for (const s of current) {
      const tagKey = s.tagId ?? NO_TAG_KEY
      rhythm[tagKey] ??= Array.from({ length: 7 }, () =>
        Array<number>(24).fill(0),
      )
      const { weekday, hour } = zonedParts(s.startedAt)
      rhythm[tagKey][(weekday + 6) % 7][hour] += s.focusedMs
    }

    // ---------- Prioridade ----------
    const priority: Record<TaskPriority, number> = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    }
    for (const t of doneCurrent) priority[t.priority]++

    return {
      range: data.range,
      granularity,
      hasHistory: allSessionDays.length > 0 || !!firstDone,
      kpis,
      tags: tagRows,
      timeline,
      rhythm,
      priority,
    }
  })
