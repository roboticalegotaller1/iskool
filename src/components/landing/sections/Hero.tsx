import type { CSSProperties } from 'react'
import { HOME } from '@/content/landing/home'
import { BrainVisual } from '../BrainVisual'
import { Icon } from '../Icon'
import { ANCHORS } from './anchors'

const order = (i: number) => ({ '--i': i }) as CSSProperties

export function Hero() {
  const { hero, pillars } = HOME

  return (
    <section id="inicio" className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40 lg:pb-28 lg:pt-44">
      {/* Luz difusa azul y violeta sobre el fondo claro */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 size-[38rem] rounded-full bg-lp-sky/20 blur-[110px]" />
        <div className="absolute -right-32 top-10 size-[40rem] rounded-full bg-lp-violet/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-lp-cyan/10 blur-[110px]" />
        <div className="lp-dot-grid lp-fade-edges absolute inset-0" />
      </div>

      <div className="mx-auto grid max-w-[76rem] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:gap-10">
        <div>
          <p
            className="lp-rise inline-flex items-center gap-2.5 rounded-full border border-lp-sky/30 bg-white/75 py-2 pl-3 pr-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-lp-blue shadow-[0_8px_24px_-16px_rgba(30,79,216,0.6)] backdrop-blur"
            style={order(0)}
          >
            <span aria-hidden="true" className="relative flex size-2.5">
              <span className="absolute inset-0 rounded-full bg-lp-sky/50 motion-safe:animate-ping" />
              <span className="relative size-2.5 rounded-full bg-lp-sky" />
            </span>
            {hero.eyebrow}
          </p>

          <h1
            className="lp-rise mt-7 text-balance font-lp-display text-[clamp(2.7rem,6.4vw,4.9rem)] font-bold leading-[1.02] tracking-[-0.04em] text-lp-navy"
            style={order(1)}
          >
            {hero.title}
          </h1>

          <p className="lp-rise mt-7 max-w-[34rem] text-pretty text-lg leading-relaxed text-lp-muted sm:text-[1.2rem]" style={order(2)}>
            {hero.lead}
          </p>

          <div className="lp-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={order(3)}>
            <a
              href={`#${ANCHORS.contact.id}`}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-lp-blue py-2 pl-7 pr-2.5 text-base font-semibold text-white shadow-[0_20px_40px_-18px_rgba(30,79,216,0.85)] transition-colors hover:bg-lp-navy"
            >
              {hero.primaryCta}
              <span className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                <Icon name="arrowRight" />
              </span>
            </a>
            <a
              href={`#${ANCHORS.how.id}`}
              className="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-lp-navy/15 bg-white/70 px-7 text-base font-semibold text-lp-navy backdrop-blur transition-colors hover:border-lp-sky hover:bg-white"
            >
              {hero.secondaryCta}
              <Icon name="arrowDown" className="size-[1.1rem] text-lp-blue transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="lp-rise lg:-mr-4" style={order(4)}>
          <BrainVisual pillars={pillars} />
        </div>
      </div>
    </section>
  )
}
