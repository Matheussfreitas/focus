import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db.ts'
import { authMiddleware } from '../middleware/auth'

const MAX_FOCUS_MS = 6 * 60 * 60 * 1000

const logFocusSessionSchema = z.object({
  taskId: z.string().nullish(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  focusedMs: z.number().int().min(0).max(MAX_FOCUS_MS),
  plannedMs: z.number().int().min(0).max(MAX_FOCUS_MS),
  completed: z.boolean(),
})

// ---------- REGISTRAR BLOCO DE FOCO ----------
// A tag é resolvida aqui a partir da task (e não enviada pelo cliente): assim
// só vale uma task do próprio usuário e a tag fica "fotografada" no momento.
export const logFocusSession = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(logFocusSessionSchema)
  .handler(async ({ data, context }) => {
    const task = data.taskId
      ? await prisma.task.findFirst({
          where: { id: data.taskId, userId: context.userId },
          select: { id: true, tagId: true },
        })
      : null

    return prisma.focusSession.create({
      data: {
        userId: context.userId,
        taskId: task?.id ?? null,
        tagId: task?.tagId ?? null,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
        focusedMs: data.focusedMs,
        plannedMs: data.plannedMs,
        completed: data.completed,
      },
      select: { id: true },
    })
  })
