import { REGION } from './site'

export const HOME = {
  hero: {
    eyebrow: 'Inteligencia para instituciones educativas',
    title: 'El cerebro vivo de tu escuela',
    lead:
      'ISkool complementa, integra y potencia las herramientas que tu escuela ya usa, genera contenido propio y aprende de todo su ecosistema. Así, cada ciclo la institución sabe más sobre sí misma.',
    primaryCta: 'Solicitar una demostración',
    secondaryCta: 'Ver cómo funciona',
  },
  pillars: [
    'Memoria institucional',
    'Inteligencia artificial',
    'Experiencia de tu escuela',
    'Mejora continua',
  ],
  origin: {
    eyebrow: 'De dónde venimos',
    title: `Tecnología creada en Canadá, ${REGION.adaptation}`,
    body: `ISkool es tecnología desarrollada por una empresa canadiense que está llegando a Latinoamérica. No es una traducción: es una plataforma ${REGION.adaptation}, pensada para la forma en que trabajan sus docentes, directivos y familias.`,
    points: [
      {
        title: 'Desarrollo con tecnología de punta',
        body: 'Ingeniería de plataforma con estándares de privacidad y aislamiento de la información de cada escuela.',
      },
      {
        title: `Hecha para ${REGION.placeName}`,
        body: REGION.curriculum,
      },
      {
        title: 'Con la identidad de tu escuela',
        body: 'Tu logotipo, tu nombre y tus colores. La plataforma se presenta como parte de tu institución.',
      },
      {
        title: 'Hecho como traje a la medida',
        body: 'ISkool se configura alrededor de tu escuela: tu modelo educativo, tus niveles y grupos, tus procesos y las funciones que decides activar. Tu escuela no se adapta a la plataforma; la plataforma se adapta a tu escuela.',
      },
      {
        title: 'Potenciada con Inteligencia Artificial',
        body: 'La inteligencia artificial pedagógica genera planeaciones y actividades, responde consultas en lenguaje natural y aprende de la experiencia de tu propia escuela. Siempre con el docente al mando: todo lo que genera se puede editar.',
      },
    ],
  },
  dataUsage: {
    text: 'Los usuarios inician sesión con su cuenta institucional. ISkool solo usa el nombre, el correo electrónico y la foto de perfil para identificar a cada usuario dentro de su escuela. Consulta los detalles en nuestra',
    linkLabel: 'Política de Privacidad',
  },
  meta: {
    title: `ISkool — El cerebro vivo de tu escuela | ${REGION.placeName}`,
    description: `ISkool integra las herramientas de tu escuela y convierte cada ciclo en memoria institucional. Tecnología canadiense para escuelas privadas de ${REGION.placeName}.`,
  },
} as const
