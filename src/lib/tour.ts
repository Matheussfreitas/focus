import type { DriveStep } from 'driver.js'

const DESKTOP_QUERY = '(min-width: 768px)'

type Section = 'general' | 'kanban'

// 'general' reaproveita a chave antiga para não repetir o tour a quem já o viu.
const STORAGE_KEYS: Record<Section, string> = {
  general: 'focus:tour-done',
  kanban: 'focus:tour-kanban-done',
}

// Tour pensado para desktop/notebook; no mobile os painéis ficam em abas.
export function canRunTour() {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function isSectionSeen(section: Section) {
  try {
    return window.localStorage.getItem(STORAGE_KEYS[section]) === '1'
  } catch {
    return true
  }
}

function markSectionsSeen(sections: Section[]) {
  try {
    for (const section of sections) {
      window.localStorage.setItem(STORAGE_KEYS[section], '1')
    }
  } catch {
    // storage indisponível: o tour pode reaparecer na próxima visita
  }
}

/**
 * Qual parte do tour o usuário ainda não viu:
 * - 'full': introdução geral (e o kanban, se estiver logado)
 * - 'kanban': viu a introdução deslogado e agora tem acesso ao kanban
 * - null: nada pendente
 */
export function getPendingTour(loggedIn: boolean): 'full' | 'kanban' | null {
  if (!isSectionSeen('general')) return 'full'
  if (loggedIn && !isSectionSeen('kanban')) return 'kanban'
  return null
}

const TIMER_STEPS: DriveStep[] = [
  {
    element: '[data-tour="timer"]',
    popover: {
      title: 'Seu ciclo de foco',
      description:
        'O timer alterna entre foco, pausa e pausa longa. O anel mostra o progresso da fase atual.',
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '[data-tour="timer-controls"]',
    popover: {
      title: 'Controles',
      description: 'Inicie ou pause, reinicie a fase ou pule para a próxima.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="durations"]',
    popover: {
      title: 'Ajuste as durações',
      description:
        'Use + e − para definir quantos minutos de foco, pausa e pausa longa você prefere.',
      side: 'top',
      align: 'center',
    },
  },
]

const LOGIN_STEP: DriveStep = {
  element: '[data-tour="login"]',
  popover: {
    title: 'Entre para organizar tarefas',
    description:
      'Com uma conta você libera o kanban e mantém suas tarefas salvas.',
    side: 'bottom',
    align: 'end',
  },
}

const PALETTE_STEP: DriveStep = {
  element: '[data-tour="palette"]',
  popover: {
    title: 'Escolha sua cor',
    description:
      'Troque a paleta principal do Focus. A escolha fica salva neste navegador.',
    side: 'bottom',
    align: 'end',
  },
}

const KANBAN_STEPS: DriveStep[] = [
  {
    element: '[data-tour="kanban"]',
    popover: {
      title: 'Suas tarefas',
      description:
        'Organize em A Fazer, Fazendo e Feito. Arraste um card entre colunas ou clique nele para editar.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="create-task"]',
    popover: {
      title: 'Nova tarefa',
      description:
        'Crie uma tarefa com título, descrição, data e tag. Ela sempre entra em A Fazer.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="start-task"]',
    popover: {
      title: 'Foque numa tarefa',
      description:
        'O botão de play leva a tarefa para o timer, que passa a mostrá-la como "em curso".',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="divider"]',
    popover: {
      title: 'Ajuste o espaço',
      description:
        'Arraste a barra para dar mais espaço ao timer ou ao kanban.',
      side: 'left',
      align: 'center',
    },
  },
]

function buildSteps(sections: Section[], loggedIn: boolean): DriveStep[] {
  const steps: DriveStep[] = []

  if (sections.includes('general')) {
    steps.push(...TIMER_STEPS)
  }
  if (sections.includes('kanban')) {
    steps.push(...KANBAN_STEPS)
  }
  if (sections.includes('general')) {
    if (!loggedIn) steps.push(LOGIN_STEP)
    steps.push(PALETTE_STEP)
  }

  // Ignora passos cujo elemento não está na tela (ex.: nenhuma tarefa criada ainda).
  return steps.filter(
    (step) =>
      typeof step.element === 'string' && document.querySelector(step.element),
  )
}

/**
 * Inicia o tour.
 * - `part: 'full'` (padrão): introdução geral; inclui o kanban se logado.
 * - `part: 'kanban'`: só a parte do kanban.
 */
export async function startTour({
  loggedIn,
  part = 'full',
}: {
  loggedIn: boolean
  part?: 'full' | 'kanban'
}) {
  if (!canRunTour()) return

  const sections: Section[] =
    part === 'kanban'
      ? ['kanban']
      : loggedIn
        ? ['general', 'kanban']
        : ['general']

  const steps = buildSteps(sections, loggedIn)
  if (steps.length === 0) return

  const { driver } = await import('driver.js')
  const overlayColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-ink')
    .trim()

  const tour = driver({
    steps,
    showProgress: true,
    allowClose: true,
    animate: true,
    overlayColor: overlayColor || '#111a2b',
    overlayOpacity: 0.72,
    stagePadding: 6,
    stageRadius: 0,
    popoverClass: 'focus-tour',
    nextBtnText: 'Próximo',
    prevBtnText: 'Voltar',
    doneBtnText: 'Concluir',
    progressText: '{{current}} de {{total}}',
    onDestroyed: () => markSectionsSeen(sections),
  })

  tour.drive()
}
