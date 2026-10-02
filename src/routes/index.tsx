import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { authClient } from '#/lib/auth-client.ts'
import { getServerSession } from '#/server/auth/session.ts'
import { tagsQueryOptions } from '../components/kanban/queries.tag'
import { tasksQueryOptions } from '../components/kanban/queries.task'
import { canRunTour, getPendingTour, startTour } from '#/lib/tour.ts'
import { Kanban } from '../components/kanban'
import type { Task } from '../components/kanban/types/task.type'
import { Pomodoro } from '../components/pomodoro'

export const Route = createFileRoute('/')({
  // Sessão lida no servidor: a página já nasce sabendo se há usuário.
  beforeLoad: async () => ({ session: await getServerSession() }),
  // Dispara as consultas sem aguardar: o HTML não espera o banco e os dados
  // chegam ao navegador junto da página, sem a cascata sessão -> tarefas.
  loader: ({ context }) => {
    if (!context.session) return
    void context.queryClient.prefetchQuery(tasksQueryOptions)
    void context.queryClient.prefetchQuery(tagsQueryOptions)
  },
  component: HomePage,
})

function HomePage() {
  const { session: serverSession } = Route.useRouteContext()
  const { data: clientSession, isPending } = authClient.useSession()
  // Até o cliente resolver a sessão, vale a do servidor (evita o "vazio").
  const user = isPending ? serverSession?.user : clientSession?.user
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [percentageScreen, setPercentageScreen] = useState<number>(0.42)
  const [mobileView, setMobileView] = useState<'timer' | 'tasks'>('timer')
  const isDraggingRef = useRef(false)
  const areaRef = useRef<HTMLDivElement>(null)

  const leftGrow = Math.round(percentageScreen * 100)
  const rightGrow = Math.round((1 - percentageScreen) * 100)

  const handlePointerDown = () => {
    isDraggingRef.current = true
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !areaRef.current) return

      const rect = areaRef.current.getBoundingClientRect()
      const novaRazao = (e.clientX - rect.left) / rect.width

      // Limita a razão entre 26% e 72%
      setPercentageScreen(Math.min(0.72, Math.max(0.33, novaRazao)))
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const showKanban = !!user

  // Tour automático (só desktop/notebook): introdução na primeira visita e,
  // se o usuário só entrou depois, a parte do kanban na primeira vez logado.
  const loggedIn = !!user
  useEffect(() => {
    if (isPending || !canRunTour()) return
    const part = getPendingTour(loggedIn)
    if (!part) return
    // espera o layout e as tarefas montarem antes de procurar os elementos
    const timer = setTimeout(() => {
      void startTour({ loggedIn, part })
    }, 800)
    return () => clearTimeout(timer)
  }, [isPending, loggedIn])

  const handleStartTask = (task: Task) => {
    setActiveTask(task)
    setMobileView('timer')
  }

  const tabClass = (active: boolean) =>
    `min-h-12 text-sm font-semibold geist-mono cursor-pointer ${
      active ? 'bg-sand text-ink' : 'text-sand'
    }`

  return (
    <div ref={areaRef} className="h-full flex flex-col md:flex-row">
      <div
        className={`min-w-0 min-h-0 flex-1 md:flex-(--left) ${
          showKanban && mobileView === 'tasks' ? 'hidden md:block' : ''
        }`}
        style={
          {
            '--left': showKanban ? `${leftGrow} 1 0` : '1 1 0',
          } as React.CSSProperties
        }
      >
        <Pomodoro activeTask={activeTask} />
      </div>

      {showKanban && (
        <>
          <div
            data-tour="divider"
            className="hidden md:flex w-2.5 cursor-col-resize touch-none bg-ink flex-col justify-center items-center"
            onPointerDown={handlePointerDown}
          >
            <div className="bg-sand h-10 w-0.5 select-none"></div>
          </div>

          <div
            className={`min-w-0 min-h-0 flex-1 md:flex-(--right) ${
              mobileView === 'timer' ? 'hidden md:block' : ''
            }`}
            style={{ '--right': `${rightGrow} 1 0` } as React.CSSProperties}
          >
            <Kanban onStartTask={handleStartTask} />
          </div>

          <nav
            aria-label="Alternar entre timer e tarefas"
            className="grid grid-cols-2 bg-ink md:hidden"
          >
            <button
              type="button"
              aria-pressed={mobileView === 'timer'}
              onClick={() => setMobileView('timer')}
              className={tabClass(mobileView === 'timer')}
            >
              TIMER
            </button>
            <button
              type="button"
              aria-pressed={mobileView === 'tasks'}
              onClick={() => setMobileView('tasks')}
              className={tabClass(mobileView === 'tasks')}
            >
              TAREFAS
            </button>
          </nav>
        </>
      )}
    </div>
  )
}
