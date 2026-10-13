import { useEffect, useRef, useState } from 'react'
import {
  FiClock,
  FiMaximize2,
  FiMinus,
  FiPause,
  FiPlay,
  FiX,
} from 'react-icons/fi'
import type { Task } from '../kanban/types/task.type'
import { Pomodoro } from '.'
import { formatTime } from './usePomodoro'
import type { PomodoroState } from './usePomodoro'

const STORAGE_KEY = 'focus:floating-timer'
const MIN_WIDTH = 220
const MIN_HEIGHT = 260
const DEFAULT_WIDTH = 280
const DEFAULT_HEIGHT = 340
const MARGIN = 16
const BAR_HEIGHT = 28

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

type DragMode = 'move' | 'resize'

interface FloatingPomodoroProps {
  state: PomodoroState
  activeTask?: Task | null
  onClearTask?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

function clampRect(rect: Rect): Rect {
  const width = Math.min(
    Math.max(rect.width, MIN_WIDTH),
    window.innerWidth - MARGIN * 2,
  )
  const height = Math.min(
    Math.max(rect.height, MIN_HEIGHT),
    window.innerHeight - MARGIN * 2,
  )
  return {
    width,
    height,
    x: Math.min(Math.max(rect.x, MARGIN), window.innerWidth - width - MARGIN),
    y: Math.min(Math.max(rect.y, MARGIN), window.innerHeight - height - MARGIN),
  }
}

function loadRect(): Rect {
  const fallback = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    x: window.innerWidth - DEFAULT_WIDTH - MARGIN * 2,
    y: window.innerHeight - DEFAULT_HEIGHT - MARGIN * 2,
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return clampRect(stored ? { ...fallback, ...JSON.parse(stored) } : fallback)
  } catch {
    return clampRect(fallback)
  }
}

function saveRect(rect: Rect) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rect))
  } catch {
    // storage indisponível: a janela volta à posição padrão na próxima visita
  }
}

/**
 * Timer em janela flutuante, para quando o pomodoro não é a tela principal.
 * Não é modal: sem overlay, clicar fora não fecha, e fechar só esconde a
 * janela (o timer continua rodando).
 */
export function FloatingPomodoro({
  state,
  activeTask,
  onClearTask,
  open,
  onOpenChange,
}: Readonly<FloatingPomodoroProps>) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [minimized, setMinimized] = useState(false)
  const dragRef = useRef<{
    mode: DragMode
    startX: number
    startY: number
    origin: Rect
  } | null>(null)
  const rectRef = useRef<Rect | null>(null)
  rectRef.current = rect

  // posição depende da janela do navegador: só calcula depois de montar
  useEffect(() => {
    setRect(loadRect())
    const handleResize = () =>
      setRect((prev) => (prev ? clampRect(prev) : prev))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      setRect(
        clampRect(
          drag.mode === 'move'
            ? { ...drag.origin, x: drag.origin.x + dx, y: drag.origin.y + dy }
            : {
                ...drag.origin,
                width: drag.origin.width + dx,
                height: drag.origin.height + dy,
              },
        ),
      )
    }

    const handlePointerUp = () => {
      if (!dragRef.current) return
      dragRef.current = null
      document.body.style.userSelect = ''
      if (rectRef.current) saveRect(rectRef.current)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    if (!rect || e.button !== 0) return
    // não inicia arrasto ao clicar nos botões da barra
    if ((e.target as HTMLElement).closest('button')) return
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: rect,
    }
    document.body.style.userSelect = 'none'
  }

  const { isRunning, restante, handlePause, handleStart } = state
  const toggleRunning = isRunning ? handlePause : handleStart
  const time = formatTime(restante)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-label="Abrir timer"
        title="Abrir timer"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-ink text-sand px-3 h-9 geist-mono text-xs cursor-pointer"
      >
        <FiClock />
        {time}
      </button>
    )
  }

  return (
    <>
      {/* mobile: barra fixa no rodapé, sem arrasto */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-ocean text-cream geist-mono px-4 h-12">
        <span className="text-lg">{time}</span>
        <span className="flex-1 truncate text-xs text-cream/62">
          {activeTask?.title ?? 'Nenhuma task selecionada'}
        </span>
        <button
          type="button"
          onClick={toggleRunning}
          aria-label={isRunning ? 'Pausar' : 'Iniciar'}
          className="h-8 w-8 flex items-center justify-center bg-cream text-ocean cursor-pointer"
        >
          {isRunning ? <FiPause /> : <FiPlay />}
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar timer"
          className="h-8 w-8 flex items-center justify-center cursor-pointer"
        >
          <FiX />
        </button>
      </div>

      {rect && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Timer"
          className="hidden md:flex fixed z-40 flex-col border-2 border-ink bg-ocean shadow-[4px_4px_0_var(--color-ink)]"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: minimized ? BAR_HEIGHT + 4 : rect.height,
          }}
        >
          <div
            onPointerDown={startDrag('move')}
            className="flex items-center gap-2 bg-ink text-sand px-2 geist-mono text-xs cursor-move touch-none select-none shrink-0"
            style={{ height: BAR_HEIGHT }}
          >
            <span className="font-bold">TIMER</span>
            {minimized && <span>{time}</span>}
            <span className="flex-1" />
            {minimized && (
              <button
                type="button"
                onClick={toggleRunning}
                aria-label={isRunning ? 'Pausar' : 'Iniciar'}
                className="cursor-pointer"
              >
                {isRunning ? <FiPause /> : <FiPlay />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMinimized((prev) => !prev)}
              aria-label={minimized ? 'Expandir timer' : 'Minimizar timer'}
              className="cursor-pointer"
            >
              {minimized ? <FiMaximize2 /> : <FiMinus />}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar timer"
              className="cursor-pointer"
            >
              <FiX />
            </button>
          </div>

          {!minimized && (
            <>
              <div className="flex-1 min-h-0">
                <Pomodoro
                  state={state}
                  activeTask={activeTask}
                  onClearTask={onClearTask}
                  variant="compact"
                />
              </div>
              <div
                onPointerDown={startDrag('resize')}
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize touch-none border-r-2 border-b-2 border-cream/62"
              />
            </>
          )}
        </div>
      )}
    </>
  )
}
