import { createFileRoute } from '@tanstack/react-router'
import { Pomodoro } from '../components/pomodoro'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="h-full bg-[#F4F6FA]">
      <Pomodoro />
    </div>
  )
}