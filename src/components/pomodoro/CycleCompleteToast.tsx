import { useEffect } from 'react'
import { FiAward, FiX } from 'react-icons/fi'

const AUTO_CLOSE_MS = 10_000

interface CycleCompleteToastProps {
  open: boolean
  focusMinutes: number
  onClose: () => void
}

export function CycleCompleteToast({
  open,
  focusMinutes,
  onClose,
}: Readonly<CycleCompleteToastProps>) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [open, onClose])

  if (!open) return null

  // O wrapper centraliza (flex) em vez de usar translate no card, para não
  // brigar com o transform da animação de entrada.
  return (
    <div className="pointer-events-none fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 border-2 border-ink bg-sand p-4 text-ink geist-mono animate-in fade-in zoom-in-95"
      >
        <FiAward aria-hidden className="mt-0.5 size-6 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wide">Parabéns!</p>
          <p className="text-xs">
            Você completou todas as sessões de foco
            {focusMinutes > 0 && ` (${focusMinutes} min focado)`}. Ótimo
            trabalho!
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          className="flex size-6 shrink-0 items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
        >
          <FiX aria-hidden />
        </button>
      </div>
    </div>
  )
}
