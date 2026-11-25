import type {
  Attendance,
  Campus,
  ClassSchedule,
  DetailedStudent,
  ElementalPetRace,
  FamilyBillingRecord,
  Group,
  StaffPayrollRecord,
  StudentAvatar,
  StudentStats,
  Subject,
  UserProfile,
} from '../../types';

export const DEMO_SCHOOL_ID = 'sch-demo-0001';

// Bancos deterministas para generar el colegio completo de 650 alumnos y 45 profesores
// sin recurrir a aleatoriedad en tiempo de ejecución ni tocar Bóveda Curricular.
const FEMALE_FIRST_NAMES = [
  'Valentina', 'Camila', 'Sofía', 'Luciana', 'Isabella', 'Regina', 'Natalia', 'Mariana',
  'Ximena', 'Renata', 'Victoria', 'Valeria', 'Elena', 'Paula', 'Romina', 'Constanza',
  'Julieta', 'Samantha', 'Jimena', 'Fátima', 'Miranda', 'Daniela', 'Andrea', 'Fernanda',
  'Abril', 'Bárbara', 'Carolina', 'Diana', 'Estefanía', 'Gabriela', 'Helena', 'Inés',
];

const MALE_FIRST_NAMES = [
  'Mateo', 'Santiago', 'Diego', 'Leonardo', 'Sebastián', 'Nicolás', 'Daniel', 'Emiliano',
  'Alejandro', 'Matías', 'Rodrigo', 'Gabriel', 'Adrián', 'Lucas', 'Gael', 'Iker',
  'Maximiliano', 'Tomás', 'Rafael', 'Joaquín', 'Carlos', 'Eduardo', 'Fernando', 'Andrés',
  'Bruno', 'César', 'Damián', 'Erick', 'Francisco', 'Héctor', 'Iván', 'Mauricio',
];

const MIDDLE_NAMES_FEMALE = [
  'Sofía', 'Renata', 'Isabel', 'Victoria', 'Valeria', 'Fernanda', 'Ximena', 'Paulina',
  'Alejandra', 'Beatriz', 'Camila', 'Lucía', 'Andrea', 'Gabriela', 'Paola', 'Mariana',
];

const MIDDLE_NAMES_MALE = [
  'Sebastián', 'Emiliano', 'Alejandro', 'Gabriel', 'Andrés', 'Benjamín', 'Eduardo', 'Tomás',
  'Alonso', 'Patricio', 'Nicolás', 'Mauricio', 'Rodrigo', 'Fernando', 'Enrique', 'David',
];

const LAST_NAMES = [
  'Mendoza', 'Ibarra', 'Navarro', 'Cruz', 'Morales', 'Herrera', 'Salinas', 'Aguilar',
  'Castillo', 'Domínguez', 'Miranda', 'Rojas', 'Sánchez', 'Guerrero', 'Cortés', 'Bautista',
  'Gómez', 'Fuentes', 'Ortiz', 'Pineda', 'Campos', 'Vega', 'Reyes', 'Paredes',
  'Rangel', 'Silva', 'Flores', 'Medina', 'León', 'Acosta', 'Zamora', 'Juárez',
  'Villanueva', 'Cárdenas', 'Espinoza', 'Delgado', 'Cervantes', 'Montes', 'Núñez', 'Ortega',
  'Pacheco', 'Quintero', 'Ríos', 'Sandoval', 'Téllez', 'Uribe', 'Vázquez', 'Zúñiga',
];

const TEACHER_FIRST_FEMALE = [
  'Sofía', 'Elena', 'Patricia', 'Laura', 'Beatriz', 'Claudia', 'Mónica', 'Adriana',
  'Verónica', 'Gabriela', 'Silvia', 'Teresa', 'Lucía', 'Karla', 'Norma', 'Lorena',
  'Mariana', 'Paulina', 'Fernanda', 'Valeria', 'Camila', 'Rebeca', 'Alejandra',
];

const TEACHER_FIRST_MALE = [
  'Alejandro', 'Carlos', 'Roberto', 'Héctor', 'Fernando', 'Mauricio', 'Ricardo', 'Javier',
  'Alberto', 'Ernesto', 'Andrés', 'Arturo', 'Sergio', 'Pablo', 'Rodrigo', 'Óscar',
  'Miguel', 'Eduardo', 'Luis', 'Raúl', 'Gustavo', 'Enrique',
];

const PARENT_FEMALE_NAMES = [
  'Laura', 'Claudia', 'Patricia', 'Lucía', 'Mónica', 'Elena', 'Gabriela', 'Valeria',
  'Beatriz', 'Adriana', 'Silvia', 'Karla', 'Norma', 'Verónica', 'Teresa', 'Lorena',
];

const PARENT_MALE_NAMES = [
  'Alejandro', 'Ricardo', 'Javier', 'Héctor', 'Fernando', 'Alberto', 'Mauricio', 'Óscar',
  'Ernesto', 'Luis', 'Raúl', 'Andrés', 'Arturo', 'Sergio', 'Pablo', 'Rodrigo',
];

const PET_RACES: ElementalPetRace[] = [
  'cryo_dragon',
  'pyros_dragon',
  'aqua_dragon',
  'voltfang_wolf',
  'flora_stag',
  'astro_caterpillar',
  'umbra_cat',
  'solari_phoenix',
  'terra_golem',
  'axo_axolotl',
];

const PET_NAMES = [
  'Zephyr', 'Ignis', 'Nereida', 'Voltio', 'Silvestre', 'Lumen', 'Nebula', 'Aurelio', 'Basalto', 'Axol',
];

const SANCTUARIES: StudentAvatar['sanctuary_house_type'][] = [
  'forest_cabin',
  'cosmic_observatory',
  'ice_temple',
  'magma_forge',
  'coral_sanctuary',
];

const normalizeSlug = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const pad2 = (n: number): string => String(n).padStart(2, '0');
const pad3 = (n: number): string => String(n).padStart(3, '0');

function getStudentPhoto(level: 'primaria' | 'secundaria' | 'preparatoria', isFemale: boolean, index: number): string {
  if (level === 'primaria') {
    const slot = (index % 16) + 1;
    return `/images/students/archive/primaria_${isFemale ? 'girl' : 'boy'}_${pad2(slot)}.webp`;
  }
  if (level === 'secundaria') {
    const slot = (index % 16) + 1;
    return `/images/students/archive/secundaria_${isFemale ? 'girl' : 'boy'}_${pad2(slot)}.webp`;
  }
  const slot = (index % 8) + 1;
  return `/images/students/archive/preparatoria_${isFemale ? 'girl' : 'boy'}_${pad2(slot)}.webp`;
}

function getAdultPhoto(isFemale: boolean, index: number): string {
  const slot = (index % 8) + 1;
  return `/images/students/archive/corporativo_${isFemale ? 'woman' : 'man'}_${pad2(slot)}.webp`;
}

// -----------------------------------------------------------------------------
// 1. 3 PLANTELES OFICIALES DE CUENTAS DEMO
// -----------------------------------------------------------------------------
export const DEMO_CAMPUSES: Campus[] = [
  {
    id: 'cmp-demo-pri',
    school_id: DEMO_SCHOOL_ID,
    name: 'Campus Central Primaria',
    level: 'primaria',
    grades: ['1º', '2º', '3º', '4º', '5º', '6º'],
    address: 'Av. Reforma Pedagógica 140, Col. Juárez, Ciudad de México',
    phone: '55-0001-1010',
    created_at: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'cmp-demo-sec',
    school_id: DEMO_SCHOOL_ID,
    name: 'Campus Norte Secundaria',
    level: 'secundaria',
    grades: ['1º', '2º', '3º'],
    address: 'Calz. Norte Académica 480, Lindavista, Ciudad de México',
    phone: '55-0001-2020',
    created_at: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'cmp-demo-prep',
    school_id: DEMO_SCHOOL_ID,
    name: 'Campus Sur Preparatoria',
    level: 'preparatoria',
    grades: ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre'],
    address: 'Periférico Sur Innovación 910, Coyoacán, Ciudad de México',
    phone: '55-0001-3030',
    created_at: '2026-03-10T08:00:00.000Z',
  },
];

