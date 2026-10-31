import { LANDING_FONT_VARIABLES } from './fonts'
import { Benefits } from './sections/Benefits'
import { Closing } from './sections/Closing'
import { Contact } from './sections/Contact'
import { Features } from './sections/Features'
import { Footer } from './sections/Footer'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { HowItWorks } from './sections/HowItWorks'
import { Origin } from './sections/Origin'
import { Roles } from './sections/Roles'

/**
 * Portada pública de https://iskool.mx/ para visitantes sin sesión.
 * Los colores, las fuentes y las animaciones viven bajo `.lp-root` y con prefijo `lp-`
 * para que el resto de la plataforma no cambie de aspecto.
 */
export function Landing() {
  return (
    <div className={`lp-root ${LANDING_FONT_VARIABLES} w-full bg-lp-mist font-lp-body text-lp-navy antialiased`}>
      <a
        href="#contenido"
        className="fixed left-3 top-3 z-[60] -translate-y-24 rounded-full bg-lp-navy px-6 py-3 font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <Features />
        <Origin />
        <HowItWorks />
        <Roles />
        <Benefits />
        <Closing />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
