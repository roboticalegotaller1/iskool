export interface Feature {
  audience: string
  title: string
  body: string
}

const items: readonly Feature[] = [
  {
    audience: 'Docentes',
    title: 'Actividades y planeaciones en minutos',
    body: `El docente escribe el tema y la inteligencia artificial pedagógica le arma la planeación o la actividad interactiva, alineada a la Nueva Escuela Mexicana y lista para editar y asignar a su grupo.`,
  },
  {
    audience: 'Alumnos',
    title: 'Tareas que se sienten como un juego',
    body: 'Cada tarea es una misión. El alumno gana experiencia, cuida a su mascota y avanza en un mapa de aventura. El progreso se gana con esfuerzo, nunca con dinero.',
  },
  {
    audience: 'Familias y docentes',
    title: 'Padres y maestros en contacto',
    body: 'Los avisos del docente llegan a la familia y la familia responde ahí mismo. Cada familia ve los logros y el desempeño de sus hijos sin esperar a la junta.',
  },
  {
    audience: 'Historia',
    title: 'Personajes históricos que responden',
    body: 'El alumno conversa por voz con figuras de la historia, que contestan en primera persona con datos reales, y recorre su vida en novela gráfica con audio.',
  },
  {
    audience: 'Idiomas',
    title: 'Inglés y francés con práctica de voz',
    body: 'Lecciones con diálogo, pronunciación guiada y seguimiento por nivel, alineadas a marcos de certificación internacional.',
  },
  {
    audience: 'En el aula',
    title: 'Clases que se proyectan y se juegan',
    body: 'Más de 20 dinámicas listas para el salón: cuestionarios, cronologías, retos de lógica y salas de escape, con ruleta de participación y temporizador en el proyector.',
  },
  {
    audience: 'Directivos',
    title: 'Todo lo que pasa en tus grupos y planteles',
    body: 'Matrícula, asistencia, avance académico y planeaciones por docente en un solo tablero. Pregunta con tus palabras y recibe la respuesta con gráfica.',
  },
  {
    audience: 'Dueños y administración',
    title: 'Cobranza y facturación',
    body: 'Colegiaturas, becas, estados de cuenta y recordatorios de pago, con facturación desde la misma plataforma.',
  },
]

export const FEATURES = {
  eyebrow: 'En concreto',
  title: 'Qué hace ISkool en tu escuela',
  lead: 'Una sola plataforma para docentes, alumnos, familias, directivos y administración. Esto es lo que cada quien hace con ella.',
  items,
} as const
