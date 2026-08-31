import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { FiChevronsRight, FiRotateCw } from 'react-icons/fi'

const DURACAO_PADRAO = 25 * 60 * 1000 // 25 minutos em ms
const PAUSA_PADRAO = 5 * 60 * 1000 // 5 minutos em ms

export function Pomodoro() {
  const [restante, setRestante] = useState(DURACAO_PADRAO || PAUSA_PADRAO)
  const [isRunning, setIsRunning] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alvoRef = useRef<number>(0) // timestamp de quando deve terminar

  const minutos = Math.floor(restante / 1000 / 60)
  const segundos = Math.floor((restante / 1000) % 60)

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
    setRestante(DURACAO_PADRAO)
  }

  // limpeza ao desmontar o componente
  useEffect(() => {
    return () => pararInterval()
  }, [])

  return (
    <div className="h-full flex justify-center items-center flex-col gap-4 bg-[#1D396E]">
      <div className="h-60 w-60 border-20 border-[rgba(240,235,225,.24)] rounded-full flex justify-center items-center flex-col">
        <p className="text-5xl">
          {minutos}:{String(segundos).padStart(2, '0')}
        </p>
      </div>

      <div className="flex flex-col items-center text-[rgba(240,235,225,.62)]">
        <p>EM CURSO</p>
        <p className="font-bold">Ajustar layout do pomodoro</p>
      </div>

      <div className="flex">
        <Button
          onClick={isRunning ? handlePause : handleStart}
          type="button"
          variant="default"
          className="px-12 py-8 cursor-pointer rounded-none text-[#1D396E] text-md border-2 border-[#F0EBE1] bg-[#F0EBE1]"
        >
          {isRunning ? 'PAUSAR' : 'INICIAR'}
        </Button>
        <Button
          onClick={handleReset}
          variant="ghost"
          className="px-12 py-8 cursor-pointer rounded-none text-[#F0EBE1] text-md border-2 border-[rgba(240,235,225,.24)]"
        >
          <FiRotateCw />
        </Button>
        <Button
          onClick={() => console.log('Pular')}
          variant="ghost"
          className="px-12 py-8 rounded-none cursor-pointer text-[#F0EBE1] text-md border-2 border-[rgba(240,235,225,.24)]"
        >
          <FiChevronsRight />
        </Button>
      </div>
    </div>
  )
}
