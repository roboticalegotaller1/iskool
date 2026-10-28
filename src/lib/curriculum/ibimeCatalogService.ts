/**
 * ============================================================================
 * CONTRATO CANÓNICO DEL SISTEMA SOBERANO IBIME
 * Catálogo Curricular, Estructura Multisede y Plantilla Bicultural
 * ============================================================================
 * 
 * Este módulo opera bajo la arquitectura de Bounded Context hermético:
 * - Aislamiento total de stores privados de otras entidades.
 * - Despliegue de planteles oficiales (Montes, Lagos, San Cristóbal, Coacalco).
 * - Estándares bilingües SEP NEM, Cambridge English y Bachillerato CCH UNAM.
 */

import { Campus, DetailedStudent, Subject, UserProfile } from '@/types';

export interface IbimePayrollRecord {
  id: string;
  school_id: string;
  employee_name: string;
  role: string;
  position_title: string;
  campus_name: string;
  base_salary: number;
  net_salary: number;
  biweekly_amount: number;
  status: 'pagado' | 'pendiente' | 'en_dispersion';
  period: string;
}

export const IBIME_CAMPUSES: Campus[] = [
  {
    id: 'cmp-ibime-montes',
    school_id: 'sch-ibime',
    name: 'Campus Montes (Sede Matriz & CCH)',
    level: 'preparatoria',
    grades: ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre'],
    address: 'Av. Central Carlos Hank González #100, Col. Montes, C.P. 55000, Ecatepec de Morelos, Edo. Méx.',
    phone: '(55) 5770-1234',
    created_at: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'cmp-ibime-lagos',
    school_id: 'sch-ibime',
    name: 'Campus Lagos (Fundador 2004)',
    level: 'primaria',
    grades: ['1º', '2º', '3º', '4º', '5º', '6º'],
    address: 'Circuito Lago de Chapala #45, Col. Jardines de Morelos, C.P. 55070, Ecatepec de Morelos, Edo. Méx.',
    phone: '(55) 5837-9876',
    created_at: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'cmp-ibime-sancristobal',
    school_id: 'sch-ibime',
    name: 'Campus San Cristóbal (Ecatepec Centro)',
    level: 'secundaria',
    grades: ['1º', '2º', '3º'],
    address: 'Av. Juárez Sur #28, Centro Histórico San Cristóbal, C.P. 55000, Ecatepec de Morelos, Edo. Méx.',
    phone: '(55) 5787-4321',
    created_at: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'cmp-ibime-coacalco',
    school_id: 'sch-ibime',
    name: 'Campus Coacalco (Metropolitano)',
    level: 'preparatoria',
    grades: ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre'],
    address: 'Vía José López Portillo #320, Ex-Hacienda San Felipe, C.P. 55700, San Francisco Coacalco, Edo. Méx.',
    phone: '(55) 5898-6543',
    created_at: '2026-01-10T08:00:00.000Z'
  }
];

