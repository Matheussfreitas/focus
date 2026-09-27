import { TaskStatus } from '#/generated/prisma/enums.ts'
import { KanbanColumn } from './KanbanColumn'
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
  const { tasksState, createTaskMutation, updateTaskMutation } = useTaskQueries()

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateTaskMutation.mutateAsync({ data: updatedTask })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleCreateTask = async (data: {
    title: string
    description?: string
    dueDate?: Date
    tagId?: string
    status: TaskStatus
  }) => {
    await createTaskMutation.mutateAsync({ data })
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center bg-[#EDE7DC] text-[#131A26] ">
      <div className="flex grow h-full">
        {columns.map((column, index) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksState}
            index={index + 1}
            updateTask={handleUpdateTask}
            onCreateTask={handleCreateTask}
            onStartTask={onStartTask}
          />
        ))}
      </div>
    </div>
  )
}
