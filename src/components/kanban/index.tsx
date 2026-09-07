import { TaskStatus } from '#/generated/prisma/enums.ts'
import { useState } from 'react'
import { tasks } from './data'
import { KanbanColumn } from './KanbanColumn'
import type { Task } from './types/task.type'

const columns = [
  { id: TaskStatus.TODO, title: 'A Fazer' },
  { id: TaskStatus.IN_PROGRESS, title: 'Fazendo' },
  { id: TaskStatus.DONE, title: 'Feito' },
]

export function Kanban() {
  const [tasksState, setTasksState] = useState<Task[]>(tasks)

  const handleCreateTask = (task: Task) => {
    try {
      tasks.push({
        ...task,
        id: Date.now().toString(),
      })
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = (updatedTask: Task) => {
    try {
      const index = tasksState.findIndex((task) => task.id === updatedTask.id)
      if (index !== -1) {
        tasksState[index] = updatedTask
      }
      setTasksState([...tasksState])
    } catch (error) {
      console.error('Error updating task:', error)
    }
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
          />
        ))}
      </div>
    </div>
  )
}