export const IBIME_STUDENTS: DetailedStudent[] = [
  {
    id: 'std-ibime-montes-01',
    first_name: 'Iker Santiago',
    last_name_1: 'Morales',
    last_name_2: 'Peña',
    birth_date: '2015-03-12',
    curp: 'MOPI150312HDFR01',
    enrollment_id: 'IB-2026-M05',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-montes',
    campus_name: 'Campus Montes (Sede Matriz & CCH)',
    level: 'primaria',
    grade: '5º Primaria Bilingüe',
    email: 'iker.morales@ibime.edu.mx',
    phone: '55-4440-1009',
    tutor_name: 'Ing. Santiago Morales Domínguez',
    emergency_contact_name: 'Lucía Peña Aguilar',
    emergency_contact_phone: '55-4440-1009',
    blood_type: 'O+',
    medical_notes: 'Sin alergias médicas reportadas. Esquema de vacunación completo.',
    academic_notes: 'Excelente desempeño en Matemáticas y Robótica STEAM IBIME. Certificación Cambridge Starters aprobada con mérito.',
    scholarship_percentage: 40,
    scholarship_type: 'academica',
    average_grade: 9.8,
    status: 'activo',
    pending_payments: [],
    subject_grades: [
      { subject_name: 'Saberes y Pensamiento Científico (Matemáticas)', grade: 9.9 },
      { subject_name: 'Robótica STEAM y Presión Hidráulica', grade: 10.0 },
      { subject_name: 'Cambridge English Bicultural (Flyers)', grade: 9.8 },
      { subject_name: 'Proyecto Comunitario Sustentable NEM', grade: 9.5 }
    ],
    teacher_notes: [
      {
        id: 'tn-ibime-1',
        date: '2026-06-02',
        teacher_name: 'Prof. Patricia Sandoval Morales',
        note: 'Iker ha demostrado un dominio sobresaliente en el diseño del brazo hidráulico y la formulación del principio de Pascal. Felicitaciones por su liderazgo en el equipo de robótica STEAM de Campus Montes.',
        parent_reply: 'Muchas gracias Profesora Patricia, en casa estamos reforzando los modelos tridimensionales con Iker y está muy motivado.',
        replied_at: '2026-06-03T09:30:00.000Z'
      }
    ]
  },
  {
    id: 'std-ibime-montes-02',
    first_name: 'Camila Sophia',
    last_name_1: 'Herrera',
    last_name_2: 'Cruz',
    birth_date: '2019-08-20',
    curp: 'HECC190820MDFR02',
    enrollment_id: 'IB-2026-M01',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-montes',
    campus_name: 'Campus Montes (Sede Matriz & CCH)',
    level: 'primaria',
    grade: '1º Primaria Bilingüe',
    email: 'camila.herrera@ibime.edu.mx',
    phone: '55-4440-1012',
    tutor_name: 'Dra. Sophia Cruz Alarcón',
    emergency_contact_name: 'Rodrigo Herrera Galindo',
    emergency_contact_phone: '55-4440-1012',
    blood_type: 'A+',
    medical_notes: 'Sin alergias ni restricciones físicas.',
    academic_notes: 'Excelente adaptación al primer grado de Primaria Bilingüe IBIME y desarrollo lector.',
    scholarship_percentage: 10,
    scholarship_type: 'academica',
    average_grade: 9.5,
    status: 'activo',
    pending_payments: [],
    subject_grades: [
      { subject_name: 'Lectoescritura y Lenguajes NEM', grade: 9.6 },
      { subject_name: 'Pensamiento Matemático Inicial', grade: 9.4 },
      { subject_name: 'Phonics & English Immersion', grade: 9.6 },
      { subject_name: 'De lo Humano y lo Comunitario', grade: 9.4 }
    ]
  },
  {
    id: 'std-ibime-lagos-01',
    first_name: 'Ximena Valentina',
    last_name_1: 'Castillo',
    last_name_2: 'Ruiz',
    birth_date: '2017-05-14',
    curp: 'CARX170514MDFR03',
    enrollment_id: 'IB-2026-L03',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-lagos',
    campus_name: 'Campus Lagos (Fundador 2004)',
    level: 'primaria',
    grade: '3º Primaria Bilingüe',
    email: 'ximena.castillo@ibime.edu.mx',
    phone: '55-4440-1018',
    tutor_name: 'Lic. Valentina Ruiz Gómez',
    emergency_contact_name: 'Arturo Castillo Gómez',
    emergency_contact_phone: '55-4440-1018',
    blood_type: 'A+',
    medical_notes: 'Alergia estacional leve al polen primaveral controlada con antihistamínico.',
    academic_notes: 'Destacada participación en el Programa Bilingüe y proyectos comunitarios NEM.',
    scholarship_percentage: 30,
    scholarship_type: 'academica',
    average_grade: 9.7,
    status: 'activo',
    pending_payments: [],
    subject_grades: [
      { subject_name: 'Lenguajes y Comunicación Bilingüe', grade: 9.8 },
      { subject_name: 'Saberes y Pensamiento Científico', grade: 9.6 },
      { subject_name: 'Cambridge English Movers', grade: 9.8 },
      { subject_name: 'Ética, Naturaleza y Sociedades', grade: 9.6 }
    ]
  },
  {
    id: 'std-ibime-san-01',
    first_name: 'Mateo Emiliano',
    last_name_1: 'Navas',
    last_name_2: 'Mendoza',
    birth_date: '2012-09-08',
    curp: 'NAMM120908HDFR04',
    enrollment_id: 'IB-2026-SC02',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-sancristobal',
    campus_name: 'Campus San Cristóbal (Ecatepec Centro)',
    level: 'secundaria',
    grade: '2º Secundaria Tecnológica',
    email: 'mateo.navas@ibime.edu.mx',
    phone: '55-4440-1025',
    tutor_name: 'Arq. Emiliano Navas Pacheco',
    emergency_contact_name: 'Mariana Mendoza Vaca',
    emergency_contact_phone: '55-4440-1025',
    blood_type: 'B+',
    medical_notes: 'Sin antecedentes clínicos de riesgo.',
    academic_notes: 'Capitán de debate bilingüe y candidato a Certificación Cambridge KET.',
    scholarship_percentage: 20,
    scholarship_type: 'academica',
    average_grade: 9.4,
    status: 'activo',
    pending_payments: [],
    subject_grades: [
      { subject_name: 'Ciencias II (Física y Robótica)', grade: 9.5 },
      { subject_name: 'Matemáticas Secundaria', grade: 9.3 },
      { subject_name: 'Cambridge English KET', grade: 9.6 },
      { subject_name: 'Historia y Debate Bicultural', grade: 9.2 }
    ]
  },
  {
    id: 'std-ibime-coac-01',
    first_name: 'Regina Sofía',
    last_name_1: 'Albarrán',
    last_name_2: 'Cruz',
    birth_date: '2008-11-05',
    curp: 'AACR081105MDFR05',
    enrollment_id: 'IB-2026-C04',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-coacalco',
    campus_name: 'Campus Coacalco (Metropolitano)',
    level: 'preparatoria',
    grade: '4º Semestre CCH UNAM',
    email: 'regina.albarran@ibime.edu.mx',
    phone: '55-4440-1033',
    tutor_name: 'Mtro. Héctor Albarrán Morales',
    emergency_contact_name: 'Sofía Cruz Del Moral',
    emergency_contact_phone: '55-4440-1033',
    blood_type: 'O+',
    medical_notes: 'Sin alergias médicas reportadas.',
    academic_notes: 'Alumna #1 en promedio general en Bachillerato Incorporado CCH-UNAM. Excelencia en Ciencias Experimentales e Inglés FCE.',
    scholarship_percentage: 50,
    scholarship_type: 'academica',
    average_grade: 9.9,
    status: 'activo',
    pending_payments: [],
    subject_grades: [
      { subject_name: 'Cálculo y Física Experimental CCH-UNAM', grade: 10.0 },
      { subject_name: 'Química y Biología Molecular CCH', grade: 9.9 },
      { subject_name: 'Cambridge English First (FCE B2)', grade: 10.0 },
      { subject_name: 'Taller de Lectura y Análisis Histórico', grade: 9.7 }
    ]
  },
  {
    id: 'std-ibime-coac-02',
    first_name: 'Leonardo Daniel',
    last_name_1: 'Varela',
    last_name_2: 'Fuentes',
    birth_date: '2013-02-17',
    curp: 'VAFL130217HDFR06',
    enrollment_id: 'IB-2026-C01',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-coacalco',
    campus_name: 'Campus Coacalco (Metropolitano)',
    level: 'secundaria',
    grade: '1º Secundaria Bicultural',
    email: 'leonardo.varela@ibime.edu.mx',
    phone: '55-4440-1041',
    tutor_name: 'Lic. Daniel Varela Vega',
    emergency_contact_name: 'Karla Fuentes Romero',
    emergency_contact_phone: '55-4440-1041',
    blood_type: 'O+',
    medical_notes: 'Alergia alimentaria leve a los frutos secos (nueces y cacahuates).',
    academic_notes: 'Buen desempeño en Taller de Robótica STEAM IBIME.',
    scholarship_percentage: 0,
    scholarship_type: 'ninguna',
    average_grade: 9.3,
    status: 'activo',
    pending_payments: ['Colegiatura de Agosto 2026 (Extemporánea) - $4,680.00 MXN (Vencida)'],
    subject_grades: [
      { subject_name: 'Taller de Robótica STEAM IBIME', grade: 9.6 },
      { subject_name: 'Matemáticas I Secundaria', grade: 9.1 },
      { subject_name: 'Inglés Bicultural PET', grade: 9.3 },
      { subject_name: 'Biología y Sustentabilidad NEM', grade: 9.2 }
    ]
  }
];

