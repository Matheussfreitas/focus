import { tasks } from './data'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn';
import type { Task } from './types/task.type'

const columns = [
  { id: 'TODO', title: 'A Fazer' },
  { id: 'IN_PROGRESS', title: 'Fazendo' },
  { id: 'DONE', title: 'Feito' },
]

export function Kanban() {
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
      const index = tasks.findIndex((task) => task.id === updatedTask.id)
      if (index !== -1) {
        tasks[index] = updatedTask
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center bg-[#EDE7DC] text-[#131A26] ">
      <div className="flex grow h-full">
        {columns.map((column, index) => (
          <KanbanColumn key={column.id} column={column} tasks={tasks} index={index + 1} />
        ))}
      </div>
    </div>
  )
}
