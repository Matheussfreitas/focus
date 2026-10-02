import { useEffect, useRef, useState } from 'react'
import { FiChevronsRight, FiRotateCw } from 'react-icons/fi'
import type { Task } from '../kanban/types/task.type'
import { Button } from '../ui/button'
import { TimeControl } from './TimeControl'

const DURATION_DEFAULT = 25 * 60 * 1000 // 25 minutos em ms
const PAUSE_DEFAULT = 5 * 60 * 1000 // 5 minutos em ms
const LONG_PAUSE_DEFAULT = 15 * 60 * 1000 // 15 minutos em ms

interface PomodoroProps {
  activeTask?: Task | null
}

export function Pomodoro({ activeTask }: Readonly<PomodoroProps>) {
  const [duration, setDuration] = useState(DURATION_DEFAULT)
  const [pause, setPause] = useState(PAUSE_DEFAULT)
  const [longPause, setLongPause] = useState(LONG_PAUSE_DEFAULT)
  const [restante, setRestante] = useState(DURATION_DEFAULT || PAUSE_DEFAULT)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alvoRef = useRef<number>(0) // timestamp de quando deve terminar

  const minutos = Math.floor(restante / 1000 / 60)
  const segundos = Math.floor((restante / 1000) % 60)

  const focusFlow = [
    { type: 'focus', duration: duration, title: 'FOCO' },
    { type: 'pause', duration: pause, title: 'PAUSA' },
    { type: 'focus', duration: duration, title: 'FOCO' },
    { type: 'longPause', duration: longPause, title: 'LONGA' },
    { type: 'focus', duration: duration, title: 'FOCO' },
  ]

  const currentPhaseData = focusFlow[currentPhase]

  const prog = 1 - restante / currentPhaseData.duration
  const discoGrad = `conic-gradient(var(--color-cream) ${prog * 360}deg, color-mix(in oklab, var(--color-cream) 24%, transparent) 0deg)`

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

  function handleStart() {
    alvoRef.current = Date.now() + restante
    setIsRunning(true)
    intervalRef.current = setInterval(tick, 100)
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

  function handleMoreDuration() {
    setDuration((prev) => prev + 1 * 60 * 1000)
    setRestante((prev) => prev + 1 * 60 * 1000)
  }

  function handleLessDuration() {
    setDuration((prev) => Math.max(prev - 1 * 60 * 1000, 0))
    setRestante((prev) => Math.max(prev - 1 * 60 * 1000, 0))
  }

  function handleMorePause() {
    setPause((prev) => prev + 1 * 60 * 1000)
  }

  function handleLessPause() {
    setPause((prev) => Math.max(prev - 1 * 60 * 1000, 0))
  }

  function handleMoreLongPause() {
    setLongPause((prev) => prev + 1 * 60 * 1000)
  }

  function handleLessLongPause() {
    setLongPause((prev) => Math.max(prev - 1 * 60 * 1000, 0))
  }

  const mapTimeControls = [
    {
      title: 'FOCO',
      duracao: duration,
      handleLessDuration: handleLessDuration,
      handleMoreDuration: handleMoreDuration,
    },
    {
      title: 'PAUSA',
      duracao: pause,
      handleLessDuration: handleLessPause,
      handleMoreDuration: handleMorePause,
    },
    {
      title: 'LONGA',
      duracao: longPause,
      handleLessDuration: handleLessLongPause,
      handleMoreDuration: handleMoreLongPause,
    },
  ]

  // limpeza ao desmontar o componente
  useEffect(() => {
    return () => pararInterval()
  }, [])

  // ao selecionar uma nova task no Kanban, inicia o foco automaticamente
  useEffect(() => {
    if (!activeTask) return
    pararInterval()
    setCurrentPhase(0)
    setRestante(duration)
    alvoRef.current = Date.now() + duration
    setIsRunning(true)
    intervalRef.current = setInterval(tick, 100)
  }, [activeTask?.id])

  return (
    <div className="h-full w-full flex items-center flex-col bg-ocean">
      <div className="w-full px-12 mt-4">
        <div className="w-full flex justify-between text-sm text-cream/62 geist-mono">
          <span>{currentPhaseData.title}</span>
          <span>
            SESSÃO {currentPhase + 1} / {focusFlow.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div
          className="h-75 w-78 rounded-[35%] flex justify-center items-center flex-col gap-4 bg-cream/24"
          style={{ background: discoGrad }}
        >
          <div className="z-10 h-60 w-60 bg-ocean rounded-full flex justify-center items-center flex-col">
            <p className="text-6xl text-cream geist-mono">
              {minutos}:{String(segundos).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-cream/62">
          <p className="text-xs geist-mono">EM CURSO</p>
          <p className="font-bold text-2xl text-cream">
            {activeTask?.title ?? 'Nenhuma task selecionada'}
          </p>
        </div>

        <div className="flex">
          <Button
            onClick={isRunning ? handlePause : handleStart}
            type="button"
            variant="default"
            className="px-12 py-8 cursor-pointer rounded-none text-ocean text-md border-3 border-cream bg-cream geist-mono"
          >
            {isRunning ? 'PAUSAR' : 'INICIAR'}
          </Button>
          <Button
            onClick={handleReset}
            variant="default"
            className="w-20 py-8 cursor-pointer rounded-none text-cream/24 bg-ocean text-md border-3 border-cream/24 hover:text-cream"
          >
            <FiRotateCw />
          </Button>
          <Button
            onClick={handleNextPhase}
            variant="default"
            className="w-20 py-8 cursor-pointer rounded-none text-cream/24 bg-ocean text-md border-r-3 border-t-3 border-b-3 border-cream/24 hover:text-cream"
          >
            <FiChevronsRight />
          </Button>
        </div>
      </div>

      <div className="w-full h-15 flex items-center justify-center border-t-2 border-cream/24 geist-mono">
        <div className="flex gap-8">
          {mapTimeControls.map((control) => (
            <TimeControl
              key={control.title}
              title={control.title}
              duracao={control.duracao}
              handleLessDuration={control.handleLessDuration}
              handleMoreDuration={control.handleMoreDuration}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
