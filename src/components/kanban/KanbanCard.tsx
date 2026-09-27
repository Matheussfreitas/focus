import { BiSolidRightArrow } from 'react-icons/bi'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import { Checkbox } from '../ui/checkbox'
import { TAG_COLOR_HEX } from './tagColors'
import type { Task } from './types/task.type'

// bg-[#EDE7DC]
interface KanbanCardProps {
  task: Task
  onToggleDone: (task: Task) => void
  onStartTask: (task: Task) => void
}

export function KanbanCard({ task, onToggleDone, onStartTask }: KanbanCardProps) {
  const formatDate = (date: Date) => {
    if (date.getDate() === new Date().getDate()) {
      return 'Hoje'
    }
    if (date.getDate() === new Date().getDate() + 1) {
      return 'Amanhã'
    }
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  const formatTaskStatus = (status: string) => {
    switch (status) {
      case 'TODO':
        return false
      case 'IN_PROGRESS':
        return false
      case 'DONE':
        return true
      default:
        return false
    }
  }

  return (
    <div
      className="flex items-center gap-2 p-2 schibsted-grotesk text-xs font-medium border-l-3 border-amber-500 border-b border-b-[rgba(17,26,43,.16)] hover:cursor-pointer"
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        console.log(`Drag start: ${task.title}`)
      }}
    >
      <div>
        <Checkbox
          checked={formatTaskStatus(task.status)}
          onCheckedChange={(checked) =>
            onToggleDone({
              ...task,
              status: checked === true ? TaskStatus.DONE : TaskStatus.TODO,
            })
          }
          className="border-[rgba(17,26,43,.16)]"
        />
      </div>
      <div className="flex-1 flex flex-col gap-2 px-4 mr-4">
        <p className="text-[#131A26] font-semibold text-[13px]">{task.title}</p>
        {task.description && (
          <p className="text-[#5D5344] text-xs">{task.description}</p>
        )}
        <div className="flex justify-between items-center">
          {task.tag && (
            <span className="flex items-center gap-1">
              <span
                className="h-2 w-2 shrink-0"
                style={{ backgroundColor: TAG_COLOR_HEX[task.tag.color] }}
              />
              <span className="text-[#5D5344]">
                {task.tag.name.toUpperCase()}
              </span>
            </span>
          )}
          {task.dueDate && (
            <p
              style={{
                color:
                  formatDate(task.dueDate) === 'Hoje' ? '#7e2020' : '#5D5344',
              }}
            >
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onStartTask(task)}
        className="ml-auto cursor-pointer"
        title="Iniciar no Pomodoro"
      >
        <BiSolidRightArrow className="w-3 h-3 text-[#5D5344]" />
      </button>
    </div>
  )
}
