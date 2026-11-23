import { useState } from 'react'
import { formatDuration } from '#/lib/dashboard.ts'
import type {
  DashboardBucket,
  DashboardTagRow,
} from '#/server/dashboard/dashboard.ts'
import { NoTagPattern, Swatch, seriesFill } from './chartColors'
import { useElementWidth } from './useElementWidth'

const HEIGHT = 220
const DONE_ROW = 22
const AXIS_ROW = 18
const LEFT = 40
const TOP = 10
const GAP = 2 // espaço de superfície entre segmentos e entre barras

// Topo arredondado de 4px só no último segmento da pilha (ancorado na base).
function topRoundedRect(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}

function niceStep(maxMinutes: number) {
  const steps = [15, 30, 60, 120, 180, 240, 360, 480, 720, 1440, 2880]
  return steps.find((s) => maxMinutes / s <= 4) ?? 2880
}

interface FocusTimelineProps {
  buckets: DashboardBucket[]
  series: DashboardTagRow[]
  selected: string | null
  granularity: 'day' | 'week'
}

export function FocusTimeline({
  buckets,
  series,
  selected,
  granularity,
}: FocusTimelineProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const plotW = Math.max(width - LEFT, 100)
  const plotH = HEIGHT - TOP - DONE_ROW - AXIS_ROW
  const slot = plotW / Math.max(buckets.length, 1)
  const barW = Math.max(Math.min(slot - GAP * 2, 36), 2)

  const totals = buckets.map((b) =>
    series.reduce((sum, s) => sum + (b.focus[s.key] ?? 0), 0),
  )
  const maxMinutes = Math.max(...totals, 1) / 60000
  const step = niceStep(maxMinutes)
  const ticks = Math.max(1, Math.ceil(maxMinutes / step))
  const scaleMax = ticks * step
  const y = (minutes: number) => (minutes / scaleMax) * plotH

  // rótulo do eixo X: espaça para não colidir (~44px por rótulo)
  const labelEvery = Math.max(1, Math.ceil(44 / slot))
  const baseY = TOP + plotH
  const hovered = hover !== null ? buckets[hover] : null

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Tempo em foco por ${granularity === 'day' ? 'dia' : 'semana'}, empilhado por tag`}
        className="block overflow-visible"
        onPointerLeave={() => setHover(null)}
      >
        <NoTagPattern />

        {Array.from({ length: ticks + 1 }, (_, i) => {
          const minutes = i * step
          const ty = baseY - y(minutes)
          return (
            <g key={i}>
              <line
                x1={LEFT}
                x2={LEFT + plotW}
                y1={ty}
                y2={ty}
                stroke="var(--color-ink)"
                strokeOpacity={i === 0 ? 1 : 0.12}
                strokeWidth={i === 0 ? 1.5 : 1}
                strokeDasharray={i === 0 ? undefined : '2 4'}
              />
              <text
                x={LEFT - 8}
                y={ty}
                dy="0.32em"
                textAnchor="end"
                className="geist-mono fill-ink-muted text-[10px]"
              >
                {minutes === 0 ? '0' : formatDuration(minutes * 60000)}
              </text>
            </g>
          )
        })}

        {buckets.map((bucket, i) => {
          const x = LEFT + i * slot + (slot - barW) / 2
          let acc = 0
          const present = series.filter((s) => (bucket.focus[s.key] ?? 0) > 0)
          const dim = hover !== null && hover !== i
          return (
            <g key={bucket.key} opacity={dim ? 0.45 : 1}>
              {present.map((s, j) => {
                const minutes = bucket.focus[s.key] / 60000
                const h = y(minutes)
                const top = baseY - y(acc + minutes)
                acc += minutes
                const isLast = j === present.length - 1
                const faded = selected !== null && selected !== s.key
                // gap de 2px de superfície entre segmentos empilhados
                const segH = Math.max(h - (isLast ? 0 : GAP), 1)
                return (
                  <path
                    key={s.key}
                    className="dash-bar"
                    style={{ '--i': i } as React.CSSProperties}
                    d={
                      isLast
                        ? topRoundedRect(x, top, barW, segH, 4)
                        : `M${x},${top + GAP}h${barW}v${segH}h${-barW}Z`
                    }
                    fill={seriesFill(s.key, s.color)}
                    opacity={faded ? 0.18 : 1}
                  />
                )
              })}

              {bucket.done > 0 && (
                <g
                  transform={`translate(${LEFT + i * slot + slot / 2}, ${baseY + DONE_ROW / 2 + 2})`}
                >
                  {slot >= 16 ? (
                    <text
                      textAnchor="middle"
                      dy="0.32em"
                      className="geist-mono fill-ink text-[10px] font-semibold"
                    >
                      {bucket.done}
                    </text>
                  ) : (
                    <rect
                      x={-1.5}
                      y={-1.5}
                      width={3}
                      height={3}
                      fill="var(--color-ink)"
                    />
                  )}
                </g>
              )}

              {i % labelEvery === 0 && (
                <text
                  x={LEFT + i * slot + slot / 2}
                  y={HEIGHT - 4}
                  textAnchor="middle"
                  className="geist-mono fill-ink-muted text-[10px] uppercase"
                >
                  {bucket.label}
                </text>
              )}

              {/* alvo de hover: a coluna inteira, maior que a barra */}
              <rect
                x={LEFT + i * slot}
                y={TOP}
                width={slot}
                height={plotH + DONE_ROW}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${bucket.label}: ${formatDuration(totals[i])} em foco, ${bucket.done} tarefas`}
                className="outline-none"
              />
            </g>
          )
        })}

        <text
          x={LEFT - 8}
          y={baseY + DONE_ROW / 2 + 2}
          dy="0.32em"
          textAnchor="end"
          className="geist-mono fill-ink-muted text-[9px] uppercase"
        >
          feitas
        </text>
      </svg>

      {hovered && hover !== null && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 w-56 border border-ink bg-sand px-3 py-2 shadow-[3px_3px_0_0_var(--color-ink)]"
          style={{
            left: Math.min(
              Math.max(LEFT + hover * slot + slot / 2 - 112, 0),
              Math.max(width - 224, 0),
            ),
            top: TOP,
          }}
        >
          <p className="geist-mono text-[10px] uppercase tracking-widest text-ink-muted">
            {granularity === 'week'
              ? `semana de ${hovered.label}`
              : hovered.label}
          </p>
          <p className="dash-num text-xl text-ink">
            {formatDuration(totals[hover])}
          </p>
          <ul className="mt-1 space-y-0.5">
            {series
              .filter((s) => (hovered.focus[s.key] ?? 0) > 0)
              .map((s) => (
                <li
                  key={s.key}
                  className="geist-mono flex items-center gap-2 text-[11px] text-ink"
                >
                  <Swatch color={s.color} />
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span className="ml-auto shrink-0 whitespace-nowrap pl-3 tabular-nums">
                    {formatDuration(hovered.focus[s.key])}
                  </span>
                </li>
              ))}
          </ul>
          <p className="geist-mono mt-1.5 border-t border-ink/20 pt-1.5 text-[11px] text-ink">
            {hovered.done}{' '}
            {hovered.done === 1 ? 'tarefa feita' : 'tarefas feitas'}
          </p>
        </div>
      )}
    </div>
  )
}
