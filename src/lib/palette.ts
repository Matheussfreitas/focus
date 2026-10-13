import { hasCookie, setPreferenceCookie } from './cookie'

export const PALETTES = [
  { id: 'ocean', label: 'Oceano', swatch: 'bg-palette-ocean' },
  { id: 'midnight', label: 'Meia-noite', swatch: 'bg-palette-midnight' },
  { id: 'green', label: 'Verde', swatch: 'bg-palette-green' },
  { id: 'orange', label: 'Laranja', swatch: 'bg-palette-orange' },
  { id: 'pink', label: 'Rosa', swatch: 'bg-palette-pink' },
] as const

export type PaletteId = (typeof PALETTES)[number]['id']

export const DEFAULT_PALETTE: PaletteId = 'ocean'
export const PALETTE_COOKIE = 'palette'
// chave usada quando a paleta ficava no localStorage
const LEGACY_STORAGE_KEY = 'palette'

export function isPaletteId(value: unknown): value is PaletteId {
  return PALETTES.some((palette) => palette.id === value)
}

export function setPalette(id: PaletteId) {
  document.documentElement.dataset.palette = id
  setPreferenceCookie(PALETTE_COOKIE, id)
}

/**
 * Leva a paleta salva no localStorage (versão antiga) para o cookie, uma vez.
 * Retorna a paleta migrada, se houver.
 * TODO: remover quando os usuários antigos já tiverem migrado.
 */
export function migrateLegacyPalette(): PaletteId | null {
  try {
    const stored = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (stored === null) return null
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    if (hasCookie(PALETTE_COOKIE) || !isPaletteId(stored)) return null
    setPalette(stored)
    return stored
  } catch {
    return null
  }
}
