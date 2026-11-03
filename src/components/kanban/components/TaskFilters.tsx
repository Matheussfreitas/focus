import { FiChevronDown } from 'react-icons/fi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { usePreferences } from '#/lib/preferences.tsx'
import {
  DONE_RANGES,
  TODO_SORTS,
  isDoneRange,
  isTodoSort,
} from '#/lib/taskFilters.ts'

interface FilterMenuProps {
  prefix: string
  current: string
  options: readonly { id: string; label: string }[]
  onChange: (value: string) => void
}

function FilterMenu({
  prefix,
  current,
  options,
  onChange,
}: Readonly<FilterMenuProps>) {
  const currentLabel = options.find((o) => o.id === current)?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${prefix}: ${currentLabel}`}
          className="flex min-h-11 md:min-h-6 items-center gap-1 px-1.5 text-[10px] uppercase tracking-wide text-ink-muted hover:text-ink cursor-pointer"
        >
          <span className="hidden @xs:inline">{prefix}:</span>
          <span className="font-bold text-ink">{currentLabel}</span>
          <FiChevronDown aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-none border border-ink bg-sand text-ink"
      >
        <DropdownMenuRadioGroup value={current} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              className="cursor-pointer rounded-none"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TodoSortMenu() {
  const { todoSort, setTodoSort } = usePreferences()
  return (
    <FilterMenu
      prefix="Ordem"
      current={todoSort}
      options={TODO_SORTS}
      onChange={(v) => isTodoSort(v) && setTodoSort(v)}
    />
  )
}

export function DoneRangeMenu() {
  const { doneRange, setDoneRange } = usePreferences()
  return (
    <FilterMenu
      prefix="Período"
      current={doneRange}
      options={DONE_RANGES}
      onChange={(v) => isDoneRange(v) && setDoneRange(v)}
    />
  )
}
