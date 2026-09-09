import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Kanban } from '../components/kanban'
import { Pomodoro } from '../components/pomodoro'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [percentageScreen, setPercentageScreen] = useState<number>(0.42)
  const isDraggingRef = useRef(false)
  const areaRef = useRef<HTMLDivElement>(null)

  const leftGrow = Math.round(percentageScreen * 100)
  const rightGrow = Math.round((1 - percentageScreen) * 100)

  const handlePointerDown = (e: React.PointerEvent) => {
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

  return (
    <div ref={areaRef} className="h-full flex">
      <div className="min-w-0" style={{ flex: `${leftGrow} 1 0` }}>
        <Pomodoro />
      </div>
      <div
        className="w-2.5 cursor-col-resize touch-none bg-[#111A2B] flex flex-col justify-center items-center"
        onPointerDown={handlePointerDown}
      >
        <div className="bg-[#EDE7DC] h-10 w-0.5 select-none"></div>
      </div>
      <div className="min-w-0" style={{ flex: `${rightGrow} 1 0` }}>
        <Kanban />
      </div>
    </div>
  )
}
