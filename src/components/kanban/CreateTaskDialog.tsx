import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import type { TaskStatus } from '#/generated/prisma/enums.ts'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Field, FieldError, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useTagQueries } from './queries.tag'
import { TAG_COLOR_HEX } from './tagColors'
import { TagManager } from './TagManager'

const DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/

function parseDDMMYYYY(value: string): Date | null {
  const match = DATE_RE.exec(value)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isValid ? date : null
}

function maskDDMMYYYY(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  return [day, month, year].filter(Boolean).join('/')
}

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine((value) => !value || parseDDMMYYYY(value) !== null, {
      message: 'Data inválida (dd/mm/aaaa)',
    }),
  tagId: z.string().optional(),
})

type SchemaFormData = z.infer<typeof schema>
type CreateTaskData = {
  title: string
  description?: string
  dueDate?: Date
  tagId?: string
  status: TaskStatus
}

const inputClassName =
  'bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30'

interface CreateTaskDialogProps {
  status: TaskStatus
  onCreate: (data: CreateTaskData) => Promise<void>
}

export function CreateTaskDialog({ status, onCreate }: Readonly<CreateTaskDialogProps>) {
  const [open, setOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const { tagsState } = useTagQueries()

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchemaFormData>({
    resolver: zodResolver(schema),
  })

  const dueDateField = register('dueDate')
  const selectedTagId = watch('tagId')
  const selectedTag = tagsState.find((tag) => tag.id === selectedTagId)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (data: SchemaFormData) => {
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
        <button className="ml-2 hover:text-[#131A26] cursor-pointer">
          <PlusIcon className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-md rounded-none border-2 border-[#111A2B] bg-[#EDE7DC] text-[#111A2B] p-6 shadow-none"
      >
        <div className="flex items-center gap-2 border-b-2 border-[#111A2B] pb-3">
          <span className="h-2 w-2 shrink-0 bg-amber-500" />
          <DialogTitle className="geist-mono text-sm font-bold uppercase tracking-widest text-[#111A2B]">
            Nova task
          </DialogTitle>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-4"
        >
          <FieldGroup className="gap-4">
            <Field>
              <Label
                htmlFor="title"
                className="geist-mono text-xs uppercase tracking-wide text-[#5D5344]"
              >
                Título
              </Label>
              <Input
                id="title"
                {...register('title', { required: true })}
                placeholder="Digite o título da task"
                className={inputClassName}
              />
              <FieldError>
                {errors.title && (
                  <span className="text-xs text-red-500">
                    {errors.title.message}
                  </span>
                )}
              </FieldError>
            </Field>
            <Field>
              <Label
                htmlFor="description"
                className="geist-mono text-xs uppercase tracking-wide text-[#5D5344]"
              >
                Descrição
              </Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Digite uma descrição (opcional)"
                className={inputClassName}
              />
            </Field>
            <Field>
              <Label
                htmlFor="dueDate"
                className="geist-mono text-xs uppercase tracking-wide text-[#5D5344]"
              >
                Data de entrega
              </Label>
              <Input
                id="dueDate"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                {...dueDateField}
                onChange={(e) => {
                  setValue('dueDate', maskDDMMYYYY(e.target.value), {
                    shouldValidate: true,
                  })
                }}
                className={inputClassName}
              />
              <FieldError>
                {errors.dueDate && (
                  <span className="text-xs text-red-500">
                    {errors.dueDate.message}
                  </span>
                )}
              </FieldError>
            </Field>
            <Field>
              <Label className="geist-mono text-xs uppercase tracking-wide text-[#5D5344]">
                Tag
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`${inputClassName} flex h-9 w-full items-center gap-2 border px-3 text-sm cursor-pointer`}
                  >
                    {selectedTag ? (
                      <>
                        <span
                          className="h-2.5 w-2.5 shrink-0"
                          style={{
                            backgroundColor: TAG_COLOR_HEX[selectedTag.color],
                          }}
                        />
                        <span>{selectedTag.name}</span>
                      </>
                    ) : (
                      <span className="text-[#5D5344]">Nenhuma tag</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 rounded-none border border-[#111A2B] bg-[#EDE7DC] text-[#111A2B]"
                >
                  <DropdownMenuItem
                    className="cursor-pointer rounded-none"
                    onClick={() => setValue('tagId', undefined)}
                  >
                    Nenhuma tag
                  </DropdownMenuItem>
                  {tagsState.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      className="cursor-pointer gap-2 rounded-none"
                      onClick={() => setValue('tagId', tag.id)}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0"
                        style={{ backgroundColor: TAG_COLOR_HEX[tag.color] }}
                      />
                      {tag.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-[#111A2B]/20" />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-none"
                    onClick={() => setManageOpen(true)}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Gerenciar tags
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
          </FieldGroup>
          {submitError && <p className="text-xs text-red-500">{submitError}</p>}
          <Button
            size="sm"
            variant="default"
            className="geist-mono w-full rounded-none bg-[#111A2B] text-xs uppercase tracking-widest text-[#EDE7DC] hover:bg-[#111A2B]/90"
          >
            Criar
          </Button>
        </form>
      </DialogContent>
      <TagManager open={manageOpen} onOpenChange={setManageOpen} />
    </Dialog>
  )
}
