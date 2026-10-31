import { HOME } from '@/content/landing/home'
import { Icon, type IconName } from '../Icon'

// Un trayecto en cinco paradas que va y regresa: cómo se hizo, a dónde llega, de quién es, a qué medida y con qué.
const STOPS: { icon: IconName; tile: string; offset: string }[] = [
  { icon: 'shield', tile: 'bg-lp-sky/12 text-lp-blue', offset: '' },
  { icon: 'pin', tile: 'bg-lp-violet/12 text-lp-violet', offset: 'lg:ml-10' },
  { icon: 'badge', tile: 'bg-lp-amber/20 text-lp-navy', offset: 'lg:ml-20' },
  { icon: 'pen', tile: 'bg-lp-magenta/10 text-lp-magenta', offset: 'lg:ml-10' },
  { icon: 'nodes', tile: 'bg-lp-blue/10 text-lp-blue', offset: '' },
]

export function Origin() {
  const { origin } = HOME

  return (
    <section id="origen" className="relative rounded-t-[2.5rem] bg-lp-surface py-24 shadow-[0_-30px_60px_-50px_rgba(11,27,63,0.35)] sm:rounded-t-[3.5rem] sm:py-32">
      <div className="mx-auto grid max-w-[76rem] gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lp-reveal">
          <p className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-lp-blue">
            <span aria-hidden="true" className="h-px w-10 bg-linear-to-r from-lp-sky to-lp-violet" />
            {origin.eyebrow}
          </p>
          <h2 className="mt-6 text-balance font-lp-display text-[clamp(2rem,3.7vw,3rem)] font-bold leading-[1.08] tracking-[-0.035em] text-lp-navy">
            {origin.title}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-lp-muted">{origin.body}</p>
        </div>

        <div className="relative lg:pl-8">
          {/* Trazo curvo que une las tres paradas */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 200 420"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -left-2 top-6 hidden h-[calc(100%-3rem)] w-44 lg:block"
            fill="none"
          >
            <defs>
              <linearGradient id="isk-route" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--color-lp-sky)' }} />
                <stop offset="0.5" style={{ stopColor: 'var(--color-lp-violet)' }} />
                <stop offset="1" style={{ stopColor: 'var(--color-lp-amber)' }} />
              </linearGradient>
            </defs>
            <path
              d="M8 10C8 84 48 90 48 126S92 176 92 210S48 258 48 294S8 340 8 410"
              stroke="url(#isk-route)"
              strokeWidth="1.5"
              strokeDasharray="3 7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="relative space-y-5">
            {origin.points.map((point, i) => {
              const stop = STOPS[i % STOPS.length]
              return (
                <li
                  key={point.title}
                  // Fondo opaco: la línea punteada pasa por detrás de las tarjetas, nunca encima.
                  className={`lp-reveal flex gap-5 rounded-[1.75rem] border border-lp-navy/[0.07] bg-lp-mist p-6 shadow-[0_24px_50px_-36px_rgba(11,27,63,0.45)] sm:p-7 ${stop.offset}`}
                >
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${stop.tile}`}>
                    <Icon name={stop.icon} className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-lp-display text-xl font-semibold tracking-[-0.02em] text-lp-navy">{point.title}</h3>
                    <p className="mt-2 text-pretty leading-relaxed text-lp-muted">{point.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