export const IBIME_TEACHERS: UserProfile[] = [
  {
    id: 'usr-ibime-dir-general',
    first_name: 'Patricia',
    last_name: 'Sandoval Morales',
    email: 'patricia.sandoval@ibime.edu.mx',
    role: 'director',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-montes',
    campus_name: 'Campus Montes (Sede Matriz & CCH)',
    created_at: '2026-01-01T08:00:00.000Z',
    updated_at: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-ibime-prof-gaby',
    first_name: 'Gabriela',
    last_name: 'Morales',
    email: 'gaby.morales@ibime.edu.mx',
    role: 'teacher',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-montes',
    campus_name: 'Campus Montes (Sede Matriz & CCH)',
    created_at: '2026-01-05T08:00:00.000Z',
    updated_at: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'usr-ibime-prof-carlos',
    first_name: 'Carlos',
    last_name: 'Mendoza',
    email: 'carlos.mendoza@ibime.edu.mx',
    role: 'teacher',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-sancristobal',
    campus_name: 'Campus San Cristóbal (Ecatepec Centro)',
    created_at: '2026-01-05T08:00:00.000Z',
    updated_at: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'usr-ibime-prof-marco',
    first_name: 'Marco Antonio',
    last_name: 'Ruiz Peralta',
    email: 'marco.ruiz@ibime.edu.mx',
    role: 'teacher',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-coacalco',
    campus_name: 'Campus Coacalco (Metropolitano)',
    created_at: '2026-01-05T08:00:00.000Z',
    updated_at: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'usr-ibime-prof-daniela',
    first_name: 'Daniela',
    last_name: 'Romero Flores',
    email: 'daniela.romero@ibime.edu.mx',
    role: 'teacher',
    school_id: 'sch-ibime',
    campus_id: 'cmp-ibime-lagos',
    campus_name: 'Campus Lagos (Fundador 2004)',
    created_at: '2026-01-05T08:00:00.000Z',
    updated_at: '2026-01-05T08:00:00.000Z'
  }
];

