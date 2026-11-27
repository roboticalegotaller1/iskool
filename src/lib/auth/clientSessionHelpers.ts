/**
 * ============================================================================
 * HELPERS DE SESIÓN EN NAVEGADOR (LOCALSTORAGE Y CONMUTACIÓN CANÓNICA)
 * ============================================================================
 * Separados de multiTenantSession.ts para mantener cero dependencias de
 * validación criptográfica/esquemas en el bundle cliente.
 */

/**
 * Conmuta la sesión del estudiante de forma canónica respetando las fronteras
 * herméticas de autenticación multi-tenant.
 */
export async function switchCanonicalStudent(studentId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('active_student_id', studentId);
      const { useStudentStore } = await import('@/store/useStudentStore');
      await useStudentStore.getState().switchStudent(studentId);
    } catch (err) {
      console.warn('[Session] Conmutación canónica fallback:', err);
    }
  }
}

/**
 * Restablece la selección de colegio para retornar al directorio institucional de superusuario
 * de forma canónica y hermética.
 */
export async function resetCanonicalSelectedSchool(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('iskool_school_admin_store');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
          parsed.state.selectedSchool = null;
          localStorage.setItem('iskool_school_admin_store', JSON.stringify(parsed));
        }
      }
      const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
      useSchoolAdminStore.getState().selectSchool(null as any);
    } catch (err) {
      console.warn('[Session] Error restableciendo selección canónica de colegio:', err);
    }
  }
}
