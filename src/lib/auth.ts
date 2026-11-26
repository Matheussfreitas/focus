import { prisma } from '#/db.ts'
import { PRIVACY_VERSION, TERMS_VERSION } from '#/lib/legal.ts'
import {
  logAccess,
  purgeExpiredAccessLogs,
  requestMeta,
} from '#/server/access-log.ts'
import bcrypt from 'bcryptjs'
import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    password: {
      hash: (password: string) => bcrypt.hash(password, 12),
      verify: ({ password, hash }): Promise<boolean> =>
        bcrypt.compare(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    // valida a sessão pelo cookie assinado, sem consultar o banco a cada chamada
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    // Aceite dos Termos/Política: o cliente envia as versões, o servidor
    // confere e grava a data (LGPD: consentimento comprovável).
    additionalFields: {
      termsVersion: { type: 'string', required: false, input: true },
      privacyVersion: { type: 'string', required: false, input: true },
      termsAcceptedAt: { type: 'date', required: false, input: false },
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (
            user.termsVersion !== TERMS_VERSION ||
            user.privacyVersion !== PRIVACY_VERSION
          ) {
            throw new APIError('BAD_REQUEST', {
              message:
                'É preciso aceitar a versão atual dos Termos e da Política de Privacidade.',
            })
          }
          return { data: { ...user, termsAcceptedAt: new Date() } }
        },
        after: async (user, ctx) => {
          await logAccess(user.id, 'signup', requestMeta(ctx?.request?.headers))
        },
      },
      update: {
        // O aceite só muda por acceptTerms (que grava a data junto); o
        // /update-user do better-auth não pode alterar as versões aceitas.
        before: async (user, ctx) => {
          if (ctx && ('termsVersion' in user || 'privacyVersion' in user)) {
            throw new APIError('BAD_REQUEST', {
              message: 'O aceite dos termos não pode ser alterado por aqui.',
            })
          }
        },
      },
      delete: {
        // Os dados da conta somem em cascata; o log de acesso fica (Marco Civil).
        before: async (user, ctx) => {
          await logAccess(
            user.id,
            'account_deleted',
            requestMeta(ctx?.request?.headers),
          )
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await logAccess(session.userId, 'login', {
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
          })
          await purgeExpiredAccessLogs()
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
