export interface Step {
  number: number
  title: string
  body: string
  items: readonly { title: string; body: string }[]
}

export const STEPS: readonly Step[] = [
  {
    number: 1,
    title: 'Se integra con lo que tu escuela ya utiliza',
    body: 'ISkool se conecta con las herramientas y proveedores que hoy aportan valor a tu escuela. No los sustituye: los complementa y aprovecha su información.',
    items: [
      { title: 'Suite de productividad escolar', body: 'Aulas virtuales, documentos y videollamadas.' },
      { title: 'Programa académico', body: 'El modelo y los programas que ya sigue tu escuela.' },
      { title: 'Editoriales y contenidos', body: 'Libros de texto y materiales de tus proveedores.' },
      { title: 'Certificaciones internacionales', body: 'Marcos y estándares de idiomas y evaluación.' },
      { title: 'Otros proveedores', body: 'Herramientas especializadas de cada área.' },
    ],
  },
  {
    number: 2,
    title: 'Organiza, conecta y da sentido',
    body: 'Reúne la información de todos los sistemas, la relaciona y la convierte en conocimiento útil para toda la institución.',
    items: [
      { title: 'Datos', body: 'Una sola fuente en lugar de archivos dispersos.' },
      { title: 'Procesos', body: 'Lo que la escuela hace, documentado y consultable.' },
      { title: 'Académico', body: 'Planeaciones, actividades y evidencias.' },
      { title: 'Resultados', body: 'Desempeño por alumno, grupo y plantel.' },
      { title: 'Comunidad', body: 'Docentes, alumnos, familias y directivos.' },
      { title: 'Contexto', body: 'La realidad y el modelo de tu institución.' },
    ],
  },
  {
    number: 3,
    title: 'Genera contenido y experiencias para tu escuela',
    body: 'Con inteligencia artificial pedagógica y la experiencia de tu propia escuela, ISkool crea materiales, propuestas y herramientas que ahorran tiempo y elevan la calidad educativa.',
    items: [
      { title: 'Planeaciones didácticas', body: 'Alineadas a tu modelo educativo y a la Nueva Escuela Mexicana.' },
      { title: 'Contenido y recursos', body: 'Actividades, ejercicios, evaluaciones y materiales interactivos.' },
      { title: 'Sugerencias para mejores clases', body: 'Estrategias, ejemplos y ajustes por nivel.' },
      { title: 'Asistente para docentes', body: 'Resuelve dudas, sugiere ideas y acompaña la práctica diaria.' },
      { title: 'Análisis y reportes', body: 'Seguimiento y recomendaciones para la mejora.' },
    ],
  },
  {
    number: 4,
    title: 'Ayuda a cada miembro de la comunidad',
    body: 'Información, contenido y herramientas adaptadas a cada rol, para que todos puedan trabajar mejor y enfocarse en lo importante: el aprendizaje.',
    items: [
      { title: 'Alumnos', body: 'Rutas de aprendizaje más claras y motivadoras.' },
      { title: 'Docentes', body: 'Planeaciones, recursos y acompañamiento.' },
      { title: 'Directivos', body: 'Visión integral para decisiones más informadas.' },
      { title: 'Familias', body: 'Comunicación y seguimiento más cercanos.' },
    ],
  },
  {
    number: 5,
    title: 'Convierte la experiencia en memoria institucional',
    body: 'ISkool aprende de lo que ocurre en tu escuela: clases, resultados, experiencias, decisiones y contexto. Lo que un docente descubre este ciclo queda disponible para toda la institución el siguiente.',
    items: [
      { title: 'Bóveda Curricular', body: 'Cada planeación se guarda y se reutiliza antes de generar una nueva.' },
      { title: 'Conocimiento que permanece', body: 'La experiencia no se va cuando cambia el personal.' },
      { title: 'Privacidad', body: 'La memoria de tu escuela es solo de tu escuela.' },
    ],
  },
]
