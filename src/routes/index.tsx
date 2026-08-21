import { createFileRoute } from '@tanstack/react-router'
import { Pomodoro } from '../components/pomodoro'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="border border-amber-400 flex-1">
      <Pomodoro />
    </main>
  )
}