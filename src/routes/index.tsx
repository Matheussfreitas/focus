import { createFileRoute, redirect } from '@tanstack/react-router'
import { Landing } from '#/components/landing/Landing.tsx'
import { isDevAuthBypass } from '#/lib/dev-auth.ts'
import { getServerSession } from '#/server/auth/session.ts'

const SITE_URL = 'https://focus.matheusfreitas.dev.br'
const TITLE = 'Focus · Pomodoro e kanban para estudo e trabalho'
const DESCRIPTION =
  'Timer pomodoro, kanban de tarefas e dashboard de foco no mesmo lugar. Grátis, e o timer funciona sem cadastro.'

export const Route = createFileRoute('/')({
  // Quem já tem conta vai direto para o app. Com o login automático de dev
  // todo mundo estaria "logado", então a landing fica sempre acessível.
  beforeLoad: async () => {
    if (isDevAuthBypass()) return
    const session = await getServerSession()
    if (session) throw redirect({ to: '/app' })
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:site_name', content: 'Focus' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: `${SITE_URL}/` },
      { property: 'og:image', content: `${SITE_URL}/og.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: TITLE },
      { name: 'twitter:description', content: DESCRIPTION },
      { name: 'twitter:image', content: `${SITE_URL}/og.png` },
      { name: 'theme-color', content: '#ede7dc' },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/` }],
  }),
  component: Landing,
})
