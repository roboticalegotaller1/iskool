import { useSchoolAdminStore } from '../src/store/useSchoolAdminStore';
import { useSchoolBooksStore } from '../src/store/useSchoolBooksStore';

console.log('--- TEST: ELIMINACIÓN DE COLEGIO CON PRESERVACIÓN Y REACREDITACIÓN ---');

const adminStore = useSchoolAdminStore.getState();
const booksStore = useSchoolBooksStore.getState();

// 1. Crear una institución de prueba para eliminarla de forma aislada
adminStore.createInstitution({
  name: 'Colegio Temporal de Prueba',
  tagline: 'Colegio para prueba de eliminación segura',
  cct: '99DEL2026X',
  address: 'Calle Falsa 123',
  phone: '55-0000-0000',
  coordinatorName: 'Coordinador de Prueba',
  campusesCount: 1
});

// Obtener el colegio recién creado
const created = useSchoolAdminStore.getState().institutionsList.find(i => i.cct === '99DEL2026X');
if (!created) {
  throw new Error('Fallo: No se pudo crear la institución de prueba');
}
const schoolId = created.id;
console.log('1. Institución de prueba creada con ID:', schoolId);

// 2. Crear un plantel para este colegio
adminStore.createCampus({
  name: 'Plantel Temporal Norte',
  level: 'primaria',
  grades: ['1º', '2º'],
  address: 'Av. Norte 100',
  phone: '55-1111-1111',
  school_id: schoolId
});
const campus = useSchoolAdminStore.getState().campusesList.find(c => c.school_id === schoolId);
console.log('2. Plantel temporal creado con ID:', campus?.id);

// 3. Crear un grupo para este colegio
adminStore.createGroup({
  name: 'Grupo 1A Temporal',
  grade: '1º',
  level: 'primaria',
  school_id: schoolId,
  campus_id: campus?.id,
  academic_year: '2025-2026' as any
});
console.log('3. Grupo temporal creado.');

// 4. Registrar un libro digital para este colegio
const uploadedBook = booksStore.uploadBook({
  titulo: 'Matemáticas y Lógica de Prueba',
  autorEditorial: 'Editorial Pedagógica',
  isbn: '978-9999999999',
  nivelEducativo: 'primaria_baja',
  faseNEM: 'Fase 3',
  grado: '1º',
  materia: 'Matemáticas',
  totalPaginas: 120,
  cicloEscolar: '2025-2026',
  portadaColor: 'from-blue-600 to-indigo-600',
  schoolId: schoolId,
  schoolName: 'Colegio Temporal de Prueba',
  palabrasClaveIndice: ['Conteo', 'Sumas', 'Figuras'],
  subidoPor: 'Profesor de Prueba',
  capitulos: [
    {
      id: 'chap-1',
      numero: 1,
      titulo: 'Números y Conteo',
      rangoPaginas: '10-25',
      paginaInicio: 10,
      paginaFin: 25,
      resumenTematico: 'Desarrollo de conteo.',
      conceptosClave: ['Números', 'Conteo'],
      preguntasDetonadoras: ['¿Cuántos objetos hay?'],
      pdaRelacionados: ['Conteo de elementos hasta 100'],
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejerciciosPropuestos: []
    }
  ]
});
console.log('4. Libro digital cargado con ID:', uploadedBook.id, 'para colegio:', uploadedBook.schoolId);

// 5. Ejecutar la acción de preservación y reasignación de libros
const preservedCount = booksStore.preserveAndReassignSchoolBooks(schoolId, 'Prof. Israel López Ángeles');
console.log(`5. Libros preservados y reasignados: ${preservedCount}`);
if (preservedCount < 1) {
  throw new Error('Fallo: El libro no fue preservado');
}

const checkPreservedBook = useSchoolBooksStore.getState().getBookById(uploadedBook.id);
console.log('6. Libro después de reasignar. SchoolId:', checkPreservedBook?.schoolId, '| SubidoPor:', checkPreservedBook?.subidoPor);
if (checkPreservedBook?.schoolId !== 'sch-jjrosseau' || !checkPreservedBook?.subidoPor?.includes('Prof. Israel López Ángeles')) {
  throw new Error('Fallo: El libro no fue reasignado correctamente a la bóveda maestra de Israel López Ángeles');
}

// 7. Ejecutar eliminación total de la institución en el store administrativo
adminStore.deleteInstitution(schoolId);

// 8. Verificar que toda la información del colegio fue eliminada
const postState = useSchoolAdminStore.getState();
const schoolStillExists = postState.institutionsList.some(i => i.id === schoolId);
const campusesStillExist = postState.campusesList.some(c => c.school_id === schoolId);
const groupsStillExist = postState.groupsList.some(g => g.school_id === schoolId);
console.log('7. ¿El colegio sigue existiendo en el catálogo?:', schoolStillExists);
console.log('8. ¿Los planteles del colegio siguen existiendo?:', campusesStillExist);
console.log('9. ¿Los grupos del colegio siguen existiendo?:', groupsStillExist);

if (schoolStillExists || campusesStillExist || groupsStillExist) {
  throw new Error('Fallo: Aún quedaron datos operativos del colegio en el sistema');
}

// 9. Verificar que el profesor maestro Prof. Israel López Ángeles NO fue eliminado
const masterTeacher = postState.teachersList.find(t => t.id === 'usr-teacher-1');
console.log('10. Profesor maestro intacto:', masterTeacher?.first_name, masterTeacher?.last_name);
if (!masterTeacher) {
  throw new Error('Fallo crítico: El profesor maestro Israel López Ángeles fue eliminado');
}

// 10. Verificar que el libro digital SIGUE EXISTIENDO y accesible
const finalBookCheck = useSchoolBooksStore.getState().getBookById(uploadedBook.id);
console.log('11. Libro final conservado intacto en el sistema:', finalBookCheck?.titulo);
if (!finalBookCheck) {
  throw new Error('Fallo crítico: El libro digital fue eliminado');
}

console.log('--- TEST COMPLETADO EXITOSAMENTE: DEPURACIÓN TOTAL CON PRESERVACIÓN Y ACREDITACIÓN GARANTIZADA ---');
