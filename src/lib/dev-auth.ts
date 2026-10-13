// Login automático para desenvolvimento local (ver .env.dev.example).
// `import.meta.env.DEV` é falso no build de produção, então o bypass some do
// bundle e nunca vale fora do `vite dev`.
export const DEV_USER = {
  id: 'dev-user',
  name: 'Dev',
  email: 'dev@focus.local',
}

export function isDevAuthBypass() {
  return (
    import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
  )
}
