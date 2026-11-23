import type { TaskPriority } from '#/generated/prisma/enums.ts'

// Ordem e rótulos fixos; tons da tinta (não cores de status nem de tag).
const ITEMS: { key: TaskPriority; label: string; tone: number }[] = [
  { key: 'HIGH', label: 'Alta', tone: 100 },
  { key: 'MEDIUM', label: 'Média', tone: 60 },
  { key: 'LOW', label: 'Baixa', tone: 28 },
]

export function PriorityBreakdown({
  counts,
}: {
  counts: Record<TaskPriority, number>
}) {
  const total = ITEMS.reduce((sum, item) => sum + counts[item.key], 0)

  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] bg-transparent">
        {total === 0 ? (
          <span className="h-full w-full bg-ink/[0.07]" />
        ) : (
          ITEMS.filter((item) => counts[item.key] > 0).map((item, i) => (
            <span
              key={item.key}
              className="dash-bar-x h-full"
              title={`${item.label}: ${counts[item.key]}`}
              style={
                {
                  '--i': i,
                  flexGrow: counts[item.key],
                  background: `color-mix(in oklab, var(--color-ink) ${item.tone}%, var(--color-sand))`,
                } as React.CSSProperties
              }
            />
          ))
        )}
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {ITEMS.map((item) => (
          <li key={item.key} className="flex flex-col">
            <span className="geist-mono flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-muted">
              <span
                aria-hidden
                className="h-2 w-2"
                style={{
                  background: `color-mix(in oklab, var(--color-ink) ${item.tone}%, var(--color-sand))`,
                }}
              />
              {item.label}
            </span>
            <span className="dash-num text-2xl text-ink">
              {counts[item.key]}
              {total > 0 && (
                <span className="ml-1 text-xs text-ink-muted">
                  {Math.round((counts[item.key] / total) * 100)}%
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
