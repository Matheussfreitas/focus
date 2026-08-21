import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const DURACAO_PADRAO = 25 * 60 * 1000 // 25 minutos em ms
const PAUSA_PADRAO = 5 * 60 * 1000 // 5 minutos em ms

export function Pomodoro() {
  const [restante, setRestante] = useState(DURACAO_PADRAO || PAUSA_PADRAO)
  const [isRunning, setIsRunning] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alvoRef = useRef<number>(0) // timestamp de quando deve terminar

  const minutos = Math.floor(restante / 1000 / 60)
  const segundos = Math.floor(restante / 1000 % 60)

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
    <div className="border flex justify-center items-center flex-col gap-4">
      <div className="h-100 w-100 border-[0.5px] border-blue-200 rounded-full flex justify-center items-center">
        <p className="text-5xl">{minutos}:{String(segundos).padStart(2, '0')}</p>
      </div>

      <div>
        <p>Tarefa Atual</p>
        <p>Ajustar layout do pomodoro</p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleStart} type="button" variant="default" className="cursor-pointer" disabled={isRunning}>
          iniciar
        </Button>
        <Button onClick={handlePause} variant="secondary" className="cursor-pointer" disabled={!isRunning}>
          pausar
        </Button>
        <Button onClick={handleReset} variant="outline" className="cursor-pointer">
          resetar
        </Button>
      </div>
    </div>
  )
}