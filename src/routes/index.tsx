import { createFileRoute } from '@tanstack/react-router'
import { Kanban } from '../components/kanban'
import { Pomodoro } from '../components/pomodoro'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const percentageScreen = 0.42
  const leftGrow = Math.round(percentageScreen * 100)
  const rightGrow = Math.round((1 - percentageScreen) * 100)

  return (
    <div className="h-full flex">
      <div className="min-w-0" style={{ flex: `${leftGrow} 1 0` }}>
        <Pomodoro />
      </div>
      <div className="w-2.5 cursor-col-resize touch-none bg-[#111A2B] flex flex-col justify-center items-center">
        <div className="bg-[#EDE7DC] h-10 w-0.5 select-none"></div>
      </div>
      <div className="min-w-0" style={{ flex: `${rightGrow} 1 0` }}>
        <Kanban />
      </div>
    </div>
  )
}