// -----------------------------------------------------------------------------
// 2. PLAN CURRICULAR POR PLANTEL (18 MATERIAS PRESERVANDO LOS IDs BASE)
// -----------------------------------------------------------------------------
export const DEMO_SUBJECTS: Subject[] = [
  // Primaria
  { id: 'sub-demo-esp-pri', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level_grade_id: 'primaria', name: 'Lenguajes (Español)', sep_code: 'DEMO-LEN-PRI', category: 'curricular', is_elective: false, description: 'Comprensión lectora, producción de textos y expresión oral NEM.', instructor_name: 'Prof. Alejandro Ruiz', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-mat-pri', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level_grade_id: 'primaria', name: 'Saberes y Pensamiento Científico (Matemáticas)', sep_code: 'DEMO-MAT-PRI', category: 'curricular', is_elective: false, description: 'Resolución de problemas geométricos, fracciones y pensamiento lógico.', instructor_name: 'Prof. Alejandro Ruiz', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-eng-pri', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level_grade_id: 'primaria', name: 'Lengua Extranjera (Inglés)', sep_code: 'DEMO-ING-PRI', category: 'curricular', is_elective: false, description: 'Inmersión conversacional 3D multilingüe con tutores virtuales.', instructor_name: 'Profa. Claire Dubois (Idiomas 3D)', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-cie-pri', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level_grade_id: 'primaria', name: 'Ciencias Naturales y Experimentación', sep_code: 'DEMO-CIE-PRI', category: 'curricular', is_elective: false, description: 'Indagación científica, ecosistemas y método experimental escolar.', instructor_name: 'Profa. Elena Ríos Morales', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-eti-pri', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level_grade_id: 'primaria', name: 'Ética, Naturaleza y Sociedades', sep_code: 'DEMO-ETI-PRI', category: 'curricular', is_elective: false, description: 'Convivencia cívica, historia comunitaria y cultura de paz.', instructor_name: 'Prof. Roberto Navarro Fuentes', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-rob-pri', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level_grade_id: 'primaria', name: 'Robótica y Pensamiento Computacional', sep_code: 'DEMO-ROB-PRI', category: 'optativa', is_elective: true, description: 'Secuencias lógicas, programación visual por bloques y retos STEM.', instructor_name: 'Prof. Héctor Pineda Campos', created_at: '2026-03-10T08:00:00.000Z' },

  // Secundaria
  { id: 'sub-demo-his-sec', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level_grade_id: 'secundaria', name: 'Historia de México y Ciudadanía', sep_code: 'DEMO-HIS-SEC', category: 'curricular', is_elective: false, description: 'Dialogando con personajes históricos en primera persona y análisis documental.', instructor_name: 'Prof. Carlos Eduardo Méndez Vega', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-mat-sec', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level_grade_id: 'secundaria', name: 'Matemáticas y Razonamiento Lógico', sep_code: 'DEMO-MAT-SEC', category: 'curricular', is_elective: false, description: 'Álgebra inicial, proporcionalidad y modelado de datos.', instructor_name: 'Profa. Ximena Paola Vargas Silva', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-esp-sec', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level_grade_id: 'secundaria', name: 'Español y Literatura Crítica', sep_code: 'DEMO-ESP-SEC', category: 'curricular', is_elective: false, description: 'Argumentación académica, ensayo y análisis literario.', instructor_name: 'Profa. Beatriz Santillán Cruz', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-eng-sec', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level_grade_id: 'secundaria', name: 'Inglés Conversacional Avanzado 3D', sep_code: 'DEMO-ENG-SEC', category: 'curricular', is_elective: false, description: 'Debate bilingüe y pronunciación neural asistida por avatares 3D.', instructor_name: 'Profa. Claire Dubois (Idiomas 3D)', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-cie-sec', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level_grade_id: 'secundaria', name: 'Biología, Física y Química Aplicada', sep_code: 'DEMO-CIE-SEC', category: 'curricular', is_elective: false, description: 'Prácticas de laboratorio, energía y genética básica.', instructor_name: 'Prof. Mauricio Salinas Ortiz', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-tec-sec', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level_grade_id: 'secundaria', name: 'Tecnología e Innovación Digital', sep_code: 'DEMO-TEC-SEC', category: 'optativa', is_elective: true, description: 'Diseño de prototipos, hojas de cálculo y ciudadanía digital.', instructor_name: 'Profa. Claudia Reyes Aguilar', created_at: '2026-03-10T08:00:00.000Z' },

  // Preparatoria
  { id: 'sub-demo-mat-prep', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level_grade_id: 'preparatoria', name: 'Cálculo Diferencial y Estadística', sep_code: 'DEMO-CAL-PREP', category: 'curricular', is_elective: false, description: 'Funciones, derivadas, modelado matemático e inferencia estadística.', instructor_name: 'Prof. Rodrigo Cervantes León', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-fis-prep', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level_grade_id: 'preparatoria', name: 'Física Moderna y Electromagnetismo', sep_code: 'DEMO-FIS-PREP', category: 'curricular', is_elective: false, description: 'Mecánica clásica, termodinámica y circuitos aplicados.', instructor_name: 'Prof. Sergio Quintero Téllez', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-qui-prep', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level_grade_id: 'preparatoria', name: 'Química Orgánica y Biotecnología', sep_code: 'DEMO-QUI-PREP', category: 'curricular', is_elective: false, description: 'Estequiometría, compuestos orgánicos y proyectos experimentales.', instructor_name: 'Profa. Gabriela Paredes Sandoval', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-lit-prep', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level_grade_id: 'preparatoria', name: 'Metodología de la Investigación y Humanidades', sep_code: 'DEMO-HUM-PREP', category: 'curricular', is_elective: false, description: 'Pensamiento crítico, ética contemporánea y redacción académica.', instructor_name: 'Profa. Verónica Acosta Zamora', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-eng-prep', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level_grade_id: 'preparatoria', name: 'Inglés Académico y Certificación C1', sep_code: 'DEMO-ENG-PREP', category: 'curricular', is_elective: false, description: 'Preparación académica bilingüe, debate y comprensión técnica.', instructor_name: 'Profa. Mariana Delgado Uribe', created_at: '2026-03-10T08:00:00.000Z' },
  { id: 'sub-demo-ia-prep', school_id: DEMO_SCHOOL_ID, campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level_grade_id: 'preparatoria', name: 'Ciencia de Datos y Emprendimiento', sep_code: 'DEMO-DAT-PREP', category: 'optativa', is_elective: true, description: 'Proyectos productivos, analítica de datos y modelado financiero.', instructor_name: 'Prof. Arturo Pacheco Núñez', created_at: '2026-03-10T08:00:00.000Z' },
];

// -----------------------------------------------------------------------------
// 3. ESPECIFICACIÓN EXACTA DE 27 GRUPOS PARA 650 ALUMNOS (260 + 210 + 180)
// -----------------------------------------------------------------------------
interface GroupPlanSpec {
  id: string;
  campus_id: 'cmp-demo-pri' | 'cmp-demo-sec' | 'cmp-demo-prep';
  campus_name: string;
  level: 'primaria' | 'secundaria' | 'preparatoria';
  grade: string;
  name: string;
  count: number;
  birthYear: number;
}

const GROUP_PLAN: GroupPlanSpec[] = [
  // Campus Central Primaria: 12 grupos = 260 alumnos (22+21)*2 + (22+22) + (22+21) + (22+22) + (22+21) = 260
  { id: 'grp-demo-pri-1a', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '1º', name: '1ºA', count: 22, birthYear: 2019 },
  { id: 'grp-demo-pri-1b', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '1º', name: '1ºB', count: 21, birthYear: 2019 },
  { id: 'grp-demo-pri-2a', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '2º', name: '2ºA', count: 22, birthYear: 2018 },
  { id: 'grp-demo-pri-2b', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '2º', name: '2ºB', count: 21, birthYear: 2018 },
  { id: 'grp-demo-pri-3a', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '3º', name: '3ºA', count: 22, birthYear: 2017 },
  { id: 'grp-demo-pri-3b', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '3º', name: '3ºB', count: 22, birthYear: 2017 },
  { id: 'grp-demo-pri-4a', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '4º', name: '4ºA', count: 22, birthYear: 2016 },
  { id: 'grp-demo-pri-4b', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '4º', name: '4ºB', count: 21, birthYear: 2016 },
  { id: 'grp-demo-pri-5a', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '5º', name: '5ºA', count: 22, birthYear: 2015 },
  { id: 'grp-demo-pri-5b', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '5º', name: '5ºB', count: 22, birthYear: 2015 },
  { id: 'grp-demo-pri-6a', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '6º', name: '6ºA', count: 22, birthYear: 2014 },
  { id: 'grp-demo-pri-6b', campus_id: 'cmp-demo-pri', campus_name: 'Campus Central Primaria', level: 'primaria', grade: '6º', name: '6ºB', count: 21, birthYear: 2014 },

  // Campus Norte Secundaria: 9 grupos = 210 alumnos (24+23+23 = 70 por grado)
  { id: 'grp-demo-sec-1a', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '1º', name: '1ºA', count: 24, birthYear: 2013 },
  { id: 'grp-demo-sec-1b', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '1º', name: '1ºB', count: 23, birthYear: 2013 },
  { id: 'grp-demo-sec-1c', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '1º', name: '1ºC', count: 23, birthYear: 2013 },
  { id: 'grp-demo-sec-2a', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '2º', name: '2ºA', count: 24, birthYear: 2012 },
  { id: 'grp-demo-sec-2b', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '2º', name: '2ºB', count: 23, birthYear: 2012 },
  { id: 'grp-demo-sec-2c', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '2º', name: '2ºC', count: 23, birthYear: 2012 },
  { id: 'grp-demo-sec-3a', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '3º', name: '3ºA', count: 24, birthYear: 2011 },
  { id: 'grp-demo-sec-3b', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '3º', name: '3ºB', count: 23, birthYear: 2011 },
  { id: 'grp-demo-sec-3c', campus_id: 'cmp-demo-sec', campus_name: 'Campus Norte Secundaria', level: 'secundaria', grade: '3º', name: '3ºC', count: 23, birthYear: 2011 },

  // Campus Sur Preparatoria: 6 grupos = 180 alumnos (30 por semestre)
  { id: 'grp-demo-prep-1a', campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level: 'preparatoria', grade: '1º Semestre', name: '101', count: 30, birthYear: 2010 },
  { id: 'grp-demo-prep-2a', campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level: 'preparatoria', grade: '2º Semestre', name: '201', count: 30, birthYear: 2010 },
  { id: 'grp-demo-prep-3a', campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level: 'preparatoria', grade: '3º Semestre', name: '301', count: 30, birthYear: 2009 },
  { id: 'grp-demo-prep-4a', campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level: 'preparatoria', grade: '4º Semestre', name: '401', count: 30, birthYear: 2009 },
  { id: 'grp-demo-prep-5a', campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level: 'preparatoria', grade: '5º Semestre', name: '501', count: 30, birthYear: 2008 },
  { id: 'grp-demo-prep-6a', campus_id: 'cmp-demo-prep', campus_name: 'Campus Sur Preparatoria', level: 'preparatoria', grade: '6º Semestre', name: '601', count: 30, birthYear: 2008 },
];

// -----------------------------------------------------------------------------
// 4. PLANTILLA DOCENTE DE 45 PROFESORES (18 PRIMARIA + 15 SECUNDARIA + 12 PREPA)
// -----------------------------------------------------------------------------
const PRI_SPECIALTIES = [
  'Pedagogía NEM 2024 y Lectoescritura',
  'Saberes Matemáticos y Geometría Activa',
  'Ciencias Experimentales y Ecología Escolar',
  'Ética, Cultura de Paz y Socioemocional',
  'Robótica Educativa y Pensamiento Lógico',
  'Inglés Bilingüe Primaria y Fonética',
];

const SEC_SPECIALTIES = [
  'Historia de México y Personajes en 1ª Persona',
  'Razonamiento Lógico-Matemático y Álgebra',
  'Inmersión Bilingüe y Avatares 3D a 60 FPS',
  'Español, Argumentación y Literatura Crítica',
  'Biología, Física y Laboratorio Experimental',
  'Tecnología Digital y Ciudadanía Responsable',
];

const PREP_SPECIALTIES = [
  'Cálculo Diferencial, Integral y Estadística',
  'Física Moderna y Electromagnetismo Aplicado',
  'Química Orgánica y Biotecnología Escolar',
  'Humanidades y Metodología de la Investigación',
  'Inglés Académico y Certificación C1',
  'Ciencia de Datos y Proyectos Productivos',
];

const buildTeachers = (): UserProfile[] => {
  const teachers: UserProfile[] = [
    // 4 docentes base preservados para continuidad absoluta del tour y horarios
    {
      id: 'usr-demo-teacher-1',
      first_name: 'Prof. Alejandro',
      last_name: 'Ruiz',
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: 'demo.docente@iskool.mx',
      phone: '55-0001-1101',
      birth_date: '1989-04-12',
      age: 37,
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      specialty: 'Pedagogía NEM 2024 y Piloto Automático de Aula',
      bio: 'Docente titular de 5ºA Primaria experto en pase de lista en 1 toque, sellado digital e integración continua con familias.',
      ai_tokens_consumed: 105400,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: ['5ºA', '5ºB'],
      assigned_subjects: ['Lenguajes (Español)', 'Saberes y Pensamiento Científico (Matemáticas)'],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-teacher-2',
      first_name: 'Profa. Claire',
      last_name: 'Dubois (Idiomas 3D)',
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: 'demo.idiomas@iskool.mx',
      phone: '55-0001-2101',
      birth_date: '1986-09-21',
      age: 40,
      campus_id: 'cmp-demo-sec',
      campus_name: 'Campus Norte Secundaria',
      specialty: 'Inmersión Bilingüe, Avatares 3D a 60 FPS y Fonética Neural',
      bio: 'Especialista en entornos conversacionales 3D multilingües e inteligencia fonética interactiva.',
      ai_tokens_consumed: 75200,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: ['5ºA', '1ºA'],
      assigned_subjects: ['Lengua Extranjera (Inglés)', 'Francés Multilingüe'],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-teacher-02',
      first_name: 'Carlos Eduardo',
      last_name: 'Méndez Vega',
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: 'carlos.mendez@iskool.mx',
      phone: '55-0001-2102',
      birth_date: '1984-06-18',
      age: 42,
      campus_id: 'cmp-demo-sec',
      campus_name: 'Campus Norte Secundaria',
      specialty: 'Historia de México y Personajes Históricos en 1ª Persona',
      bio: 'Titular de Historia y Laboratorio de Ciudadanía con dinámicas narrativas en primera persona.',
      ai_tokens_consumed: 60100,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: ['1ºA', '2ºA'],
      assigned_subjects: ['Historia de México y Ciudadanía', 'Física y Métodos de Laboratorio'],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-teacher-03',
      first_name: 'Ximena Paola',
      last_name: 'Vargas Silva',
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: 'ximena.vargas@iskool.mx',
      phone: '55-0001-2103',
      birth_date: '1991-11-05',
      age: 35,
      campus_id: 'cmp-demo-sec',
      campus_name: 'Campus Norte Secundaria',
      specialty: 'Razonamiento Lógico-Matemático y Evaluación Analítica',
      bio: 'Docente de Secundaria enfocada en modelado matemático, diagnóstico oportuno y seguimiento personalizado.',
      ai_tokens_consumed: 120800,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: ['1ºA', '3ºA'],
      assigned_subjects: ['Matemáticas y Razonamiento Lógico', 'Lengua Materna (Español)'],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
  ];

  const priGroups = GROUP_PLAN.filter((g) => g.campus_id === 'cmp-demo-pri').map((g) => g.id);
  const secGroups = GROUP_PLAN.filter((g) => g.campus_id === 'cmp-demo-sec').map((g) => g.id);
  const prepGroups = GROUP_PLAN.filter((g) => g.campus_id === 'cmp-demo-prep').map((g) => g.id);

  const priSubjects = ['sub-demo-esp-pri', 'sub-demo-mat-pri', 'sub-demo-eng-pri', 'sub-demo-cie-pri', 'sub-demo-eti-pri', 'sub-demo-rob-pri'];
  const secSubjects = ['sub-demo-his-sec', 'sub-demo-mat-sec', 'sub-demo-esp-sec', 'sub-demo-eng-sec', 'sub-demo-cie-sec', 'sub-demo-tec-sec'];
  const prepSubjects = ['sub-demo-mat-prep', 'sub-demo-fis-prep', 'sub-demo-qui-prep', 'sub-demo-lit-prep', 'sub-demo-eng-prep', 'sub-demo-ia-prep'];

  // 17 adicionales en Primaria (total 18 en cmp-demo-pri)
  for (let i = 2; i <= 18; i++) {
    const isFemale = i % 2 === 0;
    const first = isFemale ? TEACHER_FIRST_FEMALE[i % TEACHER_FIRST_FEMALE.length] : TEACHER_FIRST_MALE[i % TEACHER_FIRST_MALE.length];
    const last1 = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const last2 = LAST_NAMES[(i * 7 + 5) % LAST_NAMES.length];
    const age = 29 + (i % 18);
    const groupA = priGroups[(i - 1) % priGroups.length];
    const groupB = priGroups[(i + 4) % priGroups.length];
    teachers.push({
      id: `usr-demo-teacher-pri-${pad2(i)}`,
      first_name: `${isFemale ? 'Profa.' : 'Prof.'} ${first}`,
      last_name: `${last1} ${last2}`,
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: `docente.pri${pad2(i)}@iskool.mx`,
      phone: `55-0001-1${pad3(i + 100)}`,
      birth_date: `${2026 - age}-${pad2((i % 12) + 1)}-${pad2(((i * 3) % 27) + 1)}`,
      age,
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      specialty: PRI_SPECIALTIES[i % PRI_SPECIALTIES.length],
      bio: `Titular de Campus Central Primaria especializado en ${PRI_SPECIALTIES[i % PRI_SPECIALTIES.length].toLowerCase()}.`,
      ai_tokens_consumed: [30200, 45400, 75600, 90300, 60800, 120200, 45100, 105900][i % 8],
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: groupA === groupB ? [groupA] : [groupA, groupB],
      assigned_subjects: [priSubjects[i % priSubjects.length], priSubjects[(i + 1) % priSubjects.length]],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    });
  }

  // 12 adicionales en Secundaria (total 15 en cmp-demo-sec contando usr-demo-teacher-2, -02, -03)
  for (let i = 4; i <= 15; i++) {
    const isFemale = i % 2 === 1;
    const first = isFemale ? TEACHER_FIRST_FEMALE[(i + 5) % TEACHER_FIRST_FEMALE.length] : TEACHER_FIRST_MALE[(i + 4) % TEACHER_FIRST_MALE.length];
    const last1 = LAST_NAMES[(i * 5 + 2) % LAST_NAMES.length];
    const last2 = LAST_NAMES[(i * 11 + 3) % LAST_NAMES.length];
    const age = 31 + (i % 16);
    const groupA = secGroups[(i - 1) % secGroups.length];
    const groupB = secGroups[(i + 3) % secGroups.length];
    teachers.push({
      id: `usr-demo-teacher-sec-${pad2(i)}`,
      first_name: `${isFemale ? 'Profa.' : 'Prof.'} ${first}`,
      last_name: `${last1} ${last2}`,
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: `docente.sec${pad2(i)}@iskool.mx`,
      phone: `55-0001-2${pad3(i + 100)}`,
      birth_date: `${2026 - age}-${pad2((i % 12) + 1)}-${pad2(((i * 5) % 27) + 1)}`,
      age,
      campus_id: 'cmp-demo-sec',
      campus_name: 'Campus Norte Secundaria',
      specialty: SEC_SPECIALTIES[i % SEC_SPECIALTIES.length],
      bio: `Docente de Campus Norte Secundaria dedicado a ${SEC_SPECIALTIES[i % SEC_SPECIALTIES.length].toLowerCase()}.`,
      ai_tokens_consumed: [45800, 90400, 30500, 105200, 60900, 135300, 75100][i % 7],
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: groupA === groupB ? [groupA] : [groupA, groupB],
      assigned_subjects: [secSubjects[i % secSubjects.length], secSubjects[(i + 2) % secSubjects.length]],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    });
  }

  // 12 docentes en Preparatoria (total 12 en cmp-demo-prep)
  for (let i = 1; i <= 12; i++) {
    const isFemale = i % 2 === 0;
    const first = isFemale ? TEACHER_FIRST_FEMALE[(i + 9) % TEACHER_FIRST_FEMALE.length] : TEACHER_FIRST_MALE[(i + 8) % TEACHER_FIRST_MALE.length];
    const last1 = LAST_NAMES[(i * 7 + 1) % LAST_NAMES.length];
    const last2 = LAST_NAMES[(i * 13 + 7) % LAST_NAMES.length];
    const age = 33 + (i % 17);
    const groupA = prepGroups[(i - 1) % prepGroups.length];
    const groupB = prepGroups[(i + 2) % prepGroups.length];
    teachers.push({
      id: `usr-demo-teacher-prep-${pad2(i)}`,
      first_name: `${isFemale ? 'Profa.' : 'Prof.'} ${first}`,
      last_name: `${last1} ${last2}`,
      role: 'teacher',
      school_id: DEMO_SCHOOL_ID,
      email: `docente.prep${pad2(i)}@iskool.mx`,
      phone: `55-0001-3${pad3(i + 100)}`,
      birth_date: `${2026 - age}-${pad2((i % 12) + 1)}-${pad2(((i * 7) % 27) + 1)}`,
      age,
      campus_id: 'cmp-demo-prep',
      campus_name: 'Campus Sur Preparatoria',
      specialty: PREP_SPECIALTIES[i % PREP_SPECIALTIES.length],
      bio: `Catedrático de Campus Sur Preparatoria especializado en ${PREP_SPECIALTIES[i % PREP_SPECIALTIES.length].toLowerCase()}.`,
      ai_tokens_consumed: [60400, 105700, 45200, 135600, 75900, 30800, 90100][i % 7],
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      assigned_groups: groupA === groupB ? [groupA] : [groupA, groupB],
      assigned_subjects: [prepSubjects[i % prepSubjects.length], prepSubjects[(i + 1) % prepSubjects.length]],
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    });
  }

  return teachers;
};

export const DEMO_TEACHERS: UserProfile[] = buildTeachers();

// -----------------------------------------------------------------------------
// 5. ALUMNOS PRESERVADOS BASE (`std-demo-01..16`) + GENERADOR DETERMINISTA A 650
// -----------------------------------------------------------------------------
interface PreservedStudentSpec {
  id: string;
  fn: string;
  sn: string;
  l1: string;
  l2: string;
  bd: string;
  g: 'Femenino' | 'Masculino';
  photo: string;
  mail: string;
  mom: string;
  dad: string;
  lvl: 'primaria' | 'secundaria';
  gr: string;
  grp: string;
  cmp: string;
  cmpN: string;
  avg: number;
}

const PRESERVED_16: PreservedStudentSpec[] = [
  { id: 'std-demo-01', fn: 'Valentina', sn: 'Sofía', l1: 'Mendoza', l2: 'Gómez', bd: '2015-04-18', g: 'Femenino', photo: '/images/students/archive/primaria_girl_01.webp', mail: 'demo.alumna@iskool.mx', mom: 'Laura Gómez de Mendoza', dad: 'Alejandro Mendoza Ruiz', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.8 },
  { id: 'std-demo-02', fn: 'Mateo', sn: 'Sebastián', l1: 'Ibarra', l2: 'Fuentes', bd: '2015-07-22', g: 'Masculino', photo: '/images/students/archive/primaria_boy_03.webp', mail: 'mateo.ibarra@iskool.mx', mom: 'Claudia Fuentes León', dad: 'Ricardo Ibarra Solís', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.5 },
  { id: 'std-demo-03', fn: 'Camila', sn: 'Renata', l1: 'Navarro', l2: 'Ortiz', bd: '2015-09-11', g: 'Femenino', photo: '/images/students/archive/primaria_girl_02.webp', mail: 'camila.navarro@iskool.mx', mom: 'Patricia Ortiz Vega', dad: 'Javier Navarro Paredes', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.6 },
  { id: 'std-demo-04', fn: 'Santiago', sn: 'Emiliano', l1: 'Cruz', l2: 'Pineda', bd: '2015-02-05', g: 'Masculino', photo: '/images/students/archive/primaria_boy_04.webp', mail: 'santiago.cruz@iskool.mx', mom: 'Lucía Pineda Lara', dad: 'Héctor Cruz Navarro', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.1 },
  { id: 'std-demo-05', fn: 'Luciana', sn: 'Isabel', l1: 'Morales', l2: 'Campos', bd: '2015-11-14', g: 'Femenino', photo: '/images/students/archive/primaria_girl_03.webp', mail: 'luciana.morales@iskool.mx', mom: 'Mónica Campos Flores', dad: 'Fernando Morales Cruz', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.4 },
  { id: 'std-demo-06', fn: 'Diego', sn: 'Alejandro', l1: 'Herrera', l2: 'Vega', bd: '2015-06-30', g: 'Masculino', photo: '/images/students/archive/primaria_boy_05.webp', mail: 'diego.herrera@iskool.mx', mom: 'Elena Vega Soto', dad: 'Alberto Herrera Díaz', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.0 },
  { id: 'std-demo-07', fn: 'Isabella', sn: 'Victoria', l1: 'Salinas', l2: 'Reyes', bd: '2015-08-09', g: 'Femenino', photo: '/images/students/archive/primaria_girl_04.webp', mail: 'isabella.salinas@iskool.mx', mom: 'Gabriela Reyes Castro', dad: 'Mauricio Salinas Mena', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.7 },
  { id: 'std-demo-08', fn: 'Leonardo', sn: 'Gabriel', l1: 'Aguilar', l2: 'Paredes', bd: '2015-12-03', g: 'Masculino', photo: '/images/students/archive/primaria_boy_06.webp', mail: 'leonardo.aguilar@iskool.mx', mom: 'Valeria Paredes Ríos', dad: 'Óscar Aguilar Luna', lvl: 'primaria', gr: '5º', grp: 'grp-demo-pri-5a', cmp: 'cmp-demo-pri', cmpN: 'Campus Central Primaria', avg: 9.3 },
  { id: 'std-demo-09', fn: 'Sofía', sn: 'Valeria', l1: 'Castillo', l2: 'Rangel', bd: '2013-03-19', g: 'Femenino', photo: '/images/students/archive/secundaria_girl_01.webp', mail: 'sofia.castillo.demo@iskool.mx', mom: 'Beatriz Rangel Pérez', dad: 'Ernesto Castillo Mora', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.6 },
  { id: 'std-demo-10', fn: 'Sebastián', sn: 'Andrés', l1: 'Domínguez', l2: 'Silva', bd: '2013-05-27', g: 'Masculino', photo: '/images/students/archive/secundaria_boy_01.webp', mail: 'sebastian.dominguez@iskool.mx', mom: 'Adriana Silva Tovar', dad: 'Luis Domínguez Lara', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.2 },
  { id: 'std-demo-11', fn: 'Regina', sn: 'Fernanda', l1: 'Miranda', l2: 'Flores', bd: '2013-07-04', g: 'Femenino', photo: '/images/students/archive/secundaria_girl_02.webp', mail: 'regina.miranda@iskool.mx', mom: 'Silvia Flores Ibarra', dad: 'Raúl Miranda Peña', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.5 },
  { id: 'std-demo-12', fn: 'Nicolás', sn: 'Benjamín', l1: 'Rojas', l2: 'Medina', bd: '2013-10-16', g: 'Masculino', photo: '/images/students/archive/secundaria_boy_02.webp', mail: 'nicolas.rojas@iskool.mx', mom: 'Karla Medina Ponce', dad: 'Andrés Rojas Villa', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 8.9 },
  { id: 'std-demo-13', fn: 'Natalia', sn: 'Ximena', l1: 'Sánchez', l2: 'León', bd: '2013-01-25', g: 'Femenino', photo: '/images/students/archive/secundaria_girl_03.webp', mail: 'natalia.sanchez@iskool.mx', mom: 'Norma León Vázquez', dad: 'Arturo Sánchez Ortiz', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.4 },
  { id: 'std-demo-14', fn: 'Daniel', sn: 'Eduardo', l1: 'Guerrero', l2: 'Acosta', bd: '2013-09-08', g: 'Masculino', photo: '/images/students/archive/secundaria_boy_03.webp', mail: 'daniel.guerrero@iskool.mx', mom: 'Verónica Acosta Cruz', dad: 'Sergio Guerrero Ruiz', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.0 },
  { id: 'std-demo-15', fn: 'Mariana', sn: 'Paulina', l1: 'Cortés', l2: 'Zamora', bd: '2013-11-21', g: 'Femenino', photo: '/images/students/archive/secundaria_girl_04.webp', mail: 'mariana.cortes@iskool.mx', mom: 'Teresa Zamora Núñez', dad: 'Pablo Cortés Solís', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.7 },
  { id: 'std-demo-16', fn: 'Emiliano', sn: 'Tomás', l1: 'Bautista', l2: 'Juárez', bd: '2013-04-12', g: 'Masculino', photo: '/images/students/archive/secundaria_boy_04.webp', mail: 'emiliano.bautista@iskool.mx', mom: 'Lorena Juárez Bravo', dad: 'Rodrigo Bautista Mejía', lvl: 'secundaria', gr: '1º', grp: 'grp-demo-sec-1a', cmp: 'cmp-demo-sec', cmpN: 'Campus Norte Secundaria', avg: 9.3 },
];

const BLOOD_TYPES = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+'];
const SCHOLARSHIP_TYPES: NonNullable<DetailedStudent['scholarship_type']>[] = ['academica', 'deportiva', 'hermanos'];
const RPG_CLASSES: NonNullable<StudentStats['rpg_class']>[] = ['guerrero', 'mago', 'curandero', 'explorador'];

interface BuiltSchoolRoster {
  groups: Group[];
  detailedStudents: DetailedStudent[];
  activeStudents: UserProfile[];
  statsMap: Record<string, StudentStats>;
  avatarMap: Record<string, StudentAvatar>;
  atRiskStudentIds: string[];
}

function buildCompleteRoster(): BuiltSchoolRoster {
  const groups: Group[] = [];
  const detailedStudents: DetailedStudent[] = [];
  const activeStudents: UserProfile[] = [];
  const statsMap: Record<string, StudentStats> = {};
  const avatarMap: Record<string, StudentAvatar> = {};
  const atRiskStudentIds: string[] = [];

  const priTeacherIds = DEMO_TEACHERS.filter((t) => t.campus_id === 'cmp-demo-pri').map((t) => t.id);
  const secTeacherIds = DEMO_TEACHERS.filter((t) => t.campus_id === 'cmp-demo-sec').map((t) => t.id);
  const prepTeacherIds = DEMO_TEACHERS.filter((t) => t.campus_id === 'cmp-demo-prep').map((t) => t.id);

  // Asignación ordenada de matrículas preservando `std-demo-01..08` en 5ºA y `std-demo-09..16` en 1ºA Sec
  let nextGeneratedSeq = 17;

  GROUP_PLAN.forEach((plan, groupIdx) => {
    const groupStudentIds: string[] = [];
    const preservedQueue =
      plan.id === 'grp-demo-pri-5a'
        ? PRESERVED_16.slice(0, 8)
        : plan.id === 'grp-demo-sec-1a'
          ? PRESERVED_16.slice(8, 16)
          : [];

    for (let slot = 0; slot < plan.count; slot++) {
      const preserved = preservedQueue[slot];
      let studentId: string;
      let fn: string;
      let sn: string;
      let l1: string;
      let l2: string;
      let bd: string;
      let gender: 'Femenino' | 'Masculino';
      let photo: string;
      let mail: string;
      let mom: string;
      let dad: string;
      let avg: number;
      let numericIndex: number;

      if (preserved) {
        studentId = preserved.id;
        fn = preserved.fn;
        sn = preserved.sn;
        l1 = preserved.l1;
        l2 = preserved.l2;
        bd = preserved.bd;
        gender = preserved.g;
        photo = preserved.photo;
        mail = preserved.mail;
        mom = preserved.mom;
        dad = preserved.dad;
        avg = preserved.avg;
        numericIndex = Number(preserved.id.replace('std-demo-', ''));
      } else {
        const seq = nextGeneratedSeq++;
        numericIndex = seq;
        studentId = `std-demo-${pad3(seq)}`;
        const isFemale = seq % 2 === 1;
        gender = isFemale ? 'Femenino' : 'Masculino';
        fn = isFemale
          ? FEMALE_FIRST_NAMES[(seq * 3 + groupIdx) % FEMALE_FIRST_NAMES.length]
          : MALE_FIRST_NAMES[(seq * 5 + groupIdx) % MALE_FIRST_NAMES.length];
        sn = isFemale
          ? MIDDLE_NAMES_FEMALE[(seq + groupIdx) % MIDDLE_NAMES_FEMALE.length]
          : MIDDLE_NAMES_MALE[(seq + groupIdx) % MIDDLE_NAMES_MALE.length];
        l1 = LAST_NAMES[(seq * 7 + groupIdx) % LAST_NAMES.length];
        l2 = LAST_NAMES[(seq * 11 + groupIdx * 3) % LAST_NAMES.length];
        bd = `${plan.birthYear}-${pad2((seq % 12) + 1)}-${pad2(((seq * 5) % 27) + 1)}`;
        photo = getStudentPhoto(plan.level, isFemale, seq);
        mail = `${normalizeSlug(fn)}.${normalizeSlug(l1)}.${seq}@demo.iskool.mx`;
        const momFirst = PARENT_FEMALE_NAMES[(seq * 3) % PARENT_FEMALE_NAMES.length];
        const dadFirst = PARENT_MALE_NAMES[(seq * 5) % PARENT_MALE_NAMES.length];
        mom = `${momFirst} ${l2} de ${l1}`;
        dad = `${dadFirst} ${l1} ${LAST_NAMES[(seq + 9) % LAST_NAMES.length]}`;

        // ~32 alumnos distribuidos en los 3 planteles con promedio en riesgo académico (5.9 - 6.7)
        const isAtRisk = seq % 20 === 0;
        avg = isAtRisk
          ? Number((5.9 + (seq % 8) * 0.1).toFixed(1))
          : Number((7.5 + ((seq * 7 + groupIdx) % 25) * 0.1).toFixed(1));
      }

      groupStudentIds.push(studentId);
      const isAtRisk = !preserved && numericIndex % 20 === 0;
      if (isAtRisk) {
        atRiskStudentIds.push(studentId);
      }

      const academicStanding: DetailedStudent['academic_standing'] =
        isAtRisk
          ? 'en_riesgo'
          : avg >= 9.3
            ? 'excelente'
            : avg >= 8.5
              ? 'notable'
              : avg >= 7.6
                ? 'suficiente'
                : 'regular';

      const hasScholarship = preserved ? numericIndex === 1 || numericIndex === 9 : numericIndex % 9 === 0;
      const scholarshipPercentage = studentId === 'std-demo-01' ? 25 : hasScholarship ? (numericIndex % 3 === 0 ? 35 : 15) : 0;
      const scholarshipType: DetailedStudent['scholarship_type'] =
        studentId === 'std-demo-01'
          ? 'academica'
          : hasScholarship
            ? SCHOLARSHIP_TYPES[numericIndex % SCHOLARSHIP_TYPES.length]
            : undefined;

      const hasPendingDebt = studentId === 'std-demo-01' || (!preserved && numericIndex % 17 === 0);
      const pendingPayments: string[] =
        studentId === 'std-demo-01'
          ? ['Colegiatura Marzo 2026 (Demo)']
          : hasPendingDebt
            ? [`Colegiatura Vencida ${plan.campus_name}`]
            : [];

      const curpPrefix = `${l1.slice(0, 2).toUpperCase()}${l2.slice(0, 1).toUpperCase()}${fn.slice(0, 1).toUpperCase()}`;
      const bdCode = bd.replace(/-/g, '').slice(2);
      const subjectGrades =
        plan.level === 'primaria'
          ? [
              { subject_name: 'Lenguajes (Español)', grade: Number(Math.min(10, avg + 0.1).toFixed(1)) },
              { subject_name: 'Saberes y Pensamiento Científico', grade: Number(Math.max(5.5, avg - 0.2).toFixed(1)) },
              { subject_name: 'Lengua Extranjera (Inglés)', grade: Number(Math.min(10, avg + 0.2).toFixed(1)) },
            ]
          : plan.level === 'secundaria'
            ? [
                { subject_name: 'Historia de México y Ciudadanía', grade: Number(Math.min(10, avg + 0.1).toFixed(1)) },
                { subject_name: 'Matemáticas y Razonamiento Lógico', grade: Number(Math.max(5.5, avg - 0.3).toFixed(1)) },
                { subject_name: 'Inglés Conversacional 3D', grade: Number(Math.min(10, avg + 0.2).toFixed(1)) },
              ]
            : [
                { subject_name: 'Cálculo Diferencial y Estadística', grade: Number(Math.max(5.5, avg - 0.3).toFixed(1)) },
                { subject_name: 'Física Moderna y Electromagnetismo', grade: Number(Math.min(10, avg + 0.1).toFixed(1)) },
                { subject_name: 'Inglés Académico C1', grade: Number(Math.min(10, avg + 0.2).toFixed(1)) },
              ];

      detailedStudents.push({
        id: studentId,
        first_name: fn,
        second_name: sn,
        last_name_1: l1,
        last_name_2: l2,
        birth_date: bd,
        curp: `${curpPrefix}${bdCode}MDFRN${pad2(numericIndex % 99)}`,
        enrollment_id: `DEMO-2026-${pad4Id(numericIndex)}`,
        gender,
        shift: numericIndex % 5 === 0 ? 'vespertino' : 'matutino',
        status: 'activo',
        previous_school: 'Colegio Metropolitano de Excelencia',
        photo_url: photo,
        address: `Av. Educación Integral #${100 + (numericIndex % 850)}, CDMX`,
        phone: `55-0001-${pad4Id(1000 + numericIndex)}`,
        email: mail,
        father_name: dad,
        mother_name: mom,
        tutor_name: numericIndex === 1 ? 'Laura Gómez de Mendoza' : mom,
        emergency_contact_name: numericIndex === 1 ? 'Alejandro Mendoza Ruiz' : dad,
        emergency_contact_phone: `55-9001-${pad4Id(2000 + numericIndex)}`,
        blood_type: BLOOD_TYPES[numericIndex % BLOOD_TYPES.length],
        medical_notes: numericIndex % 15 === 0 ? 'Uso de lentes graduados en aula' : 'Expediente médico al corriente. Sin restricciones.',
        school_id: DEMO_SCHOOL_ID,
        academic_notes: isAtRisk
          ? 'Requiere plan de nivelación académica en pensamiento lógico y acompañamiento psicopedagógico semanal.'
          : 'Alumno activo del ecosistema interactivo Cuentas demo.',
        level: plan.level,
        grade: plan.grade,
        group_id: plan.id,
        campus_id: plan.campus_id,
        campus_name: plan.campus_name,
        temporary_password: 'DemoISkool2026!',
        is_blocked: false,
        pending_payments: pendingPayments,
        scholarship_percentage: scholarshipPercentage || undefined,
        scholarship_type: scholarshipType,
        behavior_reports: isAtRisk
          ? [
              {
                id: `rep-demo-${pad3(numericIndex)}`,
                date: '2026-03-08',
                description: 'Seguimiento preventivo por inasistencias intermitentes y tareas incompletas en la semana.',
                reporter: plan.campus_id === 'cmp-demo-pri' ? 'Prof. Alejandro Ruiz' : 'Coordinación Académica',
              },
            ]
          : [],
        teacher_notes:
          studentId === 'std-demo-01'
            ? [
                {
                  id: 'tn-demo-val-1',
                  date: '2026-03-10',
                  teacher_name: 'Prof. Alejandro Ruiz',
                  note: 'Excelente participación en el reto de lectura comprensiva y pensamiento matemático. Lista para demostración en tiempo real.',
                },
              ]
            : isAtRisk
              ? [
                  {
                    id: `tn-demo-risk-${pad3(numericIndex)}`,
                    date: '2026-03-09',
                    teacher_name: plan.campus_id === 'cmp-demo-pri' ? 'Prof. Alejandro Ruiz' : 'Mtra. Lucero Aréchiga Montes',
                    note: 'Canalizado a tutoría preventiva y aviso cordial a padres de familia.',
                  },
                ]
              : [],
        average_grade: avg,
        academic_standing: academicStanding,
        subject_grades: subjectGrades,
      });

      activeStudents.push({
        id: studentId,
        first_name: fn,
        last_name: `${l1} ${l2}`,
        role: 'student',
        email: mail,
        school_id: DEMO_SCHOOL_ID,
        campus_id: plan.campus_id,
        campus_name: plan.campus_name,
        created_at: '2026-03-10T08:00:00.000Z',
        updated_at: '2026-03-10T08:00:00.000Z',
      });

      const xp = preserved && studentId === 'std-demo-01' ? 1850 : 600 + ((numericIndex * 137) % 2400);
      const levelNum = Math.max(1, Math.min(18, Math.floor(xp / 220) + 1));
      const race = PET_RACES[numericIndex % PET_RACES.length];

      statsMap[studentId] = {
        student_id: studentId,
        school_id: DEMO_SCHOOL_ID,
        xp,
        level: levelNum,
        coins: 120 + ((numericIndex * 43) % 680),
        current_streak: isAtRisk ? 1 : 3 + (numericIndex % 14),
        max_streak: 8 + (numericIndex % 20),
        last_active_date: '2026-03-10',
        updated_at: '2026-03-10T08:00:00.000Z',
        ...(plan.level === 'secundaria'
          ? {
              rpg_class: RPG_CLASSES[numericIndex % RPG_CLASSES.length],
              attribute_strength: 12 + (numericIndex % 15),
              attribute_intelligence: 14 + (numericIndex % 16),
              attribute_defense: 11 + (numericIndex % 14),
              skill_points: 2 + (numericIndex % 5),
            }
          : {}),
        ...(plan.level === 'preparatoria'
          ? {
              funding_credits: 450 + ((numericIndex * 75) % 1200),
            }
          : {}),
        pet_stage: levelNum >= 10 ? 'adult' : levelNum >= 6 ? 'teen' : levelNum >= 3 ? 'child' : 'baby',
        pet_energy: 75 + (numericIndex % 25),
        pet_happiness: 80 + (numericIndex % 20),
        pet_bonded: true,
        tasks_completed_count: 6 + (numericIndex % 24),
        friendship_exp: 240 + ((numericIndex * 31) % 700),
        stat_lenguajes: Math.round(avg * 9.5),
        stat_saberes: Math.round(avg * 9.2),
        stat_etica: Math.round(avg * 9.4),
        stat_de_lo_humano: Math.round(avg * 9.6),
      };

      avatarMap[studentId] = {
        student_id: studentId,
        avatar_name: studentId === 'std-demo-01' ? 'ValenEstelar' : `${fn.slice(0, 5)}${numericIndex}`,
        hair_style: numericIndex % 2 === 0 ? 'classic_short' : 'wavy_long',
        hair_color: numericIndex % 3 === 0 ? '#1e293b' : numericIndex % 3 === 1 ? '#451a03' : '#78350f',
        eyes_style: 'bright_emerald',
        outfit_style: plan.level === 'preparatoria' ? 'blazer_academy' : 'iskool_tunic',
        outfit_color: plan.campus_id === 'cmp-demo-pri' ? '#4f46e5' : plan.campus_id === 'cmp-demo-sec' ? '#0f766e' : '#7c3aed',
        background_style: 'starlight_sanctuary',
        unlocked_items: ['crown_scholar', 'cape_nem'],
        updated_at: '2026-03-10T08:00:00.000Z',
        pet_type: race,
        pet_name: PET_NAMES[numericIndex % PET_NAMES.length],
        pet_hunger: 85,
        pet_happiness: 92,
        pet_bonded: true,
        pet_birth_date: '2026-03-10',
        sanctuary_house_type: SANCTUARIES[numericIndex % SANCTUARIES.length],
        sanctuary_placed_items: { 1: 'desk_scholar', 2: 'trophy_math' },
        sanctuary_inventory: ['desk_scholar', 'trophy_math', 'telescope_mini'],
        gender: gender === 'Femenino' ? 'female' : 'male',
      };
    }

    const pool =
      plan.campus_id === 'cmp-demo-pri'
        ? priTeacherIds
        : plan.campus_id === 'cmp-demo-sec'
          ? secTeacherIds
          : prepTeacherIds;
    const titularTeacherId =
      plan.id === 'grp-demo-pri-5a'
        ? 'usr-demo-teacher-1'
        : plan.id === 'grp-demo-sec-1a'
          ? 'usr-demo-teacher-2'
          : pool[groupIdx % pool.length];

    groups.push({
      id: plan.id,
      school_id: DEMO_SCHOOL_ID,
      teacher_id: titularTeacherId,
      campus_id: plan.campus_id,
      campus_name: plan.campus_name,
      level_grade_id: plan.level,
      level: plan.level,
      grade: plan.grade,
      academic_year_id: 'ay-25-26',
      name: plan.name,
      student_ids: groupStudentIds,
      created_at: '2026-03-10T08:00:00.000Z',
    });
  });

  return { groups, detailedStudents, activeStudents, statsMap, avatarMap, atRiskStudentIds };
}

function pad4Id(n: number): string {
  return String(n).padStart(4, '0');
}

const ROSTER = buildCompleteRoster();

export const DEMO_GROUPS: Group[] = ROSTER.groups;
export const DEMO_DETAILED_STUDENTS: DetailedStudent[] = ROSTER.detailedStudents;
export const DEMO_ACTIVE_STUDENTS: UserProfile[] = ROSTER.activeStudents;
export const DEMO_STATS_MAP: Record<string, StudentStats> = ROSTER.statsMap;
export const DEMO_AVATAR_MAP: Record<string, StudentAvatar> = ROSTER.avatarMap;
export const DEMO_AT_RISK_STUDENT_IDS: string[] = ROSTER.atRiskStudentIds;

// -----------------------------------------------------------------------------
// 6. HORARIOS ESCOLARES POR GRUPO Y DOCENTE (PRESERVANDO `sch-cdemo-1..5`)
// -----------------------------------------------------------------------------
const DAYS: ClassSchedule['dayOfWeek'][] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const SLOTS = ['08:00 - 09:30', '09:30 - 11:00', '11:30 - 13:00', '13:00 - 14:30'];

const buildSchedules = (): ClassSchedule[] => {
  const schedules: ClassSchedule[] = [
    { id: 'sch-cdemo-1', school_id: DEMO_SCHOOL_ID, groupId: 'grp-demo-pri-5a', subjectId: 'sub-demo-esp-pri', teacherId: 'usr-demo-teacher-1', dayOfWeek: 'Lunes', timeSlot: '08:00 - 09:30' },
    { id: 'sch-cdemo-2', school_id: DEMO_SCHOOL_ID, groupId: 'grp-demo-pri-5a', subjectId: 'sub-demo-mat-pri', teacherId: 'usr-demo-teacher-1', dayOfWeek: 'Miércoles', timeSlot: '09:30 - 11:00' },
    { id: 'sch-cdemo-3', school_id: DEMO_SCHOOL_ID, groupId: 'grp-demo-pri-5a', subjectId: 'sub-demo-eng-pri', teacherId: 'usr-demo-teacher-2', dayOfWeek: 'Martes', timeSlot: '10:00 - 11:00' },
    { id: 'sch-cdemo-4', school_id: DEMO_SCHOOL_ID, groupId: 'grp-demo-sec-1a', subjectId: 'sub-demo-his-sec', teacherId: 'usr-demo-teacher-02', dayOfWeek: 'Jueves', timeSlot: '11:00 - 12:30' },
    { id: 'sch-cdemo-5', school_id: DEMO_SCHOOL_ID, groupId: 'grp-demo-sec-1a', subjectId: 'sub-demo-mat-sec', teacherId: 'usr-demo-teacher-03', dayOfWeek: 'Viernes', timeSlot: '08:00 - 09:30' },
  ];

  let seq = 6;
  DEMO_GROUPS.forEach((grp, gIdx) => {
    const levelSubjects = DEMO_SUBJECTS.filter((s) => s.level_grade_id === grp.level);
    const campusTeachers = DEMO_TEACHERS.filter((t) => t.campus_id === grp.campus_id);
    for (let k = 0; k < 4; k++) {
      const subj = levelSubjects[(gIdx + k) % levelSubjects.length];
      const teach = campusTeachers[(gIdx * 2 + k) % campusTeachers.length];
      schedules.push({
        id: `sch-cdemo-${seq++}`,
        school_id: DEMO_SCHOOL_ID,
        groupId: grp.id,
        subjectId: subj.id,
        teacherId: teach.id,
        dayOfWeek: DAYS[(gIdx + k) % DAYS.length],
        timeSlot: SLOTS[k % SLOTS.length],
      });
    }
  });

  return schedules;
};

export const DEMO_SCHEDULES: ClassSchedule[] = buildSchedules();

// -----------------------------------------------------------------------------
// 7. ASISTENCIA CON PRESENCIA Y ALERTAS ACCIONABLES (PRESERVANDO `att-demo-1..4`)
// -----------------------------------------------------------------------------
const buildAttendance = (): Attendance[] => {
  const records: Attendance[] = [
    { id: 'att-demo-1', school_id: DEMO_SCHOOL_ID, student_id: 'std-demo-01', group_id: 'grp-demo-pri-5a', subject_id: 'sub-demo-esp-pri', date: '2026-03-10', status: 'presente', comments: 'Asistencia puntual y cuaderno sellado', registered_by: 'usr-demo-teacher-1', created_at: '2026-03-10T08:00:00.000Z' },
    { id: 'att-demo-2', school_id: DEMO_SCHOOL_ID, student_id: 'std-demo-02', group_id: 'grp-demo-pri-5a', subject_id: 'sub-demo-esp-pri', date: '2026-03-10', status: 'presente', comments: 'Participación destacada', registered_by: 'usr-demo-teacher-1', created_at: '2026-03-10T08:00:00.000Z' },
    { id: 'att-demo-3', school_id: DEMO_SCHOOL_ID, student_id: 'std-demo-03', group_id: 'grp-demo-pri-5a', subject_id: 'sub-demo-mat-pri', date: '2026-03-10', status: 'presente', comments: 'Ejercicios completos', registered_by: 'usr-demo-teacher-1', created_at: '2026-03-10T08:00:00.000Z' },
    { id: 'att-demo-4', school_id: DEMO_SCHOOL_ID, student_id: 'std-demo-04', group_id: 'grp-demo-pri-5a', subject_id: 'sub-demo-mat-pri', date: '2026-03-10', status: 'presente', comments: 'Presente en aula', registered_by: 'usr-demo-teacher-1', created_at: '2026-03-10T08:00:00.000Z' },
  ];

  const dates = ['2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'];
  const atRiskSet = new Set(DEMO_AT_RISK_STUDENT_IDS);
  let seq = 5;

  // Muestreo representativo por cada uno de los 27 grupos + todos los casos de riesgo académico
  DEMO_DETAILED_STUDENTS.forEach((student, idx) => {
    const inRisk = atRiskSet.has(student.id);
    if (!inRisk && idx % 6 !== 0) return;

    const subjectId =
      student.level === 'primaria'
        ? 'sub-demo-mat-pri'
        : student.level === 'secundaria'
          ? 'sub-demo-his-sec'
          : 'sub-demo-mat-prep';

    const status: Attendance['status'] = inRisk
      ? idx % 3 === 0
        ? 'falta'
        : 'retardo'
      : idx % 18 === 0
        ? 'justificado'
        : 'presente';

    records.push({
      id: `att-demo-${seq++}`,
      school_id: DEMO_SCHOOL_ID,
      student_id: student.id,
      group_id: student.group_id || 'grp-demo-pri-5a',
      subject_id: subjectId,
      date: dates[idx % dates.length],
      status,
      comments: inRisk
        ? 'Seguimiento de asistencia por tutoría preventiva'
        : 'Asistencia registrada en pase digital',
      registered_by: 'usr-demo-teacher-1',
      created_at: `${dates[idx % dates.length]}T08:30:00.000Z`,
    });
  });

  return records;
};

export const DEMO_ATTENDANCE: Attendance[] = buildAttendance();

// -----------------------------------------------------------------------------
// 8. COBRANZA Y FACTURACIÓN (36 FOLIOS: 18 PAID, 9 PENDING, 9 OVERDUE)
// -----------------------------------------------------------------------------
const buildBillingRecords = (): FamilyBillingRecord[] => {
  const records: FamilyBillingRecord[] = [
    // Preservando los 4 folios base inv-demo-001..004 para total continuidad de Cobranza & Familias
    {
      id: 'inv-demo-001',
      school_id: DEMO_SCHOOL_ID,
      invoiceNumber: 'DEMO-2026-0001',
      studentId: 'std-demo-01',
      parentName: 'Laura Gómez de Mendoza',
      parentPhone: '5500012001',
      parentEmail: 'demo.familia@iskool.mx',
      studentName: 'Valentina Mendoza Gómez',
      level: 'Primaria',
      grade: '5º',
      group: '5ºA',
      concept: 'Colegiatura Marzo 2026 · Primaria Bilingüe Demo',
      baseAmount: 4800.0,
      scholarshipPercentage: 25,
      scholarshipType: 'academica',
      discountAmount: 1200.0,
      amount: 3600.0,
      dueDate: '10 Marzo 2026',
      status: 'pending',
      autoInvoice: true,
    },
    {
      id: 'inv-demo-002',
      school_id: DEMO_SCHOOL_ID,
      invoiceNumber: 'DEMO-2026-0002',
      studentId: 'std-demo-02',
      parentName: 'Claudia Fuentes León',
      parentPhone: '5500012002',
      parentEmail: 'claudia.fuentes@iskool.mx',
      studentName: 'Mateo Sebastián Ibarra Fuentes',
      level: 'Primaria',
      grade: '5º',
      group: '5ºA',
      concept: 'Colegiatura Marzo 2026 · Primaria Bilingüe Demo',
      baseAmount: 4800.0,
      scholarshipPercentage: 0,
      scholarshipType: 'ninguna',
      discountAmount: 0,
      amount: 4800.0,
      dueDate: '10 Marzo 2026',
      status: 'paid',
      autoInvoice: true,
      paidAt: '05 Marzo 2026',
    },
    {
      id: 'inv-demo-003',
      school_id: DEMO_SCHOOL_ID,
      invoiceNumber: 'DEMO-2026-0003',
      studentId: 'std-demo-09',
      parentName: 'Beatriz Rangel Pérez',
      parentPhone: '5500012009',
      parentEmail: 'beatriz.rangel@iskool.mx',
      studentName: 'Sofía Valeria Castillo Rangel',
      level: 'Secundaria',
      grade: '1º',
      group: '1ºA',
      concept: 'Colegiatura Marzo 2026 · Secundaria Bilingüe Demo',
      baseAmount: 5400.0,
      scholarshipPercentage: 15,
      scholarshipType: 'academica',
      discountAmount: 810.0,
      amount: 4590.0,
      dueDate: '10 Marzo 2026',
      status: 'paid',
      autoInvoice: true,
      paidAt: '03 Marzo 2026',
    },
    {
      id: 'inv-demo-004',
      school_id: DEMO_SCHOOL_ID,
      invoiceNumber: 'DEMO-2026-0004',
      studentId: 'std-demo-10',
      parentName: 'Adriana Silva Tovar',
      parentPhone: '5500012010',
      parentEmail: 'adriana.silva@iskool.mx',
      studentName: 'Sebastián Andrés Domínguez Silva',
      level: 'Secundaria',
      grade: '1º',
      group: '1ºA',
      concept: 'Inscripción & Laboratorio 3D Ciclo 2025-2026',
      baseAmount: 5400.0,
      scholarshipPercentage: 0,
      scholarshipType: 'ninguna',
      discountAmount: 0,
      amount: 5400.0,
      dueDate: '15 Marzo 2026',
      status: 'overdue',
      autoInvoice: true,
    },
  ];

  // 32 registros adicionales distribuidos en los 3 planteles -> Total: 36 (18 paid, 9 pending, 9 overdue)
  // inv-demo-001..004 aportan 2 paid, 1 pending, 1 overdue. Aquí agregamos 16 paid, 8 pending, 8 overdue.
  const sampleIndices = Array.from({ length: 32 }, (_, idx) => ((idx * 19) % 630) + 17);
  sampleIndices.forEach((studentIdx, pos) => {
    const st = DEMO_DETAILED_STUDENTS[studentIdx % DEMO_DETAILED_STUDENTS.length];
    const folioNum = pos + 5;
    let status: FamilyBillingRecord['status'];
    if (pos < 16) status = 'paid';
    else if (pos < 24) status = 'pending';
    else status = 'overdue';

    const baseAmount = st.level === 'primaria' ? 3450 : st.level === 'secundaria' ? 3800 : 4100;
    const discPct = st.scholarship_percentage || (pos % 6 === 0 ? 25 : 0);
    const discountAmount = Math.round((baseAmount * discPct) / 100);
    const amount = baseAmount - discountAmount;

    const dueDate =
      status === 'overdue'
        ? pos % 2 === 0
          ? '2026-01-15'
          : '2026-02-10'
        : status === 'pending'
          ? '2026-03-28'
          : '2026-03-05';

    records.push({
      id: `inv-demo-${pad3(folioNum)}`,
      school_id: DEMO_SCHOOL_ID,
      invoiceNumber: `DEMO-2026-${pad4Id(folioNum)}`,
      studentId: st.id,
      parentName: st.mother_name || st.tutor_name || `Familia ${st.last_name_1}`,
      parentPhone: st.emergency_contact_phone || st.phone || '55-0001-2200',
      parentEmail: (st.email || 'familia@iskool.mx').replace('@demo.iskool.mx', '.familia@iskool.mx'),
      studentName: `${st.first_name} ${st.last_name_1} ${st.last_name_2 || ''}`.trim(),
      level: st.level === 'primaria' ? 'Primaria' : st.level === 'secundaria' ? 'Secundaria' : 'Preparatoria',
      grade: st.grade,
      group: DEMO_GROUPS.find((g) => g.id === st.group_id)?.name || '5ºA',
      concept:
        status === 'overdue'
          ? `Colegiatura Vencida ${st.campus_name || ''}`
          : status === 'pending'
            ? `Colegiatura Marzo 2026 · ${st.campus_name || ''}`
            : `Colegiatura Pagada Febrero 2026 · ${st.campus_name || ''}`,
      baseAmount,
      discountAmount,
      scholarshipPercentage: discPct,
      scholarshipType: discPct > 0 ? st.scholarship_type || 'academica' : 'ninguna',
      amount,
      dueDate,
      status,
      autoInvoice: pos % 2 === 0,
      ...(status === 'paid' ? { paidAt: '2026-03-03T14:15:00.000Z' } : {}),
    });
  });

  return records;
};

export const DEMO_BILLING_RECORDS: FamilyBillingRecord[] = buildBillingRecords();

// -----------------------------------------------------------------------------
// 9. CUENTAS DE DIRECCIÓN, COORDINACIÓN, CONTROL Y ROL 7 VISIÓN CEO (5 STAFF)
// -----------------------------------------------------------------------------
export const DEMO_STAFF_USERS: UserProfile[] = [
    {
      id: 'usr-demo-ceo',
      first_name: 'Mtro. Alejandro',
      last_name: 'Villarreal Castañeda',
      role: 'ceo',
      school_id: DEMO_SCHOOL_ID,
      email: 'demo.ceo@iskool.mx',
      phone: '55-0001-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Corporativo Multi-Plantel Cuentas Demo',
      specialty: 'Dirección Ejecutiva Multi-Plantel, Estrategia Financiera e IA',
      bio: 'Rol 7 Ejecutivo (Visión CEO) conectado en vivo con los 3 planteles, 650 alumnos, 45 docentes, CRM de admisiones y despacho resolutivo.',
      ai_tokens_consumed: 28400,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-director',
      first_name: 'Dra. Beatriz Elena',
      last_name: 'Santillán Torres',
      role: 'director',
      school_id: DEMO_SCHOOL_ID,
      email: 'demo.director@iskool.mx',
      phone: '55-0001-0100',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      specialty: 'Dirección Académica NEM 2024 y Supervisión Multi-Plantel',
      bio: 'Directora general operativa encargada de aprobar planeaciones, supervisar riesgos académicos y coordinar los 3 planteles.',
      ai_tokens_consumed: 19200,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-coord-sec',
      first_name: 'Mtra. Lucero',
      last_name: 'Aréchiga Montes',
      role: 'coordinator',
      school_id: DEMO_SCHOOL_ID,
      email: 'coordinacion.sec.demo@iskool.mx',
      phone: '55-0001-0200',
      campus_id: 'cmp-demo-sec',
      campus_name: 'Campus Norte Secundaria',
      specialty: 'Coordinación Académica Secundaria y Seguimiento Psicopedagógico',
      bio: 'Coordinadora académica de Campus Norte Secundaria (210 alumnos, 15 docentes).',
      ai_tokens_consumed: 9600,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-coord-prep',
      first_name: 'Ing. Gabriel',
      last_name: 'Núñez Salcedo',
      role: 'coordinator',
      school_id: DEMO_SCHOOL_ID,
      email: 'coordinacion.prep.demo@iskool.mx',
      phone: '55-0001-0300',
      campus_id: 'cmp-demo-prep',
      campus_name: 'Campus Sur Preparatoria',
      specialty: 'Coordinación Bachillerato, Proyectos STEM y Vinculación Universitaria',
      bio: 'Coordinador de Campus Sur Preparatoria (180 alumnos, 12 docentes).',
      ai_tokens_consumed: 11200,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'usr-demo-staff-1',
      first_name: 'Lic. Sofía',
      last_name: 'Reyes Aguilar',
      role: 'billing',
      school_id: DEMO_SCHOOL_ID,
      email: 'demo.control@iskool.mx',
      phone: '55-0001-0400',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Control Escolar & Finanzas',
      specialty: 'Facturación CFDI 4.0, Cobranza Preventiva y Dispersión SPEI',
      bio: 'Responsable de control escolar, conciliación de colegiaturas, becas y nómina institucional.',
      ai_tokens_consumed: 6400,
      is_blocked: false,
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z',
    },
];

// -----------------------------------------------------------------------------
// 10. NÓMINA INSTITUCIONAL CON LOTES PAGADOS Y PENDIENTES PARA DISPERSIÓN SPEI
// -----------------------------------------------------------------------------
export const DEMO_STAFF_PAYROLL: StaffPayrollRecord[] = [
  {
    id: 'pay-cdemo-001',
    employee_id: 'usr-demo-teacher-1',
    employee_name: 'Prof. Alejandro Ruiz',
    role: 'teacher',
    department: 'Académico Primaria',
    position_title: 'Docente Titular 5ºA',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Central Primaria',
    base_salary: 14500,
    bonuses: 1800,
    deductions: 2150,
    net_salary: 14150,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    payment_date: '2026-03-15',
    status: 'pagado',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '012180001234567891',
    bank_name: 'BBVA Bancomer',
    rfc: 'RUIA890412HDF',
    receipt_folio: 'NOM-DEMO-2026-001',
    notes: 'Incluye bono por seguimiento NEM 100% puntual',
  },
  {
    id: 'pay-cdemo-002',
    employee_id: 'usr-demo-teacher-2',
    employee_name: 'Profa. Claire Dubois',
    role: 'teacher',
    department: 'Idiomas Multi-Plantel',
    position_title: 'Coordinadora de Idiomas 3D',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Norte Secundaria',
    base_salary: 16200,
    bonuses: 2200,
    deductions: 2450,
    net_salary: 15950,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    payment_date: '2026-03-15',
    status: 'pagado',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '014180009876543210',
    bank_name: 'Santander',
    rfc: 'DUBC860921MDF',
    receipt_folio: 'NOM-DEMO-2026-002',
  },
  {
    id: 'pay-cdemo-003',
    employee_id: 'usr-demo-teacher-02',
    employee_name: 'Carlos Eduardo Méndez Vega',
    role: 'teacher',
    department: 'Humanidades e Historia',
    position_title: 'Profesor de Historia',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Norte Secundaria',
    base_salary: 13800,
    bonuses: 1200,
    deductions: 1980,
    net_salary: 13020,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    status: 'pendiente',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '002180005556667771',
    bank_name: 'Citibanamex',
    rfc: 'MEVC840618HDF',
    notes: 'Lote listo para autorización SPEI en 1 clic',
  },
  {
    id: 'pay-cdemo-004',
    employee_id: 'usr-demo-staff-1',
    employee_name: 'Lic. Sofía Reyes Aguilar',
    role: 'billing',
    department: 'Administración y Cobranza',
    position_title: 'Jefa de Control Escolar',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Central Primaria',
    base_salary: 15500,
    bonuses: 1500,
    deductions: 2300,
    net_salary: 14700,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    status: 'pagado',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '072180004443332221',
    bank_name: 'Banorte',
    rfc: 'REAS900214MDF',
    receipt_folio: 'NOM-DEMO-2026-004',
  },
  // Lote adicional multi-plantel incluyendo pendientes y en dispersión
  {
    id: 'pay-cdemo-005',
    employee_id: 'usr-demo-ceo',
    employee_name: 'Mtro. Alejandro Villarreal Castañeda',
    role: 'ceo',
    department: 'Dirección Ejecutiva',
    position_title: 'Director General Multi-Plantel',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Central Primaria',
    base_salary: 38000,
    bonuses: 4500,
    deductions: 6900,
    net_salary: 35600,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    payment_date: '2026-03-15',
    status: 'pagado',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '012180009998887771',
    bank_name: 'BBVA Bancomer',
    receipt_folio: 'NOM-DEMO-2026-005',
  },
  {
    id: 'pay-cdemo-006',
    employee_id: 'usr-demo-director',
    employee_name: 'Dra. Beatriz Elena Santillán Torres',
    role: 'director',
    department: 'Dirección Académica',
    position_title: 'Directora General',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Central Primaria',
    base_salary: 26500,
    bonuses: 3000,
    deductions: 4250,
    net_salary: 25250,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    payment_date: '2026-03-15',
    status: 'pagado',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '014180007776665552',
    bank_name: 'Santander',
    receipt_folio: 'NOM-DEMO-2026-006',
  },
  {
    id: 'pay-cdemo-007',
    employee_id: 'usr-demo-coord-sec',
    employee_name: 'Mtra. Lucero Aréchiga Montes',
    role: 'coordinator',
    department: 'Coordinación Campus Norte',
    position_title: 'Coordinadora de Secundaria',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Norte Secundaria',
    base_salary: 18500,
    bonuses: 1500,
    deductions: 2900,
    net_salary: 17100,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    status: 'en_dispersion',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '002180003332221114',
    bank_name: 'Citibanamex',
    notes: 'Dispersión SPEI programada 15:00h',
  },
  {
    id: 'pay-cdemo-008',
    employee_id: 'usr-demo-coord-prep',
    employee_name: 'Ing. Gabriel Núñez Salcedo',
    role: 'coordinator',
    department: 'Coordinación Campus Sur',
    position_title: 'Coordinador de Preparatoria',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Sur Preparatoria',
    base_salary: 19200,
    bonuses: 1800,
    deductions: 3100,
    net_salary: 17900,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    status: 'pendiente',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '072180001112223339',
    bank_name: 'Banorte',
    notes: 'Pendiente de autorización de tesorería',
  },
  {
    id: 'pay-cdemo-009',
    employee_id: 'usr-demo-teacher-03',
    employee_name: 'Ximena Paola Vargas Silva',
    role: 'teacher',
    department: 'Matemáticas Secundaria',
    position_title: 'Profesora de Matemáticas',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Norte Secundaria',
    base_salary: 13900,
    bonuses: 1100,
    deductions: 1950,
    net_salary: 13050,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    status: 'pendiente',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '012180005554443332',
    bank_name: 'BBVA Bancomer',
    notes: 'Pendiente de firma y dispersión',
  },
  {
    id: 'pay-cdemo-010',
    employee_id: 'usr-demo-teacher-prep-01',
    employee_name: `${DEMO_TEACHERS.find((t) => t.id === 'usr-demo-teacher-prep-01')?.first_name || 'Prof.'} ${DEMO_TEACHERS.find((t) => t.id === 'usr-demo-teacher-prep-01')?.last_name || ''}`.trim(),
    role: 'teacher',
    department: 'STEM Preparatoria',
    position_title: 'Titular de Cálculo y Estadística',
    school_id: DEMO_SCHOOL_ID,
    campus_name: 'Campus Sur Preparatoria',
    base_salary: 15800,
    bonuses: 1600,
    deductions: 2350,
    net_salary: 15050,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    status: 'pendiente',
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: '014180006665554448',
    bank_name: 'Santander',
    notes: 'Requiere validación de horas de laboratorio',
  },
];

const DEMO_PAYROLL_BASE: StaffPayrollRecord[] = [...DEMO_STAFF_PAYROLL];
const PAYROLL_BANKS = ['BBVA Bancomer', 'Santander', 'Citibanamex', 'Banorte', 'HSBC México'];
const PAYROLL_STATUSES: StaffPayrollRecord['status'][] = ['pagado', 'pagado', 'pagado', 'en_dispersion', 'pendiente'];

const existingPayrollEmployeeIds = new Set(DEMO_PAYROLL_BASE.map((r) => r.employee_id));
DEMO_TEACHERS.forEach((t, idx) => {
  if (existingPayrollEmployeeIds.has(t.id)) return;
  const fullName = `${t.first_name} ${t.last_name}`.replace(/\s*\(Idiomas 3D\)/i, '').trim();
  const baseSalary = t.campus_id === 'cmp-demo-prep' ? 15600 + (idx % 4) * 550 : t.campus_id === 'cmp-demo-sec' ? 14400 + (idx % 4) * 500 : 13400 + (idx % 4) * 450;
  const bonuses = 1100 + (idx % 5) * 250;
  const deductions = Math.round((baseSalary + bonuses) * 0.135);
  const netSalary = baseSalary + bonuses - deductions;
  const status = PAYROLL_STATUSES[idx % PAYROLL_STATUSES.length];
  const seqNum = String(DEMO_PAYROLL_BASE.length + 1).padStart(3, '0');
  DEMO_PAYROLL_BASE.push({
    id: `pay-cdemo-${seqNum}`,
    employee_id: t.id,
    employee_name: fullName,
    role: 'teacher',
    department: t.campus_id === 'cmp-demo-prep' ? 'Académico Preparatoria' : t.campus_id === 'cmp-demo-sec' ? 'Académico Secundaria' : 'Académico Primaria',
    position_title: t.assigned_subjects?.[0] ? `Titular de ${t.assigned_subjects[0]}` : 'Docente Titular',
    school_id: DEMO_SCHOOL_ID,
    campus_name: t.campus_name || 'Campus Central Primaria',
    base_salary: baseSalary,
    bonuses,
    deductions,
    net_salary: netSalary,
    payment_period: '1ª Quincena Marzo 2026',
    period_type: 'quincenal',
    payment_date: status === 'pagado' ? '2026-03-15' : undefined,
    status,
    payment_method: 'SPEI / Transferencia Bancaria',
    account_clabe: `01218000${String(1000000000 + idx * 13791).slice(0, 10)}`,
    bank_name: PAYROLL_BANKS[idx % PAYROLL_BANKS.length],
    receipt_folio: status === 'pagado' ? `NOM-DEMO-2026-${seqNum}` : undefined,
    notes: status === 'pagado' ? 'Dispersión quincenal acreditada' : 'Programado para dispersión SPEI',
  });
});
DEMO_STAFF_PAYROLL.splice(0, DEMO_STAFF_PAYROLL.length, ...DEMO_PAYROLL_BASE);

export const getDemoAvatarUrl = (isFemale: boolean, index: number): string =>
  getAdultPhoto(isFemale, index);
