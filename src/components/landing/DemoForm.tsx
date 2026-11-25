'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { buildWhatsappLink, type DemoRequest } from '@/lib/landing/contactLinks'
import { HONEYPOT_FIELD, REQUIRED_FIELDS, VERIFICATION_FIELD, validateDemoRequest, type DemoField } from '@/lib/landing/demoForm'
import type { DemoChallenge } from '@/lib/landing/verification/challenge'
import { solveChallenge } from '@/lib/landing/verification/solver'
import { Icon } from './Icon'
import { Pizarron, type PizarronState } from './Pizarron'

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'whatsapp'

interface DemoFormProps {
  placeName: string
  email: string
  whatsappNumber: string | null
}

const FIELDS: { name: DemoField; label: string; type: string; autoComplete: string; inputMode?: 'tel' | 'email' }[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', autoComplete: 'name' },
  { name: 'escuela', label: 'Escuela', type: 'text', autoComplete: 'organization' },
  { name: 'cargo', label: 'Cargo', type: 'text', autoComplete: 'organization-title' },
  { name: 'telefono', label: 'Teléfono', type: 'tel', autoComplete: 'tel', inputMode: 'tel' },
  { name: 'correo', label: 'Correo', type: 'email', autoComplete: 'email', inputMode: 'email' },
]

const EMPTY: DemoRequest = { nombre: '', escuela: '', cargo: '', telefono: '', correo: '', mensaje: '' }

// Pase resuelto en segundo plano mientras la persona llena el formulario.
interface PaseResuelto {
  pase: DemoChallenge
  number: number
  recibidoEn: number
}

// El servidor rechaza un pase con menos de 3 s de emitido; se deja un margen.
const MIN_ESPERA_MS = 3200

const MSG_SIN_BORRAR = 'Borra el pizarrón para enviar.'
const MSG_VENCIO = 'La verificación venció; borra el pizarrón otra vez.'

const dormir = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const CONTROL =
  'mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-base text-lp-navy shadow-[0_1px_0_rgba(11,27,63,0.04)] transition-colors placeholder:text-lp-muted/60 focus:border-lp-blue'

