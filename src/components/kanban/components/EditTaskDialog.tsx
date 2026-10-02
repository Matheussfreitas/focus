import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '../../ui/dialog'
import { DeleteTaskDialog } from './DeleteTaskDialog'
import { useTagQueries } from '../queries.tag'
import { TaskFormFields } from './TaskFormFields'
import { formatDDMMYYYY, parseDDMMYYYY, taskSchema } from '../taskForm'
import type { TaskFormData } from '../taskForm'
import type { Task } from '../types/task.type'

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => Promise<void> | void
  onDelete: (task: Task) => Promise<void>
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: Readonly<EditTaskDialogProps>) {
  const { tagsState } = useTagQueries()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const defaultValues: TaskFormData = {
    title: task.title,
    description: task.description ?? '',
    dueDate: task.dueDate ? formatDDMMYYYY(new Date(task.dueDate)) : '',
    tagId: task.tagId ?? undefined,
  }

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  })

  // Recarrega o formulário com os dados atuais da task toda vez que abre,
  // descartando edições canceladas.
  useEffect(() => {
    if (open) {
      reset(defaultValues)
      setSubmitError(null)
      setConfirmingDelete(false)
    }
  }, [open, task])

  const onSubmit = async (data: TaskFormData) => {
    try {
      setSubmitError(null)
      const tagId = data.tagId || null
      await onSave({
        ...task,
        title: data.title,
        description: data.description?.trim() ? data.description : null,
        dueDate: data.dueDate ? parseDDMMYYYY(data.dueDate) : null,
        tagId,
        tag: tagsState.find((tag) => tag.id === tagId) ?? null,
      })
      onOpenChange(false)
    } catch {
      setSubmitError('Não foi possível salvar a task. Tente novamente.')
    }
  }

  const handleDelete = async () => {
    await onDelete(task)
    setConfirmingDelete(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="dialog-surface w-full max-w-md"
      >
        <div className="dialog-header dialog-header-bordered">
          <span className="h-2 w-2 shrink-0 bg-signal" />
          <DialogTitle className="dialog-title">Editar task</DialogTitle>
          <DialogClose aria-label="Fechar" className="dialog-close">
            <X className="size-4" />
          </DialogClose>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-4"
        >
          <TaskFormFields
            register={register}
            setValue={setValue}
            errors={errors}
            selectedTagId={watch('tagId')}
          />
          {submitError && <p className="text-error">{submitError}</p>}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmingDelete(true)}
              className="btn-outline-danger"
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
            <Button size="sm" variant="default" className="btn-primary">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
      <DeleteTaskDialog
        taskTitle={task.title}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
