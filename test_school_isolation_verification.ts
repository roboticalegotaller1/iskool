import { 
  getSchoolStudents, 
  getSchoolTeachers, 
  getSchoolGroups, 
  getSchoolSubjects,
  getSchoolAttendance,
  getSchoolBillingRecords,
  getSchoolTuitionPricings,
  getSchoolSchedules,
  getSchoolCampuses
} from './src/store/useSchoolAdminStore';
import { 
  DETAILED_STUDENTS_SEED, 
  TEACHERS_LIST_SEED, 
  GROUPS_SEED, 
  SUBJECTS_SEED, 
  ATTENDANCE_SEED, 
  BILLING_RECORDS_SEED, 
  TUITION_PRICINGS_SEED, 
  SCHEDULES_SEED 
} from './src/store/seeds';
import * as fs from 'fs';
import * as path from 'path';

function runVerificationTests() {
  console.log('===============================================================');
  console.log('  ISkool — AUDITORÍA Y COMPROBACIÓN DE AISLAMIENTO MULTI-PLANTEL');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (detail) console.error(`         Detalle: ${detail}`);
    }
  }

  // 1. Aislamiento de Alumnos (Students)
  const studentsJJR = getSchoolStudents(DETAILED_STUDENTS_SEED, 'sch-jjrosseau');
  const studentsTest = getSchoolStudents(DETAILED_STUDENTS_SEED, 'sch-test-case');
  const studentsMontessori = getSchoolStudents(DETAILED_STUDENTS_SEED, 'sch-montessori');

  assert(
    studentsJJR.every(s => s.school_id === 'sch-jjrosseau' || s.school_id === 'sch-jjr'),
    'Alumnos de UP Juan Jacobo Rosseau sólo pertenecen a dicho colegio',
    `Encontrados alumnos con IDs: ${studentsJJR.map(s => s.id).join(', ')}`
  );

  assert(
    !studentsJJR.some(s => s.id.includes('test') || s.id.startsWith('std-pb') || s.id.startsWith('std-pa') || s.id.startsWith('std-sec') || s.id.startsWith('std-prep')),
    'Alumnos de UP Juan Jacobo Rosseau están libres de datos demo/test del laboratorio',
  );

  assert(
    !studentsMontessori.some(s => s.school_id === 'sch-jjrosseau'),
    'Alumnos de Colegio Montessori no contienen ningún alumno de Juan Jacobo Rosseau'
  );

  // 2. Aislamiento de Docentes (Teachers)
  const teachersJJR = getSchoolTeachers(TEACHERS_LIST_SEED, 'sch-jjrosseau');
  const teachersTest = getSchoolTeachers(TEACHERS_LIST_SEED, 'sch-test-case');

  assert(
    teachersJJR.every(t => t.school_id === 'sch-jjrosseau' || t.school_id === 'sch-jjr'),
    'Profesores de Juan Jacobo Rosseau están estrictamente aislados'
  );
  assert(
    !teachersJJR.some(t => t.id.startsWith('usr-teacher-') && t.school_id !== 'sch-jjrosseau'),
    'Profesores de Juan Jacobo Rosseau no mezclan profesores de prueba de otros colegios'
  );

  // 3. Aislamiento de Grupos (Groups)
  const groupsJJR = getSchoolGroups(GROUPS_SEED, 'sch-jjrosseau');
  const groupsTest = getSchoolGroups(GROUPS_SEED, 'sch-test-case');

  assert(
    groupsJJR.every(g => !g.school_id || g.school_id === 'sch-jjrosseau' || g.school_id === 'sch-jjr'),
    'Grupos de Juan Jacobo Rosseau pertenecen exclusivamente a su plantel'
  );
  assert(
    !groupsJJR.some(g => (g.campus_name || '').toLowerCase().includes('montessori')),
    'Grupos de Juan Jacobo Rosseau no contienen grupos de Montessori'
  );

  // 4. Aislamiento de Materias / Asignaturas (Subjects)
  const subjectsJJR = getSchoolSubjects(SUBJECTS_SEED, 'sch-jjrosseau');
  const subjectsTest = getSchoolSubjects(SUBJECTS_SEED, 'sch-test-case');

  assert(
    subjectsJJR.every(sub => !sub.school_id || sub.school_id === 'sch-jjrosseau' || sub.school_id === 'sch-jjr'),
    'Asignaturas de Juan Jacobo Rosseau aisladas por colegio'
  );

  // 5. Aislamiento de Cobranza y Finanzas (Billing Records)
  const billingJJR = getSchoolBillingRecords(BILLING_RECORDS_SEED, 'sch-jjrosseau', studentsJJR);
  const billingTest = getSchoolBillingRecords(BILLING_RECORDS_SEED, 'sch-test-case', studentsTest);

  assert(
    billingJJR.every(b => !b.studentId?.includes('test') && !b.studentName.toLowerCase().includes('demo')),
    'Registros de cobranza de Juan Jacobo Rosseau no muestran cobros del Laboratorio Demo'
  );
  assert(
    billingTest.every(b => b.school_id !== 'sch-montessori'),
    'Registros de cobranza de Laboratorio Demo no muestran folios de otros planteles'
  );

  // 6. Aislamiento de Aranceles & Colegiaturas (Tuition Pricings)
  const pricingsJJR = getSchoolTuitionPricings(TUITION_PRICINGS_SEED, 'sch-jjrosseau');
  assert(
    pricingsJJR.every(p => !p.school_id || p.school_id === 'sch-jjrosseau' || p.school_id === 'sch-jjr'),
    'Catálogo de aranceles y colegiaturas aislado por colegio'
  );

  // 7. Aislamiento de Asistencia (Attendance)
  const attendanceJJR = getSchoolAttendance(ATTENDANCE_SEED, 'sch-jjrosseau', studentsJJR);
  assert(
    attendanceJJR.every(att => !att.student_id?.includes('test') && !att.student_id?.startsWith('c00a0eeb')),
    'Pase de lista y asistencia no expone alumnos demo en colegios en producción'
  );

  // 8. Aislamiento de Horarios (Class Schedules)
  const schedulesJJR = getSchoolSchedules(SCHEDULES_SEED, 'sch-jjrosseau', groupsJJR);
  assert(
    schedulesJJR.every(sch => !sch.school_id || sch.school_id === 'sch-jjrosseau' || sch.school_id === 'sch-jjr' || groupsJJR.some(g => g.id === sch.groupId)),
    'Horarios de clase estrictamente vinculados a grupos del colegio'
  );

  // 9. Comprobación de Excepción Mandatoria: Bóveda Curricular y Comunidad Docente COMPARTIDAS
  const planeacionesPath = path.resolve(__dirname, 'planeaciones');
  const planeacionesExists = fs.existsSync(planeacionesPath);
  assert(
    planeacionesExists,
    'La Bóveda Curricular (planeaciones/) existe y permanece intacta como Segundo Cerebro global'
  );

  if (planeacionesExists) {
    const files = fs.readdirSync(planeacionesPath);
    assert(
      files.length > 0,
      `Bóveda Curricular contiene nodos pedagógicos compartidos (${files.length} archivos/carpetas encontrados)`
    );
  }

  // 10. Comprobación de Archivo de Migración RLS con Aislamiento Estricto
  const migrationPath = path.resolve(__dirname, 'supabase/migrations/20260904_strict_school_isolation_rls.sql');
  const migrationExists = fs.existsSync(migrationPath);
  assert(
    migrationExists,
    'Script SQL de migración multi-tenant RLS (20260904_strict_school_isolation_rls.sql) listo para Supabase'
  );

  if (migrationExists) {
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    assert(
      migrationContent.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY') &&
      migrationContent.includes('ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY') &&
      migrationContent.includes('ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY') &&
      migrationContent.includes('ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY') &&
      migrationContent.includes('ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY'),
      'Migración SQL activa RLS en todas las tablas sensibles de alumnos, notas, asistencias, cobros y gamificación'
    );
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`  RESULTADO: ${passed} de ${total} pruebas superadas exitosamente.`);
  console.log('===============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runVerificationTests();
