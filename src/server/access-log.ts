import { prisma } from '#/db.ts'
import { ACCESS_LOG_RETENTION_DAYS } from '#/lib/legal.ts'

export type AccessEvent = 'signup' | 'login' | 'account_deleted' | 'data_export'

const DAY_MS = 24 * 60 * 60 * 1000

export function requestMeta(headers?: Headers | null) {
  const forwarded = headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
  return {
    ipAddress: forwarded || headers?.get('x-real-ip') || null,
    userAgent: headers?.get('user-agent') || null,
  }
}

// Falha no log não pode derrubar o login: registra o erro e segue.
export async function logAccess(
  userId: string,
  event: AccessEvent,
  meta: { ipAddress?: string | null; userAgent?: string | null },
) {
  try {
    await prisma.accessLog.create({
      data: {
        userId,
        event,
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
      },
    })
  } catch (error) {
    console.error('Falha ao gravar access_log', error)
  }
}

// Limpeza oportunista: roda a cada login, sem precisar de cron.
export async function purgeExpiredAccessLogs() {
  const cutoff = new Date(Date.now() - ACCESS_LOG_RETENTION_DAYS * DAY_MS)
  try {
    await prisma.accessLog.deleteMany({ where: { createdAt: { lt: cutoff } } })
  } catch (error) {
    console.error('Falha ao limpar access_log', error)
  }
}
