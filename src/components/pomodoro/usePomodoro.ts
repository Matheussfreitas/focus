import { useEffect, useRef, useState } from 'react'

const DURATION_DEFAULT = 25 * 60 * 1000 // 25 minutos em ms
const PAUSE_DEFAULT = 5 * 60 * 1000 // 5 minutos em ms
const LONG_PAUSE_DEFAULT = 15 * 60 * 1000 // 15 minutos em ms
const ONE_MINUTE = 60 * 1000

// Estado do timer fica fora da visão: trocar de layout ou abrir o pop-up
// não desmonta o relógio nem zera a contagem.
export function usePomodoro() {
  const [duration, setDuration] = useState(DURATION_DEFAULT)
  const [pause, setPause] = useState(PAUSE_DEFAULT)
  const [longPause, setLongPause] = useState(LONG_PAUSE_DEFAULT)
  const [restante, setRestante] = useState(DURATION_DEFAULT)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alvoRef = useRef<number>(0) // timestamp de quando deve terminar

  const focusFlow = [
    { type: 'focus', duration: duration, title: 'FOCO' },
    { type: 'pause', duration: pause, title: 'PAUSA' },
    { type: 'focus', duration: duration, title: 'FOCO' },
    { type: 'longPause', duration: longPause, title: 'LONGA' },
    { type: 'focus', duration: duration, title: 'FOCO' },
  ]

  const currentPhaseData = focusFlow[currentPhase]
  const progress = 1 - restante / currentPhaseData.duration

  function tick() {
    try {
      const novoRestante = alvoRef.current - Date.now()
      if (novoRestante <= 0) {
        pararInterval()
        setRestante(0)
        setIsRunning(false)
      } else {
        setRestante(novoRestante)
      }
    } catch (error) {
      console.error('Erro ao atualizar o tempo:', error)
    }
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
    setIsRunning(true)
    intervalRef.current = setInterval(tick, 100)
  }

  function handleStart() {
    iniciar(restante)
  }

  function handlePause() {
    pararInterval()
    setIsRunning(false)
  }

  function handleReset() {
    pararInterval()
    setIsRunning(false)
    setRestante(DURATION_DEFAULT)
  }

  function handleNextPhase() {
    pararInterval()
    setIsRunning(false)
    setCurrentPhase((prev) => (prev + 1) % focusFlow.length)
    setRestante(focusFlow[(currentPhase + 1) % focusFlow.length].duration)
  }

  // ao iniciar uma task no Kanban, recomeça o foco do zero
  function startFocus() {
    setCurrentPhase(0)
    setRestante(duration)
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
  }
}

export type PomodoroState = ReturnType<typeof usePomodoro>

export function formatTime(ms: number) {
  const minutos = Math.floor(ms / 1000 / 60)
  const segundos = Math.floor((ms / 1000) % 60)
  return `${minutos}:${String(segundos).padStart(2, '0')}`
}
