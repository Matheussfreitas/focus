import { Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { TagsColor } from '#/generated/prisma/enums.ts'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TAG_COLOR_HEX, TAG_COLOR_ORDER } from './tagColors'
import { useTagQueries } from './queries.tag'

const inputClassName =
  'bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30'

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
        className="w-full max-w-sm rounded-none border-2 border-[#111A2B] bg-[#EDE7DC] text-[#111A2B] p-6 shadow-none"
      >
        <div className="flex items-center gap-2 border-b-2 border-[#111A2B] pb-3">
          <span className="h-2 w-2 shrink-0 bg-amber-500" />
          <DialogTitle className="geist-mono text-sm font-bold uppercase tracking-widest text-[#111A2B]">
            Gerenciar tags
          </DialogTitle>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          {tagsState.length === 0 && (
            <p className="text-xs text-[#5D5344] geist-mono">
              Nenhuma tag criada ainda.
            </p>
          )}
          {tagsState.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 border border-[#111A2B]/20 px-2 py-1.5"
            >
              <span
                className="h-3 w-3 shrink-0"
                style={{ backgroundColor: TAG_COLOR_HEX[tag.color] }}
              />
              <p className="flex-1 text-xs font-medium">{tag.name}</p>

              {confirmingDeleteId === tag.id ? (
                <div className="flex items-center gap-1 geist-mono text-[10px] uppercase">
                  <span className="text-[#5D5344]">Remover?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    className="cursor-pointer px-1.5 py-0.5 bg-[#111A2B] text-[#EDE7DC]"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(null)}
                    className="cursor-pointer px-1.5 py-0.5 border border-[#111A2B]/30"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(tag)}
                    className="cursor-pointer p-1 hover:bg-[#111A2B]/10"
                    title="Editar tag"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(tag.id)}
                    className="cursor-pointer p-1 hover:bg-[#111A2B]/10"
                    title="Remover tag"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-[#111A2B] pt-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="geist-mono text-xs uppercase tracking-wide text-[#5D5344]">
              {editingId ? 'Editar tag' : 'Nova tag'}
            </Label>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer text-[#5D5344] hover:text-[#111A2B]"
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
                    color === c ? '2px solid #111A2B' : '2px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleSubmit}
            className="geist-mono w-full rounded-none bg-[#111A2B] text-xs uppercase tracking-widest text-[#EDE7DC] hover:bg-[#111A2B]/90"
          >
            {editingId ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
