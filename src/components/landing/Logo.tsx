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
      <span aria-hidden="true" className="inline-flex items-center gap-[0.24em] whitespace-nowrap font-lp-display font-bold tracking-[-0.045em]">
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[0.88em] w-[0.88em] shrink-0 rounded-[22%]"
        >
          <rect width="64" height="64" rx="14" fill="#0B1B3F" />
          <rect x="26" y="26" width="12" height="26" rx="6" fill="#2F9BFF" />
          <circle cx="32" cy="15" r="6.5" fill="#2F9BFF" />
        </svg>
        <span>
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
