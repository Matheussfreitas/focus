import { createAuthClient } from 'better-auth/react'
import { DEV_USER, isDevAuthBypass } from './dev-auth'

export const authClient = createAuthClient()

const devSession = {
  data: { user: DEV_USER },
  isPending: false,
} as const

// Use no lugar de authClient.useSession: em dev com bypass, já entra logado.
export function useSession() {
  const session = authClient.useSession()
  return isDevAuthBypass() ? devSession : session
}
