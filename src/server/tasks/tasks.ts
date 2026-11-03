import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { TaskPriority, TaskStatus } from '#/generated/prisma/enums.ts'
import { prisma } from '#/db.ts';
import { authMiddleware } from '../middleware/auth'


// ---------- LISTAR ----------
export const getTasks = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return prisma.task.findMany({
      where: { userId: context.userId },
      include: { tag: true },
      orderBy: { createdAt: 'asc' },
    })
  })

// ---------- CRIAR ----------
const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  tagId: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.coerce.date().optional(),
})

export const createTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createTaskSchema)
  .handler(async ({ data, context }) => {
    return prisma.task.create({
      data: {
        ...data,
        userId: context.userId,
      },
      include: { tag: true },
    })
  })

// ---------- ATUALIZAR ----------
const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  tagId: z.string().nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().nullable().optional(),
})

export const updateTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateTaskSchema)
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data

    // O cliente reenvia a task inteira a cada edição, então completedAt só
    // muda na transição real: entra em DONE -> agora; sai de DONE -> null.
    let completedAt: Date | null | undefined
    if (rest.status !== undefined) {
      const current = await prisma.task.findFirst({
        where: { id, userId: context.userId },
        select: { status: true },
      })
      const wasDone = current?.status === TaskStatus.DONE
      const isDone = rest.status === TaskStatus.DONE
      if (isDone && !wasDone) completedAt = new Date()
      else if (!isDone && wasDone) completedAt = null
    }

    // updateMany em vez de update: garante que só atualiza se a task
    // pertence ao usuário logado (update simples não filtraria por userId
    // porque a busca é feita pela chave única `id`).
    const result = await prisma.task.updateMany({
      where: { id, userId: context.userId },
      data: { ...rest, completedAt },
    })

    if (result.count === 0) {
      throw new Error('Task não encontrada ou não pertence ao usuário')
    }

    return prisma.task.findUniqueOrThrow({
      where: { id },
      include: { tag: true },
    })
  })

// ---------- DELETAR ----------
export const deleteTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const result = await prisma.task.deleteMany({
      where: { id: data.id, userId: context.userId },
    })

    if (result.count === 0) {
      throw new Error('Task não encontrada ou não pertence ao usuário')
    }

    return { id: data.id }
  })