import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '#/components/ui/button.tsx'
import { Checkbox } from '#/components/ui/checkbox.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog.tsx'
import { authClient, useSession } from '#/lib/auth-client.ts'
import { PRIVACY_VERSION, TERMS_VERSION } from '#/lib/legal.ts'
import { acceptTerms } from '#/server/account/account.ts'
import { accountQueryOptions } from './queries.account'

// Pede o aceite a quem entrou antes dos Termos existirem ou quando a versão
// muda. Sem aceite, só dá para aceitar ou sair.
export function TermsGate() {
  const { data: session } = useSession()
  const loggedIn = !!session?.user
  const { data: account } = useQuery({
    ...accountQueryOptions,
    enabled: loggedIn,
  })
  const queryClient = useQueryClient()
  const [checked, setChecked] = useState(false)
  const [pending, setPending] = useState(false)

  if (!loggedIn || !account?.needsTermsAcceptance) return null

  const handleAccept = async () => {
    setPending(true)
    try {
      await acceptTerms({
        data: { termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION },
      })
      await queryClient.invalidateQueries({
        queryKey: accountQueryOptions.queryKey,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="gap-4 border border-ink bg-sand p-6 text-ink rounded-none sm:max-w-md"
      >
        <DialogTitle className="text-lg font-semibold">
          Atualizamos nossos termos
        </DialogTitle>
        <DialogDescription className="text-ink-soft">
          Para continuar usando o Focus, leia e aceite os documentos abaixo.
        </DialogDescription>
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms-gate"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5 border-ink/40 cursor-pointer"
          />
          <label
            htmlFor="terms-gate"
            className="text-[13px] leading-snug text-ink-soft cursor-pointer select-none"
          >
            Concordo com os{' '}
            <a
              href="/termos"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink hover:underline"
            >
              Termos de Uso
            </a>{' '}
            e com a{' '}
            <a
              href="/privacidade"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink hover:underline"
            >
              Política de Privacidade
            </a>
            .
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() =>
              authClient.signOut({
                fetchOptions: { onSuccess: () => window.location.assign('/') },
              })
            }
            className="rounded-none cursor-pointer"
          >
            Sair
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!checked || pending}
            className="rounded-none bg-ink text-sand hover:bg-ink-hover cursor-pointer"
          >
            Aceitar e continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
