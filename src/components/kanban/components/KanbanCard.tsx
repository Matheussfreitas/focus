import { useState } from 'react'
import { BiSolidRightArrow } from 'react-icons/bi'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import { Checkbox } from '../../ui/checkbox'
import { EditTaskDialog } from './EditTaskDialog'
import { TAG_COLOR_HEX } from '../tagColors'
import type { Task } from '../types/task.type'

// bg-sand
interface KanbanCardProps {
  task: Task
  onToggleDone: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
  onStartTask: (task: Task) => void
}

export function KanbanCard({
  task,
  onToggleDone,
  onDelete,
  onStartTask,
}: KanbanCardProps) {
  const [editOpen, setEditOpen] = useState(false)

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
      className="flex items-center gap-2 min-h-28 md:min-h-24 p-3 md:p-2 schibsted-grotesk text-sm md:text-xs font-medium border-l-3 border-ocean border-b border-b-ink/16 hover:cursor-grab"
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
      }}
    >
      <div className="p-2 -m-2">
        <Checkbox
          aria-label={`Concluir tarefa ${task.title}`}
          checked={formatTaskStatus(task.status)}
          onCheckedChange={(checked) =>
            onToggleDone({
              ...task,
              status: checked === true ? TaskStatus.DONE : TaskStatus.TODO,
            })
          }
          className="size-6 md:size-4 border-ink/50"
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Editar tarefa ${task.title}`}
        onClick={() => setEditOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setEditOpen(true)
          }
        }}
        className="flex-1 flex flex-col gap-2 px-3 md:px-4 self-stretch justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-ink"
      >
        <p className="text-ink font-semibold text-base md:text-[13px]">
          {task.title}
        </p>
        {task.description && (
          <p className="text-ink-muted text-sm md:text-xs">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-between items-center">
          {task.tag && (
            <span className="flex items-center gap-1">
              <span
                className="h-3 w-3 md:h-2 md:w-2 shrink-0"
                style={{ backgroundColor: TAG_COLOR_HEX[task.tag.color] }}
              />
              <span className="text-ink-muted">
                {task.tag.name.toUpperCase()}
              </span>
            </span>
          )}
          {task.dueDate && (
            <p
              style={{
                color:
                  formatDate(task.dueDate) === 'Hoje'
                    ? 'var(--color-tag-red)'
                    : 'var(--color-ink-muted)',
              }}
            >
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        data-tour="start-task"
        onClick={() => onStartTask(task)}
        className="ml-auto flex size-12 md:size-8 shrink-0 items-center justify-center cursor-pointer hover:bg-ink/8"
        title="Iniciar no Pomodoro"
        aria-label={`Iniciar ${task.title} no Pomodoro`}
      >
        <BiSolidRightArrow className="size-5 md:size-3 text-ink" />
      </button>
      <EditTaskDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onToggleDone}
        onDelete={onDelete}
      />
    </div>
  )
}
