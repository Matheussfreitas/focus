import { FiMinus, FiPlus } from 'react-icons/fi'
import { Button } from '../ui/button'

interface TimeControlProps {
  title: string
  duracao: number
  handleLessDuration: () => void
  handleMoreDuration: () => void
}

export function TimeControl({
  title,
  duracao,
  handleLessDuration,
  handleMoreDuration,
}: TimeControlProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-sm md:flex-row md:gap-0 md:text-xs text-cream/62">
      <p>{title}</p>
      <span className="flex items-center gap-1 md:gap-2 md:ml-2">
        <Button
          variant="ghost"
          className="size-11 px-0 md:size-auto md:px-4 hover:text-cream"
          aria-label={`Diminuir ${title.toLowerCase()}`}
          onClick={handleLessDuration}
        >
          <FiMinus aria-hidden />
        </Button>
        <p className="min-w-6 text-center text-xl md:text-lg">
          {duracao / 60 / 1000}
        </p>
        <Button
          variant="ghost"
          className="size-11 px-0 md:size-auto md:px-4 hover:text-cream"
          aria-label={`Aumentar ${title.toLowerCase()}`}
          onClick={handleMoreDuration}
        >
          <FiPlus aria-hidden />
        </Button>
      </span>
    </div>
  )
}
