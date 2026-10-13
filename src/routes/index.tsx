import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useSession } from '#/lib/auth-client.ts'
import { getServerSession } from '#/server/auth/session.ts'
import { tagsQueryOptions } from '../components/kanban/queries.tag'
import { tasksQueryOptions } from '../components/kanban/queries.task'
import { canRunTour, getPendingTour, startTour } from '#/lib/tour.ts'
import { Kanban } from '../components/kanban'
import type { Task } from '../components/kanban/types/task.type'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import { Pomodoro } from '../components/pomodoro'
import { FloatingPomodoro } from '../components/pomodoro/FloatingPomodoro'
import { usePomodoro } from '../components/pomodoro/usePomodoro'
import { getLayoutDef, resolveLayout } from '#/lib/layout.ts'
import type { PanelId } from '#/lib/layout.ts'
import { usePreferences } from '#/lib/preferences.tsx'

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
  const { data: clientSession, isPending } = useSession()
  // Até o cliente resolver a sessão, vale a do servidor (evita o "vazio").
  const user = isPending ? serverSession?.user : clientSession?.user
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [percentageScreen, setPercentageScreen] = useState<number>(0.42)
  const [mobileView, setMobileView] = useState<'timer' | 'tasks'>('timer')
  const [floatingOpen, setFloatingOpen] = useState(false)
  const pomodoro = usePomodoro()
  const { layout } = usePreferences()
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

  const loggedIn = !!user

  // A task em curso é lida da lista do kanban: edições aparecem no timer e,
  // se ela for concluída ou excluída, o timer fica vazio.
  const { data: tasks, isSuccess: tasksLoaded } = useQuery({
    ...tasksQueryOptions,
    enabled: loggedIn,
  })
  const activeTask =
    tasks?.find(
      (task) => task.id === activeTaskId && task.status !== TaskStatus.DONE,
    ) ?? null

  useEffect(() => {
    if (activeTaskId && tasksLoaded && !activeTask) setActiveTaskId(null)
  }, [activeTaskId, tasksLoaded, activeTask])
  const panels = getLayoutDef(resolveLayout(layout, loggedIn)).panels
  const isSplit = panels.length > 1
  const showsPomodoro = panels.includes('pomodoro')

  // Tour automático (só desktop/notebook): introdução na primeira visita e,
  // se o usuário só entrou depois, a parte do kanban na primeira vez logado.
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

  // Iniciar uma task sempre dispara o timer, em qualquer layout. Se o timer
  // não está na tela principal, ele aparece na janela flutuante.
  const handleStartTask = (task: Task) => {
    if (task.status === TaskStatus.DONE) return
    setActiveTaskId(task.id)
    pomodoro.startFocus()
    setMobileView('timer')
    if (!showsPomodoro) setFloatingOpen(true)
  }

  // Tira a task do timer (que pausa) e deixa o pomodoro vazio.
  const handleClearTask = () => {
    setActiveTaskId(null)
    pomodoro.handlePause()
  }

  const PANELS: Record<PanelId, React.ReactNode> = {
    pomodoro: (
      <Pomodoro
        state={pomodoro}
        activeTask={activeTask}
        onClearTask={handleClearTask}
      />
    ),
    kanban: <Kanban onStartTask={handleStartTask} />,
  }

  // No modo dividido, o mobile mostra um painel por vez (abas).
  const mobileHidden = (panel: PanelId) =>
    isSplit && (panel === 'pomodoro') !== (mobileView === 'timer')
      ? 'hidden md:block'
      : ''

  const tabClass = (active: boolean) =>
    `min-h-12 text-sm font-semibold geist-mono cursor-pointer ${
      active ? 'bg-sand text-ink' : 'text-sand'
    }`

  return (
    <div ref={areaRef} className="h-full flex flex-col md:flex-row">
      {panels.map((panel, index) => (
        <Fragment key={panel}>
          {index > 0 && (
            <div
              data-tour="divider"
              className="hidden md:flex w-2.5 cursor-col-resize touch-none bg-ink flex-col justify-center items-center"
              onPointerDown={handlePointerDown}
            >
              <div className="bg-sand h-10 w-0.5 select-none"></div>
            </div>
          )}
          <div
            className={`min-w-0 min-h-0 flex-1 md:flex-(--grow) ${mobileHidden(panel)}`}
            style={
              {
                '--grow': isSplit
                  ? `${index === 0 ? leftGrow : rightGrow} 1 0`
                  : '1 1 0',
              } as React.CSSProperties
            }
          >
            {PANELS[panel]}
          </div>
        </Fragment>
      ))}

      {isSplit && (
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
      )}

      {!showsPomodoro && (
        <FloatingPomodoro
          state={pomodoro}
          activeTask={activeTask}
          onClearTask={handleClearTask}
          open={floatingOpen}
          onOpenChange={setFloatingOpen}
        />
      )}
    </div>
  )
}
