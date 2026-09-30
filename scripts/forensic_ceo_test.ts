import { executeAnalyticQuery } from '../src/services/executiveAnalyticsEngine';
import { 
  DETAILED_STUDENTS_SEED, 
  SUBJECTS_SEED, 
  PARENT_MESSAGES_SEED, 
  TEACHERS_LIST_SEED,
  CAMPUSES_SEED,
  GROUPS_SEED,
  ATTENDANCE_SEED,
  BILLING_RECORDS_SEED,
  STAFF_PAYROLL_SEED,
  INSTITUTIONS_SEED
} from '../src/store/seeds';

const sourcesIbime = {
  schoolId: 'sch-ibime',
  isSuperUser: true,
  institutionsList: INSTITUTIONS_SEED,
  detailedStudents: DETAILED_STUDENTS_SEED,
  campusesList: CAMPUSES_SEED,
  groupsList: GROUPS_SEED,
  attendanceList: ATTENDANCE_SEED,
  billingRecords: BILLING_RECORDS_SEED,
  staffPayroll: STAFF_PAYROLL_SEED,
  teachersList: TEACHERS_LIST_SEED,
  subjectsList: SUBJECTS_SEED,
  parentMessages: PARENT_MESSAGES_SEED
};

const sourcesDemo = {
  schoolId: 'sch-test-case',
  isSuperUser: false,
  institutionsList: INSTITUTIONS_SEED,
  detailedStudents: DETAILED_STUDENTS_SEED,
  campusesList: CAMPUSES_SEED,
  groupsList: GROUPS_SEED,
  attendanceList: ATTENDANCE_SEED,
  billingRecords: BILLING_RECORDS_SEED,
  staffPayroll: STAFF_PAYROLL_SEED,
  teachersList: TEACHERS_LIST_SEED,
  subjectsList: SUBJECTS_SEED,
  parentMessages: PARENT_MESSAGES_SEED
};

