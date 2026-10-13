import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { PreferencesProvider } from '../lib/preferences'
import { getPreferences } from '../server/preferences'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Paleta e layout salvos em cookie: o HTML já sai do servidor com eles.
  beforeLoad: async () => ({ preferences: await getPreferences() }),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Focus',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { preferences } = Route.useRouteContext()
  return (
    <html
      lang="pt-BR"
      data-palette={preferences.palette}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="h-dvh flex flex-col antialiased wrap-anywhere">
        <PreferencesProvider initial={preferences}>
          <Header />
          <main className="flex-1 min-h-0">{children}</main>
        </PreferencesProvider>
        {/* <Footer /> */}
        <Scripts />
      </body>
    </html>
  )
}
