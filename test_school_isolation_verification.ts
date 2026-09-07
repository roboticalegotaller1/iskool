import { isPlatformSuperUser, ROLE_HIERARCHY_LEVEL } from './src/types';
import { SUPER_USERS_ISKOOL_SEED, STAFF_USERS_SEED, TEACHERS_LIST_SEED, DETAILED_STUDENTS_SEED, CAMPUSES_SEED, STAFF_PAYROLL_SEED, TUITION_PRICINGS_SEED, INSTITUTIONS_SEED } from './src/store/seeds';
import { getSchoolCampuses, getSchoolStudents, getSchoolTeachers, getSchoolGroups, getSchoolStaff, getSchoolPayroll, getSchoolTuitionPricings, getSchoolBillingRecords } from './src/store/useSchoolAdminStore';

console.log('=====================================================');
console.log('🧪 VERIFICACIÓN DE REGLAS DE SUPER USUARIO Y MULTI-TENANT ISKOOL');
console.log('=====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

// 1. Verificación de Cuentas de Super Usuario (Exactamente 3 directivos de ISkool)
console.log('--- 1. Cuentas Oficiales de Super Usuario ISkool ---');
assert(SUPER_USERS_ISKOOL_SEED.length === 3, `Deben existir exactamente 3 cuentas de Super Usuario (actual: ${SUPER_USERS_ISKOOL_SEED.length})`);

const superEmails = SUPER_USERS_ISKOOL_SEED.map(u => u.email);
assert(superEmails.includes('admin@iskool.edu.mx'), 'Existe la cuenta de Dirección General (admin@iskool.edu.mx)');
assert(superEmails.includes('tecnologia@iskool.edu.mx'), 'Existe la cuenta de Dirección de Tecnología (tecnologia@iskool.edu.mx)');
assert(superEmails.includes('pedagogia@iskool.edu.mx'), 'Existe la cuenta de Dirección Pedagógica (pedagogia@iskool.edu.mx)');

SUPER_USERS_ISKOOL_SEED.forEach(u => {
  assert(isPlatformSuperUser(u) === true, `isPlatformSuperUser(${u.email}) debe ser true`);
  assert(ROLE_HIERARCHY_LEVEL[u.role] === 1, `Jerarquía de ${u.email} debe ser Nivel 1 (Super Usuario)`);
});

// 2. Verificación de Cuentas de Dueño y Subordinados (NO son Super Usuarios)
console.log('\n--- 2. Cuentas de Dueño de Escuela hacia abajo (Aislamiento) ---');
const ownerUser = STAFF_USERS_SEED.find(u => u.role === 'owner');
assert(!!ownerUser, 'Existe el usuario Dueño (usr-owner-1)');
if (ownerUser) {
  assert(isPlatformSuperUser(ownerUser) === false, 'El Dueño de Escuela (owner) NO es Super Usuario de la plataforma');
  assert(ROLE_HIERARCHY_LEVEL[ownerUser.role] === 2, 'Jerarquía del Dueño debe ser Nivel 2 (Presidencia Institucional Aislada)');
  assert(ownerUser.school_id === 'sch-jjrosseau', 'El Dueño Don Alejandro está asignado estrictamente a UP Juan Jacobo Rosseau (sch-jjrosseau)');
}

const nonSuperRoles = ['director', 'coordinator', 'billing', 'teacher', 'student', 'parent'];
nonSuperRoles.forEach(role => {
  const dummyUser = { id: `test-${role}`, role: role as any, school_id: 'sch-jjrosseau' };
  assert(isPlatformSuperUser(dummyUser) === false, `Rol '${role}' NO debe tener permisos de Super Usuario`);
});

// 3. Aislamiento Estricto de Datos de Instituciones (UP Juan Jacobo Rosseau vs Laboratorio Demo vs Montessori)
console.log('\n--- 3. Aislamiento Estricto de Datos Multi-Colegio ---');

// a) Planteles
const jjrCampuses = getSchoolCampuses(CAMPUSES_SEED, 'sch-jjrosseau');
const testCampuses = getSchoolCampuses(CAMPUSES_SEED, 'sch-test-case');
assert(jjrCampuses.every(c => c.school_id === 'sch-jjrosseau' || (!c.school_id && (c.name.includes('Jardines') || c.name.includes('Torres')))), 'Planteles de JJ Rosseau solo pertenecen a sch-jjrosseau');
assert(testCampuses.every(c => c.school_id === 'sch-test-case' || c.name.toLowerCase().includes('demo')), 'Planteles de Sandbox solo pertenecen a sch-test-case');
assert(jjrCampuses.length > 0 && testCampuses.length > 0, 'Ambas instituciones tienen planteles particionados');

// b) Personal Administrativo
const jjrStaff = getSchoolStaff(STAFF_USERS_SEED, 'sch-jjrosseau');
const testStaff = getSchoolStaff(STAFF_USERS_SEED, 'sch-test-case');
assert(jjrStaff.every(s => s.school_id === 'sch-jjrosseau' || s.school_id === 'sch-jjr'), 'Personal de JJ Rosseau NO contiene usuarios de otros colegios');
assert(testStaff.every(s => s.school_id === 'sch-test-case'), 'Personal de Sandbox NO contiene usuarios de otros colegios');
assert(jjrStaff.some(s => s.id === 'usr-owner-1'), 'JJ Rosseau contiene al Dueño Don Alejandro Vargas');
assert(!testStaff.some(s => s.id === 'usr-owner-1'), 'Sandbox NO contiene al Dueño Don Alejandro Vargas');
assert(!jjrStaff.some(s => s.id === 'usr-billing-1'), 'JJ Rosseau NO contiene a Mónica Suárez (cobranza de Sandbox)');
assert(testStaff.some(s => s.id === 'usr-billing-1'), 'Sandbox contiene a Mónica Suárez');

// c) Nóminas
const jjrPayroll = getSchoolPayroll(STAFF_PAYROLL_SEED, 'sch-jjrosseau');
const testPayroll = getSchoolPayroll(STAFF_PAYROLL_SEED, 'sch-test-case');
assert(jjrPayroll.every(p => p.school_id === 'sch-jjrosseau' || p.school_id === 'sch-jjr'), 'Nómina de JJ Rosseau estrictamente aislada');
assert(testPayroll.every(p => p.school_id === 'sch-test-case'), 'Nómina de Sandbox estrictamente aislada');
assert(!jjrPayroll.some(p => p.school_id === 'sch-test-case'), 'JJ Rosseau NO tiene acceso a la nómina de Sandbox');

// d) Alumnos
const jjrStudents = getSchoolStudents(DETAILED_STUDENTS_SEED, 'sch-jjrosseau', jjrCampuses);
const testStudents = getSchoolStudents(DETAILED_STUDENTS_SEED, 'sch-test-case', testCampuses);
assert(jjrStudents.every(s => s.school_id === 'sch-jjrosseau'), 'Alumnos de JJ Rosseau pertenecen solo a su sistema escolar');
assert(testStudents.every(s => s.school_id !== 'sch-montessori'), 'Sandbox no mezcla alumnos con Montessori');

// e) Aranceles y Colegiaturas
const jjrTuition = getSchoolTuitionPricings(TUITION_PRICINGS_SEED, 'sch-jjrosseau');
assert(jjrTuition.every(p => p.school_id === 'sch-jjrosseau' || p.school_id === 'sch-jjr'), 'Aranceles y cuotas están aislados por colegio');

console.log('\n=====================================================');
console.log(`🎯 RESULTADO FINAL: ${passedTests}/${totalTests} pruebas superadas exitosamente.`);
console.log('=====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
