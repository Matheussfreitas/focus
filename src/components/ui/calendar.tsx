import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { cn } from '#/lib/utils.ts'

const cell = 'size-9 md:size-8'

function Calendar({
  className,
  classNames,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={ptBR}
      weekStartsOn={0}
      showOutsideDays
      className={cn('geist-mono text-ink', className)}
      classNames={{
        root: 'w-fit',
        months: 'relative flex flex-col',
        month: 'flex flex-col gap-2',
        month_caption: 'flex h-9 md:h-8 items-center justify-center',
        caption_label: 'text-xs font-bold uppercase tracking-wide',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: cn(
          cell,
          'flex items-center justify-center cursor-pointer hover:bg-ink/10',
        ),
        button_next: cn(
          cell,
          'flex items-center justify-center cursor-pointer hover:bg-ink/10',
        ),
        month_grid: 'border-collapse',
        weekdays: 'flex',
        weekday: cn(
          cell,
          'flex items-center justify-center text-[10px] uppercase text-ink-muted',
        ),
        week: 'flex',
        day: cn(cell, 'p-0 text-center text-xs'),
        day_button: cn(
          cell,
          'flex items-center justify-center cursor-pointer hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-ink',
        ),
        selected:
          '[&>button]:bg-ink [&>button]:text-sand [&>button]:hover:bg-ink',
        today: '[&>button]:border [&>button]:border-ink',
        outside: 'text-ink-muted/50',
        disabled: 'opacity-30',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <FiChevronLeft className="size-4" />
          ) : (
            <FiChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
