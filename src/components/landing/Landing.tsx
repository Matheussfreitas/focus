import { Link } from '@tanstack/react-router'
import { FiCheck, FiMinus } from 'react-icons/fi'
import { CONTACT_EMAIL } from '#/lib/legal.ts'
import { FocusTimeline } from '../dashboard/FocusTimeline'
import { KpiStrip } from '../dashboard/KpiStrip'
import { RhythmGrid } from '../dashboard/RhythmGrid'
import { Customize } from './Customize'
import { DemoApp } from './DemoApp'
import { DemoCard, DemoColumnHead } from './DemoCard'
import {
  DEMO_KPIS,
  DEMO_RHYTHM,
  DEMO_TAGS,
  DEMO_TASKS,
  DEMO_TIMELINE,
} from './demoData'

const DEVELOPER_URL = 'https://matheusfreitas.dev.br'

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-8'
// Cada seção ocupa ao menos uma tela (menos a barra de navegação).
const screen =
  'flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 flex-col justify-center py-20'

const primaryButton =
  'inline-flex items-center justify-center gap-2 border-2 border-ink bg-ink px-5 py-3 text-sm font-semibold text-sand transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ocean)] active:translate-y-0 active:shadow-none'
const navButton =
  'ml-auto inline-flex items-center border-2 border-ink bg-ink px-4 py-1.5 text-sm font-semibold text-sand transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-ocean)] active:translate-y-0 active:shadow-none'
const secondaryButton =
  'inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-3 text-sm font-semibold text-ink transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-none'
const textLink =
  'underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink'

const h2Class =
  'text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl'
const leadClass = 'mt-4 max-w-xl text-lg leading-relaxed text-ink-soft'

function rise(i: number) {
  return { '--i': i } as React.CSSProperties
}

export function Landing() {
  return (
    <div
      id="top"
      className="landing-scroll h-full overflow-y-auto scroll-smooth bg-sand text-ink"
    >
      <a
        href="#conteudo"
        className="sr-only z-50 bg-ink px-4 py-2 text-sand focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>
      <Nav />
      <div id="conteudo">
        <Hero />
        <HowItWorks />
        <DashboardSection />
        <CustomizeSection />
        <AccountSection />
        <PrivacySection />
        <FaqSection />
        <Close />
      </div>
      <LandingFooter />
    </div>
  )
}

function Nav() {
  const links = [
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#conta', label: 'Conta grátis' },
    { href: '#duvidas', label: 'Dúvidas' },
  ]
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-sand">
      <nav className={`${wrap} flex h-14 items-center gap-6`}>
        <a href="#top" className="text-lg font-bold tracking-tight text-ink">
          FOCUS
        </a>
        <ul className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-ink-soft transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link to="/app" className={navButton}>
          Começar a focar
        </Link>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className={`${wrap} pt-12 pb-20 lg:pt-16`}>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="label-mono dash-rise" style={rise(0)}>
            Timer pomodoro · Kanban · Dashboard
          </p>
          <h1
            className="dash-rise mt-4 text-5xl font-extrabold leading-[0.92] tracking-[-0.045em] text-ink sm:text-6xl xl:text-7xl"
            style={rise(1)}
          >
            Pomodoro e kanban para estudo e trabalho
            <span className="text-ocean">.</span>
          </h1>
        </div>
        <div>
          <p
            className="dash-rise text-lg leading-relaxed text-ink-soft"
            style={rise(2)}
          >
            Escolha uma tarefa do kanban, mande para o timer e trabalhe em
            blocos de 25 minutos. Cada bloco entra no seu dashboard de foco.
          </p>
          <div className="dash-rise mt-6 flex flex-wrap gap-3" style={rise(3)}>
            <Link to="/app" className={primaryButton}>
              Começar a focar
            </Link>
            <a href="#como-funciona" className={secondaryButton}>
              Ver como funciona
            </a>
          </div>
          <p className="text-meta dash-rise mt-5" style={rise(4)}>
            Grátis · timer sem cadastro · 25 min de foco, 5 de pausa
          </p>
        </div>
      </div>
      <div className="dash-rise mt-12" style={rise(4)}>
        <DemoApp />
      </div>
    </section>
  )
}

