import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth.ts'

// Lê a sessão no servidor (SSR) para a página já nascer sabendo se há usuário,
// sem esperar o authClient.useSession buscar de novo no navegador.
export const getServerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    })
    return session?.user
      ? { user: { id: session.user.id, name: session.user.name } }
      : null
  },
)
