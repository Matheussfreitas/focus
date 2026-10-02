import { prisma } from '#/db.ts'
import bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
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
      hash: (password: string) => bcrypt.hash(password, 10),
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
  plugins: [tanstackStartCookies()],
})
