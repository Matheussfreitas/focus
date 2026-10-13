const ONE_YEAR = 60 * 60 * 24 * 365

// Preferências ficam em cookie para o servidor já renderizar a página certa.
export function setPreferenceCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; samesite=lax`
}

export function hasCookie(name: string) {
  return document.cookie
    .split('; ')
    .some((cookie) => cookie.startsWith(`${name}=`))
}