function SectionHead({
  title,
  lead,
  id,
}: {
  title: React.ReactNode
  lead: string
  id: string
}) {
  return (
    <div className="mb-12">
      <h2 id={`${id}-titulo`} className={h2Class}>
        {title}
      </h2>
      <p className={leadClass}>{lead}</p>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: 'Anote as tarefas no kanban',
      body: 'Três colunas: a fazer, fazendo e feito. Cada cartão leva prioridade, tag colorida e prazo.',
      visual: <StepKanban />,
    },
    {
      title: 'Mande uma tarefa para o timer',
      body: 'O botão ▶ do cartão leva a tarefa para o relógio. Um som avisa cada troca entre foco e pausa.',
      visual: <StepTimer />,
    },
    {
      title: 'Acompanhe o foco no dashboard',
      body: 'Minutos por dia, tarefas concluídas e os horários em que você mais rende, separados por tag.',
      visual: <StepChart />,
    },
  ]
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className={`${screen} border-t-2 border-ink`}
    >
      <div className={wrap}>
        <SectionHead
          id="como-funciona"
          title="Do kanban ao dashboard em três passos."
          lead="O timer e a lista de tarefas ficam na mesma tela, então você não perde tempo trocando de aplicativo."
        />
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col">
              <div
                className="h-52 overflow-hidden border-2 border-ink"
                aria-hidden
              >
                {step.visual}
              </div>
              <p className="mt-6 text-sm text-ink-muted geist-mono">0{i + 1}</p>
              <h3 className="mt-1 text-xl font-bold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function StepKanban() {
  return (
    <div className="h-full bg-sand">
      <DemoColumnHead index="01" title="A FAZER" count={DEMO_TASKS.length} />
      {DEMO_TASKS.slice(0, 2).map((t) => (
        <DemoCard key={t.id} task={t} />
      ))}
    </div>
  )
}

function StepTimer() {
  const ring = `conic-gradient(var(--color-cream) 200deg, color-mix(in oklab, var(--color-cream) 24%, transparent) 0deg)`
  return (
    <div className="flex h-full items-center justify-center gap-5 bg-ocean px-5">
      <div
        className="flex size-28 shrink-0 items-center justify-center rounded-[35%]"
        style={{ background: ring }}
      >
        <div className="flex size-[80%] items-center justify-center rounded-full bg-ocean">
          <span className="text-2xl text-cream geist-mono">11:02</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-cream/62 geist-mono">FOCO · EM CURSO</p>
        <p className="mt-1 font-bold leading-snug text-cream">
          Revisar relatório trimestral
        </p>
      </div>
    </div>
  )
}

