import Link from 'next/link'
import { HOME } from '@/content/landing/home'
import { Logo } from '../Logo'
import { ANCHORS, NAV_ANCHORS } from './anchors'

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex h-16 max-w-[76rem] items-center justify-between gap-2 rounded-full border border-white/80 bg-white/70 pl-5 pr-2.5 shadow-[0_14px_44px_-20px_rgba(11,27,63,0.4)] backdrop-blur-xl backdrop-saturate-150 sm:pl-7">
        <a href="#inicio" className="inline-flex min-h-11 items-center rounded-full pr-2 text-[1.55rem] sm:text-[1.7rem]">
          <Logo />
        </a>

        <nav aria-label="Secciones" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ANCHORS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-[0.95rem] font-medium text-lp-navy/80 transition-colors hover:bg-lp-navy/5 hover:text-lp-navy xl:px-4"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`#${ANCHORS.contact.id}`}
            className="hidden min-h-11 items-center whitespace-nowrap rounded-full border border-lp-navy/15 px-5 text-sm font-semibold text-lp-navy transition-colors hover:border-lp-sky hover:bg-white md:inline-flex"
          >
            {HOME.hero.primaryCta}
          </a>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-lp-navy px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(11,27,63,0.8)] transition-colors hover:bg-lp-blue sm:px-6"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  )
}
