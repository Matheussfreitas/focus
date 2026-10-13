import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LAYOUT_COOKIE } from './layout'
import type { LayoutId } from './layout'
import { setPreferenceCookie } from './cookie'
import { migrateLegacyPalette, setPalette as applyPalette } from './palette'
import type { PaletteId } from './palette'

interface Preferences {
  layout: LayoutId
  palette: PaletteId
  setLayout: (id: LayoutId) => void
  setPalette: (id: PaletteId) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

// Header e página compartilham o layout/paleta. O valor inicial vem do cookie
// lido no servidor, então SSR e cliente renderizam igual.
export function PreferencesProvider({
  initial,
  children,
}: {
  initial: { layout: LayoutId; palette: PaletteId }
  children: React.ReactNode
}) {
  const [layout, setLayoutState] = useState(initial.layout)
  const [palette, setPaletteState] = useState(initial.palette)

  useEffect(() => {
    const migrated = migrateLegacyPalette()
    if (migrated) setPaletteState(migrated)
  }, [])

  const value = useMemo<Preferences>(
    () => ({
      layout,
      palette,
      setLayout: (id) => {
        setPreferenceCookie(LAYOUT_COOKIE, id)
        setLayoutState(id)
      },
      setPalette: (id) => {
        applyPalette(id)
        setPaletteState(id)
      },
    }),
    [layout, palette],
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
