import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '#/components/ui/button.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog.tsx'
import { Input } from '#/components/ui/input.tsx'
import { authClient } from '#/lib/auth-client.ts'
import { getServerSession } from '#/server/auth/session.ts'
import { exportMyData } from '#/server/account/account.ts'
import { accountQueryOptions } from '#/components/legal/queries.account.ts'

export const Route = createFileRoute('/conta')({
  beforeLoad: async () => {
    const session = await getServerSession()
    if (!session) throw redirect({ to: '/' })
    return { session }
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountQueryOptions),
  head: () => ({ meta: [{ title: 'Minha conta · Focus' }] }),
  component: AccountPage,
})

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

const sectionClass =
  'border border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]'
const headingClass =
  'geist-mono text-xs font-bold uppercase tracking-widest text-ink-muted'

function AccountPage() {
  const { data: account } = useQuery(accountQueryOptions)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `focus-meus-dados-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  if (!account) return null

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 text-ink">
        <h1 className="text-3xl font-semibold tracking-tight">Minha conta</h1>

        <section className={sectionClass}>
          <h2 className={headingClass}>Dados</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-ink-soft">Nome</dt>
            <dd>{account.name}</dd>
            <dt className="text-ink-soft">E-mail</dt>
            <dd>{account.email}</dd>
            <dt className="text-ink-soft">Conta criada</dt>
            <dd>{dateFmt.format(new Date(account.createdAt))}</dd>
            <dt className="text-ink-soft">Termos aceitos</dt>
            <dd>
              {account.termsAcceptedAt
                ? `${dateFmt.format(new Date(account.termsAcceptedAt))} (versão ${account.termsVersion})`
                : 'Pendente'}
            </dd>
          </dl>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Exportar dados</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Baixe um arquivo JSON com tudo o que guardamos sobre você: conta,
            tarefas, tags, sessões de foco e registros de acesso.
          </p>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="mt-4 rounded-none bg-ink text-sand hover:bg-ink-hover cursor-pointer"
          >
            {exporting ? 'Gerando…' : 'Baixar meus dados'}
          </Button>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Excluir conta</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Apaga definitivamente sua conta, tarefas, tags e sessões de foco.
            Registros de acesso (IP, data e hora) ficam guardados por 6 meses
            por obrigação legal (Marco Civil da Internet) e depois são apagados.
          </p>
          <DeleteAccountDialog />
        </section>
      </div>
    </div>
  )
}

function DeleteAccountDialog() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const { error: deleteError } = await authClient.deleteUser({ password })
    setPending(false)
    if (deleteError) {
      setError(deleteError.message ?? 'Não foi possível excluir a conta.')
      return
    }
    await navigate({ to: '/', reloadDocument: true })
  }

  return (
    <Dialog onOpenChange={() => (setPassword(''), setError(null))}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="mt-4 rounded-none cursor-pointer"
        >
          Excluir minha conta
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-4 border border-ink bg-sand p-6 text-ink rounded-none sm:max-w-md">
        <DialogTitle className="text-lg font-semibold">
          Excluir conta definitivamente?
        </DialogTitle>
        <DialogDescription className="text-ink-soft">
          Essa ação não pode ser desfeita. Digite sua senha para confirmar.
        </DialogDescription>
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-soft h-11"
            required
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-none cursor-pointer"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending || !password}
              className="rounded-none cursor-pointer"
            >
              {pending ? 'Excluindo…' : 'Excluir conta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