export function DemoForm({ placeName, email, whatsappNumber }: DemoFormProps) {
  const [values, setValues] = useState<DemoRequest>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<DemoField, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [trap, setTrap] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const [generacion, setGeneracion] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [errorPizarron, setErrorPizarron] = useState<string | undefined>()
  const pizarron = useRef<PizarronState | null>(null)
  const paseRef = useRef<Promise<PaseResuelto> | null>(null)
  const enviando = useRef(false)
  const enviado = useRef(false)

  // Pide el pase y lo resuelve en segundo plano; uno nuevo en cada generación.
  useEffect(() => {
    const control = new AbortController()
    const promesa = (async () => {
      const response = await fetch('/api/demo/challenge', { cache: 'no-store', signal: control.signal })
      if (!response.ok) throw new Error(String(response.status))
      const pase = (await response.json()) as DemoChallenge
      const recibidoEn = Date.now()
      const number = await solveChallenge(pase, control.signal)
      return { pase, number, recibidoEn }
    })()
    paseRef.current = promesa
    // Sin pase no hay forma de enviar: se ofrece el correo de inmediato, nunca una espera sin fin.
    promesa.catch(() => {
      if (!control.signal.aborted && paseRef.current === promesa && !enviado.current) setStatus('failed')
    })
    return () => control.abort()
  }, [generacion])

  const pedirPaseNuevo = () => {
    paseRef.current = null
    setGeneracion((g) => g + 1)
  }

  // Pase nuevo y pizarrón limpio; lo que la persona escribió se queda.
  const rearmar = () => {
    pedirPaseNuevo()
    setResetKey((k) => k + 1)
  }

  const onPizarron = useCallback((state: PizarronState) => {
    pizarron.current = state
    if (state.listo) setErrorPizarron(undefined)
  }, [])

  const enfocarPizarron = () => formRef.current?.querySelector<HTMLElement>('[data-pizarron]')?.focus()

  const update = (name: DemoField, value: string) => {
    setValues((v) => ({ ...v, [name]: value }))
    setStatus((s) => (s === 'sent' ? s : 'idle'))
  }

  // Devuelve la solicitud si todo está bien; si no, marca los errores y enfoca el primer campo.
  function validated(): DemoRequest | null {
    const found = validateDemoRequest(values)
    setErrors(found)
    const first = REQUIRED_FIELDS.find((f) => found[f])
    if (!first) return values
    setStatus('idle')
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    return null
  }

  async function onSend(e: FormEvent) {
    e.preventDefault()
    if (enviando.current || enviado.current) return
    const req = validated()
    if (!req) return
    const borrado = pizarron.current
    if (!borrado?.listo) {
      setErrorPizarron(MSG_SIN_BORRAR)
      enfocarPizarron()
      return
    }

    enviando.current = true
    setStatus('sending')
    try {
      let resuelto: PaseResuelto
      try {
        if (!paseRef.current) throw new Error('sin pase')
        resuelto = await paseRef.current
      } catch {
        // El pase no se pudo obtener: se intenta otro para la próxima y se ofrece el correo.
        pedirPaseNuevo()
        setStatus('failed')
        return
      }

      const espera = MIN_ESPERA_MS - (Date.now() - resuelto.recibidoEn)
      if (espera > 0) await dormir(espera)

      const { pase, number } = resuelto
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req,
          [HONEYPOT_FIELD]: trap,
          [VERIFICATION_FIELD]: {
            salt: pase.salt,
            challenge: pase.challenge,
            max: pase.max,
            signature: pase.signature,
            number,
            mode: borrado.mode,
            radio: borrado.radio,
            trazo: borrado.trazo,
            teclas: borrado.teclas,
          },
        }),
      })
      if (response.ok) {
        enviado.current = true
        setValues(EMPTY)
        setStatus('sent')
        return
      }
      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as { error?: unknown } | null
        if (data?.error === 'verificacion') {
          rearmar()
          setErrorPizarron(MSG_VENCIO)
          setStatus('idle')
          enfocarPizarron()
          return
        }
      }
      // Con 502 o 503 el pase ya se gastó: se prepara otro para el siguiente intento.
      if (response.status === 502 || response.status === 503) rearmar()
      setStatus('failed')
    } catch {
      // Sin respuesta no se sabe si el pase se gastó: se prepara otro.
      rearmar()
      setStatus('failed')
    } finally {
      enviando.current = false
    }
  }

  function onWhatsapp() {
    const req = validated()
    if (!req) return
    const link = buildWhatsappLink(whatsappNumber, req, placeName)
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
    setStatus('whatsapp')
  }

  return (
    <form
      ref={formRef}
      noValidate
      // Destino seguro same-origin si el envío ocurre antes de hidratar (evita advertencia Mixed Content sobre HTTPS).
      action="/api/demo"
      method="post"
      onSubmit={onSend}
      className="rounded-[2rem] border border-lp-navy/10 bg-white p-6 shadow-[0_30px_70px_-40px_rgba(11,27,63,0.55)] sm:p-9"
    >
      {/* Campo trampa para robots: invisible y fuera del orden de tabulación. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="demo-sitio">No llenes este campo</label>
        <input
          id="demo-sitio"
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map(({ name, label, type, autoComplete, inputMode }) => {
          const error = errors[name]
          const wide = name === 'correo'
          return (
            <div key={name} className={wide ? 'sm:col-span-2' : undefined}>
              <label htmlFor={`demo-${name}`} className="block text-sm font-semibold text-lp-navy">
                {label}
              </label>
              <input
                id={`demo-${name}`}
                name={name}
                type={type}
                inputMode={inputMode}
                autoComplete={autoComplete}
                value={values[name]}
                onChange={(e) => update(name, e.target.value)}
                aria-required={(REQUIRED_FIELDS as readonly DemoField[]).includes(name) ? 'true' : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `demo-${name}-error` : undefined}
                className={`${CONTROL} ${error ? 'border-lp-amber ring-4 ring-lp-amber/25' : 'border-lp-navy/15'}`}
              />
              {error && (
                <p id={`demo-${name}-error`} className="mt-2 flex items-start gap-2 text-sm font-medium text-lp-navy">
                  <span aria-hidden="true" className="mt-[0.35rem] size-2.5 shrink-0 rounded-full bg-lp-amber" />
                  {error}
                </p>
              )}
            </div>
          )
        })}

        <div className="sm:col-span-2">
          <label htmlFor="demo-mensaje" className="block text-sm font-semibold text-lp-navy">
            Mensaje <span className="font-normal text-lp-muted">(opcional)</span>
          </label>
          <textarea
            id="demo-mensaje"
            name="mensaje"
            rows={4}
            value={values.mensaje}
            onChange={(e) => update('mensaje', e.target.value)}
            className={`${CONTROL} border-lp-navy/15`}
          />
        </div>

        <Pizarron onChange={onPizarron} resetKey={resetKey} error={errorPizarron} />
      </div>

      <p className="mt-3 text-sm text-lp-muted">
        ¿No puedes usar el pizarrón? Escríbenos a{' '}
        <a href={`mailto:${email}`} className="font-semibold text-lp-navy underline decoration-lp-sky underline-offset-4">
          {email}
        </a>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          aria-disabled={status === 'sending' ? true : undefined}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-lp-blue px-7 text-lg font-semibold text-white shadow-[0_20px_40px_-18px_rgba(30,79,216,0.85)] transition-colors hover:bg-lp-navy aria-disabled:cursor-progress aria-disabled:opacity-70"
        >
          <Icon name="mail" className="size-6" />
          {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
        </button>
        {whatsappNumber !== null && (
          <button
            type="button"
            onClick={onWhatsapp}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border-2 border-lp-navy px-7 text-lg font-semibold text-lp-navy transition-colors hover:bg-lp-navy hover:text-white"
          >
            <Icon name="chat" className="size-6" />
            Enviar por WhatsApp
          </button>
        )}
      </div>

      <div
        role="status"
        className={
          status === 'sent' || status === 'whatsapp'
            ? 'mt-6 rounded-2xl bg-lp-sky/12 px-5 py-4 text-base font-medium text-lp-navy'
            : status === 'failed'
              ? 'mt-6 rounded-2xl bg-lp-amber/20 px-5 py-4 text-base font-medium text-lp-navy'
              : undefined
        }
      >
        {status === 'sent' && <p>Recibimos tu solicitud. ISkool Team te responderá pronto para acordar la fecha de tu demostración.</p>}
        {status === 'failed' && (
          <p>
            No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos a{' '}
            <a href={`mailto:${email}`} className="font-semibold underline underline-offset-4">
              {email}
            </a>
            .
          </p>
        )}
        {status === 'whatsapp' && <p>Abrimos WhatsApp con el mensaje listo; solo falta enviarlo.</p>}
      </div>
    </form>
  )
}
