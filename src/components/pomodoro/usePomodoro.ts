import { useEffect, useRef, useState } from 'react'
import { playCycleComplete, playPhaseEnd, unlockAudio } from './sound'

const DURATION_DEFAULT = 25 * 60 * 1000 // 25 minutos em ms
const PAUSE_DEFAULT = 5 * 60 * 1000 // 5 minutos em ms
const LONG_PAUSE_DEFAULT = 15 * 60 * 1000 // 15 minutos em ms
const ONE_MINUTE = 60 * 1000
// Blocos de foco menores que isso não entram no histórico (cliques sem querer).
const MIN_LOGGED_FOCUS = ONE_MINUTE

export interface FocusBlock {
  taskId: string | null
  startedAt: Date
  endedAt: Date
  focusedMs: number
  plannedMs: number
  completed: boolean
}

interface UsePomodoroOptions {
  // Chamado ao fim de cada bloco de foco (concluído ou interrompido).
  onFocusEnd?: (block: FocusBlock) => void
  // Task em foco, lida quando o bloco começa: concluir a task no meio do
  // foco não tira dela o tempo já investido.
  getTaskId?: () => string | null
}

// Estado do timer fica fora da visão: trocar de layout ou abrir o pop-up
// não desmonta o relógio nem zera a contagem.
export function usePomodoro({
  onFocusEnd,
  getTaskId,
}: UsePomodoroOptions = {}) {
  const [duration, setDuration] = useState(DURATION_DEFAULT)
  const [pause, setPause] = useState(PAUSE_DEFAULT)
  const [longPause, setLongPause] = useState(LONG_PAUSE_DEFAULT)
  const [restante, setRestante] = useState(DURATION_DEFAULT)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alvoRef = useRef<number>(0) // timestamp de quando deve terminar
  const [cycleCompleted, setCycleCompleted] = useState(false)
  // O tick roda dentro de um setInterval criado em outra renderização; lê fase
  // e durações por refs para nunca usar valores velhos.
  const phaseRef = useRef(0)

  // Contabilidade do bloco de foco atual: início do bloco, tempo já somado
  // em trechos anteriores (entre pausas) e início do trecho em andamento.
  const focusStartRef = useRef<number | null>(null)
  const focusAccumRef = useRef(0)
  const runStartRef = useRef<number | null>(null)
  const focusTaskRef = useRef<string | null>(null)
  const onFocusEndRef = useRef(onFocusEnd)
  onFocusEndRef.current = onFocusEnd
  const getTaskIdRef = useRef(getTaskId)
  getTaskIdRef.current = getTaskId

  const focusFlow = [
    { type: 'focus', duration: duration, title: 'FOCO' },
    { type: 'pause', duration: pause, title: 'PAUSA' },
    { type: 'focus', duration: duration, title: 'FOCO' },
    { type: 'longPause', duration: longPause, title: 'LONGA' },
    { type: 'focus', duration: duration, title: 'FOCO' },
  ]

  const focusFlowRef = useRef(focusFlow)
  focusFlowRef.current = focusFlow

  const currentPhaseData = focusFlow[currentPhase]
  const progress = 1 - restante / currentPhaseData.duration

  function tick() {
    try {
      const novoRestante = alvoRef.current - Date.now()
      if (novoRestante <= 0) {
        handlePhaseEnd()
      } else {
        setRestante(novoRestante)
      }
    } catch (error) {
      console.error('Erro ao atualizar o tempo:', error)
    }
  }

  function isFocusPhase() {
    return focusFlowRef.current[phaseRef.current].type === 'focus'
  }

  // Fecha o trecho em andamento, somando-o ao bloco de foco.
  function closeRun() {
    if (runStartRef.current === null) return
    focusAccumRef.current += Date.now() - runStartRef.current
    runStartRef.current = null
  }

  // Encerra o bloco de foco atual e o reporta (se durou o mínimo).
  function flushFocus(completed: boolean) {
    closeRun()
    const startedAt = focusStartRef.current
    const focusedMs = focusAccumRef.current
    focusStartRef.current = null
    focusAccumRef.current = 0
    if (startedAt === null || !isFocusPhase()) return
    if (focusedMs < MIN_LOGGED_FOCUS) return
    onFocusEndRef.current?.({
      taskId: focusTaskRef.current,
      startedAt: new Date(startedAt),
      endedAt: new Date(),
      focusedMs: Math.round(focusedMs),
      plannedMs: focusFlowRef.current[phaseRef.current].duration,
      completed,
    })
  }

  function goToPhase(phase: number) {
    phaseRef.current = phase
    setCurrentPhase(phase)
    setRestante(focusFlowRef.current[phase].duration)
  }

  // Fase terminou: segue sozinho para a próxima. Ao fim da última, volta ao
  // início pausado e avisa que o ciclo todo foi concluído.
  function handlePhaseEnd() {
    const flow = focusFlowRef.current
    const next = phaseRef.current + 1
    flushFocus(true)
    if (next < flow.length) {
      playPhaseEnd()
      goToPhase(next)
      iniciar(flow[next].duration)
      return
    }
    pararInterval()
    playCycleComplete()
    goToPhase(0)
    setIsRunning(false)
    setCycleCompleted(true)
  }

  function pararInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function iniciar(tempo: number) {
    pararInterval()
    alvoRef.current = Date.now() + tempo
    if (isFocusPhase()) {
      const now = Date.now()
      if (focusStartRef.current === null) {
        focusStartRef.current = now
        focusTaskRef.current = getTaskIdRef.current?.() ?? null
      }
      runStartRef.current = now
    }
    setIsRunning(true)
    intervalRef.current = setInterval(tick, 100)
  }

  function handleStart() {
    unlockAudio()
    setCycleCompleted(false)
    iniciar(restante)
  }

  function handlePause() {
    pararInterval()
    closeRun()
    setIsRunning(false)
  }

  function handleReset() {
    pararInterval()
    flushFocus(false)
    setIsRunning(false)
    setRestante(DURATION_DEFAULT)
  }

  function handleNextPhase() {
    pararInterval()
    flushFocus(false)
    setIsRunning(false)
    goToPhase((phaseRef.current + 1) % focusFlow.length)
  }

  // ao iniciar uma task no Kanban, recomeça o foco do zero
  function startFocus() {
    pararInterval()
    flushFocus(false)
    unlockAudio()
    setCycleCompleted(false)
    goToPhase(0)
    iniciar(duration)
  }

  const timeControls = [
    {
      title: 'FOCO',
      duracao: duration,
      handleLessDuration: () => {
        setDuration((prev) => Math.max(prev - ONE_MINUTE, 0))
        setRestante((prev) => Math.max(prev - ONE_MINUTE, 0))
      },
      handleMoreDuration: () => {
        setDuration((prev) => prev + ONE_MINUTE)
        setRestante((prev) => prev + ONE_MINUTE)
      },
    },
    {
      title: 'PAUSA',
      duracao: pause,
      handleLessDuration: () =>
        setPause((prev) => Math.max(prev - ONE_MINUTE, 0)),
      handleMoreDuration: () => setPause((prev) => prev + ONE_MINUTE),
    },
    {
      title: 'LONGA',
      duracao: longPause,
      handleLessDuration: () =>
        setLongPause((prev) => Math.max(prev - ONE_MINUTE, 0)),
      handleMoreDuration: () => setLongPause((prev) => prev + ONE_MINUTE),
    },
  ]

  // limpeza ao desmontar
  useEffect(() => {
    return () => pararInterval()
  }, [])

  return {
    restante,
    isRunning,
    currentPhase,
    currentPhaseData,
    totalPhases: focusFlow.length,
    progress,
    timeControls,
    handleStart,
    handlePause,
    handleReset,
    handleNextPhase,
    startFocus,
    // Pausa e fecha o bloco atual (ex.: a task foi tirada do timer).
    interruptFocus: () => {
      pararInterval()
      flushFocus(false)
      setIsRunning(false)
    },
    cycleCompleted,
    focusMinutesPerCycle: Math.round(
      focusFlow
        .filter((phase) => phase.type === 'focus')
        .reduce((total, phase) => total + phase.duration, 0) / ONE_MINUTE,
    ),
    dismissCelebration: () => setCycleCompleted(false),
  }
}

export type PomodoroState = ReturnType<typeof usePomodoro>

export function formatTime(ms: number) {
  const minutos = Math.floor(ms / 1000 / 60)
  const segundos = Math.floor((ms / 1000) % 60)
  return `${minutos}:${String(segundos).padStart(2, '0')}`
}
