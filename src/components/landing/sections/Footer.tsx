import { PRIVACY_URL, TERMS_URL } from '@/components/PublicLanding'
import { HOME } from '@/content/landing/home'
import { REGION, SITE } from '@/content/landing/site'
import { Logo } from '../Logo'

const YEAR = 2026

const LEGAL_LINKS = [
  { label: 'Política de Privacidad', href: PRIVACY_URL },
  { label: 'Condiciones del Servicio', href: TERMS_URL },
  { label: 'Contacto', href: `mailto:${SITE.email}` },
]

export function Footer() {
  return (
    <footer className="lp-on-dark relative isolate overflow-hidden rounded-t-[2.25rem] bg-lp-navy-deep text-white sm:rounded-t-[3rem]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 size-96 rounded-full bg-lp-blue/25 blur-[120px]" />
        <div className="lp-dot-grid-light absolute inset-0 opacity-60" />
      </div>

      <div className="mx-auto max-w-[76rem] px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo variant="dark" withTagline className="text-[2.75rem] sm:text-[3.5rem]" />
            <p className="mt-7 max-w-md text-pretty text-lg leading-relaxed text-white/75">
              Tecnología canadiense para escuelas privadas de {REGION.placeName}
            </p>
          </div>

          <p className="max-w-md text-pretty text-base leading-relaxed text-white/80">
            {HOME.dataUsage.text}{' '}
            <a href={PRIVACY_URL} className="font-semibold text-white underline decoration-lp-sky decoration-2 underline-offset-4 transition-colors hover:text-lp-cyan">
              {HOME.dataUsage.linkLabel}
            </a>
            .
          </p>
        </div>

        <nav aria-label="Enlaces legales" className="mt-12">
          <ul className="flex flex-wrap gap-x-6">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-white/30 decoration-2 underline-offset-4 transition-colors hover:decoration-lp-sky"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/15 pt-6 text-[0.95rem] text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-lp-display font-semibold text-white">{SITE.teamName}</p>
          <p>
            © {YEAR} {SITE.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
