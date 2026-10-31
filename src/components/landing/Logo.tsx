import { SITE } from '@/content/landing/site'

interface LogoProps {
  /** `light` = sobre fondo claro ("Skool" marino); `dark` = sobre fondo oscuro ("Skool" blanco). */
  variant?: 'light' | 'dark'
  withTagline?: boolean
  className?: string
}

/** El tamaño se controla con `font-size` desde `className`; todo lo demás escala en `em`. */
export function Logo({ variant = 'light', withTagline = false, className = '' }: LogoProps) {
  const dark = variant === 'dark'

  return (
    <span role="img" aria-label="ISkool" className={`inline-flex flex-col leading-none ${className}`}>
      <span aria-hidden="true" className="whitespace-nowrap font-lp-display font-bold tracking-[-0.045em]">
        <span className="text-lp-sky">i</span>
        <span className={dark ? 'text-white' : 'text-lp-navy'}>Skool</span>
        {/* Marca registrada: pequeña y alineada con la altura de las mayúsculas. */}
        <span
          className={`relative -top-[1.6em] ml-[0.2em] inline-block font-lp-body text-[0.3em] font-semibold tracking-normal ${
            dark ? 'text-white' : 'text-lp-navy'
          }`}
        >
          ®
        </span>
      </span>
      {withTagline && (
        <span
          aria-hidden="true"
          className={`mt-[0.75em] font-lp-body [font-size:max(0.5625rem,0.2em)] font-semibold uppercase leading-[1.5] tracking-[0.3em] ${
            dark ? 'text-white/70' : 'text-lp-muted'
          }`}
        >
          {SITE.tagline}
        </span>
      )}
    </span>
  )
}
