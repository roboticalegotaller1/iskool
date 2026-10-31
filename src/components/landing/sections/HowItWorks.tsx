import type { ReactNode } from 'react'
import { STEPS, type Step } from '@/content/landing/steps'
import { Icon, type IconName } from '../Icon'
import { ANCHORS } from './anchors'

// Un acento por paso: cielo, azul, violeta, magenta y ámbar.
const ACCENTS = [
  { badge: 'border-lp-sky ring-lp-sky/15', rail: 'from-lp-sky to-lp-blue', tile: 'bg-lp-sky/12 text-lp-blue' },
  { badge: 'border-lp-blue ring-lp-blue/15', rail: 'from-lp-blue to-lp-violet', tile: 'bg-lp-blue/10 text-lp-blue' },
  { badge: 'border-lp-violet ring-lp-violet/20', rail: 'from-lp-violet to-lp-magenta', tile: 'bg-lp-violet/12 text-lp-violet' },
  { badge: 'border-lp-magenta ring-lp-magenta/15', rail: 'from-lp-magenta to-lp-amber', tile: 'bg-lp-magenta/10 text-lp-magenta' },
  { badge: 'border-lp-amber ring-lp-amber/25', rail: 'from-lp-amber to-lp-amber', tile: 'bg-lp-amber/20 text-lp-navy' },
] as const

const ICONS: IconName[][] = [
  ['grid', 'layers', 'book', 'award', 'link'],
  ['database', 'flow', 'cap', 'chart', 'users', 'pin'],
  ['doc', 'shapes', 'bulb', 'chat', 'trend'],
  ['compass', 'board', 'eye', 'home'],
  ['vault', 'loop', 'lock'],
]

const iconFor = (step: number, item: number): IconName => ICONS[step]?.[item] ?? 'nodes'
const twoDigits = (n: number) => String(n).padStart(2, '0')

const TITLE = 'text-balance font-lp-display font-semibold tracking-[-0.03em]'

function Intro({ step, className = '' }: { step: Step; className?: string }) {
  return (
    <div className={className}>
      <h3 className={`${TITLE} text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] text-lp-navy`}>{step.title}</h3>
      <p className="mt-4 text-pretty text-[1.05rem] leading-relaxed text-lp-muted">{step.body}</p>
    </div>
  )
}

