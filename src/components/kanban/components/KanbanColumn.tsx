import { useState } from 'react'
import { CreateTaskDialog } from './CreateTaskDialog'
import { FiAlertCircle } from 'react-icons/fi'
import { KanbanCard } from './KanbanCard'
import { isTaskOverdue } from '../dueDate'
import { DoneRangeMenu, TodoSortMenu } from './TaskFilters'
import { usePreferences } from '#/lib/preferences.tsx'
import { PRIORITY_WEIGHT } from '#/lib/taskFilters.ts'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import type { TaskPriority } from '#/generated/prisma/enums.ts'
import type { Column } from '../types/column.type'
import type { Task } from '../types/task.type'

interface KanbanColumnProps {
  column: Column
  active: boolean
  loading: boolean
  tasks: Task[]
  index: number
  updateTask: (task: Task) => void
  deleteTask: (task: Task) => Promise<void>
  onCreateTask: (data: {
    title: string
    description?: string
    dueDate?: Date
    tagId?: string
    priority: TaskPriority
    status: Column['id']
  }) => Promise<void>
  onStartTask: (task: Task) => void
}

export function KanbanColumn({
  column,
  active,
  loading,
  tasks,
  index,
  updateTask,
  deleteTask,
  onCreateTask,
  onStartTask,
}: Readonly<KanbanColumnProps>) {
  const [isOver, setIsOver] = useState(false)
  const { todoSort } = usePreferences()

  const format = (i: number) => {
    if (i < 10) {
      return `0${i}`
    }
    return i.toString()
  }

  // atrasadas primeiro, as mais antigas no topo; sort estável mantém o resto
  const filterTasksByColumn = tasks
    .filter((task) => task.status === column.id)
    .sort((a, b) => {
      // Em "A Fazer" por prioridade, o nível manda e o atraso só desempata
      // dentro dele; nos demais casos atrasadas vêm primeiro.
      if (column.id === TaskStatus.TODO && todoSort === 'priority') {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
        if (diff !== 0) return diff
      }
      const aOverdue = isTaskOverdue(a)
      const bOverdue = isTaskOverdue(b)
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
      if (aOverdue && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  const overdueCount = filterTasksByColumn.filter(isTaskOverdue).length

  const dragBackgroundColor = `${isOver ? 'bg-ink/16' : ''}`

  return (
    <div
      role="tabpanel"
      id={`panel-${column.id}`}
      aria-label={column.title}
      className={`${active ? 'flex' : 'hidden'} lg:flex h-full min-w-0 min-h-0 flex-1 flex-col border geist-mono @container ${dragBackgroundColor}`}
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
          {overdueCount > 0 && (
            <span
              title={`${overdueCount} ${overdueCount === 1 ? 'tarefa' : 'tarefas'} em atraso`}
              aria-label={`${overdueCount} em atraso`}
              className="flex items-center gap-1 bg-danger px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sand"
            >
              <FiAlertCircle aria-hidden />
              {overdueCount}
              <span className="hidden @md:inline">
                {overdueCount === 1 ? 'atrasada' : 'atrasadas'}
              </span>
            </span>
          )}
        </span>
        <span className="flex gap-2 items-center">
          {column.id === TaskStatus.TODO && <TodoSortMenu />}
          {column.id === TaskStatus.DONE && <DoneRangeMenu />}
          <p>{filterTasksByColumn.length}</p>
          <CreateTaskDialog status={column.id} onCreate={onCreateTask} />
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              aria-hidden
              className="min-h-28 md:min-h-24 animate-pulse border-b border-b-ink/16 bg-ink/5"
            />
          ))}
        {!loading && filterTasksByColumn.length === 0 && (
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
