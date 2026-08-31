import { createFileRoute } from '@tanstack/react-router'
import { Pomodoro } from '../components/pomodoro'
import { Kanban } from '../components/kanban';

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="h-full">
      <Pomodoro />
    </div>
  )
}
