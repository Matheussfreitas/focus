import { Link, useRouterState } from '@tanstack/react-router'
import { CONTACT_EMAIL, CONTROLLER_NAME } from '#/lib/legal.ts'

const linkClass = 'hover:text-ink hover:underline'

export default function Footer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // A tela de foco ocupa a altura toda: sem rodapé lá.
  if (pathname === '/') return null

  return (
    <footer className="shrink-0 border-t border-ink/20 px-4 py-1.5 geist-mono text-[10px] uppercase tracking-wide text-ink-muted">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>
          &copy; {new Date().getFullYear()} {CONTROLLER_NAME}
        </span>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={`${linkClass} normal-case`}
        >
          {CONTACT_EMAIL}
        </a>
        <Link to="/termos" className={linkClass}>
          Termos
        </Link>
        <Link to="/privacidade" className={linkClass}>
          Privacidade
        </Link>
        <Link to="/privacidade" hash="cookies" className={linkClass}>
          Cookies
        </Link>
      </div>
    </footer>
  )
}
