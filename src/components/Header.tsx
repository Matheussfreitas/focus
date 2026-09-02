import { subHours } from 'date-fns'

export default function Header() {
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
          <div className="h-full w-0.5 bg-[#111A2B]" />
          <div className="flex items-center">
            {colors.map((color, index) => (
              <div
                key={index}
                onClick={() => console.log({ color })}
                className={`h-4 w-4 ${color} cursor-pointer`}
              />
            ))}
          </div>
          {/* <ThemeToggle /> */}
        </div>
      </nav>
    </header>
  )
}
