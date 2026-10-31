import { ROLES, type Role, type RoleId } from '@/content/landing/roles'
import { Icon, type IconName } from '../Icon'
import { ANCHORS } from './anchors'

interface RoleStyle {
  icon: IconName
  /** Columnas que ocupa la tarjeta en escritorio. */
  span: string
  tile: string
  marker: string
  chip: string
}

const STYLES: Record<RoleId, RoleStyle> = {
  docentes: { icon: 'board', span: 'lg:col-span-7', tile: 'bg-lp-sky/12 text-lp-blue', marker: 'before:bg-lp-sky', chip: 'bg-lp-sky' },
  alumnos: { icon: 'compass', span: 'lg:col-span-5', tile: 'bg-white/10 text-lp-cyan', marker: 'before:bg-lp-magenta', chip: 'bg-lp-magenta' },
  familias: { icon: 'home', span: 'lg:col-span-4', tile: 'bg-lp-cyan/15 text-lp-blue', marker: 'before:bg-lp-cyan', chip: 'bg-lp-cyan' },
  directivos: { icon: 'eye', span: 'lg:col-span-8', tile: 'bg-lp-blue/10 text-lp-blue', marker: 'before:bg-lp-blue', chip: 'bg-lp-blue' },
  institucion: { icon: 'building', span: 'lg:col-span-12', tile: 'bg-lp-amber/20 text-lp-navy', marker: 'before:bg-lp-amber', chip: 'bg-lp-amber' },
}

const roleAnchor = (id: RoleId) => `rol-${id}`

// Cada capacidad es un grupo <dt>/<dd> directo dentro del <dl>; el punto de acento es un ::before decorativo.
const CAPABILITY =
  "relative pl-[1.375rem] before:absolute before:left-0 before:top-[0.55rem] before:size-2 before:rounded-full before:ring-4 before:ring-current/10 before:content-['']"

function RoleHeader({ role, dark = false }: { role: Role; dark?: boolean }) {
  const style = STYLES[role.id]
  return (
    <header className="flex items-start gap-4">
      <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${style.tile}`}>
        <Icon name={style.icon} className="size-7" />
      </span>
      <div>
        <h3 className={`font-lp-display text-[1.75rem] font-bold leading-none tracking-[-0.03em] ${dark ? 'text-white' : 'text-lp-navy'}`}>
          {role.name}
        </h3>
        <p className={`mt-2 text-pretty text-lg leading-snug ${dark ? 'text-white/80' : 'text-lp-muted'}`}>{role.summary}</p>
      </div>
    </header>
  )
}

function Capabilities({ role, columns, dark = false }: { role: Role; columns: string; dark?: boolean }) {
  const style = STYLES[role.id]
  return (
    <dl className={`mt-8 grid gap-x-8 gap-y-5 ${columns}`}>
      {role.capabilities.map((capability) => (
        <div key={capability.title} className={`${CAPABILITY} ${style.marker}`}>
          <dt className={`font-semibold leading-snug ${dark ? 'text-white' : 'text-lp-navy'}`}>{capability.title}</dt>
          <dd className={`mt-1 text-pretty text-[0.95rem] leading-relaxed ${dark ? 'text-white/70' : 'text-lp-muted'}`}>{capability.body}</dd>
        </div>
      ))}
    </dl>
  )
}

const CARD = 'lp-reveal relative scroll-mt-28 rounded-[2rem] p-6 sm:p-9'
const LIGHT_CARD = `${CARD} border border-lp-navy/[0.07] bg-lp-mist/70 shadow-[0_30px_60px_-44px_rgba(11,27,63,0.5)]`

/* Docentes: la tarjeta principal. La primera capacidad (planeaciones) se destaca. */
function TeacherCard({ role }: { role: Role }) {
  const [first, ...rest] = role.capabilities
  return (
    <article id={roleAnchor(role.id)} className={`${LIGHT_CARD} ${STYLES[role.id].span}`}>
      <RoleHeader role={role} />
      <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div className="rounded-3xl border border-lp-sky/25 bg-lp-surface p-5 shadow-[0_20px_40px_-32px_rgba(47,155,255,0.9)] sm:col-span-2 sm:p-6">
          <dt className="flex items-center gap-3 font-lp-display text-xl font-semibold tracking-[-0.02em] text-lp-navy">
            <Icon name="doc" className="size-6 text-lp-blue" />
            {first.title}
          </dt>
          <dd className="mt-3 text-pretty leading-relaxed text-lp-muted">{first.body}</dd>
        </div>
        {rest.map((capability) => (
          <div key={capability.title} className={`${CAPABILITY} ${STYLES[role.id].marker}`}>
            <dt className="font-semibold leading-snug text-lp-navy">{capability.title}</dt>
            <dd className="mt-1 text-pretty text-[0.95rem] leading-relaxed text-lp-muted">{capability.body}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

/* Alumnos: tarjeta oscura y luminosa, el lado lúdico de la plataforma. */
function StudentCard({ role }: { role: Role }) {
  return (
    <article
      id={roleAnchor(role.id)}
      className={`${CARD} lp-on-dark isolate overflow-hidden bg-lp-navy-deep text-white shadow-[0_36px_70px_-40px_rgba(193,60,255,0.7)] ${STYLES[role.id].span}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-lp-magenta/40 blur-[90px]" />
        <div className="absolute -bottom-28 -left-16 size-72 rounded-full bg-lp-blue/45 blur-[90px]" />
        <div className="lp-dot-grid-light absolute inset-0" />
      </div>
      <RoleHeader role={role} dark />
      <Capabilities role={role} columns="" dark />
    </article>
  )
}

