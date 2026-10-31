export type RoleId = 'docentes' | 'alumnos' | 'familias' | 'directivos' | 'institucion'

export interface Role {
  id: RoleId
  name: string
  summary: string
  capabilities: readonly { title: string; body: string }[]
}

export const ROLES: readonly Role[] = [
  {
    id: 'docentes',
    name: 'Docentes',
    summary: 'Menos tiempo en formatos, más tiempo en el aula.',
    capabilities: [
      { title: 'Planeaciones didácticas', body: 'Con campo formativo, ejes articuladores, PDA, sesiones de inicio, desarrollo y cierre, y rúbrica. Primero se busca en la Bóveda Curricular de tu escuela; solo si no existe se genera con inteligencia artificial pedagógica. Siempre editables.' },
      { title: 'Estudio de Actividades', body: 'Un constructor visual con más de 20 tipos de dinámica: cuestionarios, cronologías, lecturas cronometradas, retos de lógica, salas de escape y más.' },
      { title: 'Clase en vivo', body: 'Modo proyector con ruleta de participación, temporizador y sondeos rápidos.' },
      { title: 'Evaluación formativa', body: 'Bandeja de evidencias, rúbricas interactivas y retroalimentación al alumno.' },
      { title: 'Asistencia', body: 'Pase de lista por grupo y reportes listos para imprimir o exportar.' },
      { title: 'Comunidad docente', body: 'Comparte actividades con tus colegas y asígnalas a tu grupo en un paso.' },
      { title: 'Centro de Idiomas', body: 'Lecciones con diálogo y práctica de pronunciación guiada por voz.' },
    ],
  },
  {
    id: 'alumnos',
    name: 'Alumnos',
    summary: 'Aprender se siente como avanzar en una aventura.',
    capabilities: [
      { title: 'Misiones y mapa de aventura', body: 'Cada actividad es una misión. El progreso se gana con mérito y esfuerzo, nunca con dinero real.' },
      { title: 'Mascota y hábitat', body: 'Una compañera que crece cuando el alumno cumple con sus tareas.' },
      { title: 'Avatar propio', body: 'Identidad personalizable dentro de la plataforma.' },
      { title: 'Portafolio de evidencias', body: 'Todo lo que el alumno ha logrado, organizado por habilidades.' },
      { title: 'Personajes históricos', body: 'Conversaciones por voz con figuras de la historia, que responden en primera persona con datos reales.' },
    ],
  },
  {
    id: 'familias',
    name: 'Familias',
    summary: 'Saber cómo va tu hijo sin esperar a la junta.',
    capabilities: [
      { title: 'Panel por hijo', body: 'Logros, hábitos y desempeño por proyecto.' },
      { title: 'Mensajes con el docente', body: 'Avisos y respuestas dentro de la plataforma.' },
      { title: 'Estado de cuenta', body: 'Consulta de pagos pendientes e historial.' },
    ],
  },
  {
    id: 'directivos',
    name: 'Directivos',
    summary: 'Una visión completa para decidir con información.',
    capabilities: [
      { title: 'Indicadores por plantel', body: 'Matrícula, asistencia y avance académico en un solo tablero.' },
      { title: 'Gobernanza', body: 'Tú decides qué funciones se activan y para quién.' },
      { title: 'Supervisión de planeaciones', body: 'Seguimiento del trabajo académico por docente.' },
      { title: 'Consultas en lenguaje natural', body: 'Pregunta con tus palabras y recibe la respuesta con gráfica y tabla.' },
      { title: 'Memoria institucional', body: 'Los protocolos y aprendizajes de la escuela, consultables.' },
    ],
  },
  {
    id: 'institucion',
    name: 'Tu institución',
    summary: 'La plataforma lleva tu identidad, no la nuestra.',
    capabilities: [
      { title: 'Marca blanca', body: 'Logotipo, nombre y color de tu escuela en toda la plataforma.' },
      { title: 'Información aislada', body: 'Los datos de cada escuela están separados de los de las demás.' },
      { title: 'Varios planteles', body: 'Una sola institución con todas sus sedes.' },
    ],
  },
]
