import { BiSolidRightArrow } from 'react-icons/bi'
import { Checkbox } from '../ui/checkbox'
import { tasks } from './data'
import type { Task } from './types/task.type'

// bg-[#EDE7DC]

export function KanbanCard({ task }: { task: Task }) {
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
        return status
    }
  }

  async function updatedTaskStatus(id: string) {
    const item = tasks.find((t) => t.id === id)
    if (item?.status === 'DONE') {
      return false
    }
    item.status = 'DONE'
    return true
  }

  return (
    <div className="flex items-center gap-2 p-2 schibsted-grotesk text-xs font-medium border-l-3 border-amber-500 border-b border-b-[rgba(17,26,43,.16)] hover:cursor-pointer">
      <div>
        <Checkbox
          checked={formatTaskStatus(task.status)}
          onCheckedChange={() => console.log('abu')}
          className="border-[rgba(17,26,43,.16)]"
        />
      </div>
      <div className="flex-1 flex flex-col gap-2 px-4 mr-4">
        <p className="text-[#131A26] font-semibold text-[13px]">{task.title}</p>
        <div className="flex justify-between items-center">
          {task.tag && (
            <span className="text-blue-900">{task.tag.name.toUpperCase()}</span>
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
      <div className="ml-auto">
        <BiSolidRightArrow className="w-3 h-3 text-[#5D5344]" />
      </div>
    </div>
  )
}
