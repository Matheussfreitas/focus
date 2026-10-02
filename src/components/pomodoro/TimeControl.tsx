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
    <div className="flex items-center text-xs text-cream/62">
      <p>{title}</p>
      <span className="flex items-center gap-2 ml-2">
        <Button
          variant="ghost"
          className="hover:text-cream"
          onClick={handleLessDuration}
        >
          <FiMinus />
        </Button>
        <p className="text-lg">{duracao / 60 / 1000}</p>
        <Button
          variant="ghost"
          className="hover:text-cream"
          onClick={handleMoreDuration}
        >
          <FiPlus />
        </Button>
      </span>
    </div>
  )
}