function PlainCard({ role, columns }: { role: Role; columns: string }) {
  return (
    <article id={roleAnchor(role.id)} className={`${LIGHT_CARD} ${STYLES[role.id].span}`}>
      <RoleHeader role={role} />
      <Capabilities role={role} columns={columns} />
    </article>
  )
}

/* Tu institución: banda horizontal de cierre, con borde de acento. */
function InstitutionCard({ role }: { role: Role }) {
  return (
    <article
      id={roleAnchor(role.id)}
      className={`${CARD} grid gap-2 border border-lp-amber/40 bg-lp-surface shadow-[0_30px_60px_-44px_rgba(245,165,36,0.8)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:items-center lg:gap-12 ${STYLES[role.id].span}`}
    >
      <RoleHeader role={role} />
      <div className="lg:-mt-8">
        <Capabilities role={role} columns="md:grid-cols-3" />
      </div>
    </article>
  )
}

function RoleCard({ role }: { role: Role }) {
  switch (role.id) {
    case 'docentes':
      return <TeacherCard role={role} />
    case 'alumnos':
      return <StudentCard role={role} />
    case 'institucion':
      return <InstitutionCard role={role} />
    case 'directivos':
      return <PlainCard role={role} columns="sm:grid-cols-2" />
    default:
      return <PlainCard role={role} columns="" />
  }
}

export function Roles() {
  return (
    <section id={ANCHORS.roles.id} className="relative rounded-[2.5rem] bg-lp-surface py-24 sm:rounded-[3.5rem] sm:py-32">
      <div className="mx-auto max-w-[76rem] px-5 sm:px-8">
        <div className="lp-reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-lp-display text-[clamp(2.4rem,5.4vw,4.25rem)] font-bold leading-none tracking-[-0.04em] text-lp-navy">
            {ANCHORS.roles.label}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <li key={role.id}>
                <a
                  href={`#${roleAnchor(role.id)}`}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-lp-navy/10 bg-lp-mist px-4 text-[0.95rem] font-semibold text-lp-navy transition-colors hover:border-lp-sky hover:bg-lp-surface"
                >
                  <span aria-hidden="true" className={`size-2 rounded-full ${STYLES[role.id].chip}`} />
                  {role.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-12">
          {ROLES.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </div>
    </section>
  )
}
