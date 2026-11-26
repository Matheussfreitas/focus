import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import {
  FiActivity,
  FiHelpCircle,
  FiLogOut,
  FiSettings,
  FiTarget,
  FiUser,
} from 'react-icons/fi'
import { authClient, useSession } from '#/lib/auth-client.ts'
import { canRunTour, startTour } from '#/lib/tour.ts'
import { PALETTES } from '#/lib/palette.ts'
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

const sectionLabelClass =
  'px-3 pt-2.5 pb-1 geist-mono text-[10px] uppercase tracking-widest text-ink-muted'
const itemClass =
  'cursor-pointer rounded-none px-3 geist-mono text-xs uppercase tracking-wide focus:bg-ink/10 focus:text-ink [&_svg]:text-ink'
const contentClass =
  'w-60 rounded-none border border-ink bg-sand p-0 text-ink shadow-[4px_4px_0_0_var(--color-ink)]'
const separatorClass = 'm-0 bg-ink/20'

interface PreferencesMenuProps {
  loggedIn: boolean
  layout: LayoutId
  palette: PaletteId
  onLayoutChange: (id: LayoutId) => void
  onPaletteChange: (id: PaletteId) => void
}

// Layout e cores: vivem só dentro do menu, para o header ficar limpo.
function PreferencesMenu({
  loggedIn,
  layout,
  palette,
  onLayoutChange,
  onPaletteChange,
}: PreferencesMenuProps) {
  const activePalette = PALETTES.find((item) => item.id === palette)

  return (
    <>
      <DropdownMenuLabel className={sectionLabelClass}>
        Layout
      </DropdownMenuLabel>
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
              className={`${itemClass} pl-8`}
            >
              <Icon className="h-3 w-3" />
              {item.label}
            </DropdownMenuRadioItem>
          )
        })}
      </DropdownMenuRadioGroup>

      <DropdownMenuLabel
        className={`${sectionLabelClass} flex items-baseline justify-between`}
      >
        Cores
        <span className="normal-case tracking-normal text-ink">
          {activePalette?.label}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuPrimitive.RadioGroup
        value={palette}
        onValueChange={(value) => onPaletteChange(value as PaletteId)}
        className="flex gap-1.5 px-3 pb-3 pt-1"
      >
        {PALETTES.map((item) => (
          <DropdownMenuPrimitive.RadioItem
            key={item.id}
            value={item.id}
            aria-label={`Paleta ${item.label}`}
            title={item.label}
            onSelect={(e) => e.preventDefault()}
            className={`group flex h-6 flex-1 cursor-pointer items-center justify-center outline-none ring-offset-2 ring-offset-sand focus-visible:ring-2 focus-visible:ring-ink data-[highlighted]:ring-2 data-[highlighted]:ring-ink/40 ${item.swatch}`}
          >
            <DropdownMenuPrimitive.ItemIndicator>
              <span className="block h-2 w-2 bg-cream" />
            </DropdownMenuPrimitive.ItemIndicator>
          </DropdownMenuPrimitive.RadioItem>
        ))}
      </DropdownMenuPrimitive.RadioGroup>
    </>
  )
}

