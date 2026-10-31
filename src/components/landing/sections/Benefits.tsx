import { BENEFITS } from '@/content/landing/benefits'
import { Icon, type IconName } from '../Icon'
import { ANCHORS } from './anchors'

const STYLES: { icon: IconName; ring: string; glow: string }[] = [
  { icon: 'clock', ring: 'border-lp-sky text-lp-blue', glow: 'bg-lp-sky/25' },
  { icon: 'star', ring: 'border-lp-violet text-lp-violet', glow: 'bg-lp-violet/25' },
  { icon: 'trend', ring: 'border-lp-amber text-lp-navy', glow: 'bg-lp-amber/35' },
]

export function Benefits() {
  return (
    <section id={ANCHORS.benefits.id} className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-[76rem] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lp-reveal lg:col-span-4">
          <h2 className="font-lp-display text-[clamp(2.4rem,5.4vw,4.25rem)] font-bold leading-none tracking-[-0.04em] text-lp-navy lg:sticky lg:top-32">
            {ANCHORS.benefits.label}
          </h2>
        </div>

        <ul className="lg:col-span-8">
          {BENEFITS.map((benefit, i) => {
            const style = STYLES[i % STYLES.length]
            return (
              <li
                key={benefit.title}
                className="lp-reveal grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-6 gap-y-2 border-t border-lp-navy/10 py-9 last:border-b sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-9 sm:py-11"
              >
                <span className="relative row-span-2 flex size-16 items-center justify-center sm:row-span-1 sm:size-20">
                  <span aria-hidden="true" className={`absolute inset-0 rounded-full blur-xl ${style.glow}`} />
                  <span className={`relative flex size-full items-center justify-center rounded-full border-2 bg-lp-surface ${style.ring}`}>
                    <Icon name={style.icon} className="size-7 sm:size-9" />
                  </span>
                </span>
                <h3 className="text-balance font-lp-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-lp-navy">
                  {benefit.title}
                </h3>
                <p className="col-start-2 text-pretty text-lg leading-relaxed text-lp-muted sm:col-start-3">{benefit.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