/* Paso 1 — lo que la escuela ya usa: fichas sueltas que confluyen. */
function Sources({ step, index }: { step: Step; index: number }) {
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-12">
      <Intro step={step} />
      <ul className="flex flex-wrap gap-3">
        {step.items.map((item, i) => (
          <li
            key={item.title}
            className="flex w-full items-start gap-3.5 rounded-2xl border border-lp-navy/[0.07] bg-lp-surface p-4 shadow-[0_18px_36px_-30px_rgba(11,27,63,0.5)] sm:w-[calc(50%-0.375rem)] sm:last:odd:w-full"
          >
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${ACCENTS[index].tile}`}>
              <Icon name={iconFor(index, i)} />
            </span>
            <div>
              <p className="font-semibold leading-snug text-lp-navy">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-lp-muted">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Paso 2 — una sola matriz ordenada, sin tarjetas sueltas. */
function Matrix({ step, index }: { step: Step; index: number }) {
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-12">
      <Intro step={step} className="xl:order-2" />
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-lp-navy/10 bg-lp-navy/10 shadow-[0_24px_50px_-36px_rgba(11,27,63,0.5)] sm:grid-cols-3">
        {step.items.map((item, i) => (
          <li key={item.title} className="bg-lp-surface p-5">
            <Icon name={iconFor(index, i)} className="size-6 text-lp-blue" />
            <p className="mt-3 font-lp-display font-semibold tracking-[-0.01em] text-lp-navy">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-lp-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Paso 3 — lo que genera: panel oscuro, el de mayor peso. */
function Generator({ step, index }: { step: Step; index: number }) {
  return (
    <div className="lp-on-dark relative isolate overflow-hidden rounded-[2rem] bg-lp-navy-deep p-6 text-white shadow-[0_40px_80px_-40px_rgba(124,77,255,0.65)] sm:rounded-[2.5rem] sm:p-10 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-32 size-[26rem] rounded-full bg-lp-violet/45 blur-[100px]" />
        <div className="absolute -bottom-40 -left-20 size-[24rem] rounded-full bg-lp-blue/40 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 size-64 rounded-full bg-lp-magenta/25 blur-[90px]" />
        <div className="lp-dot-grid-light absolute inset-0" />
        <span className="absolute -right-2 -top-10 font-lp-display text-[11rem] font-bold leading-none tracking-[-0.06em] text-white/[0.06] sm:text-[15rem]">
          {twoDigits(step.number)}
        </span>
      </div>

      <h3 className={`${TITLE} max-w-2xl text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-white`}>{step.title}</h3>
      <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">{step.body}</p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {step.items.map((item, i) => {
          const lead = i === 0
          return (
            <li
              key={item.title}
              className={
                lead
                  ? 'relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl bg-linear-to-br from-lp-blue to-lp-violet p-6 sm:col-span-2 lg:col-span-1 lg:row-span-2'
                  : 'rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm'
              }
            >
              <span className={`flex items-center justify-center rounded-2xl ${lead ? 'size-14 bg-white/15' : 'size-11 bg-white/10 text-lp-cyan'}`}>
                <Icon name={iconFor(index, i)} className={lead ? 'size-7' : 'size-5'} />
              </span>
              <div className={lead ? '' : 'mt-4'}>
                <p className={`font-lp-display font-semibold tracking-[-0.02em] text-white ${lead ? 'text-2xl' : 'text-lg'}`}>{item.title}</p>
                <p className={`mt-2 text-pretty leading-relaxed ${lead ? 'text-white' : 'text-sm text-white/70'}`}>{item.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* Paso 4 — la comunidad: cuatro personas en línea, unidas por un mismo hilo. */
const COMMUNITY = ['border-lp-sky text-lp-blue', 'border-lp-violet text-lp-violet', 'border-lp-magenta text-lp-magenta', 'border-lp-cyan text-lp-blue']

function Community({ step, index }: { step: Step; index: number }) {
  return (
    <div>
      <Intro step={step} className="max-w-2xl" />
      <ul className="relative mt-10 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
        <li aria-hidden="true" className="absolute inset-x-[12.5%] top-8 hidden h-px bg-linear-to-r from-lp-sky via-lp-violet to-lp-cyan lg:block" />
        {step.items.map((item, i) => (
          <li key={item.title} className="relative flex flex-col items-center text-center">
            <span className={`flex size-16 items-center justify-center rounded-full border-2 bg-lp-surface shadow-[0_14px_30px_-18px_rgba(11,27,63,0.55)] ${COMMUNITY[i % COMMUNITY.length]}`}>
              <Icon name={iconFor(index, i)} className="size-7" />
            </span>
            <p className="mt-4 font-lp-display text-lg font-semibold tracking-[-0.02em] text-lp-navy">{item.title}</p>
            <p className="mt-1 max-w-[14rem] text-sm leading-relaxed text-lp-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Paso 5 — la memoria: una constelación de saberes enlazados a un mismo núcleo. */
type StarKind = 'bright' | 'sky' | 'violet'

const HUB = { x: 160, y: 150 }

interface Star {
  x: number
  y: number
  kind: StarKind
}

const HUB_INDEX = -1
const STAR_COUNT = 64
const STAR_GAP = 25
const HUB_CLEARANCE = 36
const HUB_LINKS = 9

// Generador con semilla fija: la constelación es siempre la misma en cada build.
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const distance = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)

function buildConstellation() {
  const random = seeded(11)
  const stars: Star[] = []
  for (let tries = 0; stars.length < STAR_COUNT && tries < 6000; tries++) {
    const candidate = { x: Math.round(12 + random() * 296), y: Math.round(12 + random() * 276) }
    if (distance(candidate, HUB) < HUB_CLEARANCE) continue
    if (stars.some((star) => distance(star, candidate) < STAR_GAP)) continue
    const kind: StarKind = stars.length % 8 === 3 ? 'bright' : random() < 0.5 ? 'sky' : 'violet'
    stars.push({ ...candidate, kind })
  }

  // Cada estrella se enlaza con sus dos vecinas más cercanas; el núcleo, con las que lo rodean.
  const links = new Map<string, [number, number]>()
  const nearest = (from: { x: number; y: number }, skip: number, count: number) =>
    stars
      .map((star, index) => ({ index, d: distance(from, star) }))
      .filter(({ index }) => index !== skip)
      .sort((p, q) => p.d - q.d)
      .slice(0, count)
      .map(({ index }) => index)

  stars.forEach((star, index) => {
    for (const other of nearest(star, index, 2)) {
      const pair: [number, number] = index < other ? [index, other] : [other, index]
      links.set(pair.join('-'), pair)
    }
  })
  for (const index of nearest(HUB, HUB_INDEX, HUB_LINKS)) links.set(`hub-${index}`, [HUB_INDEX, index])

  return { stars, links: [...links.values()] }
}

const CONSTELLATION = buildConstellation()

const DUST: [number, number, number][] = [
  [22, 40, 1.2], [86, 8, 1], [146, 6, 1.1], [204, 8, 1], [312, 44, 1.2], [314, 158, 1], [270, 294, 1.1],
  [190, 294, 1], [64, 294, 1.2], [6, 248, 1], [6, 96, 1.1], [314, 250, 1],
]

const STAR_FILL: Record<Exclude<StarKind, 'bright'>, string> = { sky: 'fill-lp-sky', violet: 'fill-lp-violet' }
const STAR_HALO: Record<Exclude<StarKind, 'bright'>, string> = { sky: 'fill-lp-sky/20', violet: 'fill-lp-violet/20' }

function MemoryConstellation() {
  const { stars, links } = CONSTELLATION
  const point = (index: number) => (index === HUB_INDEX ? HUB : stars[index])
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 320 300" fill="none" className="mx-auto w-full max-w-[21rem]">
      {DUST.map(([x, y, r], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          className={`lp-brain-twinkle ${i % 3 ? 'fill-lp-navy/25' : 'fill-lp-amber/70'}`}
          style={{ animationDelay: `${-i * 0.45}s` }}
        />
      ))}

      {links.map(([from, to], i) => {
        const p = point(from)
        const q = point(to)
        const toHub = from === HUB_INDEX
        return (
          <g key={`${from}-${to}`}>
            <line
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={toHub ? 'stroke-lp-amber/55' : 'stroke-lp-navy/20'}
              strokeWidth={toHub ? 1.3 : 0.9}
              strokeLinecap="round"
            />
            {toHub && (
              <line
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                className="lp-brain-flow stroke-lp-amber"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="2 18"
                style={{ animationDelay: `${-i * 0.6}s` }}
              />
            )}
          </g>
        )
      })}

      {stars.map(({ x, y, kind }, i) =>
        kind === 'bright' ? (
          <g key={`${x}-${y}`} className="lp-brain-twinkle" style={{ animationDelay: `${-i * 0.7}s` }}>
            <circle cx={x} cy={y} r="11" className="fill-lp-amber/20" />
            <circle cx={x} cy={y} r="5" className="fill-lp-surface stroke-lp-amber" strokeWidth="1.8" />
            <circle cx={x} cy={y} r="1.9" className="fill-lp-navy" />
          </g>
        ) : (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="6" className={STAR_HALO[kind]} />
            <circle cx={x} cy={y} r="2.6" className={STAR_FILL[kind]} />
          </g>
        ),
      )}

      <circle cx={HUB.x} cy={HUB.y} r="34" className="lp-brain-aura fill-lp-amber/20" />
      <circle cx={HUB.x} cy={HUB.y} r="16" className="fill-lp-navy" />
      <circle cx={HUB.x} cy={HUB.y} r="5.5" className="fill-lp-amber" />
    </svg>
  )
}

function Memory({ step, index }: { step: Step; index: number }) {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-lp-amber/35 bg-lp-surface p-6 shadow-[0_40px_80px_-44px_rgba(245,165,36,0.7)] sm:rounded-[2.5rem] sm:p-10 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-lp-amber/20 blur-[90px]" />
        <div className="absolute -bottom-32 left-10 size-72 rounded-full bg-lp-sky/15 blur-[90px]" />
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div>
          <h3 className={`${TITLE} max-w-2xl text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-lp-navy`}>{step.title}</h3>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-lp-muted">{step.body}</p>
        </div>
        <MemoryConstellation />
      </div>

      <ul className="mt-10 grid gap-6 border-t border-lp-navy/10 pt-8 lg:grid-cols-3 lg:gap-8">
        {step.items.map((item, i) => (
          <li key={item.title} className="flex gap-4">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${ACCENTS[index].tile}`}>
              <Icon name={iconFor(index, i)} />
            </span>
            <div>
              <p className="font-lp-display text-lg font-semibold tracking-[-0.02em] text-lp-navy">{item.title}</p>
              <p className="mt-1 text-pretty text-sm leading-relaxed text-lp-muted">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const LAYOUTS: ((props: { step: Step; index: number }) => ReactNode)[] = [Sources, Matrix, Generator, Community, Memory]

export function HowItWorks() {
  return (
    <section id={ANCHORS.how.id} className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="lp-dot-grid lp-fade-edges pointer-events-none absolute inset-x-0 top-0 h-[36rem]" />

      <div className="relative mx-auto max-w-[76rem] px-5 sm:px-8">
        <h2 className="lp-reveal font-lp-display text-[clamp(2.4rem,5.4vw,4.25rem)] font-bold leading-none tracking-[-0.04em] text-lp-navy">
          {ANCHORS.how.label}
        </h2>

        <ol className="mt-14 space-y-16 sm:mt-20 lg:space-y-24">
          {STEPS.map((step, index) => {
            const Layout = LAYOUTS[index % LAYOUTS.length]
            const accent = ACCENTS[index % ACCENTS.length]
            const last = index === STEPS.length - 1
            return (
              <li key={step.number} className="lp-reveal relative grid gap-6 lg:grid-cols-[6rem_minmax(0,1fr)] lg:gap-10">
                {/* Hilo que une un paso con el siguiente */}
                {!last && (
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-24 left-12 top-28 hidden w-px bg-linear-to-b opacity-60 lg:block ${accent.rail}`}
                  />
                )}
                <div className="lg:pt-1">
                  <span
                    className={`flex size-16 items-center justify-center rounded-full border-[3px] bg-lp-surface font-lp-display text-2xl font-bold tracking-[-0.04em] text-lp-navy ring-8 lg:size-24 lg:text-[2.5rem] ${accent.badge}`}
                  >
                    {twoDigits(step.number)}
                  </span>
                </div>
                <Layout step={step} index={index} />
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
