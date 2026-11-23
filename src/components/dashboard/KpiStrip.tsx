import { formatDuration, formatPercent } from '#/lib/dashboard.ts'
import type { DashboardKpis } from '#/server/dashboard/dashboard.ts'

interface Delta {
  current: number | null
  previous: number | null
  // taxa: compara em pontos percentuais em vez de variação relativa
  points?: boolean
}

function DeltaBadge({ current, previous, points }: Delta) {
  if (current === null || previous === null) return null
  let diff: number
  let label: string
  if (points) {
    diff = current - previous
    label = `${Math.abs(Math.round(diff * 100))} p.p.`
  } else {
    if (previous === 0) {
      if (current === 0) return null
      return <span className="text-[10px] text-ink-muted">novo</span>
    }
    diff = (current - previous) / previous
    label = formatPercent(Math.abs(diff))
  }
  if (Math.round(Math.abs(diff) * 100) === 0) {
    return <span className="text-[10px] text-ink-muted">= anterior</span>
  }
  const up = diff > 0
  return (
    <span
      className={`text-[10px] ${up ? 'text-success' : 'text-danger'}`}
      title="Comparado ao período anterior de mesmo tamanho"
    >
      <span aria-hidden>{up ? '▲' : '▼'}</span>
      <span className="sr-only">{up ? 'subiu' : 'caiu'}</span> {label}
    </span>
  )
}

interface CellProps {
  label: string
  value: string
  unit?: string
  note?: React.ReactNode
  delta?: Delta
  index: number
  hero?: boolean
}

function Cell({ label, value, unit, note, delta, index, hero }: CellProps) {
  return (
    <div
      className={`dash-rise flex min-w-0 flex-col justify-between gap-3 p-4 sm:p-5 ${
        hero ? 'col-span-2 bg-ink text-sand lg:col-span-1' : 'bg-sand'
      }`}
      style={{ '--i': index } as React.CSSProperties}
    >
      <p
        className={`geist-mono text-[10px] uppercase tracking-widest ${
          hero ? 'text-sand/70' : 'text-ink-muted'
        }`}
      >
        {label}
      </p>
      <div>
        <p className="dash-num flex items-baseline gap-1 leading-none">
          <span className={hero ? 'text-5xl sm:text-6xl' : 'text-4xl'}>
            {value}
          </span>
          {unit && (
            <span
              className={`text-sm ${hero ? 'text-sand/70' : 'text-ink-muted'}`}
            >
              {unit}
            </span>
          )}
        </p>
        <div className="geist-mono mt-2 flex min-h-4 flex-wrap items-center gap-x-2 text-[10px]">
          {delta && <DeltaBadge {...delta} />}
          {note && (
            <span className={hero ? 'text-sand/70' : 'text-ink-muted'}>
              {note}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function KpiStrip({ kpis }: { kpis: DashboardKpis }) {
  const focus = formatDuration(kpis.focusMs)
  // "12h30" vira número grande "12h30"; minutos puros ganham a unidade ao lado
  const focusMatch = /^(\d+)min$/.exec(focus)

  return (
    <section
      aria-label="Resumo do período"
      // gap de 1px sobre fundo ink desenha as réguas entre as células
      className="grid grid-cols-2 gap-px border-b-2 border-ink bg-ink lg:grid-cols-5"
    >
      <Cell
        index={0}
        hero
        label="Tempo em foco"
        value={focusMatch ? focusMatch[1] : focus}
        unit={focusMatch ? 'min' : undefined}
        delta={{ current: kpis.focusMs, previous: kpis.prevFocusMs }}
        note={
          kpis.avgSessionMs !== null &&
          `média ${formatDuration(kpis.avgSessionMs)} por sessão`
        }
      />
      <Cell
        index={1}
        label="Tarefas feitas"
        value={String(kpis.tasksDone)}
        delta={{ current: kpis.tasksDone, previous: kpis.prevTasksDone }}
      />
      <Cell
        index={2}
        label="Sessões de foco"
        value={String(kpis.sessions)}
        delta={{ current: kpis.sessions, previous: kpis.prevSessions }}
      />
      <Cell
        index={3}
        label="Sessões até o fim"
        value={
          kpis.completionRate === null
            ? '-'
            : String(Math.round(kpis.completionRate * 100))
        }
        unit={kpis.completionRate === null ? undefined : '%'}
        delta={{
          current: kpis.completionRate,
          previous: kpis.prevCompletionRate,
          points: true,
        }}
        note={kpis.completionRate === null ? 'sem sessões' : undefined}
      />
      <Cell
        index={4}
        label="Sequência"
        value={String(kpis.streak)}
        unit={kpis.streak === 1 ? 'dia' : 'dias'}
        note={`recorde ${kpis.bestStreak} ${kpis.bestStreak === 1 ? 'dia' : 'dias'}`}
      />
    </section>
  )
}
