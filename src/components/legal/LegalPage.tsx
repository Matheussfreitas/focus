import { Link } from '@tanstack/react-router'

interface LegalPageProps {
  title: string
  version: string
  children: React.ReactNode
}

// Layout comum das páginas legais: texto corrido, rolagem própria.
export function LegalPage({ title, version, children }: LegalPageProps) {
  return (
    <div className="h-full overflow-y-auto">
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 text-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_p]:my-3 [&_p]:leading-relaxed [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_a]:underline [&_table]:my-4 [&_table]:w-full [&_table]:text-sm [&_table]:wrap-break-word [&_th]:border [&_th]:border-ink/30 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-ink/30 [&_td]:p-2 [&_td]:align-top">
        <p className="geist-mono text-xs uppercase tracking-widest text-ink-muted">
          <Link to="/" className="no-underline!">
            Focus
          </Link>{' '}
          · versão {version}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        {children}
      </article>
    </div>
  )
}
