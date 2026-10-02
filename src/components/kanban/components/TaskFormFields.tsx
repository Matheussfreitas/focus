import { Settings2 } from 'lucide-react'
import { useState } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Field, FieldError, FieldGroup } from '../../ui/field'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { useTagQueries } from '../queries.tag'
import { TagManager } from './TagManager'
import { TAG_COLOR_HEX } from '../tagColors'
import { maskDDMMYYYY } from '../taskForm'
import type { TaskFormData } from '../taskForm'

export const inputClassName = 'input-field'

interface TaskFormFieldsProps {
  register: UseFormRegister<TaskFormData>
  setValue: UseFormSetValue<TaskFormData>
  errors: FieldErrors<TaskFormData>
  selectedTagId?: string
}

export function TaskFormFields({
  register,
  setValue,
  errors,
  selectedTagId,
}: Readonly<TaskFormFieldsProps>) {
  const [manageOpen, setManageOpen] = useState(false)
  const { tagsState } = useTagQueries()
  const dueDateField = register('dueDate')
  const selectedTag = tagsState.find((tag) => tag.id === selectedTagId)

  return (
    <>
      <FieldGroup className="gap-4">
        <Field>
          <Label htmlFor="title" className="label-mono">
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
              <span className="text-error">{errors.title.message}</span>
            )}
          </FieldError>
        </Field>
        <Field>
          <Label htmlFor="description" className="label-mono">
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
          <Label htmlFor="dueDate" className="label-mono">
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
              <span className="text-error">{errors.dueDate.message}</span>
            )}
          </FieldError>
        </Field>
        <Field>
          <Label className="label-mono">Tag</Label>
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
                  <span className="text-ink-muted">Nenhuma tag</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 rounded-none border border-ink bg-sand text-ink"
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
              <DropdownMenuSeparator className="bg-ink/20" />
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
      <TagManager open={manageOpen} onOpenChange={setManageOpen} />
    </>
  )
}
