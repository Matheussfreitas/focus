import { useState } from 'react'
import { BiSolidRightArrow } from 'react-icons/bi'
import { FiAlertCircle } from 'react-icons/fi'
import { TaskStatus } from '#/generated/prisma/enums.ts'
import { Checkbox } from '../../ui/checkbox'
import { EditTaskDialog } from './EditTaskDialog'
import { TAG_COLOR_HEX } from '../tagColors'
import {
  formatDueLabel,
  getDueStatus,
  getOverdueDays,
  isTaskOverdue,
} from '../dueDate'
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
  // tarefa concluída não volta para o timer
  const isDone = task.status === TaskStatus.DONE

  const overdue = isTaskOverdue(task)
  const overdueDays = getOverdueDays(task.dueDate)

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
      className={`flex items-center gap-2 min-h-28 md:min-h-24 p-3 md:p-2 schibsted-grotesk text-sm md:text-xs font-medium border-l-3 ${overdue ? 'border-danger' : 'border-ocean'} border-b border-b-ink/16 hover:cursor-grab`}
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
          {task.dueDate &&
            (overdue ? (
              <p
                className="ml-auto flex items-center gap-1 font-bold text-danger geist-mono"
                aria-label={`Atrasada há ${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}`}
              >
                <FiAlertCircle aria-hidden className="shrink-0" />
                ATRASADA · {overdueDays}d
              </p>
            ) : (
              <p
                className={`ml-auto ${
                  getDueStatus(task.dueDate) === 'today'
                    ? 'text-tag-red'
                    : 'text-ink-muted'
                }`}
              >
                {formatDueLabel(task.dueDate)}
              </p>
            ))}
        </div>
      </div>
      <button
        type="button"
        data-tour={isDone ? undefined : 'start-task'}
        onClick={() => onStartTask(task)}
        disabled={isDone}
        className="ml-auto flex size-12 md:size-8 shrink-0 items-center justify-center cursor-pointer hover:bg-ink/8 disabled:cursor-not-allowed disabled:opacity-24 disabled:hover:bg-transparent"
        title={isDone ? 'Tarefa concluída' : 'Iniciar no Pomodoro'}
        aria-label={
          isDone
            ? `${task.title} já foi concluída`
            : `Iniciar ${task.title} no Pomodoro`
        }
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