const queriesToTest = [
  // 1. Dinero / Económicos
  { q: 'cuanto dinero ingresa al mes', expected: ['FINANCIAL_SUMMARY', 'MONTHLY_COMPARISON'] },
  { q: 'cual es el margen de ganancia', expected: ['FINANCIAL_SUMMARY', 'CAMPUSES_GROUPS'] },
  { q: 'cuanto se factura mensualmente', expected: ['FINANCIAL_SUMMARY', 'CAMPUSES_GROUPS'] },
  { q: 'flujo de caja del consorcio', expected: ['FINANCIAL_SUMMARY', 'MONTHLY_COMPARISON'] },
  { q: 'ingresos vs egresos', expected: ['FINANCIAL_SUMMARY', 'MONTHLY_COMPARISON'] },
  { q: 'que colegio gana mas', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que colegio gana menos', expected: ['CAMPUSES_GROUPS'] },
  { q: 'cual es el plantel con mayor rentabilidad', expected: ['CAMPUSES_GROUPS'] },
  { q: 'cual es el plantel con menor rentabilidad', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que plantel tiene mayor margen ebitda', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que plantel tiene menor margen ebitda', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que plantel factura mas dinero', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que plantel factura menos dinero', expected: ['CAMPUSES_GROUPS'] },

  // 2. Morosidad / Adeudos
  { q: 'quien debe colegiatura', expected: ['DEBTS_BILLING'] },
  { q: 'quienes son los alumnos con adeudo', expected: ['DEBTS_BILLING'] },
  { q: 'cuanto dinero se debe en total', expected: ['DEBTS_BILLING'] },
  { q: 'cartera vencida del colegio', expected: ['DEBTS_BILLING'] },
  { q: 'quien es el alumno que debe mas dinero', expected: ['DEBTS_BILLING'] },
  { q: 'quien debe menos dinero', expected: ['DEBTS_BILLING'] },

  // 3. Profesores / Plantilla
  { q: 'cuantos profesores tenemos', expected: ['FACULTY_DIRECTORY'] },
  { q: 'quien es el profesor de mayor edad', expected: ['FACULTY_DIRECTORY'] },
  { q: 'quien es el profesor mas joven', expected: ['FACULTY_DIRECTORY'] },
  { q: 'plantilla de profesores y materias', expected: ['FACULTY_DIRECTORY'] },
  { q: 'edades de los profesores', expected: ['FACULTY_DIRECTORY'] },

  // 4. Nóminas / Sueldos
  { q: 'cuanto pagamos de nomina al mes', expected: ['STAFF_PAYROLL'] },
  { q: 'quien gana mas de los empleados', expected: ['STAFF_PAYROLL'] },
  { q: 'quien gana menos de los colaboradores', expected: ['STAFF_PAYROLL'] },
  { q: 'cual es el sueldo promedio de los profesores', expected: ['STAFF_PAYROLL'] },
  { q: 'desglose de nomina por colaborador', expected: ['STAFF_PAYROLL'] },
  { q: 'comparativa de ingresos contra nomina', expected: ['FINANCIAL_SUMMARY', 'STAFF_PAYROLL'] },

  // 5. Alumnos / Matrícula
  { q: 'cuantos alumnos tenemos en total', expected: ['STUDENTS_DIRECTORY'] },
  { q: 'cuantos alumnos hay en primaria', expected: ['STUDENTS_DIRECTORY'] },
  { q: 'cual es la capacidad de los planteles', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que plantel tiene mas alumnos', expected: ['CAMPUSES_GROUPS'] },
  { q: 'que plantel tiene menos alumnos', expected: ['CAMPUSES_GROUPS'] },
  { q: 'alumnos dados de baja', expected: ['STUDENT_DELETIONS_AUDIT'] },
  { q: 'auditoria de bajas de alumnos', expected: ['STUDENT_DELETIONS_AUDIT'] },

  // 6. Calificaciones / Académico
  { q: 'promedio general de calificaciones', expected: ['ACADEMIC_GRADES_ASSESSMENT'] },
  { q: 'quien tiene el mejor promedio', expected: ['ACADEMIC_GRADES_ASSESSMENT'] },
  { q: 'quien tiene el peor promedio', expected: ['ACADEMIC_GRADES_ASSESSMENT'] },
  { q: 'alumno con menor promedio', expected: ['ACADEMIC_GRADES_ASSESSMENT'] },
  { q: 'alumnos en cuadro de honor', expected: ['ACADEMIC_GRADES_ASSESSMENT'] },

  // 7. Asistencias
  { q: 'indice de asistencia escolar', expected: ['ATTENDANCE'] },
  { q: 'que grupo tiene mas faltas', expected: ['ATTENDANCE'] },
  { q: 'cual es el alumno con mas inasistencias', expected: ['ATTENDANCE'] },
  { q: 'quien tiene mas retardos', expected: ['ATTENDANCE'] },

  // 8. Información / Materias
  { q: 'que materias se imparten en el colegio', expected: ['CURRICULUM_SUBJECTS'] },
  { q: 'que talleres extracurriculares hay', expected: ['CURRICULUM_SUBJECTS'] },
  { q: 'han contestado los papas los recados', expected: ['PARENT_COMMUNICATION_REPLIES'] },
  { q: 'cumpleaños de este mes', expected: ['BIRTHDAYS_CALENDAR'] },

  // 9. Consultas Críticas de Matrícula, Facturación, Nómina y Comparativa Multi-Plantel
  { q: 'cual es la matricula de mi mayor plantel', expected: ['CAMPUSES_GROUPS'], expectedContent: '1,620' },
  { q: 'cuales la matricula de mi mayor plantel', expected: ['CAMPUSES_GROUPS'], expectedContent: '1,620' },
  { q: 'cual es el colegio mas grande', expected: ['CAMPUSES_GROUPS'], expectedContent: '1,620' },
  { q: 'plantel con menor matricula', expected: ['CAMPUSES_GROUPS'], expectedContent: '420' },
  { q: 'cual es la facturacion de mis colegios', expected: ['CAMPUSES_GROUPS'], expectedContent: '$5,000,000' },
  { q: 'cual fue la facturacion de mi colegio mas grande', expected: ['CAMPUSES_GROUPS'], expectedContent: '$2,180,000' },
  { q: 'cual es la nomina de mis 2 planteles con mas alumnos', expected: ['CAMPUSES_GROUPS'], expectedContent: '$1,880,000' },
  { q: 'comparativa entre alumnos, profesores, colegios y fases', expected: ['CAMPUSES_GROUPS'], expectedContent: 'Ecosistema' },

  // 10. Directorio Oficial y Expedientes 360°
  { q: 'Directorio oficial de alumnos', expected: ['STUDENTS_DIRECTORY'], expectedContent: 'Directorio Oficial' },
  { q: 'directorio de alumnos', expected: ['STUDENTS_DIRECTORY'] },
  { q: 'padron oficial de alumnos', expected: ['STUDENTS_DIRECTORY'] },
  { q: 'censo de alumnos', expected: ['STUDENTS_DIRECTORY'] },
  { q: 'tutor de Diego Vargas', expected: ['STUDENT_LOOKUP'], expectedContent: 'Diego' },
  { q: '¿Qué edad tiene Santi?', expected: ['STUDENT_LOOKUP'], expectedContent: 'Santi' },
  { q: 'alergias de Diego', expected: ['STUDENT_LOOKUP'], expectedContent: 'Diego' },

  // 11. Comparativa Forense entre Alumnos
  { q: 'comparativa entre Santi y Diego', expected: ['STUDENTS_COMPARISON'], expectedContent: 'Santi' },
  { q: 'quién tiene mejor promedio entre Santi y Elena', expected: ['STUDENTS_COMPARISON'], expectedContent: 'Santi' },
  { q: 'comparar alumnos Santi y Diego', expected: ['STUDENTS_COMPARISON'], expectedContent: 'Comparativa' },
  { q: 'Santi vs Diego', expected: ['STUDENTS_COMPARISON'], expectedContent: 'Comparativa' },
  { q: 'comparativa de alumnos', expected: ['STUDENTS_COMPARISON'], expectedContent: 'Comparativa' }
];

console.log('--- INICIO DE PRUEBAS FORENSES CEO ---');
let passed = 0;
let failed = 0;

for (const t of queriesToTest) {
  const res = executeAnalyticQuery(t.q, sourcesIbime);
  const domainOk = t.expected.includes(res.domain);
  const contentOk = !t.expectedContent || 
    (res.directAnswer && res.directAnswer.includes(t.expectedContent)) || 
    res.reportTitle.includes(t.expectedContent) ||
    res.kpis.some(k => k.value.includes(t.expectedContent) || (k.subtext && k.subtext.includes(t.expectedContent)));
  
  if (domainOk && contentOk) {
    passed++;
    console.log(`[OK] "${t.q}" -> Domain: ${res.domain} | Title: ${res.reportTitle}`);
  } else {
    failed++;
    console.error(`[FAIL] "${t.q}" -> Obtenido: ${res.domain} | Esperado: ${t.expected.join(' o ')} | ContentOk: ${contentOk} (buscando '${t.expectedContent}') | Title: ${res.reportTitle}`);
  }
}

console.log(`\nRESUMEN: ${passed} APROBADAS, ${failed} FALLADAS de ${queriesToTest.length} consultas.`);
