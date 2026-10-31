import { Fragment } from 'react'
import { CLOSING } from '@/content/landing/benefits'
import { Icon, type IconName } from '../Icon'

const BEAT_ICONS: IconName[] = ['pen', 'nodes', 'building']
const BEAT_TONES = ['text-lp-sky', 'text-lp-magenta', 'text-lp-amber']
const WORDMARK = 'iSkool'

// La marca conserva su "i" en cielo dondequiera que aparezca dentro de una frase.
function withWordmark(text: string) {
  const parts = text.split(WORDMARK)
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <span className="tracking-[-0.045em]">
          <span className="text-lp-sky">{WORDMARK[0]}</span>
          {WORDMARK.slice(1)}
          <sup className="ml-[0.1em] font-lp-body text-[0.55em] font-semibold tracking-normal">®</sup>
        </span>
      )}
      {part}
    </Fragment>
  ))
}

export function Closing() {
  return (
    <section id="cierre" className="px-3 pb-10 sm:px-6">
      <div className="lp-on-dark lp-reveal relative isolate mx-auto max-w-[80rem] overflow-hidden rounded-[2.25rem] bg-lp-navy-deep px-6 py-20 text-center text-white sm:rounded-[3rem] sm:px-12 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-40 size-[30rem] rounded-full bg-lp-blue/45 blur-[120px]" />
          <div className="absolute -bottom-48 -right-24 size-[32rem] rounded-full bg-lp-violet/40 blur-[120px]" />
          <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-lp-magenta/20 blur-[100px]" />
          <div className="lp-dot-grid-light lp-fade-edges absolute inset-0" />
        </div>

        <h2 className="mx-auto max-w-4xl text-balance font-lp-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.06] tracking-[-0.04em] text-white">
          {CLOSING.title}
        </h2>

        <ul className="mx-auto mt-14 grid max-w-4xl divide-y divide-white/15 sm:mt-16 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {CLOSING.beats.map((beat, i) => (
            <li key={beat} className="flex items-center justify-center gap-3 px-4 py-5 sm:flex-col sm:justify-start sm:gap-4 sm:py-2">
              <Icon name={BEAT_ICONS[i % BEAT_ICONS.length]} className={`size-6 sm:size-7 ${BEAT_TONES[i % BEAT_TONES.length]}`} />
              <span className="text-balance font-lp-display text-lg font-semibold tracking-[-0.02em] text-white lg:text-xl">{withWordmark(beat)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
