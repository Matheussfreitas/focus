import { authClient } from '#/lib/auth-client.ts'
import { useEffect, useState } from 'react'
import { startTour } from '#/lib/tour.ts'
import {
  DEFAULT_PALETTE,
  PALETTES,
  getPalette,
  setPalette,
} from '#/lib/palette.ts'
import type { PaletteId } from '#/lib/palette.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Login } from './login'

export default function Header() {
  const { data: session, isPending } = authClient.useSession()

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

  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE)

  useEffect(() => {
    setPaletteState(getPalette())
  }, [])

  const handleSelectPalette = (id: PaletteId) => {
    setPalette(id)
    setPaletteState(id)
  }

  return (
    <header className="top-0 z-50 bg-sand px-4 h-10">
      <nav className="h-full page-wrap flex flex-wrap items-center gap-x-3">
        <div className="h-full flex items-center gap-1.5 sm:gap-2 mr-auto">
          <p className="font-bold text-ink">FOCUS</p>
          <div className="h-full w-0.5 bg-ink" />
          <p className="text-xs text-ink-muted geist-mono">
            {daysOfWeek[weekDay]} {day} {monthsOfYear[month]}
          </p>
        </div>

        <div className="h-full flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* <BetterAuthHeader /> */}
          <button
            type="button"
            aria-label="Ver tour guiado"
            title="Ver tour guiado"
            onClick={() => void startTour({ loggedIn: !!session?.user })}
            className="hidden md:flex h-4 w-4 items-center justify-center bg-ink text-sand text-[10px] font-bold geist-mono cursor-pointer"
          >
            ?
          </button>
          <div className="flex items-center" data-tour="palette">
            {PALETTES.map((item) => {
              const selected = palette === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Paleta ${item.label}`}
                  aria-pressed={selected}
                  title={item.label}
                  onClick={() => handleSelectPalette(item.id)}
                  className={`flex items-center justify-center cursor-pointer h-4 w-4 ${item.swatch}`}
                >
                  {selected && <span className="h-3 w-3 border border-cream" />}
                </button>
              )
            })}
          </div>
          <div className="h-full w-0.5 bg-ink" />
          {isPending ? (
            <div className="h-4 w-16 bg-ink/20 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs bg-ink text-sand rounded-none cursor-pointer px-4 py-1 geist-mono uppercase tracking-wide">
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
            <Login />
          )}
          {/* <ThemeToggle /> */}
        </div>
      </nav>
    </header>
  )
}
