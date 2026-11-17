import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { getServerSession } from '#/server/auth/session.ts'
import { DASHBOARD_RANGES, DEFAULT_DASHBOARD_RANGE } from '#/lib/dashboard.ts'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import { Dashboard } from '../components/dashboard/Dashboard'
import { dashboardQueryOptions } from '../components/dashboard/queries.dashboard'
import { tasksQueryOptions } from '../components/kanban/queries.task'
import { FloatingPomodoro } from '../components/pomodoro/FloatingPomodoro'
import { usePomodoroContext } from '../components/pomodoro/PomodoroProvider'

const searchSchema = z.object({
  // opcional: links para /dashboard não precisam informar o período
  range: z.enum(DASHBOARD_RANGES).optional().catch(undefined),
})

export const Route = createFileRoute('/dashboard')({
  validateSearch: searchSchema,
  // O dashboard é por usuário: visitante volta para o timer.
  beforeLoad: async () => {
    const session = await getServerSession()
    if (!session) throw redirect({ to: '/' })
    return { session }
  },
  loaderDeps: ({ search }) => ({
    range: search.range ?? DEFAULT_DASHBOARD_RANGE,
  }),
  // Aguarda os dados: o HTML já sai com os números (e sem divergir na
  // hidratação). Trocar de período reaproveita o placeholder no cliente.
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions(deps.range)),
  head: () => ({ meta: [{ title: 'Dashboard · Focus' }] }),
  component: DashboardPage,
})

function DashboardPage() {
  const range = Route.useSearch({
    select: (s) => s.range ?? DEFAULT_DASHBOARD_RANGE,
  })
  const navigate = Route.useNavigate()
  const {
    pomodoro,
    activeTaskId,
    setActiveTaskId,
    floatingOpen,
    setFloatingOpen,
  } = usePomodoroContext()

  // O timer continua rodando aqui: aparece na janela flutuante.
  const { data: tasks } = useQuery(tasksQueryOptions)
  const activeTask =
    tasks?.find((t) => t.id === activeTaskId && t.status !== TaskStatus.DONE) ??
    null
  const showTimer = pomodoro.isRunning || floatingOpen || activeTaskId !== null

  return (
    <>
      <Dashboard
        range={range}
        onRangeChange={(next) =>
          void navigate({ search: { range: next }, replace: true })
        }
      />
      {showTimer && (
        <FloatingPomodoro
          state={pomodoro}
          activeTask={activeTask}
          onClearTask={() => {
            pomodoro.interruptFocus()
            setActiveTaskId(null)
          }}
          open={floatingOpen}
          onOpenChange={setFloatingOpen}
        />
      )}
    </>
  )
}
