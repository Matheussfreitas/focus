import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth' // ajuste para o caminho da sua instância do Better Auth

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      throw new Error('Não autenticado')
    }

    return next({
      context: {
        userId: session.user.id,
      },
    })
  },
)