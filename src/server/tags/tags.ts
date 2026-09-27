import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { TagsColor } from '#/generated/prisma/enums.ts'
import { prisma } from '#/db.ts';
import { authMiddleware } from '../middleware/auth'

// ---------- LISTAR ----------
export const getTags = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return prisma.tags.findMany({
      where: { userId: context.userId },
      orderBy: { createdAt: 'asc' },
    })
  })

// ---------- CRIAR ----------
const createTagSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.nativeEnum(TagsColor),
})

export const createTag = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createTagSchema)
  .handler(async ({ data, context }) => {
    return prisma.tags.create({
      data: {
        ...data,
        userId: context.userId,
      },
    })
  })

// ---------- ATUALIZAR ----------
const updateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  color: z.nativeEnum(TagsColor).optional(),
})

export const updateTag = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateTagSchema)
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data

    const result = await prisma.tags.updateMany({
      where: { id, userId: context.userId },
      data: rest,
    })

    if (result.count === 0) {
      throw new Error('Tag não encontrada ou não pertence ao usuário')
    }

    return prisma.tags.findUniqueOrThrow({
      where: { id },
    })
  })

// ---------- DELETAR ----------
export const deleteTag = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const result = await prisma.tags.deleteMany({
      where: { id: data.id, userId: context.userId },
    })

    if (result.count === 0) {
      throw new Error('Tag não encontrada ou não pertence ao usuário')
    }

    return { id: data.id }
  })
