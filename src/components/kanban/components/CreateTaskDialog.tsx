import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { TaskStatus } from '#/generated/prisma/enums.ts'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog'
import { TaskFormFields } from './TaskFormFields'
import { parseDDMMYYYY, taskSchema } from '../taskForm'
import type { TaskFormData } from '../taskForm'

type CreateTaskData = {
  title: string
  description?: string
  dueDate?: Date
  tagId?: string
  status: TaskStatus
}

interface CreateTaskDialogProps {
  status: TaskStatus
  onCreate: (data: CreateTaskData) => Promise<void>
}

export function CreateTaskDialog({
  status,
  onCreate,
}: Readonly<CreateTaskDialogProps>) {
  const [open, setOpen] = useState(false)

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  const selectedTagId = watch('tagId')

  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (data: TaskFormData) => {
    try {
      setSubmitError(null)
      await onCreate({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate
          ? (parseDDMMYYYY(data.dueDate) ?? undefined)
          : undefined,
        tagId: data.tagId,
        status,
      })
      reset()
      setOpen(false)
    } catch {
      setSubmitError('Não foi possível criar a task. Tente novamente.')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          reset()
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          data-tour="create-task"
          aria-label="Adicionar tarefa"
          className="ml-2 flex size-11 md:size-6 items-center justify-center hover:text-ink cursor-pointer"
        >
          <PlusIcon className="size-5 md:size-3" />
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="dialog-surface w-full max-w-md"
      >
        <div className="dialog-header dialog-header-bordered">
          <span className="h-2 w-2 shrink-0 bg-signal" />
          <DialogTitle className="dialog-title">Nova task</DialogTitle>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-4"
        >
          <TaskFormFields
            register={register}
            setValue={setValue}
            errors={errors}
            selectedTagId={selectedTagId}
          />
          {submitError && <p className="text-error">{submitError}</p>}
          <Button size="sm" variant="default" className="btn-primary w-full">
            Criar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
