import { tasks } from './data';
import { KanbanCard } from './KanbanCard';
import type { Task } from './types/task.type';

const columns = [
  { id: 'TODO', title: 'A fazer' },
  { id: 'IN_PROGRESS', title: 'Em Progresso' },
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
    <div className="flex-1 flex items-center justify-center border border-amber-400 text-[#131A26]">
      <div className="flex">
        {columns.map((column) => (
          <div key={column.id}>
            <div className="bg-[#1D396E] text-[#F4F6FA] p-6">
              <h2>{column.title}</h2>
            </div>
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <KanbanCard key={task.id} task={task} />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
