import { REGION, SITE } from '@/content/landing/site'
import { plainWhatsappLink } from '@/lib/landing/contactLinks'
import { DemoForm } from '../DemoForm'
import { Icon } from '../Icon'
import { ANCHORS } from './anchors'

const CHANNEL =
  'group inline-flex min-h-11 items-center gap-3 break-all text-lg font-semibold text-lp-navy underline decoration-lp-sky decoration-2 underline-offset-4 transition-colors hover:text-lp-blue'

export function Contact() {
  const whatsapp = plainWhatsappLink(SITE.whatsappNumber)

  return (
    <section id={ANCHORS.contact.id} className="relative px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <div aria-hidden="true" className="lp-dot-grid lp-fade-edges pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-[76rem] gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="text-balance font-lp-display text-[clamp(2rem,4.6vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.04em] text-lp-navy">
            Solicita una demostración
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-lp-muted">
            Cuéntanos de tu escuela. {SITE.teamName} te responde para acordar la fecha de una demostración pensada para tu institución.
          </p>

          <div className="mt-10 border-t border-lp-navy/10 pt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lp-muted">Canales directos</p>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a href={`mailto:${SITE.email}`} className={CHANNEL}>
                  <Icon name="mail" className="size-6 shrink-0 text-lp-blue" />
                  {SITE.email}
                </a>
              </li>
              {whatsapp && (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={CHANNEL}>
                    <Icon name="chat" className="size-6 shrink-0 text-lp-blue" />
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7">
          <DemoForm placeName={REGION.placeName} email={SITE.email} whatsappNumber={SITE.whatsappNumber} />
          <noscript>
            <p className="mt-6 text-lg font-medium text-lp-navy">Escríbenos a {SITE.email} para solicitar tu demostración.</p>
          </noscript>
        </div>
      </div>
    </section>
  )
}
