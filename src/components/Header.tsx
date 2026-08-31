import BetterAuthHeader from '../integrations/better-auth/header-user.tsx';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const day = new Date().getDay()
  const month = new Date().getMonth()
  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
  const monthsOfYear = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

  return (
    <header className="top-0 z-50 bg-[#EDE7DC] px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2 py-3 mr-auto">
          <div className="border font-extrabold text-[#111A2B]">FOCUS</div>
          <div className="text-sm font-medium text-[#5D5344]">
            {daysOfWeek[day]} {day} {monthsOfYear[month]}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
