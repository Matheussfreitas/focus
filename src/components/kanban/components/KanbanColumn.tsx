import { useState } from 'react'
import { CreateTaskDialog } from './CreateTaskDialog'
import { KanbanCard } from './KanbanCard'
import type { Column } from '../types/column.type'
import type { Task } from '../types/task.type'

interface KanbanColumnProps {
  column: Column
  active: boolean
  tasks: Task[]
  index: number
  updateTask: (task: Task) => void
  deleteTask: (task: Task) => Promise<void>
  onCreateTask: (data: {
    title: string
    description?: string
    dueDate?: Date
    tagId?: string
    status: Column['id']
  }) => Promise<void>
  onStartTask: (task: Task) => void
}

export function KanbanColumn({
  column,
  active,
  tasks,
  index,
  updateTask,
  deleteTask,
  onCreateTask,
  onStartTask,
}: Readonly<KanbanColumnProps>) {
  const [isOver, setIsOver] = useState(false)

  const format = (i: number) => {
    if (i < 10) {
      return `0${i}`
    }
    return i.toString()
  }

  const filterTasksByColumn = tasks.filter((task) => task.status === column.id)

  const dragBackgroundColor = `${isOver ? 'bg-ink/16' : ''}`

  return (
    <div
      role="tabpanel"
      id={`panel-${column.id}`}
      aria-label={column.title}
      className={`${active ? 'flex' : 'hidden'} md:flex h-full min-h-0 flex-1 flex-col border geist-mono ${dragBackgroundColor}`}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        updateTask({
          ...tasks.find(
            (task) => task.id === e.dataTransfer.getData('text/plain'),
          )!,
          status: column.id,
        })
        setIsOver(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
    >
      <div
        className={`flex justify-between bg-sand p-2 items-center text-base md:text-sm text-ink-muted border-y-2 border-ink ${dragBackgroundColor}`}
      >
        <span className="flex gap-2 items-center">
          <p>{format(index)}</p>
          <p className="font-bold text-ink">{column.title.toUpperCase()}</p>
        </span>
        <span className="flex gap-2 items-center">
          <p>{filterTasksByColumn.length}</p>
          <CreateTaskDialog status={column.id} onCreate={onCreateTask} />
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filterTasksByColumn.length === 0 && (
          <p className="p-4 text-sm text-center text-ink-muted">
            Nenhuma tarefa.
          </p>
        )}
        {filterTasksByColumn.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onToggleDone={updateTask}
            onDelete={deleteTask}
            onStartTask={onStartTask}
          />
        ))}
      </div>
    </div>
  )
}
