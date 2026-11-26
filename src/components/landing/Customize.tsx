import { useState } from 'react'
import { PALETTES } from '#/lib/palette.ts'
import type { PaletteId } from '#/lib/palette.ts'
import { DemoCard, DemoColumnHead } from './DemoCard'
import { DEMO_TASKS } from './demoData'

const LAYOUTS = [
  { id: 'split', label: 'Timer e tarefas' },
  { id: 'pomodoro', label: 'Só timer' },
  { id: 'kanban', label: 'Só tarefas' },
] as const

type LayoutId = (typeof LAYOUTS)[number]['id']

const optionClass = (active: boolean) =>
  `cursor-pointer border-2 px-3 py-2 text-sm transition-[transform,background-color] active:translate-y-px ${
    active
      ? 'border-ink bg-ink text-sand'
      : 'border-ink/30 text-ink hover:-translate-y-0.5 hover:border-ink'
  }`

// Prévia local: a paleta vale só dentro da moldura (data-palette no
// container), sem salvar cookie nem mudar a página.
export function Customize() {
  const [layout, setLayout] = useState<LayoutId>('split')
  const [palette, setPalette] = useState<PaletteId>('ocean')

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <fieldset>
          <legend className="label-mono mb-2">Layout</legend>
          <div className="flex flex-wrap gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={layout === l.id}
                onClick={() => setLayout(l.id)}
                className={optionClass(layout === l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label-mono mb-2">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={palette === p.id}
                onClick={() => setPalette(p.id)}
                className={`flex items-center gap-2 ${optionClass(palette === p.id)}`}
              >
                <span
                  aria-hidden
                  className={`size-3.5 border border-sand/40 ${p.swatch}`}
                />
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div
        data-palette={palette}
        aria-hidden
        className="border-2 border-ink bg-sand shadow-[8px_8px_0_0_var(--color-ink)] transition-colors"
      >
        <div className="flex h-9 items-center gap-3 border-b-2 border-ink px-3">
          <span className="text-sm font-bold text-ink">FOCUS</span>
          <span className="h-full w-0.5 bg-ink" />
          <span className="text-xs text-ink-muted geist-mono">
            {LAYOUTS.find((l) => l.id === layout)?.label.toUpperCase()}
          </span>
        </div>
        <div
          className={`grid h-72 sm:h-80 ${layout === 'split' ? 'sm:grid-cols-[1fr_1.4fr]' : ''}`}
        >
          {layout !== 'kanban' && <StaticTimer />}
          {layout !== 'pomodoro' && (
            <div
              className={`grid min-w-0 ${layout === 'kanban' ? 'sm:grid-cols-3' : ''} ${layout === 'split' ? 'hidden sm:grid' : ''}`}
            >
              <Column index="01" title="A FAZER" tasks={DEMO_TASKS.slice(1)} />
              {layout === 'kanban' && (
                <>
                  <Column
                    index="02"
                    title="FAZENDO"
                    tasks={DEMO_TASKS.slice(0, 1)}
                    className="hidden sm:block sm:border-l-2"
                  />
                  <Column
                    index="03"
                    title="FEITO"
                    tasks={[]}
                    className="hidden sm:block sm:border-l-2"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Column({
  index,
  title,
  tasks,
  className = '',
}: {
  index: string
  title: string
  tasks: typeof DEMO_TASKS
  className?: string
}) {
  return (
    <div className={`min-w-0 overflow-hidden border-ink ${className}`}>
      <DemoColumnHead index={index} title={title} count={tasks.length} />
      {tasks.map((t) => (
        <DemoCard key={t.id} task={t} />
      ))}
    </div>
  )
}

function StaticTimer() {
  const ring = `conic-gradient(var(--color-cream) 130deg, color-mix(in oklab, var(--color-cream) 24%, transparent) 0deg)`
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-ocean transition-colors">
      <div
        className="flex size-36 items-center justify-center rounded-[35%]"
        style={{ background: ring }}
      >
        <div className="flex size-[80%] items-center justify-center rounded-full bg-ocean transition-colors">
          <span className="text-3xl text-cream geist-mono">16:24</span>
        </div>
      </div>
      <p className="text-xs text-cream/62 geist-mono">EM CURSO</p>
      <p className="text-sm font-bold text-cream">
        Revisar relatório trimestral
      </p>
    </div>
  )
}