export const IBIME_SUBJECTS: Subject[] = [
  { id: 'sub-ibime-esp-pri', school_id: 'sch-ibime', level_grade_id: 'primaria', name: 'Lenguajes y Comunicación SEP NEM', sep_code: 'IB-LEN-PRI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-mat-pri', school_id: 'sch-ibime', level_grade_id: 'primaria', name: 'Saberes y Pensamiento Científico (Matemáticas)', sep_code: 'IB-MAT-PRI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-cambridge-pri', school_id: 'sch-ibime', level_grade_id: 'primaria', name: 'Cambridge English (Starters / Movers / Flyers)', sep_code: 'IB-CAM-PRI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-steam-pri', school_id: 'sch-ibime', level_grade_id: 'primaria', name: 'Ciencias Naturales & Laboratorio STEAM', sep_code: 'IB-STM-PRI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-soc-pri', school_id: 'sch-ibime', level_grade_id: 'primaria', name: 'Ética, Naturaleza y Sociedades (Historia y Geografía)', sep_code: 'IB-SOC-PRI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-hum-pri', school_id: 'sch-ibime', level_grade_id: 'primaria', name: 'De lo Humano y lo Comunitario (Formación en Valores)', sep_code: 'IB-HUM-PRI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },

  { id: 'sub-ibime-esp-sec', school_id: 'sch-ibime', level_grade_id: 'secundaria', name: 'Lengua Materna (Español Avanzado)', sep_code: 'IB-LEN-SEC', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-mat-sec', school_id: 'sch-ibime', level_grade_id: 'secundaria', name: 'Matemáticas y Razonamiento Lógico', sep_code: 'IB-MAT-SEC', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-cambridge-sec', school_id: 'sch-ibime', level_grade_id: 'secundaria', name: 'Cambridge English B1 Preliminary / B2 First', sep_code: 'IB-CAM-SEC', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-fis-sec', school_id: 'sch-ibime', level_grade_id: 'secundaria', name: 'Física y Métodos Experimentales', sep_code: 'IB-FIS-SEC', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-fcye-sec', school_id: 'sch-ibime', level_grade_id: 'secundaria', name: 'Formación Cívica y Ética', sep_code: 'IB-FCY-SEC', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },

  { id: 'sub-ibime-cch-bio', school_id: 'sch-ibime', level_grade_id: 'preparatoria', name: 'Biología I-IV (Programa CCH UNAM)', sep_code: 'UNAM-CCH-BIO', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-cch-mat', school_id: 'sch-ibime', level_grade_id: 'preparatoria', name: 'Matemáticas y Cálculo CCH UNAM', sep_code: 'UNAM-CCH-MAT', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-cch-qui', school_id: 'sch-ibime', level_grade_id: 'preparatoria', name: 'Química Teórico-Práctica CCH UNAM', sep_code: 'UNAM-CCH-QUI', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-cch-tlriid', school_id: 'sch-ibime', level_grade_id: 'preparatoria', name: 'Taller de Lectura, Redacción e Inv. Documental (TLRIID CCH)', sep_code: 'UNAM-CCH-TLR', category: 'curricular', is_elective: false, created_at: new Date().toISOString() },
  { id: 'sub-ibime-cch-fil', school_id: 'sch-ibime', level_grade_id: 'preparatoria', name: 'Filosofía y Temas Selectos de Humanidades UNAM', sep_code: 'UNAM-CCH-FIL', category: 'curricular', is_elective: false, created_at: new Date().toISOString() }
];

export const IBIME_PAYROLL: IbimePayrollRecord[] = [
  { id: 'pay-ib-01', school_id: 'sch-ibime', employee_name: 'Lic. Patricia Sandoval Morales', role: 'director', position_title: 'Dirección General IBIME Campus Montes & CCH', campus_name: 'Campus Montes (Sede Matriz & CCH)', base_salary: 38000, net_salary: 32000, biweekly_amount: 32000, status: 'pagado', period: 'Quincena 1 - Octubre 2026' },
  { id: 'pay-ib-02', school_id: 'sch-ibime', employee_name: 'Prof. Gabriela Morales', role: 'teacher', position_title: 'Coordinación Bilingüe Cambridge', campus_name: 'Campus Montes', base_salary: 22000, net_salary: 18500, biweekly_amount: 18500, status: 'pagado', period: 'Quincena 1 - Octubre 2026' },
  { id: 'pay-ib-03', school_id: 'sch-ibime', employee_name: 'Prof. Carlos Mendoza', role: 'teacher', position_title: 'Docente Ciencias & Robótica STEAM', campus_name: 'Campus San Cristóbal', base_salary: 19000, net_salary: 16000, biweekly_amount: 16000, status: 'pagado', period: 'Quincena 1 - Octubre 2026' },
  { id: 'pay-ib-04', school_id: 'sch-ibime', employee_name: 'Lic. Marco Antonio Ruiz Peralta', role: 'teacher', position_title: 'Docente CCH UNAM Humanidades', campus_name: 'Campus Coacalco', base_salary: 20500, net_salary: 17200, biweekly_amount: 17200, status: 'pagado', period: 'Quincena 1 - Octubre 2026' },
  { id: 'pay-ib-05', school_id: 'sch-ibime', employee_name: 'Mtra. Daniela Romero Flores', role: 'teacher', position_title: 'Docente Primaria Bilingüe', campus_name: 'Campus Lagos', base_salary: 18500, net_salary: 15500, biweekly_amount: 15500, status: 'pagado', period: 'Quincena 1 - Octubre 2026' }
];

export class IbimeCatalogService {
  public static getCampuses(): Campus[] {
    return IBIME_CAMPUSES;
  }

  public static getStudents(campusId?: string, level?: string): DetailedStudent[] {
    return IBIME_STUDENTS.filter(std => {
      const matchCampus = !campusId || campusId === 'all' || std.campus_id === campusId;
      const matchLevel = !level || level === 'all' || std.level === level;
      return matchCampus && matchLevel;
    });
  }

  public static getTeachers(campusId?: string): UserProfile[] {
    return IBIME_TEACHERS.filter(tch => {
      if (!campusId || campusId === 'all') return true;
      return tch.campus_id === campusId;
    });
  }

  public static getSubjects(levelGradeId?: string): Subject[] {
    if (!levelGradeId || levelGradeId === 'all') return IBIME_SUBJECTS;
    return IBIME_SUBJECTS.filter(s => s.level_grade_id === levelGradeId);
  }

  public static getPayroll(): IbimePayrollRecord[] {
    return IBIME_PAYROLL;
  }
}
