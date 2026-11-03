import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LAYOUT_COOKIE } from './layout'
import type { LayoutId } from './layout'
import { setPreferenceCookie } from './cookie'
import { migrateLegacyPalette, setPalette as applyPalette } from './palette'
import type { PaletteId } from './palette'
import { DONE_RANGE_COOKIE, TODO_SORT_COOKIE } from './taskFilters'
import type { DoneRange, TodoSort } from './taskFilters'

interface Preferences {
  layout: LayoutId
  palette: PaletteId
  doneRange: DoneRange
  todoSort: TodoSort
  setLayout: (id: LayoutId) => void
  setPalette: (id: PaletteId) => void
  setDoneRange: (id: DoneRange) => void
  setTodoSort: (id: TodoSort) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

// Header e página compartilham o layout/paleta. O valor inicial vem do cookie
// lido no servidor, então SSR e cliente renderizam igual.
export function PreferencesProvider({
  initial,
  children,
}: {
  initial: {
    layout: LayoutId
    palette: PaletteId
    doneRange: DoneRange
    todoSort: TodoSort
  }
  children: React.ReactNode
}) {
  const [layout, setLayoutState] = useState(initial.layout)
  const [palette, setPaletteState] = useState(initial.palette)
  const [doneRange, setDoneRangeState] = useState(initial.doneRange)
  const [todoSort, setTodoSortState] = useState(initial.todoSort)

  useEffect(() => {
    const migrated = migrateLegacyPalette()
    if (migrated) setPaletteState(migrated)
  }, [])

  const value = useMemo<Preferences>(
    () => ({
      layout,
      palette,
      doneRange,
      todoSort,
      setDoneRange: (id) => {
        setPreferenceCookie(DONE_RANGE_COOKIE, id)
        setDoneRangeState(id)
      },
      setTodoSort: (id) => {
        setPreferenceCookie(TODO_SORT_COOKIE, id)
        setTodoSortState(id)
      },
      setLayout: (id) => {
        setPreferenceCookie(LAYOUT_COOKIE, id)
        setLayoutState(id)
      },
      setPalette: (id) => {
        applyPalette(id)
        setPaletteState(id)
      },
    }),
    [layout, palette, doneRange, todoSort],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error(
      'usePreferences precisa estar dentro de PreferencesProvider',
    )
  }
  return context
}
