'use client'

import { useRef, useState, type FormEvent } from 'react'
import { buildWhatsappLink, type DemoRequest } from '@/lib/landing/contactLinks'
import { HONEYPOT_FIELD, REQUIRED_FIELDS, validateDemoRequest, type DemoField } from '@/lib/landing/demoForm'
import { Icon } from './Icon'

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

const CONTROL =
  'mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-base text-lp-navy shadow-[0_1px_0_rgba(11,27,63,0.04)] transition-colors placeholder:text-lp-muted/60 focus:border-lp-blue'

export function DemoForm({ placeName, email, whatsappNumber }: DemoFormProps) {
  const [values, setValues] = useState<DemoRequest>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<DemoField, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [trap, setTrap] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const update = (name: DemoField, value: string) => {
    setValues((v) => ({ ...v, [name]: value }))
    setStatus('idle')
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
    if (status === 'sending') return
    const req = validated()
    if (!req) return

    setStatus('sending')
    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, [HONEYPOT_FIELD]: trap }),
      })
      if (!response.ok) throw new Error(String(response.status))
      setValues(EMPTY)
      setStatus('sent')
    } catch {
      setStatus('failed')
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
      // Destino nativo si el envío ocurre sin JavaScript o antes de hidratar: abre el correo del visitante, nunca la URL del sitio.
      action={`mailto:${email}`}
      method="post"
      encType="text/plain"
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
      </div>

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
