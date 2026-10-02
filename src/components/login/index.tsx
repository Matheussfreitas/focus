import { authClient } from '#/lib/auth-client.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
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
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
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

export function Login() {
  const [loginOpen, setLoginOpen] = useState(true)

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
    setLoginOpen(isLogin)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="xs"
          variant="default"
          className="text-xs bg-[#111A2B] text-[#EDE7DC] rounded-xs cursor-pointer px-4"
        >
          Entrar
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex bg-[#EDE7DC] min-w-4xl"
      >
        <div className="w-1/2 flex flex-col justify-center gap-4 p-4 bg-[#111A2B] text-[#EDE7DC] rounded-l-md">
          <p className="text-xl font-bold">Focus</p>
          <div className="flex flex-col gap-4">
            <p className="text-2xl">
              Um espaço de trabalho que se organiza em volta do seu foco.
            </p>
            <ul className="list-disc list-inside text-sm">
              <li>Layout em grade que você monta e redimensiona</li>
              <li>Kanban, quadro branco e leitor de PDF lado a lado</li>
              <li>Histórico de foco, metas e temas personalizados</li>
              <li>Tudo salvo automaticamente</li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-4 p-4 bg-[#EDE7DC] text-[#111A2B] rounded-r-md">
          <span className="flex items-center gap-2">
            <button
              className={`${loginOpen ? 'font-bold' : ''} cursor-pointer`}
              onClick={() => handleChangeTab(true)}
            >
              Entrar
            </button>
            <div className="w-1 h-1 rounded-full bg-[#111A2B]"></div>
            <button
              className={`${!loginOpen ? 'font-bold' : ''} cursor-pointer`}
              onClick={() => handleChangeTab(false)}
            >
              Criar conta
            </button>
          </span>
          {loginOpen && (
            <form
              onSubmit={handleSubmit(onLogin)}
              className="flex flex-col gap-4"
            >
              <FieldGroup className="gap-2">
                <Field>
                  <Label htmlFor="email-1">Email</Label>
                  <Input
                    id="email-1"
                    {...register('email', { required: true })}
                    placeholder="Digite seu email"
                    className="bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30"
                  />
                  <FieldError>
                    {errors.email && (
                      <span className="text-xs text-red-500">
                        {errors.email.message}
                      </span>
                    )}
                  </FieldError>
                </Field>
                <Field>
                  <Label htmlFor="password-1">Password</Label>
                  <Input
                    id="password-1"
                    {...register('password', { required: true })}
                    placeholder="Digite sua senha"
                    type="password"
                    className="bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30"
                  />
                  <FieldError>
                    {errors.password && (
                      <span className="text-xs text-red-500">
                        {errors.password.message}
                      </span>
                    )}
                  </FieldError>
                </Field>
              </FieldGroup>
              <Button
                size="sm"
                variant="default"
                className="text-xs bg-[#111A2B] text-[#EDE7DC]"
              >
                Entrar
              </Button>
            </form>
          )}
          {!loginOpen && (
            <form
              onSubmit={handleSubmit(onRegister)}
              className="flex flex-col gap-4"
            >
              <FieldGroup className="gap-2">
                <Field>
                  <Label htmlFor="name-1">Nome</Label>
                  <Input
                    id="name-1"
                    {...register('name', { required: true })}
                    placeholder="Digite seu nome"
                    className="bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30"
                  />
                  <FieldError>
                    {errors.name && (
                      <span className="text-xs text-red-500">
                        {errors.name.message}
                      </span>
                    )}
                  </FieldError>
                </Field>
                <Field>
                  <Label htmlFor="email-1">Email</Label>
                  <Input
                    id="email-1"
                    {...register('email', { required: true })}
                    placeholder="Digite seu email"
                    className="bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30"
                  />
                  <FieldError>
                    {errors.email && (
                      <span className="text-xs text-red-500">
                        {errors.email.message}
                      </span>
                    )}
                  </FieldError>
                </Field>
                <Field>
                  <Label htmlFor="password-1">Password</Label>
                  <Input
                    id="password-1"
                    {...register('password', { required: true })}
                    type="password"
                    placeholder="Digite sua senha"
                    className="bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30"
                  />
                  <FieldError>
                    {errors.password && (
                      <span className="text-xs text-red-500">
                        {errors.password.message}
                      </span>
                    )}
                  </FieldError>
                </Field>
                <Field>
                  <Label htmlFor="password-2">Confirm Password</Label>
                  <Input
                    id="password-2"
                    {...register('confirmPassword', { required: true })}
                    type="password"
                    placeholder="Confirme sua senha"
                    className="bg-white text-[#111A2B] border-[#111A2B]/30 placeholder:text-[#5D5344] focus-visible:border-[#111A2B] focus-visible:ring-[#111A2B]/30"
                  />
                  <FieldError>
                    {errors.confirmPassword && (
                      <span className="text-xs text-red-500">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </FieldError>
                </Field>
              </FieldGroup>
              <Button
                size="sm"
                variant="default"
                className="text-xs bg-[#111A2B] text-[#EDE7DC]"
              >
                Cadastrar
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
