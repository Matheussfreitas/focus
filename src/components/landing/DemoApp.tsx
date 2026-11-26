import { useState } from 'react'
import { Pomodoro } from '../pomodoro'
import { usePomodoro } from '../pomodoro/usePomodoro'
import type { Task } from '../kanban/types/task.type'
import { DemoCard, DemoColumnHead } from './DemoCard'
import { DEMO_DONE, DEMO_TASKS } from './demoData'
import type { DemoTask } from './demoData'

// O timer de verdade (mesmo hook e componente do app), sem gravar histórico:
// o visitante pode apertar play ou mandar uma tarefa de exemplo para ele, que
// passa para "Fazendo" como no app.
export function DemoApp() {
  const pomodoro = usePomodoro()
  const [active, setActive] = useState<DemoTask | null>(null)

  const handleStart = (task: DemoTask) => {
    pomodoro.interruptFocus()
    setActive(task)
    pomodoro.startFocus()
  }

  // O Pomodoro só lê o título da tarefa ativa.
  const activeTask = active ? ({ title: active.title } as Task) : null
  const todo = DEMO_TASKS.filter((t) => t.id !== active?.id)
  const doing = active ? [active] : []

  return (
    <div className="border-2 border-ink bg-sand shadow-[8px_8px_0_0_var(--color-ink)]">
      <div className="flex h-9 items-center gap-3 border-b-2 border-ink px-3">
        <span className="text-sm font-bold text-ink">FOCUS</span>
        <span aria-hidden className="h-full w-0.5 bg-ink" />
        <span className="text-xs text-ink-muted geist-mono">
          TIMER E TAREFAS
        </span>
      </div>
      <div className="grid lg:h-[38rem] lg:grid-cols-[20rem_1fr] xl:grid-cols-[23rem_1fr]">
        {/* Altura folgada e sem rolagem: o timer cabe inteiro e a roda do
            mouse rola a página, não o painel. */}
        <div className="h-[36rem] overflow-hidden lg:h-full [&>div]:overflow-hidden">
          <Pomodoro
            state={pomodoro}
            activeTask={activeTask}
            onClearTask={() => {
              pomodoro.interruptFocus()
              setActive(null)
            }}
          />
        </div>
        <div className="grid min-w-0 border-t-2 border-ink md:grid-cols-2 lg:border-t-0 xl:grid-cols-3 lg:border-l-2">
          <Column
            index="01"
            title="A FAZER"
            tasks={todo}
            onStart={handleStart}
          />
          <Column
            index="02"
            title="FAZENDO"
            tasks={doing}
            activeId={active?.id}
            onStart={handleStart}
            className="hidden md:block md:border-l-2"
          />
          <Column
            index="03"
            title="FEITO"
            tasks={DEMO_DONE}
            done
            className="hidden xl:block xl:border-l-2"
          />
        </div>
      </div>
    </div>
  )
}

function Column({
  index,
  title,
  tasks,
  activeId,
  done,
  onStart,
  className = '',
}: {
  index: string
  title: string
  tasks: DemoTask[]
  activeId?: string
  done?: boolean
  onStart?: (task: DemoTask) => void
  className?: string
}) {
  return (
    <div className={`min-w-0 border-ink ${className}`}>
      <DemoColumnHead index={index} title={title} count={tasks.length} />
      {tasks.length === 0 && (
        <p className="p-4 text-center text-sm text-ink-muted">
          Nenhuma tarefa.
        </p>
      )}
      {tasks.map((task) => (
        <DemoCard
          key={task.id}
          task={task}
          done={done}
          active={task.id === activeId}
          onStart={done ? undefined : onStart}
        />
      ))}
    </div>
  )
}
