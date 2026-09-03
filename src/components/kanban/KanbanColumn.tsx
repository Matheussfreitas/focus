import { PlusIcon } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import type { Column } from './types/column.type'
import type { Task } from './types/task.type'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  index: number
}

export function KanbanColumn({ column, tasks, index }: KanbanColumnProps) {
  const format = (i: number) => {
    if (i < 10) {
      return `0${i}`
    }
    return i.toString()
  }

  const filterTasksByColumn = tasks.filter((task) => task.status === column.id)

  return (
    <div className="h-full flex-1 flex flex-col border geist-mono">
      <div className="flex justify-between bg-[#EDE7DC] p-2 items-center text-sm text-[#5D5344] border-y-2 border-[#131A26]">
        <span className="flex gap-2 items-center">
          <p>{format(index)}</p>
          <p className="font-bold text-[#131A26]">
            {column.title.toUpperCase()}
          </p>
        </span>
        <span className="flex gap-2 items-center">
          <p>{filterTasksByColumn.length}</p>
          {index === 1 && (
            <button
              onClick={() => console.log('Create task')}
              className="ml-2 hover:text-[#131A26] cursor-pointer"
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>
      <div>
        {filterTasksByColumn.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
