import { useState } from 'react'
import { formatDuration, formatLead, formatPercent } from '#/lib/dashboard.ts'
import type { DashboardTagRow } from '#/server/dashboard/dashboard.ts'
import { CHART_TAG_COLOR, Swatch } from './chartColors'

type SortKey =
  | 'focusMs'
  | 'tasksDone'
  | 'focusPerTaskMs'
  | 'avgLeadMs'
  | 'onTimeRate'
  | 'overdue'

const COLUMNS: { key: SortKey; label: string; hint: string }[] = [
  { key: 'focusMs', label: 'Foco', hint: 'Tempo em foco no período' },
  { key: 'tasksDone', label: 'Feitas', hint: 'Tarefas concluídas no período' },
  {
    key: 'focusPerTaskMs',
    label: 'Foco/tarefa',
    hint: 'Tempo de foco médio por tarefa concluída',
  },
  {
    key: 'avgLeadMs',
    label: 'Ciclo',
    hint: 'Tempo médio entre criar e concluir a tarefa',
  },
  {
    key: 'onTimeRate',
    label: 'No prazo',
    hint: 'Concluídas até a data de entrega (entre as que tinham data)',
  },
  {
    key: 'overdue',
    label: 'Atrasadas',
    hint: 'Tarefas abertas hoje com a data de entrega vencida',
  },
]

function cell(row: DashboardTagRow, key: SortKey) {
  const value = row[key]
  if (value === null) return <span className="text-ink-muted">-</span>
  switch (key) {
    case 'focusMs':
      return value === 0 ? (
        <span className="text-ink-muted">-</span>
      ) : (
        formatDuration(value)
      )
    case 'focusPerTaskMs':
      return formatDuration(value)
    case 'avgLeadMs':
      return formatLead(value)
    case 'onTimeRate':
      return formatPercent(value)
    case 'overdue':
      return value > 0 ? (
        <span className="text-danger">
          {value}
          <span className="text-ink-muted"> / {row.open}</span>
        </span>
      ) : (
        <span className="text-ink-muted">0 / {row.open}</span>
      )
    default:
      return value
  }
}

interface TagLedgerProps {
  rows: DashboardTagRow[]
  selected: string | null
  onSelect: (key: string | null) => void
}

export function TagLedger({ rows, selected, onSelect }: TagLedgerProps) {
  const [sort, setSort] = useState<SortKey>('focusMs')
  const sorted = [...rows].sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1))
  const maxFocus = Math.max(...rows.map((r) => r.focusMs), 1)

  if (rows.length === 0) {
    return (
      <p className="geist-mono px-1 py-6 text-xs text-ink-muted">
        Nenhuma tag com atividade no período.
      </p>
    )
  }

  const toggle = (key: string) => onSelect(selected === key ? null : key)

  return (
    <div>
      {/* Desktop: tabela de razão */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-ink">
            <th className="geist-mono py-2 pr-4 text-left text-[10px] font-normal uppercase tracking-widest text-ink-muted">
              Tag
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="py-2 pl-3 text-right"
                aria-sort={sort === col.key ? 'descending' : 'none'}
              >
                <button
                  type="button"
                  title={col.hint}
                  onClick={() => setSort(col.key)}
                  className={`geist-mono cursor-pointer text-[10px] uppercase tracking-widest ${
                    sort === col.key
                      ? 'text-ink underline underline-offset-4'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {col.label}
                  {sort === col.key && ' ↓'}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const active = selected === row.key
            const faded = selected !== null && !active
            return (
              <tr
                key={row.key}
                onClick={() => toggle(row.key)}
                className={`dash-rise cursor-pointer border-b border-ink/15 transition-opacity hover:bg-ink/5 ${
                  active ? 'bg-ink/[0.07]' : ''
                } ${faded ? 'opacity-45' : ''}`}
                style={{ '--i': i + 6 } as React.CSSProperties}
              >
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(row.key)
                    }}
                    className="flex w-full min-w-40 cursor-pointer flex-col gap-1.5 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Swatch color={row.color} />
                      {row.name}
                    </span>
                    <span className="block h-1.5 w-full bg-ink/[0.07]">
                      <span
                        className={`dash-bar-x block h-full ${row.color ? '' : 'dash-hatch'}`}
                        style={
                          {
                            '--i': i,
                            width: `${(row.focusMs / maxFocus) * 100}%`,
                            background: row.color
                              ? CHART_TAG_COLOR[row.color]
                              : undefined,
                          } as React.CSSProperties
                        }
                      />
                    </span>
                  </button>
                </td>
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={`dash-num py-3 pl-3 text-right text-sm text-ink ${
                      col.key === 'focusMs' ? 'font-semibold' : ''
                    }`}
                  >
                    {cell(row, col.key)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Mobile: um cartão por tag */}
      <ul className="space-y-px bg-ink/15 md:hidden">
        {sorted.map((row) => {
          const active = selected === row.key
          return (
            <li key={row.key} className="bg-sand">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => toggle(row.key)}
                className={`w-full cursor-pointer px-1 py-3 text-left ${
                  selected !== null && !active ? 'opacity-45' : ''
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Swatch color={row.color} />
                  {row.name}
                  <span className="dash-num ml-auto">
                    {cell(row, 'focusMs')}
                  </span>
                </span>
                <span className="mt-2 block h-1.5 w-full bg-ink/[0.07]">
                  <span
                    className={`block h-full ${row.color ? '' : 'dash-hatch'}`}
                    style={{
                      width: `${(row.focusMs / maxFocus) * 100}%`,
                      background: row.color
                        ? CHART_TAG_COLOR[row.color]
                        : undefined,
                    }}
                  />
                </span>
                <span className="mt-2 grid grid-cols-3 gap-2">
                  {COLUMNS.slice(1).map((col) => (
                    <span key={col.key} className="flex flex-col">
                      <span className="geist-mono text-[9px] uppercase tracking-widest text-ink-muted">
                        {col.label}
                      </span>
                      <span className="dash-num text-sm text-ink">
                        {cell(row, col.key)}
                      </span>
                    </span>
                  ))}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
