import { useState } from 'react'
import { CreateTaskDialog } from './CreateTaskDialog'
import { KanbanCard } from './KanbanCard'
import type { Column } from './types/column.type'
import type { Task } from './types/task.type'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  index: number
  updateTask: (task: Task) => void
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
  tasks,
  index,
  updateTask,
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

  const dragBackgroundColor = `${isOver ? 'bg-[rgba(17,26,43,.16)]' : ''}`

  return (
    <div
      className={`h-full flex-1 flex flex-col border geist-mono ${dragBackgroundColor}`}
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
        console.log(`Drag over em ${column.title}`)
      }}
    >
      <div
        className={`flex justify-between bg-[#EDE7DC] p-2 items-center text-sm text-[#5D5344] border-y-2 border-[#131A26] ${dragBackgroundColor}`}
      >
        <span className="flex gap-2 items-center">
          <p>{format(index)}</p>
          <p className="font-bold text-[#131A26]">
            {column.title.toUpperCase()}
          </p>
        </span>
        <span className="flex gap-2 items-center">
          <p>{filterTasksByColumn.length}</p>
          <CreateTaskDialog status={column.id} onCreate={onCreateTask} />
        </span>
      </div>
      <div>
        {filterTasksByColumn.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onToggleDone={updateTask}
            onStartTask={onStartTask}
          />
        ))}
      </div>
    </div>
  )
}
