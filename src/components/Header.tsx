import { subHours } from 'date-fns'
import { authClient } from '#/lib/auth-client.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Login } from './login';

export default function Header() {
  const { data: session, isPending } = authClient.useSession()

  const day = subHours(new Date(), 3).getDate()
  const month = new Date().getMonth()
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

  const colors = [
    'bg-[#1D396E]',
    'bg-[#111A2B]',
    'bg-[#17453A]',
    'bg-[#6B3A1E]',
    'bg-[#5A1F33]',
  ]

  return (
    <header className="top-0 z-50 bg-[#EDE7DC] px-4 h-10">
      <nav className="h-full page-wrap flex flex-wrap items-center gap-x-3">
        <div className="h-full flex items-center gap-1.5 sm:gap-2 mr-auto">
          <p className="font-bold text-[#111A2B]">FOCUS</p>
          <div className="h-full w-0.5 bg-[#111A2B]" />
          <p className="text-xs text-[#5D5344] geist-mono">
            {daysOfWeek[day]} {day} {monthsOfYear[month]}
          </p>
        </div>

        <div className="h-full flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* <BetterAuthHeader /> */}
          <div className="flex items-center">
            {colors.map((color, index) => (
              <div
                key={index}
                onClick={() => console.log({ color })}
                className={`h-4 w-4 ${color} cursor-pointer`}
              />
            ))}
          </div>
          <div className="h-full w-0.5 bg-[#111A2B]" />
          {isPending ? (
            <div className="h-4 w-16 bg-[#111A2B]/20 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs bg-[#111A2B] text-[#EDE7DC] rounded-none cursor-pointer px-4 py-1 geist-mono uppercase tracking-wide">
                  {session.user.name || session.user.email}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="rounded-none border border-[#111A2B] bg-[#EDE7DC] p-0 text-[#111A2B] shadow-none"
              >
                <div className="flex items-center gap-2 border-b border-[#111A2B] px-3 py-2">
                  <span className="h-2 w-2 shrink-0 bg-green-500" />
                  <div className="flex flex-col">
                    <DropdownMenuLabel className="p-0 geist-mono text-xs font-bold uppercase tracking-widest">
                      {session.user.name}
                    </DropdownMenuLabel>
                    <p className="text-xs text-[#5D5344] geist-mono">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="m-0 bg-[#111A2B]/20" />
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
