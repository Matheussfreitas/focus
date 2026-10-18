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
    <div className="min-w-0 flex flex-col items-center gap-0.5 text-xs whitespace-nowrap wrap-normal @lg:flex-row @lg:gap-0 text-cream/62">
      <p>{title}</p>
      <span className="flex items-center gap-0.5 @lg:gap-2 @lg:ml-2">
        <Button
          variant="ghost"
          className="size-9 px-0 @lg:size-auto @lg:px-4 hover:text-cream"
          aria-label={`Diminuir ${title.toLowerCase()}`}
          onClick={handleLessDuration}
        >
          <FiMinus aria-hidden />
        </Button>
        <p className="min-w-6 text-center text-lg">{duracao / 60 / 1000}</p>
        <Button
          variant="ghost"
          className="size-9 px-0 @lg:size-auto @lg:px-4 hover:text-cream"
          aria-label={`Aumentar ${title.toLowerCase()}`}
          onClick={handleMoreDuration}
        >
          <FiPlus aria-hidden />
        </Button>
      </span>
    </div>
  )
}
