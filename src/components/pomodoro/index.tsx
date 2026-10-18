import {
  FiChevronsRight,
  FiPause,
  FiPlay,
  FiRotateCw,
  FiSquare,
} from 'react-icons/fi'
import type { Task } from '../kanban/types/task.type'
import { Button } from '../ui/button'
import { TimeControl } from './TimeControl'
import { formatTime } from './usePomodoro'
import type { PomodoroState } from './usePomodoro'

interface PomodoroProps {
  state: PomodoroState
  activeTask?: Task | null
  // tira a task do timer, deixando-o vazio
  onClearTask?: () => void
  // 'compact' é a versão enxuta usada na janela flutuante
  variant?: 'full' | 'compact'
}

export function Pomodoro({
  state,
  activeTask,
  onClearTask,
  variant = 'full',
}: Readonly<PomodoroProps>) {
  const {
    restante,
    isRunning,
    currentPhase,
    currentPhaseData,
    totalPhases,
    progress,
    timeControls,
    handleStart,
    handlePause,
    handleReset,
    handleNextPhase,
  } = state

  const clearTaskButton = activeTask && onClearTask && (
    <button
      type="button"
      onClick={onClearTask}
      title="Parar tarefa"
      aria-label={`Parar ${activeTask.title}`}
      className="shrink-0 flex items-center justify-center text-cream/62 hover:text-cream cursor-pointer"
    >
      <FiSquare />
    </button>
  )

  const discoGrad = `conic-gradient(var(--color-cream) ${progress * 360}deg, color-mix(in oklab, var(--color-cream) 24%, transparent) 0deg)`

  if (variant === 'compact') {
    return (
      <div className="@container h-full w-full flex flex-col items-center bg-ocean geist-mono">
        <div className="w-full flex justify-between px-3 pt-2 text-[10px] text-cream/62">
          <span>{currentPhaseData.title}</span>
          <span>
            {currentPhase + 1} / {totalPhases}
          </span>
        </div>

        <div className="flex-1 min-h-0 w-full flex flex-col justify-center items-center gap-2 px-3">
          <div
            className="aspect-square h-[min(70cqw,100%)] max-h-full rounded-[35%] flex justify-center items-center"
            style={{ background: discoGrad }}
          >
            <div className="h-[80%] w-[80%] bg-ocean rounded-full flex justify-center items-center">
              <p className="text-[clamp(1rem,14cqw,3.5rem)] text-cream">
                {formatTime(restante)}
              </p>
            </div>
          </div>
          <div className="w-full flex items-center justify-center gap-2 text-xs">
            <p className="truncate font-bold text-cream">
              {activeTask?.title ?? 'Nenhuma task selecionada'}
            </p>
            {clearTaskButton}
          </div>
        </div>

        <div className="w-full grid grid-cols-[2fr_1fr_1fr] border-t-2 border-cream/24">
          <button
            type="button"
            onClick={isRunning ? handlePause : handleStart}
            aria-label={isRunning ? 'Pausar' : 'Iniciar'}
            className="h-9 flex items-center justify-center bg-cream text-ocean cursor-pointer"
          >
            {isRunning ? <FiPause /> : <FiPlay />}
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar"
            className="h-9 flex items-center justify-center text-cream/40 hover:text-cream cursor-pointer"
          >
            <FiRotateCw />
          </button>
          <button
            type="button"
            onClick={handleNextPhase}
            aria-label="Próxima fase"
            className="h-9 flex items-center justify-center text-cream/40 hover:text-cream border-l-2 border-cream/24 cursor-pointer"
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="@container h-full w-full min-h-0 flex items-center flex-col bg-ocean overflow-y-auto">
      <div className="w-full px-4 @lg:px-12 mt-4">
        <div className="w-full flex justify-between text-sm text-cream/62 geist-mono">
          <span>{currentPhaseData.title}</span>
          <span>
            SESSÃO {currentPhase + 1} / {totalPhases}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-w-0 flex flex-col justify-center items-center gap-4 px-4">
        <div
          data-tour="timer"
          className="aspect-square h-[min(18.75rem,100cqw,40cqh)] max-h-full rounded-[35%] flex justify-center items-center flex-col gap-4 bg-cream/24"
          style={{ background: discoGrad }}
        >
          <div className="z-10 h-[80%] w-[80%] bg-ocean rounded-full flex justify-center items-center flex-col">
            <p className="text-[clamp(2.5rem,16cqw,3.75rem)] text-cream geist-mono">
              {formatTime(restante)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-cream/62">
          <p className="text-xs geist-mono">EM CURSO</p>
          <div className="flex items-center gap-3 text-lg">
            <p className="font-bold text-xl @lg:text-2xl text-cream text-center">
              {activeTask?.title ?? 'Nenhuma task selecionada'}
            </p>
            {clearTaskButton}
          </div>
        </div>

        <div className="flex" data-tour="timer-controls">
          <Button
            onClick={isRunning ? handlePause : handleStart}
            type="button"
            variant="default"
            className="px-8 py-6 @lg:px-12 @lg:py-8 cursor-pointer rounded-none text-ocean text-md border-3 border-cream bg-cream geist-mono"
          >
            {isRunning ? 'PAUSAR' : 'INICIAR'}
          </Button>
          <Button
            onClick={handleReset}
            variant="default"
            className="w-14 py-6 @lg:w-20 @lg:py-8 cursor-pointer rounded-none text-cream/24 bg-ocean text-md border-3 border-cream/24 hover:text-cream"
          >
            <FiRotateCw />
          </Button>
          <Button
            onClick={handleNextPhase}
            variant="default"
            className="w-14 py-6 @lg:w-20 @lg:py-8 cursor-pointer rounded-none text-cream/24 bg-ocean text-md border-r-3 border-t-3 border-b-3 border-cream/24 hover:text-cream"
          >
            <FiChevronsRight />
          </Button>
        </div>
      </div>

      <div
        data-tour="durations"
        className="w-full shrink-0 py-2 @lg:py-0 @lg:h-15 flex items-center justify-center border-t-2 border-cream/24 geist-mono"
      >
        <div className="grid w-full grid-cols-3 gap-1 px-2 @lg:flex @lg:w-auto @lg:gap-8 @lg:px-0">
          {timeControls.map((control) => (
            <TimeControl
              key={control.title}
              title={control.title}
              duracao={control.duracao}
              handleLessDuration={control.handleLessDuration}
              handleMoreDuration={control.handleMoreDuration}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
