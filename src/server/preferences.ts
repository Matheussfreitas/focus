import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { DEFAULT_LAYOUT, LAYOUT_COOKIE, isLayoutId } from '#/lib/layout.ts'
import { DEFAULT_PALETTE, PALETTE_COOKIE, isPaletteId } from '#/lib/palette.ts'

// Lê as preferências salvas em cookie para o SSR já nascer com a paleta e o
// layout escolhidos, sem piscar o padrão antes da hidratação.
export const getPreferences = createServerFn({ method: 'GET' }).handler(() => {
  const layout = getCookie(LAYOUT_COOKIE)
  const palette = getCookie(PALETTE_COOKIE)
  return {
    layout: isLayoutId(layout) ? layout : DEFAULT_LAYOUT,
    palette: isPaletteId(palette) ? palette : DEFAULT_PALETTE,
  }
})
