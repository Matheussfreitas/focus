import { authClient } from '#/lib/auth-client.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, Eye, EyeOff, Lock, ShieldCheck, User, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Field, FieldError, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const schema = z
  .object({
    name: z
      .string()
      .min(2, 'O nome deve ter pelo menos 2 caracteres')
      .optional(),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false
      }
      return true
    },
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    },
  )

type SchemaFormData = z.infer<typeof schema>

const inputClass = 'input-soft pl-10 h-11'

const labelClass = 'text-xs font-semibold uppercase tracking-wider'

function FieldInput({
  icon: Icon,
  trailing,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ComponentType<{ className?: string }>
  trailing?: React.ReactNode
}) {
  return (
    <div className="relative flex items-center">
      <Icon className="absolute left-3 size-4 text-ink-soft pointer-events-none" />
      <Input
        {...props}
        className={`${inputClass} ${trailing ? 'pr-10' : ''}`}
      />
      {trailing}
    </div>
  )
}

function ErrorMessage({ message }: { message?: string }) {
  return (
    <FieldError>
      {message && <span className="text-error">{message}</span>}
    </FieldError>
  )
}

export function Login() {
  const [loginOpen, setLoginOpen] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SchemaFormData>({
    resolver: zodResolver(schema),
  })

  const onLogin = async (data: SchemaFormData) => {
    await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })
    reset()
  }

  const onRegister = async (data: SchemaFormData) => {
    await authClient.signUp.email({
      name: data.name || '',
      email: data.email,
      password: data.password,
    })
    reset()
  }

  const handleChangeTab = (isLogin: boolean) => {
    reset()
    setShowPassword(false)
    setAcceptedTerms(false)
    setLoginOpen(isLogin)
  }

  const passwordToggle = (
    <button
      type="button"
      aria-label="Alternar visibilidade de senha"
      onClick={() => setShowPassword((v) => !v)}
      className="absolute right-3 p-1 text-ink-soft hover:text-ink transition-colors cursor-pointer"
    >
      {showPassword ? (
        <EyeOff className="size-4" />
      ) : (
        <Eye className="size-4" />
      )}
    </button>
  )

  const tabClass = (active: boolean) =>
    `py-1.5 text-center text-sm transition-colors cursor-pointer ${
      active
        ? 'bg-sand text-ink font-semibold shadow-sm'
        : 'text-ink-soft hover:text-ink'
    }`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="xs"
          variant="default"
          className="text-xs bg-ink text-sand rounded-xs cursor-pointer px-4"
        >
          Entrar
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 bg-sand text-ink rounded-none p-6 sm:p-8 sm:max-w-140 max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2">
          <span className="text-xl font-bold tracking-tight">FOCUS</span>
          <DialogClose
            aria-label="Fechar"
            className="size-8 flex items-center justify-center bg-sand-dark hover:bg-sand-darker transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 bg-sand-dark/40 p-1">
          <button
            type="button"
            className={tabClass(loginOpen)}
            onClick={() => handleChangeTab(true)}
          >
            Entrar
          </button>
          <button
            type="button"
            className={tabClass(!loginOpen)}
            onClick={() => handleChangeTab(false)}
          >
            Criar conta
          </button>
        </div>

        <div className="mt-6">
          <DialogTitle className="text-3xl font-semibold tracking-tight">
            {loginOpen ? 'Entrar na sua conta' : 'Criar sua conta'}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-soft">
            {loginOpen
              ? 'Retome seu fluxo de trabalho de onde parou.'
              : 'Comece a organizar seu fluxo de trabalho livre de distrações e atinja seu estado de flow.'}
          </DialogDescription>
        </div>

        {loginOpen ? (
          <form
            onSubmit={handleSubmit(onLogin)}
            className="mt-6 flex flex-col gap-4"
          >
            <FieldGroup className="gap-4">
              <Field className="gap-1.5">
                <Label htmlFor="email-1" className={labelClass}>
                  E-mail
                </Label>
                <FieldInput
                  icon={AtSign}
                  id="email-1"
                  {...register('email', { required: true })}
                  placeholder="seu.nome@exemplo.com"
                />
                <ErrorMessage message={errors.email?.message} />
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="password-1" className={labelClass}>
                  Senha
                </Label>
                <FieldInput
                  icon={Lock}
                  id="password-1"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true })}
                  placeholder="••••••••"
                  trailing={passwordToggle}
                />
                <ErrorMessage message={errors.password?.message} />
              </Field>
            </FieldGroup>
            <Button
              size="lg"
              variant="default"
              className="mt-2 w-full rounded-none bg-ink text-sand hover:bg-ink-hover cursor-pointer"
            >
              Entrar no Focus
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit(onRegister)}
            className="mt-6 flex flex-col gap-4"
          >
            <FieldGroup className="gap-4">
              <Field className="gap-1.5">
                <Label htmlFor="name-1" className={labelClass}>
                  Nome completo
                </Label>
                <FieldInput
                  icon={User}
                  id="name-1"
                  {...register('name', { required: true })}
                  placeholder="Seu nome completo"
                />
                <ErrorMessage message={errors.name?.message} />
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="email-1" className={labelClass}>
                  E-mail
                </Label>
                <FieldInput
                  icon={AtSign}
                  id="email-1"
                  {...register('email', { required: true })}
                  placeholder="seu.nome@exemplo.com"
                />
                <ErrorMessage message={errors.email?.message} />
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="password-1" className={labelClass}>
                  Senha
                </Label>
                <FieldInput
                  icon={Lock}
                  id="password-1"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true })}
                  placeholder="••••••••"
                  trailing={passwordToggle}
                />
                <ErrorMessage message={errors.password?.message} />
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="password-2" className={labelClass}>
                  Confirmar senha
                </Label>
                <FieldInput
                  icon={ShieldCheck}
                  id="password-2"
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { required: true })}
                  placeholder="Repita sua senha"
                />
                <ErrorMessage message={errors.confirmPassword?.message} />
              </Field>
            </FieldGroup>
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(v) => setAcceptedTerms(v === true)}
                className="mt-0.5 border-ink/40 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-[13px] leading-snug text-ink-soft cursor-pointer select-none"
              >
                Concordo com os{' '}
                <a href="#" className="font-semibold text-ink hover:underline">
                  Termos de Serviço
                </a>{' '}
                e com a{' '}
                <a href="#" className="font-semibold text-ink hover:underline">
                  Política de Privacidade
                </a>{' '}
                da plataforma Focus.
              </label>
            </div>
            <Button
              size="lg"
              variant="default"
              disabled={!acceptedTerms}
              className="w-full rounded-none bg-ink text-sand hover:bg-ink-hover cursor-pointer"
            >
              Criar conta no Focus
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-ink-soft">
          <span>
            {loginOpen ? 'Não possui uma conta? ' : 'Já possui uma conta? '}
          </span>
          <button
            type="button"
            onClick={() => handleChangeTab(!loginOpen)}
            className="font-semibold text-ink hover:underline cursor-pointer"
          >
            {loginOpen ? 'Criar conta' : 'Entrar na sessão'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
