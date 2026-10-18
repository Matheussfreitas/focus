import { authClient, useSession } from '#/lib/auth-client.ts'
import { startTour } from '#/lib/tour.ts'
import { PALETTES } from '#/lib/palette.ts'
import { FiSettings } from 'react-icons/fi'
import { LAYOUTS, resolveLayout } from '#/lib/layout.ts'
import type { LayoutId } from '#/lib/layout.ts'
import type { PaletteId } from '#/lib/palette.ts'
import { usePreferences } from '#/lib/preferences.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Login } from './login'

interface PreferencesMenuProps {
  loggedIn: boolean
  layout: LayoutId
  palette: PaletteId
  onLayoutChange: (id: LayoutId) => void
  onPaletteChange: (id: PaletteId) => void
}

// Layout e cores dentro do dropdown: usado em telas pequenas, onde os
// controles inline do header não cabem.
function PreferencesMenu({
  loggedIn,
  layout,
  palette,
  onLayoutChange,
  onPaletteChange,
}: PreferencesMenuProps) {
  const labelClass =
    'px-3 pt-2 pb-1 geist-mono text-[10px] uppercase tracking-widest text-ink-muted'
  const itemClass =
    'cursor-pointer rounded-none geist-mono text-xs uppercase tracking-wide focus:bg-ink/10 focus:text-ink'

  return (
    <>
      <DropdownMenuLabel className={labelClass}>Layout</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={layout}
        onValueChange={(value) => onLayoutChange(value as LayoutId)}
      >
        {LAYOUTS.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuRadioItem
              key={item.id}
              value={item.id}
              disabled={item.requiresAuth && !loggedIn}
              onSelect={(e) => e.preventDefault()}
              className={itemClass}
            >
              <Icon className="h-3 w-3" />
              {item.label}
            </DropdownMenuRadioItem>
          )
        })}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator className="m-0 bg-ink/20" />
      <DropdownMenuLabel className={labelClass}>Cores</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={palette}
        onValueChange={(value) => onPaletteChange(value as PaletteId)}
      >
        {PALETTES.map((item) => (
          <DropdownMenuRadioItem
            key={item.id}
            value={item.id}
            onSelect={(e) => e.preventDefault()}
            className={itemClass}
          >
            <span className={`h-3 w-3 shrink-0 ${item.swatch}`} />
            {item.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  )
}

export default function Header() {
  const { data: session, isPending } = useSession()

  const today = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  )
  const weekDay = today.getDay()
  const day = today.getDate()
  const month = today.getMonth()
  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
  const monthsOfYear = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ]

  const { palette, setPalette, layout, setLayout } = usePreferences()
  const loggedIn = !!session?.user
  const activeLayout = resolveLayout(layout, loggedIn)
  const preferencesMenu = (
    <PreferencesMenu
      loggedIn={loggedIn}
      layout={activeLayout}
      palette={palette}
      onLayoutChange={setLayout}
      onPaletteChange={setPalette}
    />
  )

  return (
    <header className="top-0 z-50 bg-sand px-4 h-10">
      <nav className="h-full flex items-center gap-x-3">
        <div className="h-full min-w-0 flex items-center gap-1.5 sm:gap-2 mr-auto">
          <p className="font-bold text-ink">FOCUS</p>
          <div className="hidden sm:block h-full w-0.5 bg-ink" />
          <p className="hidden sm:block text-xs text-ink-muted geist-mono whitespace-nowrap">
            {daysOfWeek[weekDay]} {day} {monthsOfYear[month]}
          </p>
        </div>

        <div className="h-full min-w-0 flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* <BetterAuthHeader /> */}
          <button
            type="button"
            aria-label="Ver tour guiado"
            title="Ver tour guiado"
            onClick={() => void startTour({ loggedIn })}
            className="hidden lg:flex h-4 w-4 items-center justify-center bg-ink text-sand text-[10px] font-bold geist-mono cursor-pointer"
          >
            ?
          </button>
          <div
            className="hidden lg:flex items-center gap-0.5"
            data-tour="layout"
          >
            {LAYOUTS.map((item) => {
              const selected = activeLayout === item.id
              const disabled = item.requiresAuth && !loggedIn
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Layout ${item.label}`}
                  aria-pressed={selected}
                  title={
                    disabled ? `${item.label} (entre para usar)` : item.label
                  }
                  disabled={disabled}
                  onClick={() => setLayout(item.id)}
                  className={`flex items-center justify-center h-5 w-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 ${
                    selected ? 'bg-ink text-sand' : 'text-ink'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </button>
              )
            })}
          </div>
          <div className="hidden lg:block h-full w-0.5 bg-ink" />
          <div className="hidden lg:flex items-center" data-tour="palette">
            {PALETTES.map((item) => {
              const selected = palette === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Paleta ${item.label}`}
                  aria-pressed={selected}
                  title={item.label}
                  onClick={() => setPalette(item.id)}
                  className={`flex items-center justify-center cursor-pointer h-4 w-4 ${item.swatch}`}
                >
                  {selected && <span className="h-3 w-3 border border-cream" />}
                </button>
              )
            })}
          </div>
          <div className="hidden lg:block h-full w-0.5 bg-ink" />
          {isPending ? (
            <div className="h-4 w-16 bg-ink/20 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs bg-ink text-sand rounded-none cursor-pointer px-4 py-1 geist-mono uppercase tracking-wide max-w-[45vw] truncate">
                  {session.user.name || session.user.email}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="rounded-none border border-ink bg-sand p-0 text-ink shadow-none"
              >
                <div className="flex items-center gap-2 border-b border-ink px-3 py-2">
                  <span className="h-2 w-2 shrink-0 bg-success" />
                  <div className="flex flex-col">
                    <DropdownMenuLabel className="p-0 geist-mono text-xs font-bold uppercase tracking-widest">
                      {session.user.name}
                    </DropdownMenuLabel>
                    <p className="text-xs text-ink-muted geist-mono">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="m-0 bg-ink/20" />
                <div className="lg:hidden">
                  {preferencesMenu}
                  <DropdownMenuSeparator className="m-0 bg-ink/20" />
                </div>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => authClient.signOut()}
                  className="cursor-pointer justify-center rounded-none geist-mono text-xs uppercase tracking-wide"
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Layout e cores"
                    title="Layout e cores"
                    className="lg:hidden flex h-6 w-6 items-center justify-center bg-ink text-sand cursor-pointer"
                  >
                    <FiSettings className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="rounded-none border border-ink bg-sand p-0 text-ink shadow-none"
                >
                  {preferencesMenu}
                </DropdownMenuContent>
              </DropdownMenu>
              <Login />
            </>
          )}
          {/* <ThemeToggle /> */}
        </div>
      </nav>
    </header>
  )
}
