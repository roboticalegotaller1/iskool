'use client'

import { useSyncExternalStore } from 'react'

// Aviso para quien envió el formulario sin JavaScript (el servidor lo regresa con
// ?demo=sin-verificacion). Se lee la dirección solo en el navegador, después de
// hidratar, para que la portada siga siendo estática.

const sinSuscripcion = () => () => {}
const leerAviso = () => new URLSearchParams(window.location.search).get('demo') === 'sin-verificacion'
const enServidor = () => false

export function AvisoSinVerificacion({ email }: { email: string }) {
  const visible = useSyncExternalStore(sinSuscripcion, leerAviso, enServidor)
  if (!visible) return null
  return (
    <p className="mb-6 rounded-2xl bg-lp-amber/20 px-5 py-4 text-base font-medium text-lp-navy">
      No pudimos recibir tu solicitud desde este navegador. Escríbenos a{' '}
      <a href={`mailto:${email}`} className="font-semibold underline underline-offset-4">
        {email}
      </a>{' '}
      y con gusto te atendemos.
    </p>
  )
}
