import { TagsColor } from '#/generated/prisma/enums.ts'
import { NO_TAG_KEY } from '#/lib/dashboard.ts'

// Cor de gráfico de cada tag: mesmo matiz da tag no kanban, em versão mais
// clara (ver --color-chart-* em styles.css). A cor segue a tag, nunca a posição.
export const CHART_TAG_COLOR: Record<TagsColor, string> = {
  [TagsColor.RED]: 'var(--color-chart-red)',
  [TagsColor.GREEN]: 'var(--color-chart-green)',
  [TagsColor.BLUE]: 'var(--color-chart-blue)',
  [TagsColor.YELLOW]: 'var(--color-chart-yellow)',
  [TagsColor.ORANGE]: 'var(--color-chart-orange)',
  [TagsColor.PURPLE]: 'var(--color-chart-purple)',
  [TagsColor.PINK]: 'var(--color-chart-pink)',
  [TagsColor.BROWN]: 'var(--color-chart-brown)',
  [TagsColor.GRAY]: 'var(--color-chart-gray)',
}

export const NO_TAG_PATTERN_ID = 'dash-no-tag'

/** Preenchimento SVG de uma série: cor da tag ou hachura para "Sem tag". */
export function seriesFill(key: string, color: TagsColor | null) {
  if (key === NO_TAG_KEY || !color) return `url(#${NO_TAG_PATTERN_ID})`
  return CHART_TAG_COLOR[color]
}

/** Amostra (quadradinho) da série, em HTML. */
export function Swatch({
  color,
  className = 'h-2.5 w-2.5',
}: {
  color: TagsColor | null
  className?: string
}) {
  return color ? (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{ background: CHART_TAG_COLOR[color] }}
    />
  ) : (
    <span
      aria-hidden
      className={`inline-block shrink-0 border border-ink-muted dash-hatch ${className}`}
    />
  )
}

/** Hachura usada por "Sem tag"; declarar uma vez dentro de cada <svg>. */
export function NoTagPattern() {
  return (
    <defs>
      <pattern
        id={NO_TAG_PATTERN_ID}
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="5" height="5" fill="var(--color-sand-gray)" />
        <rect width="1.6" height="5" fill="var(--color-ink-muted)" />
      </pattern>
    </defs>
  )
}
