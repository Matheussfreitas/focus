import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { DEFAULT_LAYOUT, LAYOUT_COOKIE, isLayoutId } from '#/lib/layout.ts'
import { DEFAULT_PALETTE, PALETTE_COOKIE, isPaletteId } from '#/lib/palette.ts'
import {
  DEFAULT_DONE_RANGE,
  DEFAULT_TODO_SORT,
  DONE_RANGE_COOKIE,
  TODO_SORT_COOKIE,
  isDoneRange,
  isTodoSort,
} from '#/lib/taskFilters.ts'

// Lê as preferências salvas em cookie para o SSR já nascer com a paleta e o
// layout escolhidos, sem piscar o padrão antes da hidratação.
export const getPreferences = createServerFn({ method: 'GET' }).handler(() => {
  const layout = getCookie(LAYOUT_COOKIE)
  const palette = getCookie(PALETTE_COOKIE)
  const doneRange = getCookie(DONE_RANGE_COOKIE)
  const todoSort = getCookie(TODO_SORT_COOKIE)
  return {
    layout: isLayoutId(layout) ? layout : DEFAULT_LAYOUT,
    palette: isPaletteId(palette) ? palette : DEFAULT_PALETTE,
    doneRange: isDoneRange(doneRange) ? doneRange : DEFAULT_DONE_RANGE,
    todoSort: isTodoSort(todoSort) ? todoSort : DEFAULT_TODO_SORT,
  }
})
