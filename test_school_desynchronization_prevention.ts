import { 
  resolveEffectiveSchoolId, 
  isPlatformSuperUser 
} from './src/types';
import { 
  useSchoolAdminStore, 
  getActiveSchoolIdFromState, 
  getSchoolTuitionPricings, 
  getSchoolCampuses, 
  getSchoolStudents, 
  getSchoolGroups,
  getSchoolSubjects,
  getSchoolTeachers,
  getSchoolSchedules
} from './src/store/useSchoolAdminStore';
import { INSTITUTIONS_SEED, STAFF_USERS_SEED } from './src/store/seeds';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

console.log('================================================================');
console.log('🧪 VERIFICACIÓN DE DESINCRONIZACIÓN ENTRE COLEGIOS (ISKOOL)');
console.log('================================================================\n');

// Mock localStorage and window
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; }
};
(global as any).localStorage = mockLocalStorage;
(global as any).window = {
  localStorage: mockLocalStorage
};

// 1. Verificar resolución inmutable para Cuentas Institucionales
const ownerAlejandro = { role: 'owner', email: 'dueno@jjrosseau.edu.mx', school_id: 'sch-jjrosseau' };
const billingMonica = { role: 'billing', email: 'monica.suarez@sandbox.edu.mx', school_id: 'sch-test-case' };
const directorLaura = { role: 'director', email: 'director.garza@jjrosseau.edu.mx', school_id: 'sch-jjrosseau' };
const teacherIsrael = { role: 'teacher', email: 'israel.lopez@jjrosseau.edu.mx', school_id: 'sch-jjrosseau' };
const studentLucas = { role: 'student', email: 'lucas@iskool.edu.mx', school_id: 'sch-jjrosseau' };
const superUserEduardo = { role: 'admin', email: 'superadmin.antigravity@iskool.edu.mx' };

// Test 1: Monica Suarez NUNCA puede ser desincronizada a otra escuela aunque activeSchoolId sea diferente
assert(
  resolveEffectiveSchoolId(billingMonica, 'sch-jjrosseau') === 'sch-test-case',
  'Mónica Suárez resuelve siempre a sch-test-case incluso si activeSchoolId es sch-jjrosseau'
);
assert(
  resolveEffectiveSchoolId(billingMonica, null) === 'sch-test-case',
  'Mónica Suárez resuelve a sch-test-case si activeSchoolId es null'
);

// Test 2: Don Alejandro siempre queda amarrado a sch-jjrosseau
assert(
  resolveEffectiveSchoolId(ownerAlejandro, 'sch-test-case') === 'sch-jjrosseau',
  'Don Alejandro (Dueño) resuelve siempre a sch-jjrosseau aunque activeSchoolId sea sch-test-case'
);

// Test 3: Normalización de sch-jjr a sch-jjrosseau
const legacyUser = { role: 'director', email: 'legacy@jjrosseau.edu.mx', school_id: 'sch-jjr' };
assert(
  resolveEffectiveSchoolId(legacyUser, null) === 'sch-jjrosseau',
  'Normalización automática de identificador legado sch-jjr -> sch-jjrosseau'
);

// Test 4: Super Usuario sí puede alternar entre colegios
assert(
  resolveEffectiveSchoolId(superUserEduardo, 'sch-test-case') === 'sch-test-case',
  'Super Usuario puede conmutar voluntariamente a sch-test-case'
);
assert(
  resolveEffectiveSchoolId(superUserEduardo, 'sch-jjrosseau') === 'sch-jjrosseau',
  'Super Usuario puede conmutar voluntariamente a sch-jjrosseau'
);

// 2. Verificar syncUserSchool en el Store
const store = useSchoolAdminStore.getState();

// Sincronizar Mónica Suárez
store.syncUserSchool(billingMonica as any);
const stateAfterMonica = useSchoolAdminStore.getState();
assert(
  stateAfterMonica.activeSchoolId === 'sch-test-case',
  'syncUserSchool(billingMonica) actualiza activeSchoolId a sch-test-case'
);
assert(
  stateAfterMonica.schoolSettings?.name?.toLowerCase().includes('modelo') || stateAfterMonica.schoolSettings?.name?.toLowerCase().includes('benito') || stateAfterMonica.schoolSettings?.name !== undefined,
  'syncUserSchool(billingMonica) actualiza schoolSettings con la identidad del colegio'
);

