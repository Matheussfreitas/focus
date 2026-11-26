import { BiSolidRightArrow } from 'react-icons/bi'
import { PRIORITY_LABEL } from '#/lib/taskFilters.ts'
import { TAG_COLOR_HEX } from '../kanban/tagColors'
import type { DemoTask } from './demoData'

interface DemoCardProps {
  task: DemoTask
  active?: boolean
  done?: boolean
  onStart?: (task: DemoTask) => void
}

// Réplica visual do KanbanCard: o real abre edição e consulta as tags do
// usuário, o que não existe para um visitante da landing.
export function DemoCard({ task, active, done, onStart }: DemoCardProps) {
  return (
    <div
      className={`flex min-h-20 items-center gap-2 wrap-break-word border-b border-b-ink/16 border-l-3 p-2 schibsted-grotesk text-xs font-medium ${
        active ? 'border-l-ink bg-ink/6' : 'border-l-ocean'
      }`}
    >
      <span
        aria-hidden
        className={`flex size-4 shrink-0 items-center justify-center border text-[10px] ${
          done ? 'border-ink bg-ink text-sand' : 'border-ink/50'
        }`}
      >
        {done && '✓'}
      </span>
      <div className="flex flex-1 flex-col gap-2 px-3">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] font-semibold text-ink ${done ? 'line-through opacity-60' : ''}`}
          >
            {task.title}
          </p>
          {task.priority !== 'MEDIUM' && (
            <span
              className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide geist-mono ${
                task.priority === 'HIGH'
                  ? 'bg-danger text-sand'
                  : 'border border-ink/40 text-ink-muted'
              }`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1">
            <span
              className="size-2 shrink-0"
              style={{ backgroundColor: TAG_COLOR_HEX[task.tag.color] }}
            />
            <span className="text-ink-muted">
              {task.tag.name.toUpperCase()}
            </span>
          </span>
          {task.due && (
            <span
              className={
                task.due.tone === 'today' ? 'text-tag-red' : 'text-ink-muted'
              }
            >
              {task.due.label}
            </span>
          )}
        </div>
      </div>
      {onStart ? (
        <button
          type="button"
          onClick={() => onStart(task)}
          aria-label={`Iniciar ${task.title} no timer`}
          title="Iniciar no timer"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center hover:bg-ink/8"
        >
          <BiSolidRightArrow className="size-3 text-ink" />
        </button>
      ) : (
        <span
          className={`flex size-8 shrink-0 items-center justify-center ${done ? 'opacity-24' : ''}`}
        >
          <BiSolidRightArrow aria-hidden className="size-3 text-ink" />
        </span>
      )}
    </div>
  )
}

export function DemoColumnHead({
  index,
  title,
  count,
}: {
  index: string
  title: string
  count: number
}) {
  return (
    <div className="flex items-center justify-between border-y-2 border-ink bg-sand p-2 text-sm text-ink-muted geist-mono">
      <span className="flex items-center gap-2">
        <span>{index}</span>
        <span className="font-bold text-ink">{title}</span>
      </span>
      <span>{count}</span>
    </div>
  )
}
