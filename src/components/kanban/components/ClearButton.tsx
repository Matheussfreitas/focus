import { FiX } from 'react-icons/fi'

interface ClearButtonProps {
  label: string
  onClick: () => void
}

// X posicionado à direita de um campo (o wrapper precisa ser `relative`).
export function ClearButton({ label, onClick }: Readonly<ClearButtonProps>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
    >
      <FiX aria-hidden />
    </button>
  )
}
