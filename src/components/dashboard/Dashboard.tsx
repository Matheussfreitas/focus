import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FiArrowRight } from 'react-icons/fi'
import {
  DASHBOARD_RANGES,
  RANGE_LABEL,
  formatDuration,
  formatPercent,
} from '#/lib/dashboard.ts'
import type { DashboardRange } from '#/lib/dashboard.ts'
import type { DashboardData } from '#/server/dashboard/dashboard.ts'
import { FocusTimeline } from './FocusTimeline'
import { KpiStrip } from './KpiStrip'
import { PriorityBreakdown } from './PriorityBreakdown'
import { RhythmGrid } from './RhythmGrid'
import { TagLedger } from './TagLedger'
import { Swatch } from './chartColors'
import { dashboardQueryOptions } from './queries.dashboard'

const MONTHS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
]
const RANGE_TEXT: Record<DashboardRange, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  all: 'Todo o histórico',
}

function shortDate(key: string) {
  const [, m, d] = key.split('-')
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`
}

function RangeTabs({
  value,
  onChange,
}: {
  value: DashboardRange
  onChange: (range: DashboardRange) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Período"
      className="flex border border-ink"
    >
      {DASHBOARD_RANGES.map((range) => {
        const active = value === range
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(range)}
            className={`geist-mono min-h-9 flex-1 cursor-pointer px-3 text-xs tracking-widest transition-colors sm:flex-none ${
              active ? 'bg-ink text-sand' : 'text-ink hover:bg-ink/10'
            }`}
          >
            {RANGE_LABEL[range]}
          </button>
        )
      })}
    </div>
  )
}

function SectionHead({
  index,
  title,
  hint,
  children,
}: {
  index: string
  title: string
  hint?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t-2 border-ink pt-3 pb-5">
      <div className="flex items-baseline gap-3">
        <span className="geist-mono shrink-0 whitespace-nowrap text-xs text-ink-muted">
          {index}
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {title}
          </h2>
          {hint && <p className="text-meta mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="dash-rise grid gap-8 border-b-2 border-ink py-16 md:grid-cols-[1fr_auto] md:items-end">
      <div className="max-w-xl">
        <p className="label-mono">Nada registrado ainda</p>
        <p className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          Cada bloco de foco do timer passa a contar aqui.
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          Inicie uma tarefa com tag no kanban e deixe o timer correr: o tempo
          vai para a tag dela. Blocos com menos de um minuto não entram.
        </p>
      </div>
      <Link
        to="/"
        className="btn-primary geist-mono inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest"
      >
        Começar foco <FiArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

function Insight({ data }: { data: DashboardData }) {
  const tagged = data.tags.filter((t) => t.focusMs > 0)
  const total = tagged.reduce((sum, t) => sum + t.focusMs, 0)
  const top = tagged.at(0)
  if (!top || total === 0) {
    return <p className="text-meta">Sem foco registrado neste período.</p>
  }
  return (
    <p className="text-lg leading-snug text-ink">
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <Swatch color={top.color} />
        {top.name}
      </span>{' '}
      levou{' '}
      <span className="dash-num font-semibold">
        {formatPercent(top.focusMs / total)}
      </span>{' '}
      do seu foco:{' '}
      <span className="dash-num">{formatDuration(top.focusMs)}</span> em{' '}
      {top.sessions} {top.sessions === 1 ? 'sessão' : 'sessões'}.
    </p>
  )
}

interface DashboardProps {
  range: DashboardRange
  onRangeChange: (range: DashboardRange) => void
}

export function Dashboard({ range, onRangeChange }: DashboardProps) {
  const { data, isPending, isError, isPlaceholderData } = useQuery(
    dashboardQueryOptions(range),
  )
  const [selected, setSelected] = useState<string | null>(null)

  const firstKey = data?.timeline[0]?.key
  const lastKey = data?.timeline.at(-1)?.key

  const rhythm = (() => {
    if (!data) return null
    const grids = selected
      ? [data.rhythm[selected]].filter(Boolean)
      : Object.values(data.rhythm)
    const sum = Array.from({ length: 7 }, () => Array<number>(24).fill(0))
    for (const g of grids) {
      for (let d = 0; d < 7; d++)
        for (let h = 0; h < 24; h++) sum[d][h] += g[d][h]
    }
    return sum
  })()

  const selectedRow = data?.tags.find((t) => t.key === selected)
  const legend = data?.tags.filter((t) => t.focusMs > 0) ?? []

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        {/* Cabeçalho */}
        <header className="dash-rise flex flex-col gap-6 pt-8 pb-6 sm:pt-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-mono">
              Dashboard · {RANGE_TEXT[range]}
              {firstKey && lastKey && (
                <span className="text-ink">
                  {' '}
                  · {shortDate(firstKey)} a {shortDate(lastKey)}
                </span>
              )}
            </p>
            <h1 className="mt-2 text-5xl font-extrabold leading-[0.9] tracking-[-0.04em] text-ink sm:text-7xl">
              Seu ritmo
              <br />
              de foco<span className="text-ocean">.</span>
            </h1>
          </div>
          <RangeTabs value={range} onChange={onRangeChange} />
        </header>

        {isError && (
          <p className="border-y-2 border-ink py-6 text-sm text-danger">
            Não foi possível carregar o dashboard. Tente de novo em instantes.
          </p>
        )}

        {isPending && (
          <div className="grid grid-cols-2 gap-px border-b-2 border-ink bg-ink lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-36 animate-pulse bg-sand" />
            ))}
          </div>
        )}

        {data && !data.hasHistory && <EmptyState />}

        {data && data.hasHistory && (
          <div
            className={`transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
            aria-busy={isPlaceholderData}
          >
            <KpiStrip kpis={data.kpis} />

            {/* 01: linha do tempo */}
            <section className="mt-12">
              <SectionHead
                index="01"
                title="Foco ao longo do tempo"
                hint={`Minutos em foco por ${data.granularity === 'day' ? 'dia' : 'semana'}, empilhados por tag. Abaixo, tarefas concluídas.`}
              >
                {legend.length > 0 && (
                  <ul
                    className="flex flex-wrap gap-1.5"
                    aria-label="Legenda e filtro por tag"
                  >
                    {legend.map((t) => {
                      const active = selected === t.key
                      return (
                        <li key={t.key}>
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelected(active ? null : t.key)}
                            className={`geist-mono flex cursor-pointer items-center gap-1.5 border px-2 py-1 text-[11px] transition-opacity ${
                              active
                                ? 'border-ink bg-ink text-sand'
                                : 'border-ink/25 text-ink hover:border-ink'
                            } ${selected && !active ? 'opacity-50' : ''}`}
                          >
                            <Swatch color={t.color} />
                            {t.name}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </SectionHead>

              <div className="grid gap-10 lg:grid-cols-[1fr_17rem]">
                <div
                  className="dash-rise min-w-0"
                  style={{ '--i': 5 } as React.CSSProperties}
                >
                  <FocusTimeline
                    buckets={data.timeline}
                    series={data.tags}
                    selected={selected}
                    granularity={data.granularity}
                  />
                </div>
                <aside className="flex flex-col gap-8 lg:border-l lg:border-ink/20 lg:pl-6">
                  <div>
                    <p className="label-mono mb-2">Onde foi o foco</p>
                    <Insight data={data} />
                  </div>
                  <div>
                    <p className="label-mono mb-3">Concluídas por prioridade</p>
                    <PriorityBreakdown counts={data.priority} />
                  </div>
                </aside>
              </div>
            </section>

            {/* 02: por tag */}
            <section className="mt-14">
              <SectionHead
                index="02"
                title="Livro de tags"
                hint="Clique numa tag para destacá-la em todo o painel. Clique no cabeçalho para ordenar."
              >
                {selectedRow && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="geist-mono cursor-pointer text-[11px] uppercase tracking-widest text-ink underline underline-offset-4"
                  >
                    Limpar destaque
                  </button>
                )}
              </SectionHead>
              <TagLedger
                rows={data.tags}
                selected={selected}
                onSelect={setSelected}
              />
            </section>

            {/* 03: ritmo */}
            <section className="mt-14">
              <SectionHead
                index="03"
                title="Ritmo da semana"
                hint={
                  selectedRow
                    ? `Quando você foca em ${selectedRow.name}, por dia e hora de início.`
                    : 'Quando você mais foca, por dia da semana e hora de início.'
                }
              />
              {rhythm && <RhythmGrid grid={rhythm} />}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
