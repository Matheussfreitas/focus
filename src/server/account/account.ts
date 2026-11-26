import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { prisma } from '#/db.ts'
import { PRIVACY_VERSION, TERMS_VERSION } from '#/lib/legal.ts'
import { logAccess, requestMeta } from '../access-log'
import { authMiddleware } from '../middleware/auth'

// ---------- SITUAÇÃO DA CONTA ----------
export const getAccount = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        name: true,
        email: true,
        createdAt: true,
        termsAcceptedAt: true,
        termsVersion: true,
        privacyVersion: true,
      },
    })
    if (!user) throw new Error('Usuário não encontrado')
    return {
      ...user,
      needsTermsAcceptance:
        user.termsVersion !== TERMS_VERSION ||
        user.privacyVersion !== PRIVACY_VERSION,
    }
  })

// ---------- ACEITE DOS TERMOS (usuários antigos ou versão nova) ----------
export const acceptTerms = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      termsVersion: z.literal(TERMS_VERSION),
      privacyVersion: z.literal(PRIVACY_VERSION),
    }),
  )
  .handler(async ({ data, context }) => {
    await prisma.user.update({
      where: { id: context.userId },
      data: {
        termsVersion: data.termsVersion,
        privacyVersion: data.privacyVersion,
        termsAcceptedAt: new Date(),
      },
    })
    return { ok: true }
  })

// ---------- EXPORTAR DADOS (LGPD art. 18, portabilidade/acesso) ----------
// Tudo o que é guardado sobre o titular, sem segredos (hash de senha, tokens).
export const exportMyData = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.userId
    const [user, tasks, tags, focusSessions, sessions, accessLogs] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            termsAcceptedAt: true,
            termsVersion: true,
            privacyVersion: true,
          },
        }),
        prisma.task.findMany({ where: { userId } }),
        prisma.tags.findMany({ where: { userId } }),
        prisma.focusSession.findMany({ where: { userId } }),
        prisma.session.findMany({
          where: { userId },
          select: {
            createdAt: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
          },
        }),
        prisma.accessLog.findMany({
          where: { userId },
          select: {
            event: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

    await logAccess(userId, 'data_export', requestMeta(getRequest().headers))

    return {
      exportedAt: new Date().toISOString(),
      user,
      tasks,
      tags,
      focusSessions,
      sessions,
      accessLogs,
    }
  })
