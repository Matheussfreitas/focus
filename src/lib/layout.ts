import { FiClock, FiColumns, FiTrello } from 'react-icons/fi'
import type { IconType } from 'react-icons'

export type PanelId = 'pomodoro' | 'kanban'

interface LayoutDef {
  id: string
  label: string
  icon: IconType
  panels: readonly PanelId[]
  // painéis que exigem login (kanban) não fazem sentido para visitantes
  requiresAuth: boolean
}

// Para criar um layout novo basta adicionar uma entrada aqui (e, se for um
// painel inédito, registrá-lo no mapa de painéis da página).
export const LAYOUTS = [
  {
    id: 'split',
    label: 'Timer e tarefas',
    icon: FiColumns,
    panels: ['pomodoro', 'kanban'],
    requiresAuth: true,
  },
  {
    id: 'pomodoro',
    label: 'Só timer',
    icon: FiClock,
    panels: ['pomodoro'],
    requiresAuth: false,
  },
  {
    id: 'kanban',
    label: 'Só tarefas',
    icon: FiTrello,
    panels: ['kanban'],
    requiresAuth: true,
  },
] as const satisfies readonly LayoutDef[]

export type LayoutId = (typeof LAYOUTS)[number]['id']

export const DEFAULT_LAYOUT: LayoutId = 'split'
export const GUEST_LAYOUT: LayoutId = 'pomodoro'
export const LAYOUT_COOKIE = 'layout'

export function isLayoutId(value: unknown): value is LayoutId {
  return LAYOUTS.some((layout) => layout.id === value)
}

export function getLayoutDef(id: LayoutId): LayoutDef {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0]
}

export function hasPanel(id: LayoutId, panel: PanelId) {
  return getLayoutDef(id).panels.includes(panel)
}

// Layout que de fato vai para a tela: visitante só tem acesso ao timer.
export function resolveLayout(id: LayoutId, loggedIn: boolean): LayoutId {
  return getLayoutDef(id).requiresAuth && !loggedIn ? GUEST_LAYOUT : id
}
