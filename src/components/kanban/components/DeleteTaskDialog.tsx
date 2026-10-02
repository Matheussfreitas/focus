import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'

const CONFIRM_WORD = 'excluir'

interface DeleteTaskDialogProps {
  taskTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteTaskDialog({
  taskTitle,
  open,
  onOpenChange,
  onConfirm,
}: Readonly<DeleteTaskDialogProps>) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open) {
      setValue('')
      setError(null)
      setPending(false)
    }
  }, [open])

  const canDelete = value.trim().toLowerCase() === CONFIRM_WORD && !pending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canDelete) return
    try {
      setPending(true)
      setError(null)
      await onConfirm()
    } catch {
      setPending(false)
      setError('Não foi possível excluir a task. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="dialog-surface-flat w-full max-w-sm"
      >
        <div className="dialog-header">
          <span className="h-2 w-2 shrink-0 bg-danger" />
          <DialogTitle className="dialog-title">Excluir task</DialogTitle>
          <DialogClose aria-label="Fechar" className="dialog-close">
            <X className="size-4" />
          </DialogClose>
        </div>
        <DialogDescription className="text-sm text-ink-muted">
          Você está prestes a excluir{' '}
          <span className="font-semibold text-ink">{taskTitle}</span>. Essa ação
          não pode ser desfeita.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-delete" className="label-mono">
              Digite “{CONFIRM_WORD}” para confirmar
            </Label>
            <Input
              id="confirm-delete"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={CONFIRM_WORD}
              className="input-soft"
            />
          </div>
          {error && <p className="text-error">{error}</p>}
          <Button size="sm" disabled={!canDelete} className="btn-danger w-full">
            Excluir definitivamente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
