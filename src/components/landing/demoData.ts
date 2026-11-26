import type {
  DashboardBucket,
  DashboardKpis,
  DashboardTagRow,
} from '#/server/dashboard/dashboard.ts'
import type { TagsColor } from '#/generated/prisma/enums.ts'

// Dados de demonstração da landing. Fixos (sem Date.now) para o HTML do
// servidor e o do navegador saírem iguais.

export interface DemoTask {
  id: string
  title: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  tag: { name: string; color: TagsColor }
  due?: { label: string; tone: 'today' | 'later' | 'overdue' }
}

export const DEMO_TASKS: DemoTask[] = [
  {
    id: 'relatorio',
    title: 'Revisar relatório trimestral',
    priority: 'HIGH',
    tag: { name: 'Trabalho', color: 'BLUE' },
    due: { label: 'Hoje', tone: 'today' },
  },
  {
    id: 'calculo',
    title: 'Lista de exercícios de cálculo',
    priority: 'MEDIUM',
    tag: { name: 'Faculdade', color: 'GREEN' },
    due: { label: 'Amanhã', tone: 'later' },
  },
  {
    id: 'ingles',
    title: 'Ler capítulo 4 em inglês',
    priority: 'LOW',
    tag: { name: 'Inglês', color: 'ORANGE' },
  },
]

export const DEMO_DONE: DemoTask[] = [
  {
    id: 'resumo',
    title: 'Resumo de história do Brasil',
    priority: 'MEDIUM',
    tag: { name: 'Faculdade', color: 'GREEN' },
  },
]

const MIN = 60_000

export const DEMO_TAGS: DashboardTagRow[] = [
  tag('trabalho', 'Trabalho', 'BLUE', 1075, 44, 12),
  tag('faculdade', 'Faculdade', 'GREEN', 750, 31, 9),
  tag('ingles', 'Inglês', 'ORANGE', 275, 12, 4),
]

function tag(
  key: string,
  name: string,
  color: TagsColor,
  minutes: number,
  sessions: number,
  tasksDone: number,
): DashboardTagRow {
  return {
    key,
    name,
    color,
    focusMs: minutes * MIN,
    sessions,
    tasksDone,
    focusPerTaskMs: (minutes / tasksDone) * MIN,
    avgLeadMs: null,
    onTimeRate: null,
    open: 0,
    overdue: 0,
  }
}

// 14 dias: minutos por tag e tarefas concluídas em cada dia.
const DAYS: [string, number, number, number, number][] = [
  ['SEG 9', 100, 50, 25, 3],
  ['TER 10', 125, 75, 0, 2],
  ['QUA 11', 75, 50, 25, 2],
  ['QUI 12', 150, 25, 25, 4],
  ['SEX 13', 100, 0, 25, 1],
  ['SÁB 14', 0, 100, 0, 1],
  ['DOM 15', 0, 50, 25, 0],
  ['SEG 16', 125, 75, 25, 3],
  ['TER 17', 100, 100, 0, 2],
  ['QUA 18', 75, 75, 50, 3],
  ['QUI 19', 125, 50, 25, 2],
  ['SEX 20', 75, 25, 25, 1],
  ['SÁB 21', 0, 50, 25, 1],
  ['DOM 22', 25, 25, 0, 0],
]

export const DEMO_TIMELINE: DashboardBucket[] = DAYS.map(
  ([label, trabalho, faculdade, ingles, done], i) => ({
    key: `d${i}`,
    label,
    focus: {
      trabalho: trabalho * MIN,
      faculdade: faculdade * MIN,
      ingles: ingles * MIN,
    },
    done,
  }),
)

export const DEMO_KPIS: DashboardKpis = {
  focusMs: 2100 * MIN,
  prevFocusMs: 1840 * MIN,
  tasksDone: 25,
  prevTasksDone: 21,
  sessions: 87,
  prevSessions: 80,
  completionRate: 0.87,
  prevCompletionRate: 0.82,
  avgSessionMs: 24 * MIN,
  streak: 6,
  bestStreak: 11,
}

// Foco por dia da semana (seg=0) e hora: manhãs fortes nos dias úteis,
// um bloco à noite, fim de semana leve.
export const DEMO_RHYTHM: number[][] = Array.from({ length: 7 }, (_day, d) =>
  Array.from({ length: 24 }, (_hour, h) => {
    const weekday = d < 5
    let minutes = 0
    if (h >= 8 && h <= 11) minutes = weekday ? 40 + ((d * 7 + h * 3) % 20) : 0
    if (h >= 14 && h <= 17) minutes = weekday ? 20 + ((d * 5 + h) % 18) : 0
    if (h >= 19 && h <= 21) minutes = 15 + ((d * 3 + h) % 12)
    if (!weekday && h >= 10 && h <= 12) minutes = 25
    return minutes * MIN
  }),
)
