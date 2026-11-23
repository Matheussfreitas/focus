import { createContext, useContext, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '#/lib/auth-client.ts'
import { logFocusSession } from '#/server/focus/focus.ts'
import { CycleCompleteToast } from './CycleCompleteToast'
import { usePomodoro } from './usePomodoro'
import type { FocusBlock, PomodoroState } from './usePomodoro'

interface PomodoroContextValue {
  pomodoro: PomodoroState
  activeTaskId: string | null
  setActiveTaskId: (id: string | null) => void
  floatingOpen: boolean
  setFloatingOpen: (open: boolean) => void
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

// O timer vive acima das rotas: ir ao dashboard e voltar não zera a contagem.
// Cada bloco de foco encerrado vira um registro no histórico (se logado).
export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [activeTaskId, setActiveTaskIdState] = useState<string | null>(null)
  const [floatingOpen, setFloatingOpen] = useState(false)

  // Ref atualizada na hora (não só no próximo render): o bloco de foco que
  // começa na mesma ação já enxerga a task nova.
  const activeTaskIdRef = useRef(activeTaskId)
  const setActiveTaskId = (id: string | null) => {
    activeTaskIdRef.current = id
    setActiveTaskIdState(id)
  }
  const loggedInRef = useRef(false)
  loggedInRef.current = !!session?.user

  const logMutation = useMutation({
    mutationFn: logFocusSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const handleFocusEnd = (block: FocusBlock) => {
    if (!loggedInRef.current) return
    logMutation.mutate({ data: block })
  }

  const pomodoro = usePomodoro({
    onFocusEnd: handleFocusEnd,
    getTaskId: () => activeTaskIdRef.current,
  })

  return (
    <PomodoroContext.Provider
      value={{
        pomodoro,
        activeTaskId,
        setActiveTaskId,
        floatingOpen,
        setFloatingOpen,
      }}
    >
      {children}
      <CycleCompleteToast
        open={pomodoro.cycleCompleted}
        focusMinutes={pomodoro.focusMinutesPerCycle}
        onClose={pomodoro.dismissCelebration}
      />
    </PomodoroContext.Provider>
  )
}

export function usePomodoroContext() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoroContext fora do PomodoroProvider')
  return ctx
}
