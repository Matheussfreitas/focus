import { useState } from 'react'
import { FiCalendar } from 'react-icons/fi'
import { Calendar } from '../../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { ClearButton } from './ClearButton'
import { formatDDMMYYYY, parseDDMMYYYY } from '../taskForm'

interface DueDatePickerProps {
  id?: string
  // dd/mm/aaaa, '' quando não há data
  value?: string
  onChange: (value: string) => void
}

const footerButton =
  'flex-1 py-2 text-xs uppercase tracking-wide cursor-pointer hover:bg-ink/10'

export function DueDatePicker({ id, value, onChange }: DueDatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = (value && parseDDMMYYYY(value)) || undefined

  const select = (date: Date | undefined) => {
    onChange(date ? formatDDMMYYYY(date) : '')
    setOpen(false)
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className={`input-field flex h-9 w-full items-center gap-2 border px-3 text-sm cursor-pointer ${selected ? 'pr-9' : ''}`}
          >
            <FiCalendar aria-hidden className="shrink-0" />
            {selected ? (
              <span>{formatDDMMYYYY(selected)}</span>
            ) : (
              <span className="text-ink-muted">Sem data</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-none border border-ink bg-sand p-0 text-ink shadow-none"
        >
          <div className="p-2">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected}
              onSelect={select}
            />
          </div>
          <div className="flex border-t border-ink geist-mono">
            <button
              type="button"
              className={footerButton}
              onClick={() => select(new Date())}
            >
              Hoje
            </button>
            <button
              type="button"
              className={`${footerButton} border-l border-ink`}
              onClick={() => select(undefined)}
            >
              Limpar
            </button>
          </div>
        </PopoverContent>
      </Popover>
      {selected && (
        <ClearButton label="Apagar data" onClick={() => onChange('')} />
      )}
    </div>
  )
}
