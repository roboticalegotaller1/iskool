import { describe, it, expect, beforeEach } from 'vitest';
import { WorkOsService } from '../src/lib/services/workOs/workOsService';

describe('Work OS - Casos Multi-Delegado y Bóveda de Evidencias', () => {
  const tenantId = 'test-multi-tenant-9901';

  beforeEach(() => {
    // Resetear almacén para el tenant de prueba
    const tasks = WorkOsService.getTasks(tenantId);
  });

  it('1. Debe generar y mantener siempre el caso tripartita EXP-IBIME-2026-9901 con más de 2 personas', () => {
    const tasks = WorkOsService.getTasks(tenantId);
    const multiTask = tasks.find(t => t.matterCode === 'EXP-IBIME-2026-9901');

    expect(multiTask).toBeDefined();
    expect(multiTask?.primaryAssignee.name).toBe('Dra. Andrea Palacios');
    expect(multiTask?.collaborators.length).toBeGreaterThanOrEqual(2);

    const collaboratorNames = multiTask?.collaborators.map(c => c.name);
    expect(collaboratorNames).toContain('Mtra. Sofía Villalpando');
    expect(collaboratorNames).toContain('Prof. Mario Alberto Torres');

    // Total de personas asignadas al caso
    const totalDelegates = 1 + (multiTask?.collaborators.length || 0);
    expect(totalDelegates).toBe(3);
  });

  it('2. Dra. Andrea Palacios debe poder acceder, actualizar progreso y subir archivo probatorio', () => {
    const tasks = WorkOsService.getTasks(tenantId);
    const multiTask = tasks.find(t => t.matterCode === 'EXP-IBIME-2026-9901')!;

    const res = WorkOsService.setTaskInProgress(tenantId, multiTask.id, {
      authorName: 'Dra. Andrea Palacios',
      authorEmail: 'enfermeria@ibime.edu.mx',
      nextStepsOutline: '1. Dictamen clínico completado\n2. Entrega de minuta médica a Dirección',
      progressPercent: 65,
      uploadedEvidence: [
        {
          fileName: 'Dictamen_Clinico_Alergias_Respiratorias.pdf',
          fileSize: 245000,
          fileType: 'pdf',
          notes: 'Valoración médica con diagnóstico de asma de esfuerzo'
        }
      ]
    });

    expect(res.success).toBe(true);
    expect(res.task?.status).toBe('EN_PROCESO');
    expect(res.task?.progressPercent).toBe(65);

    // Verificar que el archivo quedó almacenado en la bóveda del caso
    const uploaded = res.task?.evidenceDocs.find(d => d.fileName === 'Dictamen_Clinico_Alergias_Respiratorias.pdf');
    expect(uploaded).toBeDefined();
    expect(uploaded?.uploadedBy).toBe('Dra. Andrea Palacios');

    // Verificar trazabilidad en auditoría
    const audit = res.task?.auditTrail.find(a => a.authorName === 'Dra. Andrea Palacios');
    expect(audit).toBeDefined();
  });

  it('3. Mtra. Sofía Villalpando debe tener acceso al mismo caso, ver el archivo de la Dra. Andrea, subir su archivo y resolver el caso', () => {
    const tasks = WorkOsService.getTasks(tenantId);
    const multiTask = tasks.find(t => t.matterCode === 'EXP-IBIME-2026-9901')!;

    // Mtra. Sofía visualiza el archivo previo de la Dra. Andrea
    const andreaDoc = multiTask.evidenceDocs.find(d => d.fileName === 'Dictamen_Clinico_Alergias_Respiratorias.pdf');
    expect(andreaDoc).toBeDefined();

    // Mtra. Sofía sube su archivo de adecuación curricular y cierra el caso al 100%
    const res = WorkOsService.resolveTask(tenantId, multiTask.id, {
      authorName: 'Mtra. Sofía Villalpando',
      authorEmail: 'academica@ibime.edu.mx',
      resolutionSummary: 'Protocolo concluido exitosamente en coordinación tripartita con Salud Escolar y Prefectura.',
      uploadedEvidence: [
        {
          fileName: 'Acuerdo_Curricular_Ajuste_Docente.pdf',
          fileSize: 189000,
          fileType: 'pdf',
          notes: 'Ajuste razonable curricular para aula y educación física'
        }
      ]
    });

    expect(res.success).toBe(true);
    expect(res.task?.status).toBe('RESUELTO');
    expect(res.task?.progressPercent).toBe(100);

    // Ambos archivos deben coexistir en la bóveda
    const sofiaDoc = res.task?.evidenceDocs.find(d => d.fileName === 'Acuerdo_Curricular_Ajuste_Docente.pdf');
    expect(sofiaDoc).toBeDefined();
    expect(sofiaDoc?.uploadedBy).toBe('Mtra. Sofía Villalpando');

    expect(res.task?.evidenceDocs.some(d => d.fileName === 'Dictamen_Clinico_Alergias_Respiratorias.pdf')).toBe(true);
    expect(res.task?.evidenceDocs.some(d => d.fileName === 'Acuerdo_Curricular_Ajuste_Docente.pdf')).toBe(true);
  });

  it('4. Dirección General / CEO debe tener visibilidad plena del caso resuelto y de todo el proceso forense', () => {
    const tasks = WorkOsService.getTasks(tenantId);
    const multiTask = tasks.find(t => t.matterCode === 'EXP-IBIME-2026-9901')!;

    // CEO ve que está resuelto al 100%
    expect(multiTask.status).toBe('RESUELTO');
    expect(multiTask.progressPercent).toBe(100);
    expect(multiTask.resolutionSummary).toContain('Protocolo concluido exitosamente');

    // CEO puede inspeccionar la auditoría cronológica completa
    const authors = multiTask.auditTrail.map(a => a.authorName);
    expect(authors).toContain('Mtra. Sofía Villalpando');
    expect(authors).toContain('Dra. Andrea Palacios');
    expect(authors).toContain('Dirección General / CEO');

    // Métricas del dashboard reflejan el caso resuelto y las evidencias
    const metrics = WorkOsService.getDashboardMetrics(tenantId);
    expect(metrics.resolvedTasks).toBeGreaterThanOrEqual(1);
    expect(metrics.totalEvidenceDocs).toBeGreaterThanOrEqual(3);
  });
});