function StepChart() {
  const bars = [62, 80, 48, 92, 54, 30, 70]
  return (
    <div className="flex h-full flex-col bg-sand p-4">
      <p className="label-mono">Foco por dia</p>
      <div className="mt-auto flex h-32 items-end gap-2 border-b-2 border-ink">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col justify-end"
            style={{ height: `${h}%` }}
          >
            <div className="bg-tag-orange" style={{ height: '18%' }} />
            <div className="bg-tag-green" style={{ height: '32%' }} />
            <div className="flex-1 bg-tag-blue" />
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardSection() {
  return (
    <section
      id="dashboard"
      aria-labelledby="dashboard-titulo"
      className={`${screen} border-t-2 border-ink`}
    >
      <div className={wrap}>
        <SectionHead
          id="dashboard"
          title="Dashboard com o histórico do seu foco."
          lead="Tempo em foco, tarefas feitas e a sequência de dias, nos períodos de 7, 30 ou 90 dias. Abaixo, duas semanas de exemplo."
        />
        <div className="border-2 border-ink bg-sand p-4 shadow-[8px_8px_0_0_var(--color-ink)] sm:p-6">
          <KpiStrip kpis={DEMO_KPIS} />
          <div className="mt-8 grid gap-10">
            <div className="min-w-0">
              <p className="label-mono mb-3">Foco ao longo do tempo</p>
              <FocusTimeline
                buckets={DEMO_TIMELINE}
                series={DEMO_TAGS}
                selected={null}
                granularity="day"
              />
            </div>
            <div className="min-w-0">
              <p className="label-mono mb-3">Ritmo da semana</p>
              <RhythmGrid grid={DEMO_RHYTHM} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CustomizeSection() {
  return (
    <section
      id="personalizar"
      aria-labelledby="personalizar-titulo"
      className={`${screen} border-t-2 border-ink`}
    >
      <div className={wrap}>
        <SectionHead
          id="personalizar"
          title="Três layouts e cinco cores para o app."
          lead="Use só o timer, só as tarefas ou os dois lado a lado. Teste aqui: a cor escolhida vale para o app inteiro."
        />
        <Customize />
      </div>
    </section>
  )
}

function AccountSection() {
  const rows: [string, boolean, boolean][] = [
    ['Timer pomodoro com durações ajustáveis', true, true],
    ['Cinco cores de paleta', true, true],
    ['Kanban com prioridades, tags e prazos', false, true],
    ['Tarefas salvas entre dispositivos', false, true],
    ['Histórico de foco e dashboard', false, true],
    ['Layouts com timer e tarefas', false, true],
  ]
  const mark = (on: boolean, label: string) =>
    on ? (
      <FiCheck
        aria-label={`${label}: sim`}
        className="mx-auto size-5 text-ink"
      />
    ) : (
      <FiMinus
        aria-label={`${label}: não`}
        className="mx-auto size-5 text-ink/30"
      />
    )
  return (
    <section
      id="conta"
      aria-labelledby="conta-titulo"
      className={`${screen} border-t-2 border-ink`}
    >
      <div className={wrap}>
        <SectionHead
          id="conta"
          title="O que a conta grátis libera."
          lead="O timer funciona sem cadastro. Com nome, e-mail e senha você ganha o kanban e o histórico de foco."
        />
        <table className="w-full max-w-3xl border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink text-sm geist-mono">
              <th scope="col" className="py-3 pr-4 font-normal text-ink-muted">
                Recurso
              </th>
              <th
                scope="col"
                className="w-20 py-3 text-center font-bold sm:w-28"
              >
                Sem conta
              </th>
              <th
                scope="col"
                className="w-20 bg-ink py-3 text-center font-bold text-sand sm:w-28"
              >
                Com conta
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, guest, user]) => (
              <tr key={label} className="border-b border-ink/20">
                <th scope="row" className="py-4 pr-4 font-medium">
                  {label}
                </th>
                <td className="py-4">{mark(guest, 'Sem conta')}</td>
                <td className="bg-ink/5 py-4">{mark(user, 'Com conta')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PrivacySection() {
  const points = [
    'Sem anúncios e sem cookies de rastreamento.',
    'Baixe todos os seus dados em JSON quando quiser.',
    'Exclua a conta e tudo some na hora.',
  ]
  return (
    <section
      id="privacidade"
      aria-labelledby="privacidade-titulo"
      className={`${screen} border-t-2 border-ink bg-ocean text-cream`}
    >
      <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2`}>
        <div>
          <h2 id="privacidade-titulo" className={`${h2Class} !text-cream`}>
            Seus dados ficam com você.
          </h2>
          <ul className="mt-8 flex flex-col gap-4 text-lg">
            {points.map((p) => (
              <li key={p} className="flex gap-3">
                <FiCheck aria-hidden className="mt-1 size-5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-cream/75">
            Detalhes na{' '}
            <Link
              to="/privacidade"
              className="underline underline-offset-4 hover:text-cream"
            >
              Política de Privacidade
            </Link>{' '}
            e nos{' '}
            <Link
              to="/termos"
              className="underline underline-offset-4 hover:text-cream"
            >
              Termos de Uso
            </Link>
            .
          </p>
        </div>
        <div aria-hidden className="grid gap-5 text-ink">
          <div className="border-2 border-ink bg-sand p-5 shadow-[8px_8px_0_0_var(--color-ink)]">
            <p className="label-mono font-bold">Exportar dados</p>
            <p className="mt-2 text-sm text-ink-soft">
              Conta, tarefas, tags, sessões de foco e registros de acesso em um
              arquivo JSON.
            </p>
            <span className="mt-4 inline-block bg-ink px-4 py-2 text-sm font-medium text-sand">
              Baixar meus dados
            </span>
          </div>
          <div className="border-2 border-ink bg-sand p-5 shadow-[8px_8px_0_0_var(--color-ink)]">
            <p className="label-mono font-bold">Excluir conta</p>
            <p className="mt-2 text-sm text-ink-soft">
              Apaga definitivamente sua conta, tarefas, tags e sessões de foco.
            </p>
            <span className="mt-4 inline-block bg-danger px-4 py-2 text-sm font-medium text-sand">
              Excluir minha conta
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const faq = [
    {
      q: 'O Focus é grátis?',
      a: 'Sim. O timer, o kanban e o dashboard são gratuitos, sem plano pago e sem anúncios.',
    },
    {
      q: 'Preciso criar conta?',
      a: 'Não para usar o timer. A conta é necessária para salvar tarefas, guardar o histórico de foco e ver o dashboard.',
    },
    {
      q: 'O que é a técnica pomodoro?',
      a: 'Trabalhar em blocos curtos de foco, em geral 25 minutos, com pausas de 5 minutos e uma pausa longa a cada ciclo. No Focus você ajusta as três durações.',
    },
    {
      q: 'Funciona no celular?',
      a: 'Sim, pelo navegador. No celular o timer e as tarefas aparecem em abas, uma de cada vez.',
    },
    {
      q: 'O timer para se eu sair da tela?',
      a: 'Não. Ele continua contando ao abrir o dashboard ou trocar de layout, numa janela flutuante que você arrasta e minimiza.',
    },
  ]
  return (
    <section
      id="duvidas"
      aria-labelledby="duvidas-titulo"
      className={`${screen} border-t-2 border-ink`}
    >
      <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.6fr]`}>
        <h2 id="duvidas-titulo" className={h2Class}>
          Dúvidas frequentes.
        </h2>
        <div className="border-t-2 border-ink">
          {faq.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              className="group border-b-2 border-ink"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="text-2xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-6 text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Close() {
  return (
    <section
      aria-labelledby="fechamento-titulo"
      className={`${screen} border-t-2 border-ink bg-ink text-sand`}
    >
      <div className={`${wrap} flex flex-col items-start gap-8`}>
        <p
          aria-hidden
          className="text-[clamp(5rem,22vw,17rem)] font-extrabold leading-[0.8] tracking-[-0.035em]"
        >
          FOCUS
        </p>
        <h2
          id="fechamento-titulo"
          className="max-w-2xl text-2xl font-semibold sm:text-3xl"
        >
          Abra o timer e comece o primeiro bloco de 25 minutos.
        </h2>
        <Link
          to="/app"
          className="inline-flex items-center justify-center border-2 border-sand bg-sand px-6 py-3.5 font-semibold text-ink transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ocean)] active:translate-y-0 active:shadow-none"
        >
          Começar a focar
        </Link>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t-2 border-ink">
      <div
        className={`${wrap} flex flex-col gap-4 py-8 text-sm text-ink-soft md:flex-row md:items-center md:justify-between`}
      >
        <p>
          Focus, desenvolvido por{' '}
          <a
            href={DEVELOPER_URL}
            target="_blank"
            rel="noopener"
            className={`${textLink} font-semibold text-ink`}
          >
            Matheus Freitas
          </a>
          .
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className={textLink}>
              Contato
            </a>
          </li>
          <li>
            <Link to="/termos" className={textLink}>
              Termos
            </Link>
          </li>
          <li>
            <Link to="/privacidade" className={textLink}>
              Privacidade
            </Link>
          </li>
          <li>
            <Link to="/privacidade" hash="cookies" className={textLink}>
              Cookies
            </Link>
          </li>
          <li className="text-ink-muted">© {new Date().getFullYear()}</li>
        </ul>
      </div>
    </footer>
  )
}
