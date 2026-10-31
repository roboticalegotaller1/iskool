import { FEATURES } from '@/content/landing/features'
import { Icon, type IconName } from '../Icon'
import { ANCHORS } from './anchors'

const ICONS: IconName[] = ['bulb', 'compass', 'chat', 'book', 'award', 'board', 'eye', 'doc']

// Las dos primeras abren la sección a lo grande; el resto alterna acentos.
const TILES = ['bg-lp-sky/12 text-lp-blue', 'bg-lp-violet/12 text-lp-violet', 'bg-lp-amber/20 text-lp-navy', 'bg-lp-magenta/10 text-lp-magenta', 'bg-lp-blue/10 text-lp-blue', 'bg-lp-cyan/15 text-lp-navy']

const LEAD_CARDS = [
  'bg-linear-to-br from-lp-blue to-lp-violet shadow-[0_40px_80px_-40px_rgba(30,79,216,0.75)]',
  'bg-lp-navy-deep shadow-[0_40px_80px_-40px_rgba(7,19,48,0.8)]',
]

export function Features() {
  const { eyebrow, title, lead, items } = FEATURES

  return (
    <section id={ANCHORS.features.id} className="relative scroll-mt-24 pb-24 pt-8 sm:pb-32 sm:pt-12">
      <div className="mx-auto max-w-[76rem] px-5 sm:px-8">
        <div className="lp-reveal max-w-3xl">
          <p className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-lp-blue">
            <span aria-hidden="true" className="h-px w-10 bg-linear-to-r from-lp-sky to-lp-violet" />
            {eyebrow}
          </p>
          <h2 className="mt-6 text-balance font-lp-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.04em] text-lp-navy">
            {title}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-lp-muted sm:text-xl">{lead}</p>
        </div>

        <ul className="mt-12 grid gap-5 sm:mt-14 md:grid-cols-2 lg:grid-cols-6">
          {items.map((item, i) => {
            const isLead = i < LEAD_CARDS.length
            return (
              <li
                key={item.title}
                className={`lp-reveal relative isolate flex flex-col overflow-hidden rounded-[2rem] p-7 sm:p-8 ${
                  isLead
                    ? `lp-on-dark text-white lg:col-span-3 lg:p-10 ${LEAD_CARDS[i]}`
                    : 'border border-lp-navy/[0.07] bg-lp-surface shadow-[0_24px_50px_-36px_rgba(11,27,63,0.45)] lg:col-span-2'
                }`}
              >
                {isLead && (
                  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-white/10 blur-3xl" />
                )}
                <div className="flex items-center gap-4">
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                      isLead ? 'bg-white/15 text-white' : TILES[(i - LEAD_CARDS.length) % TILES.length]
                    }`}
                  >
                    <Icon name={ICONS[i] ?? 'nodes'} className="size-6" />
                  </span>
                  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${isLead ? 'text-white/80' : 'text-lp-blue'}`}>
                    {item.audience}
                  </p>
                </div>
                <h3
                  className={`mt-6 text-balance font-lp-display font-semibold tracking-[-0.03em] ${
                    isLead ? 'text-[clamp(1.6rem,2.6vw,2.1rem)] leading-[1.1]' : 'text-xl leading-snug text-lp-navy sm:text-[1.4rem]'
                  }`}
                >
                  {item.title}
                </h3>
                <p className={`mt-3 text-pretty leading-relaxed ${isLead ? 'text-lg text-white' : 'text-lp-muted'}`}>{item.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
