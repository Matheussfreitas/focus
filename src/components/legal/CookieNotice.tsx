import { useEffect, useState } from 'react'
import { hasCookie, setPreferenceCookie } from '#/lib/cookie.ts'

const NOTICE_COOKIE = 'cookie-notice'

// Aviso informativo: só há cookies essenciais e de preferência, então nada é
// bloqueado até o "Entendi" — ele só esconde o aviso.
export function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!hasCookie(NOTICE_COOKIE))
  }, [])

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-xl flex-col gap-3 border border-ink bg-sand p-4 text-sm text-ink shadow-[4px_4px_0_0_var(--color-ink)] sm:flex-row sm:items-center"
    >
      <p className="flex-1 leading-snug">
        Usamos apenas cookies essenciais e de preferência, sem rastreamento.{' '}
        <a href="/privacidade#cookies" className="font-semibold underline">
          Saiba mais
        </a>
      </p>
      <button
        type="button"
        onClick={() => {
          setPreferenceCookie(NOTICE_COOKIE, '1')
          setVisible(false)
        }}
        className="bg-ink px-4 py-1.5 text-sand geist-mono text-xs uppercase tracking-wide cursor-pointer"
      >
        Entendi
      </button>
    </div>
  )
}
