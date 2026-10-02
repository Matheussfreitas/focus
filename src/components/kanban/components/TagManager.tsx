import { Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { TagsColor } from '#/generated/prisma/enums.ts'
import { Button } from '../../ui/button'
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { TAG_COLOR_HEX, TAG_COLOR_ORDER } from '../tagColors'
import { useTagQueries } from '../queries.tag'

const inputClassName = 'input-field'

interface TagManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TagManager({ open, onOpenChange }: Readonly<TagManagerProps>) {
  const { tagsState, createTagMutation, updateTagMutation, deleteTagMutation } =
    useTagQueries()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagsColor>(TagsColor.BLUE)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  )

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setColor(TagsColor.BLUE)
    setError(null)
  }

  const startEdit = (tag: (typeof tagsState)[number]) => {
    setEditingId(tag.id)
    setName(tag.name)
    setColor(tag.color)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    try {
      if (editingId) {
        await updateTagMutation.mutateAsync({
          data: { id: editingId, name: name.trim(), color },
        })
      } else {
        await createTagMutation.mutateAsync({
          data: { name: name.trim(), color },
        })
      }
      resetForm()
    } catch {
      setError('Já existe uma tag com esse nome')
    }
  }

  const handleDelete = async (id: string) => {
    await deleteTagMutation.mutateAsync({ data: { id } })
    if (editingId === id) resetForm()
    setConfirmingDeleteId(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          resetForm()
          setConfirmingDeleteId(null)
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="dialog-surface w-full max-w-sm"
      >
        <div className="dialog-header dialog-header-bordered">
          <span className="h-2 w-2 shrink-0 bg-signal" />
          <DialogTitle className="dialog-title">Gerenciar tags</DialogTitle>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          {tagsState.length === 0 && (
            <p className="text-meta">Nenhuma tag criada ainda.</p>
          )}
          {tagsState.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 border border-ink/20 px-2 py-1.5"
            >
              <span
                className="h-3 w-3 shrink-0"
                style={{ backgroundColor: TAG_COLOR_HEX[tag.color] }}
              />
              <p className="flex-1 text-xs font-medium">{tag.name}</p>

              {confirmingDeleteId === tag.id ? (
                <div className="flex items-center gap-1 geist-mono text-[10px] uppercase">
                  <span className="text-ink-muted">Remover?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    className="cursor-pointer px-1.5 py-0.5 bg-ink text-sand"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(null)}
                    className="cursor-pointer px-1.5 py-0.5 border border-ink/30"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(tag)}
                    className="cursor-pointer p-1 hover:bg-ink/10"
                    title="Editar tag"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(tag.id)}
                    className="cursor-pointer p-1 hover:bg-ink/10"
                    title="Remover tag"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-ink pt-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="label-mono">
              {editingId ? 'Editar tag' : 'Nova tag'}
            </Label>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer text-ink-muted hover:text-ink"
                title="Cancelar edição"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da tag"
            className={inputClassName}
          />

          <div className="flex flex-wrap gap-1.5">
            {TAG_COLOR_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={c}
                className="h-6 w-6 shrink-0 cursor-pointer"
                style={{
                  backgroundColor: TAG_COLOR_HEX[c],
                  outline:
                    color === c
                      ? '2px solid var(--color-ink)'
                      : '2px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          {error && <p className="text-error">{error}</p>}

          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleSubmit}
            className="btn-primary w-full"
          >
            {editingId ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