export default function Header() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const onDashboard = pathname.startsWith('/dashboard')
  const onFocus = pathname === '/app'

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

  // Escolher um layout fora da tela de foco leva de volta a ela.
  const handleLayoutChange = (id: LayoutId) => {
    setLayout(id)
    if (!onFocus) void navigate({ to: '/app' })
  }

  const preferencesMenu = (
    <PreferencesMenu
      loggedIn={loggedIn}
      layout={activeLayout}
      palette={palette}
      onLayoutChange={handleLayoutChange}
      onPaletteChange={setPalette}
    />
  )

  // O tour mostra elementos da tela de foco: fora dela, volta antes.
  const handleTour = async () => {
    if (!onFocus) {
      await navigate({ to: '/app' })
      setTimeout(() => void startTour({ loggedIn }), 400)
      return
    }
    void startTour({ loggedIn })
  }

  // O conteúdo do menu só renderiza no navegador (portal ao abrir).
  const tourDisabled = typeof window !== 'undefined' && !canRunTour()
  const tourItem = (
    <DropdownMenuItem
      onSelect={() => void handleTour()}
      disabled={tourDisabled}
      className={itemClass}
    >
      <FiHelpCircle className="h-3 w-3" />
      Tour guiado
      {tourDisabled && (
        <span className="ml-auto text-[10px] normal-case tracking-normal text-ink-muted">
          só no desktop
        </span>
      )}
    </DropdownMenuItem>
  )

  return (
    // Na tela de foco o painel escuro logo abaixo já faz a divisa; nas demais
    // páginas (fundo areia) a borda precisa ser explícita.
    <header
      className={`top-0 z-50 bg-sand px-4 h-10 ${
        onFocus ? '' : 'border-b-2 border-ink'
      }`}
    >
      <nav className="h-full flex items-center gap-x-3">
        <div className="h-full min-w-0 flex items-center gap-1.5 sm:gap-2 mr-auto">
          <Link to="/app" className="font-bold text-ink">
            FOCUS
          </Link>
          <div className="hidden sm:block h-full w-0.5 bg-ink" />
          <p className="hidden sm:block text-xs text-ink-muted geist-mono whitespace-nowrap">
            {daysOfWeek[weekDay]} {day} {monthsOfYear[month]}
          </p>
          {onDashboard && (
            <>
              <div className="hidden sm:block h-full w-0.5 bg-ink" />
              <p className="text-xs text-ink geist-mono uppercase tracking-widest whitespace-nowrap">
                Dashboard
              </p>
            </>
          )}
        </div>

        <div className="h-full min-w-0 flex items-center gap-1.5 sm:gap-2 ml-auto">
          {isPending ? (
            <div className="h-4 w-16 bg-ink/20 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-tour="menu"
                  className="text-xs bg-ink text-sand rounded-none cursor-pointer px-4 py-1 geist-mono uppercase tracking-wide max-w-[45vw] truncate"
                >
                  {session.user.name || session.user.email}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className={contentClass}
              >
                <div className="flex items-center gap-2 border-b border-ink px-3 py-2.5">
                  <span className="h-2 w-2 shrink-0 bg-success" />
                  <div className="flex min-w-0 flex-col">
                    <DropdownMenuLabel className="p-0 geist-mono text-xs font-bold uppercase tracking-widest truncate">
                      {session.user.name}
                    </DropdownMenuLabel>
                    <p className="text-xs text-ink-muted geist-mono truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <DropdownMenuItem asChild className={itemClass}>
                  <Link to="/app">
                    <FiTarget className="h-3 w-3" />
                    Foco
                    {onFocus && <ActiveMark />}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={itemClass}>
                  <Link to="/dashboard">
                    <FiActivity className="h-3 w-3" />
                    Dashboard
                    {onDashboard && <ActiveMark />}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={itemClass}>
                  <Link to="/conta">
                    <FiUser className="h-3 w-3" />
                    Minha conta
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className={separatorClass} />
                {preferencesMenu}
                <DropdownMenuSeparator className={separatorClass} />
                {tourItem}
                <DropdownMenuSeparator className={separatorClass} />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => authClient.signOut()}
                  className="cursor-pointer rounded-none px-3 geist-mono text-xs uppercase tracking-wide"
                >
                  <FiLogOut className="h-3 w-3" />
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
                    data-tour="menu"
                    aria-label="Preferências"
                    title="Preferências"
                    className="flex h-6 w-6 items-center justify-center bg-ink text-sand cursor-pointer"
                  >
                    <FiSettings className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className={contentClass}
                >
                  {preferencesMenu}
                  <DropdownMenuSeparator className={separatorClass} />
                  {tourItem}
                </DropdownMenuContent>
              </DropdownMenu>
              <Login />
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function ActiveMark() {
  return <span aria-hidden className="ml-auto h-1.5 w-1.5 bg-ink" />
}