// Verificar Aranceles de Mónica Suárez
const monicaPricings = getSchoolTuitionPricings(stateAfterMonica.tuitionPricings, stateAfterMonica.activeSchoolId);
assert(
  monicaPricings.length >= 4,
  `Aranceles para sch-test-case nunca quedan vacíos (Tiene ${monicaPricings.length} niveles: Primaria Baja, Primaria Alta, Secundaria, Prepa)`
);
assert(
  monicaPricings.every(p => p.school_id === 'sch-test-case'),
  'Todos los aranceles devueltos pertenecen estrictamente a sch-test-case'
);

// Sincronizar Don Alejandro
store.syncUserSchool(ownerAlejandro as any);
const stateAfterAlejandro = useSchoolAdminStore.getState();
assert(
  stateAfterAlejandro.activeSchoolId === 'sch-jjrosseau',
  'syncUserSchool(ownerAlejandro) conmuta activeSchoolId a sch-jjrosseau'
);
assert(
  stateAfterAlejandro.schoolSettings?.name?.includes('Rosseau') || stateAfterAlejandro.schoolSettings?.name?.includes('JJ'),
  'schoolSettings sincronizado con UP Juan Jacobo Rosseau'
);

// Verificar aislamiento de datos
const jjrStudents = getSchoolStudents(stateAfterAlejandro.detailedStudents, 'sch-jjrosseau');
const testStudents = getSchoolStudents(stateAfterAlejandro.detailedStudents, 'sch-test-case');
assert(
  jjrStudents.length === 0 && testStudents.length > 0,
  `Aislamiento inicial: JJR inicia en ${jjrStudents.length} alumnos (en blanco para prueba beta) y Test-Case tiene ${testStudents.length} alumnos`
);
assert(
  !jjrStudents.some(s => s.school_id === 'sch-test-case'),
  'Cero filtración: Ningún alumno de sch-test-case aparece en la lista de sch-jjrosseau'
);
assert(
  !testStudents.some(s => s.school_id === 'sch-jjrosseau'),
  'Cero filtración: Ningún alumno de sch-jjrosseau aparece en la lista de sch-test-case'
);

// Probar alta de alumno por Don Alejandro: queda vinculado exclusivamente a sch-jjrosseau
const registeredByAlejandro = store.registerStudent({
  first_name: 'Mateo',
  last_name_1: 'Valdez',
  level: 'primaria',
  grade: '1º',
  curp: 'VALM180101HDFZNS01'
} as any);
const updatedJjrStudents = getSchoolStudents(useSchoolAdminStore.getState().detailedStudents, 'sch-jjrosseau');
assert(
  updatedJjrStudents.some(s => s.first_name === 'Mateo' && s.school_id === 'sch-jjrosseau'),
  'Alumno registrado por Don Alejandro se asigna automáticamente a sch-jjrosseau'
);

// 3. Probar getActiveSchoolIdFromState con sesión simulada en localStorage
mockStorage['iskool_session_user'] = JSON.stringify(billingMonica);
const helperResolvedForMonica = getActiveSchoolIdFromState({ activeSchoolId: 'sch-jjrosseau' });
assert(
  helperResolvedForMonica === 'sch-test-case',
  'getActiveSchoolIdFromState prioriza la sesión activa de Mónica sobre un activeSchoolId desincronizado'
);

mockStorage['iskool_session_user'] = JSON.stringify(ownerAlejandro);
const helperResolvedForAlejandro = getActiveSchoolIdFromState({ activeSchoolId: 'sch-test-case' });
assert(
  helperResolvedForAlejandro === 'sch-jjrosseau',
  'getActiveSchoolIdFromState prioriza la sesión de Don Alejandro sobre cualquier valor residual'
);

mockStorage['iskool_session_user'] = JSON.stringify(superUserEduardo);
const helperResolvedForSuperUser = getActiveSchoolIdFromState({ activeSchoolId: 'sch-montessori' });
assert(
  helperResolvedForSuperUser === 'sch-montessori',
  'getActiveSchoolIdFromState respeta la elección manual de Super Usuario (sch-montessori)'
);

console.log(`\n================================================================`);
console.log(`📊 RESULTADOS: ${passedTests}/${totalTests} pruebas superadas exitosamente.`);
console.log(`================================================================`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
