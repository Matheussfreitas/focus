import { useState } from 'react'
import { formatDuration } from '#/lib/dashboard.ts'

const DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
const DAYS_LONG = [
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
  'domingo',
]
// 5 degraus de um único matiz (a cor da paleta ativa), claro → escuro
const STEPS = [0.14, 0.32, 0.52, 0.74, 1]

interface RhythmGridProps {
  grid: number[][]
}

export function RhythmGrid({ grid }: RhythmGridProps) {
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null)
  const max = Math.max(...grid.flat(), 0)

  // Melhor faixa: a hora do dia com mais foco somando todos os dias.
  const byHour = Array.from({ length: 24 }, (_, h) =>
    grid.reduce((sum, row) => sum + row[h], 0),
  )
  const bestHour = byHour.indexOf(Math.max(...byHour))
  const byDay = grid.map((row) => row.reduce((a, b) => a + b, 0))
  const bestDay = byDay.indexOf(Math.max(...byDay))

  const level = (ms: number) => {
    if (ms <= 0 || max <= 0) return -1
    return Math.min(STEPS.length - 1, Math.floor((ms / max) * STEPS.length))
  }

  const hoverValue = hover ? grid[hover.d][hover.h] : null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_14rem]">
      <div className="overflow-x-auto pb-2">
        <div
          role="grid"
          aria-label="Foco por dia da semana e hora"
          className="inline-grid min-w-[560px] grid-cols-[2.5rem_repeat(24,minmax(14px,1fr))] gap-[2px]"
          style={{ width: '100%' }}
          onPointerLeave={() => setHover(null)}
        >
          {DAYS.map((day, d) => (
            <div key={day} role="row" className="contents">
              <span
                role="rowheader"
                className="geist-mono flex items-center text-[10px] text-ink-muted"
              >
                {day}
              </span>
              {grid[d].map((ms, h) => {
                const lv = level(ms)
                const active = hover?.d === d && hover.h === h
                return (
                  <span
                    key={h}
                    role="gridcell"
                    aria-label={`${DAYS_LONG[d]} ${h}h: ${ms > 0 ? formatDuration(ms) : 'sem foco'}`}
                    onPointerEnter={() => setHover({ d, h })}
                    className={`aspect-square ${active ? 'outline-2 outline-offset-1 outline-ink' : ''}`}
                    style={{
                      background:
                        lv < 0
                          ? 'color-mix(in oklab, var(--color-ink) 6%, transparent)'
                          : `color-mix(in oklab, var(--color-ocean) ${STEPS[lv] * 100}%, var(--color-sand))`,
                    }}
                  />
                )
              })}
            </div>
          ))}
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span
              key={h}
              className="geist-mono pt-1 text-center text-[9px] text-ink-muted"
            >
              {h % 3 === 0 ? String(h).padStart(2, '0') : ''}
            </span>
          ))}
        </div>
        <div className="geist-mono mt-3 flex items-center gap-1.5 text-[10px] text-ink-muted">
          menos
          {STEPS.map((step) => (
            <span
              key={step}
              className="h-2.5 w-2.5"
              style={{
                background: `color-mix(in oklab, var(--color-ocean) ${step * 100}%, var(--color-sand))`,
              }}
            />
          ))}
          mais
          <span className="ml-auto text-ink" aria-live="polite">
            {hover &&
              `${DAYS_LONG[hover.d]} ${String(hover.h).padStart(2, '0')}h · ${
                hoverValue ? formatDuration(hoverValue) : 'sem foco'
              }`}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px self-start bg-ink/15 lg:grid-cols-1">
        <div className="bg-sand py-3 lg:pl-5">
          <dt className="geist-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Melhor horário
          </dt>
          <dd className="dash-num mt-1 text-3xl text-ink">
            {max > 0 ? `${String(bestHour).padStart(2, '0')}h` : '-'}
          </dd>
        </div>
        <div className="bg-sand py-3 pl-4 lg:pl-5">
          <dt className="geist-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Dia mais forte
          </dt>
          <dd className="mt-1 text-3xl font-semibold capitalize text-ink">
            {max > 0 ? DAYS_LONG[bestDay] : '-'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
