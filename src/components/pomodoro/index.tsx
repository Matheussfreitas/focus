import { useEffect, useRef, useState } from 'react'
import { FiChevronsRight, FiRotateCw } from 'react-icons/fi'
import { Button } from '../ui/button'
import { TimeControl } from './TimeControl'

const DURATION_DEFAULT = 25 * 60 * 1000 // 25 minutos em ms
const PAUSE_DEFAULT = 5 * 60 * 1000 // 5 minutos em ms
const LONG_PAUSE_DEFAULT = 15 * 60 * 1000 // 15 minutos em ms

export function Pomodoro() {
  const [duration, setDuration] = useState(DURATION_DEFAULT)
  const [pause, setPause] = useState(PAUSE_DEFAULT)
  const [longPause, setLongPause] = useState(LONG_PAUSE_DEFAULT)
  const [restante, setRestante] = useState(DURATION_DEFAULT || PAUSE_DEFAULT)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [totalFocus, setTotalFocus] = useState(0)

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
  const discoGrad = `conic-gradient(#F0EBE1 ${prog * 360}deg, rgba(240,235,225,.24) 0deg)`

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
    setTotalFocus(
      (prev) =>
        prev +
        (currentPhaseData.type === 'focus' ? currentPhaseData.duration : 0),
    )
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

  const formatHours = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="h-full w-full flex items-center flex-col bg-[#1D396E]">
      <div className="w-full px-12 mt-4">
        <div className="w-full flex justify-between text-sm text-[rgba(240,235,225,.62)] geist-mono">
          <span>{currentPhaseData.title}</span>
          <span>
            SESSÃO {currentPhase + 1} / {focusFlow.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div
          className="h-75 w-78 rounded-[35%] flex justify-center items-center flex-col gap-4 bg-[rgba(240,235,225,.24)]"
          style={{ background: discoGrad }}
        >
          <div className="z-10 h-60 w-60 bg-[#1D396E] rounded-full flex justify-center items-center flex-col">
            <p className="text-6xl geist-mono">
              {minutos}:{String(segundos).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-[rgba(240,235,225,.62)]">
          <p className="text-xs geist-mono">EM CURSO</p>
          <p className="font-bold text-2xl text-[#F0EBE1]">
            Ajustar layout do painel de relatórios
          </p>
        </div>

        <div className="flex">
          <Button
            onClick={isRunning ? handlePause : handleStart}
            type="button"
            variant="default"
            className="px-12 py-8 cursor-pointer rounded-none text-[#1D396E] text-md border-3 border-[#F0EBE1] bg-[#F0EBE1] geist-mono"
          >
            {isRunning ? 'PAUSAR' : 'INICIAR'}
          </Button>
          <Button
            onClick={handleReset}
            variant="default"
            className="w-20 py-8 cursor-pointer rounded-none text-[rgba(240,235,225,.24)] bg-[#1D396E] text-md border-3 border-[rgba(240,235,225,.24)] hover:text-[#F0EBE1]"
          >
            <FiRotateCw />
          </Button>
          <Button
            onClick={handleNextPhase}
            variant="default"
            className="w-20 py-8 cursor-pointer rounded-none text-[rgba(240,235,225,.24)] bg-[#1D396E] text-md border-r-3 border-t-3 border-b-3 border-[rgba(240,235,225,.24)] hover:text-[#F0EBE1]"
          >
            <FiChevronsRight />
          </Button>
        </div>
      </div>

      <div className="w-full flex items-center justify-around border-t-2 border-[rgba(240,235,225,.24)] geist-mono">
        <div className="flex gap-8">
          {mapTimeControls.map((control, index) => (
            <TimeControl
              key={index}
              title={control.title}
              duracao={control.duracao}
              handleLessDuration={control.handleLessDuration}
              handleMoreDuration={control.handleMoreDuration}
            />
          ))}
        </div>
        <div>
          <p className="text-sm text-[rgba(240,235,225,.62)]">
            FOCO {formatHours(totalFocus)}
          </p>
        </div>
      </div>
    </div>
  )
}
