import { useState } from 'react'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import { KanbanColumn } from './components/KanbanColumn'
import type { Task } from './types/task.type'
import { useTaskQueries } from './queries.task'

const columns = [
  { id: TaskStatus.TODO, title: 'A Fazer' },
  { id: TaskStatus.IN_PROGRESS, title: 'Fazendo' },
  { id: TaskStatus.DONE, title: 'Feito' },
]

interface KanbanProps {
  onStartTask: (task: Task) => void
}

export function Kanban({ onStartTask }: Readonly<KanbanProps>) {
  const [activeColumn, setActiveColumn] = useState<TaskStatus>(TaskStatus.TODO)
  const {
    tasksState,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  } = useTaskQueries()

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateTaskMutation.mutateAsync({ data: updatedTask })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (task: Task) => {
    await deleteTaskMutation.mutateAsync({ data: { id: task.id } })
  }

  const handleCreateTask = async (data: {
    title: string
    description?: string
    dueDate?: Date
    tagId?: string
    status: TaskStatus
  }) => {
    // Toda task nova nasce em "A Fazer", independente da coluna do botão +.
    await createTaskMutation.mutateAsync({
      data: { ...data, status: TaskStatus.TODO },
    })
    setActiveColumn(TaskStatus.TODO)
  }

  return (
    <div className="h-full flex flex-col bg-sand text-ink">
      <div
        role="tablist"
        aria-label="Colunas do kanban"
        className="grid grid-cols-3 border-b-2 border-ink md:hidden"
      >
        {columns.map((column) => {
          const selected = column.id === activeColumn
          const count = tasksState.filter((t) => t.status === column.id).length
          return (
            <button
              key={column.id}
              type="button"
              role="tab"
              id={`tab-${column.id}`}
              aria-selected={selected}
              aria-controls={`panel-${column.id}`}
              onClick={() => setActiveColumn(column.id)}
              className={`min-h-12 px-2 text-sm font-semibold geist-mono cursor-pointer ${
                selected ? 'bg-ink text-sand' : 'text-ink'
              }`}
            >
              {column.title.toUpperCase()} ({count})
            </button>
          )
        })}
      </div>
      <div className="flex grow min-h-0">
        {columns.map((column, index) => (
          <KanbanColumn
            key={column.id}
            column={column}
            active={column.id === activeColumn}
            tasks={tasksState}
            index={index + 1}
            updateTask={handleUpdateTask}
            deleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
            onStartTask={onStartTask}
          />
        ))}
      </div>
    </div>
  )
}
