import { useSchoolAdminStore } from '../src/store/useSchoolAdminStore';
import { INSTITUTIONS_SEED, TEACHER_SEED, DETAILED_STUDENTS_SEED } from '../src/store/seeds';
import { resolveEffectiveSchoolId, isPlatformSuperUser } from '../src/types';

console.log('--- TEST: SUSPENSIÓN INSTITUCIONAL Y CANDADO MULTI-CUENTA ---');

const store = useSchoolAdminStore.getState();

// 1. Verificar estado inicial
const initialSchool = store.institutionsList.find(i => i.id === 'sch-jjrosseau');
console.log('1. Estado inicial UP Juan Jacobo Rosseau:', initialSchool?.status || 'active');

const initialStudentCount = (store.detailedStudents || []).length;
const initialTeacherCount = (store.teachersList || []).length;
console.log(`2. Integridad previa: ${initialStudentCount} alumnos, ${initialTeacherCount} profesores.`);

// 3. Activar suspensión (Deslizar hacia la derecha a Inactivo)
const wasSuspended = store.toggleSchoolSuspension('sch-jjrosseau');
console.log('3. Resultado toggleSchoolSuspension(sch-jjrosseau): suspendido =', wasSuspended);

const isSuspendedCheck = store.isSchoolSuspended('sch-jjrosseau');
console.log('4. isSchoolSuspended(sch-jjrosseau):', isSuspendedCheck);
if (!isSuspendedCheck) {
  throw new Error('Fallo: La escuela debería estar suspendida');
}

// 5. Verificar que NO se borró ninguna información
const postSuspendStudentCount = (store.detailedStudents || []).length;
const postSuspendTeacherCount = (store.teachersList || []).length;
console.log(`5. Integridad posterior: ${postSuspendStudentCount} alumnos, ${postSuspendTeacherCount} profesores.`);
if (postSuspendStudentCount !== initialStudentCount || postSuspendTeacherCount !== initialTeacherCount) {
  throw new Error('Fallo crítico: Se eliminaron datos durante la suspensión');
}

// 6. Simular intento de login para profesor
const teacherSchool = resolveEffectiveSchoolId({ role: 'teacher', school_id: 'sch-jjrosseau' });
console.log('6. Escuela de profesor:', teacherSchool);
const teacherBlocked = store.isSchoolSuspended(teacherSchool);
console.log('7. ¿Profesor bloqueado por suspensión de colegio?:', teacherBlocked);
if (!teacherBlocked) {
  throw new Error('Fallo: El profesor debería estar bloqueado');
}

// 8. Simular intento de login para alumno
const studentSchool = resolveEffectiveSchoolId({ role: 'student', school_id: 'sch-jjrosseau' });
const studentBlocked = store.isSchoolSuspended(studentSchool);
console.log('8. ¿Alumno bloqueado por suspensión de colegio?:', studentBlocked);
if (!studentBlocked) {
  throw new Error('Fallo: El alumno debería estar bloqueado');
}

// 9. Simular Super Usuario de plataforma (INMUNE)
const superUser = { role: 'admin', email: 'admin@iskool.edu.mx' };
const isSuper = isPlatformSuperUser(superUser);
console.log('9. ¿Super Usuario es inmune a la suspensión?:', isSuper);
if (!isSuper) {
  throw new Error('Fallo: Super usuario no debe ser bloqueado');
}

// 10. Deslizar de nuevo hacia la izquierda (Reactivar)
const reactivated = store.toggleSchoolSuspension('sch-jjrosseau');
console.log('10. Reactivando colegio. Suspendido?:', reactivated);
const isStillSuspended = store.isSchoolSuspended('sch-jjrosseau');
console.log('11. isSchoolSuspended después de reactivar:', isStillSuspended);
if (isStillSuspended) {
  throw new Error('Fallo: La escuela debería estar activa');
}

console.log('--- TODOS LOS TESTS DE SUSPENSIÓN Y SEGURIDAD PASARON CON ÉXITO ---');
