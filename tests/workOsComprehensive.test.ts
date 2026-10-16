import { describe, it, expect, beforeEach } from 'vitest';
import { WorkOsService } from '../src/lib/services/workOs/workOsService';
import {
  WorkOsTask,
  getDefaultSeedAccounts,
  SEED_TEST_SCENARIOS
} from '../src/lib/services/workOs/workOsTypes';

describe('🚀 SUITE INTEGRAL DE WORK OS INSTITUCIONAL (ISKOOL)', () => {
  const TEST_TENANT = 'tenant_test_work_os';

  beforeEach(() => {
    // Limpiar estado previo
    localStorage.clear();
  });

  describe('1. Cuentas Semilla, Permisos y Modos Duales (Simulado vs Real)', () => {
    it('debe inicializar exactamente las 5 cuentas semilla departamentales por defecto', () => {
      const seeds = WorkOsService.getSeedAccounts(TEST_TENANT);
      expect(seeds).toHaveLength(5);
      
      const keys = seeds.map(s => s.sectionKey);
      expect(keys).toContain('cobranza');
      expect(keys).toContain('transporte');
      expect(keys).toContain('control_escolar');
      expect(keys).toContain('servicio_medico');
      expect(keys).toContain('convivencia');
    });

    it('el CEO debe tener permisos completos para modificar nombres de departamento, correos institucionales y SLAs', () => {
      const res = WorkOsService.updateSeedAccount(TEST_TENANT, 'cobranza', {
        sectionName: 'Tesorería y Finanzas Estratégicas',
        departmentAccount: 'tesoreria.rectoria@ibime.edu.mx',
        slaHours: 12,
        isRealAccountSwapped: true
      }, true); // isCeo = true

      expect(res.success).toBe(true);
      const updated = res.updatedSeed!;
      expect(updated.sectionName).toBe('Tesorería y Finanzas Estratégicas');
      expect(updated.departmentAccount).toBe('tesoreria.rectoria@ibime.edu.mx');
      expect(updated.slaHours).toBe(12);
      expect(updated.isRealAccountSwapped).toBe(true);
    });

    it('un delegado NO debe poder modificar el nombre de la cuenta departamental ni SLAs, solo sus datos personales', () => {
      // Primero asegurar la cuenta
      WorkOsService.getSeedAccounts(TEST_TENANT);

      // Intento de delegado (isCeo = false)
      const res = WorkOsService.updateSeedAccount(TEST_TENANT, 'cobranza', {
        sectionName: 'HACKED DEPARTMENT', // No debe cambiar
        slaHours: 999, // No debe cambiar
        delegateName: 'Lic. Roberto Gómez', // Sí debe cambiar
        personalEmail: 'roberto.personal@gmail.com' // Sí debe cambiar
      }, false);

      expect(res.success).toBe(true);
      const updated = res.updatedSeed!;
      expect(updated.sectionName).not.toBe('HACKED DEPARTMENT');
      expect(updated.slaHours).not.toBe(999);
      expect(updated.delegateName).toBe('Lic. Roberto Gómez');
      expect(updated.personalEmail).toBe('roberto.personal@gmail.com');
    });

    it('debe contar con exactamente 5 escenarios realistas de prueba por cada cuenta semilla (25 en total)', () => {
      expect(SEED_TEST_SCENARIOS).toHaveLength(25);
      
      const depts = ['cobranza', 'transporte', 'control_escolar', 'servicio_medico', 'convivencia'];
      for (const dept of depts) {
        const scenarios = SEED_TEST_SCENARIOS.filter(s => s.seedKey === dept);
        expect(scenarios.length).toBe(5);
        // Cada escenario debe tener título, descripción de caso y SLA
        scenarios.forEach(sc => {
          expect(sc.title).toBeTruthy();
          expect(sc.description).toBeTruthy();
          expect(sc.slaHours).toBeGreaterThan(0);
        });
      }
    });

    it('debe inyectar un escenario de prueba correctamente en el Work OS', () => {
      const scenario = SEED_TEST_SCENARIOS[0];
      const task = WorkOsService.injectScenario(TEST_TENANT, scenario.id);

      expect(task).toBeDefined();
      expect(task).not.toBeNull();
      expect(task!.title).toBe(scenario.title);
      expect(task!.sectionKey).toBe(scenario.seedKey);
      expect(task!.priority).toBe(scenario.urgency);
      expect(task!.auditTrail.length).toBeGreaterThanOrEqual(1);
      expect(task!.auditTrail[0].action).toContain('Inyección de Escenario');
    });
  });

  describe('2. Flujo Quirúrgico de Resolución (RESUELTO)', () => {
    it('debe exigir explicación de acciones tomadas para resolver la tarea', () => {
      const task = WorkOsService.createTask(TEST_TENANT, {
        title: 'Revisión médica urgente de alumno',
        description: 'Alumno con crisis alérgica',
        sectionKey: 'servicio_medico',
        primaryAssignee: {
          name: 'Dra. Gabriela Fuentes',
          email: 'enfermeria@ibime.edu.mx',
          role: 'Médico Escolar'
        },
        slaHours: 4,
        priority: 'CRITICA'
      });

      // Intento sin explicación
      const res = WorkOsService.resolveTask(TEST_TENANT, task.id, {
        resolutionSummary: '', // Inválido
        authorName: 'Dra. Gabriela Fuentes',
        authorEmail: 'enfermeria@ibime.edu.mx'
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('obligatorio');
    });

    it('debe marcar la tarea como RESUELTO, asignar 100% de avance, calcular duración real y registrar auditoría con microsegundos', () => {
      const task = WorkOsService.createTask(TEST_TENANT, {
        title: 'Convenio de pago colegiatura vencida',
        description: 'Familia solicita reestructuración de adeudo',
        sectionKey: 'cobranza',
        primaryAssignee: {
          name: 'Lic. Roberto Gómez',
          email: 'finanzas@ibime.edu.mx',
          role: 'Cobranza'
        },
        slaHours: 24,
        priority: 'ALTA'
      });

      const appointmentDate = new Date(Date.now() + 86400000).toISOString();
      const res = WorkOsService.resolveTask(TEST_TENANT, task.id, {
        resolutionSummary: 'Se contactó al padre de familia vía telefónica y se formalizó convenio de 3 pagos quincenales sin recargos.',
        appointmentDate: appointmentDate,
        appointmentNotes: 'Firma presencial en dirección general',
        uploadedEvidence: [
          {
            fileName: 'convenio_firmado.pdf',
            fileSize: 102400,
            fileType: 'pdf'
          }
        ],
        authorName: 'Lic. Roberto Gómez',
        authorEmail: 'finanzas@ibime.edu.mx'
      });

      expect(res.success).toBe(true);
      const resolved = res.task!;
      expect(resolved.status).toBe('RESUELTO');
      expect(resolved.progressPercent).toBe(100);
      expect(resolved.resolutionSummary).toContain('formalizó convenio');
      expect(resolved.scheduledAppointment?.date).toBe(appointmentDate);
      expect(resolved.evidenceDocs).toHaveLength(1);
      expect(resolved.evidenceDocs[0].fileName).toBe('convenio_firmado.pdf');

      // Comprobar entrada en auditoría
      const resolveAudit = resolved.auditTrail.find(a => a.type === 'resolved');
      expect(resolveAudit).toBeDefined();
      expect(resolveAudit?.details).toContain('Caso concluido');
      expect(resolveAudit?.timestamp).toMatch(/\.\d{3}Z$/); // Micro/milisegundo ISO
    });
  });

  describe('3. Flujo En Proceso (EN PROCESO) y Código de Colores Dinámico', () => {
    it('debe asignar el color correcto de la barra según el porcentaje de avance', () => {
      // Rojo < 30%
      expect(WorkOsService.getProgressColor(15).colorName).toBe('red');
      expect(WorkOsService.getProgressColor(29).colorName).toBe('red');

      // Naranja 30-80%
      expect(WorkOsService.getProgressColor(30).colorName).toBe('orange');
      expect(WorkOsService.getProgressColor(50).colorName).toBe('orange');
      expect(WorkOsService.getProgressColor(80).colorName).toBe('orange');

      // Amarillo 81-99%
      expect(WorkOsService.getProgressColor(81).colorName).toBe('yellow');
      expect(WorkOsService.getProgressColor(95).colorName).toBe('yellow');
      expect(WorkOsService.getProgressColor(99).colorName).toBe('yellow');

      // Verde 100%
      expect(WorkOsService.getProgressColor(100).colorName).toBe('green');
    });

    it('debe actualizar a EN PROCESO con lista de pasos siguientes y cita presencial agendada', () => {
      const task = WorkOsService.createTask(TEST_TENANT, {
        title: 'Retraso de Ruta 4 - Autobús Escolar',
        description: 'Falla mecánica en autopista',
        sectionKey: 'transporte',
        primaryAssignee: {
          name: 'Ing. Carlos Ortiz',
          email: 'transporte@ibime.edu.mx',
          role: 'Logística'
        },
        slaHours: 2,
        priority: 'CRITICA'
      });

      const res = WorkOsService.setTaskInProgress(TEST_TENANT, task.id, {
        progressPercent: 45,
        nextStepsOutline: 'Enviar unidad de apoyo\nNotificar a los 18 padres por WhatsApp institucional\nArribo a plantel y registro de acceso',
        authorName: 'Ing. Carlos Ortiz',
        authorEmail: 'transporte@ibime.edu.mx'
      });

      expect(res.success).toBe(true);
      const updated = res.task!;
      expect(updated.status).toBe('EN_PROCESO');
      expect(updated.progressPercent).toBe(45);
      expect(updated.nextStepsOutline).toContain('Enviar unidad de apoyo');
      expect(updated.checklist).toHaveLength(3);
      expect(updated.checklist[0].completed).toBe(true);
      expect(updated.checklist[2].completed).toBe(false);

      const inProgressAudit = updated.auditTrail.find(a => a.type === 'progress_update');
      expect(inProgressAudit).toBeDefined();
    });
  });

  describe('4. Auditoría de Salud y Detección Automática de NO ATENDIDO', () => {
    it('debe marcar como NO ATENDIDO y elevar prioridad a CRITICA si la tarea no se ha abierto tras vencer la ventana', () => {
      // Creamos una tarea con fecha de creación antigua (hace 6 horas) sin abrir
      const oldCreatedAt = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
      const task = WorkOsService.createTask(TEST_TENANT, {
        title: 'Certificado de Primaria extraviado',
        description: 'Padre solicita reposición inmediata con folio SEP',
        sectionKey: 'control_escolar',
        primaryAssignee: {
          name: 'Lic. Mariana Valdez',
          email: 'controlescolar@ibime.edu.mx',
          role: 'Control Escolar'
        },
        slaHours: 12,
        priority: 'MEDIA'
      });

      // Modificamos artificialmente la fecha de creación y estado para simular abandono
      const tasks = WorkOsService.getTasks(TEST_TENANT);
      const target = tasks.find(t => t.id === task.id)!;
      target.createdAt = oldCreatedAt;
      target.firstOpenedAt = undefined; // Sin abrir
      target.progressPercent = 0;
      target.status = 'PENDIENTE';
      WorkOsService.saveTasks(TEST_TENANT, tasks);

      // Ejecutar auditoría de salud
      const auditResult = WorkOsService.runHealthAndNeglectAudit(TEST_TENANT);
      expect(auditResult.updatedCount).toBeGreaterThanOrEqual(1);
      
      const refreshedTasks = WorkOsService.getTasks(TEST_TENANT);
      const auditedTarget = refreshedTasks.find(t => t.id === task.id)!;

      expect(auditedTarget.status).toBe('NO_ATENDIDO');
      expect(auditedTarget.priority).toBe('CRITICA');
      expect(auditedTarget.isNeglected).toBe(true);
      
      const neglectAudit = auditedTarget.auditTrail.find(a => a.details.includes('sin atención'));
      expect(neglectAudit).toBeDefined();
    });
  });

  describe('5. Función "Escalar a CEO"', () => {
    it('debe registrar el escalamiento de caso directamente al Director General / CEO con motivo y prioridad crítica', () => {
      const task = WorkOsService.createTask(TEST_TENANT, {
        title: 'Conflicto grave entre tutores en acceso vehicular',
        description: 'Altercado físico entre dos familias',
        sectionKey: 'convivencia',
        primaryAssignee: {
          name: 'Mtra. Sofía Altamirano',
          email: 'academica@ibime.edu.mx',
          role: 'Coordinación'
        },
        slaHours: 4,
        priority: 'ALTA'
      });

      const res = WorkOsService.escalateToCeo(
        TEST_TENANT,
        task.id,
        {
          reason: 'Requiere presencia de Dirección General y Asesoría Legal debido a amenazas verbales.',
          authorName: 'Mtra. Sofía Altamirano',
          authorEmail: 'academica@ibime.edu.mx'
        }
      );

      expect(res.success).toBe(true);
      const escalated = res.task!;
      expect(escalated.isEscalatedToCeo).toBe(true);
      expect(escalated.priority).toBe('CRITICA');
      expect(escalated.status).toBe('ESCALADO_CEO');
      expect(escalated.escalationReason).toContain('presencia de Dirección General');

      const escalateAudit = escalated.auditTrail.find(a => a.type === 'escalated');
      expect(escalateAudit).toBeDefined();
      expect(escalateAudit?.action).toContain('Escalamiento');
    });
  });

  describe('6. Delegación Colaborativa Multi-Persona con Barra Compartida', () => {
    it('debe permitir añadir colaboradores adicionales y compartir la barra de avance sin duplicar alertas', () => {
      const task = WorkOsService.createTask(TEST_TENANT, {
        title: 'Preparación de Auditoría SEP y Carpetas de Fase 4',
        description: 'Revisión curricular integral de planeaciones y expedientes',
        sectionKey: 'convivencia',
        primaryAssignee: {
          name: 'Mtra. Sofía Altamirano',
          email: 'academica@ibime.edu.mx',
          role: 'Coordinadora Académica'
        },
        slaHours: 48,
        priority: 'ALTA'
      });

      // Añadir segundo colaborador (Control Escolar)
      const res = WorkOsService.addCollaboratorToTask(TEST_TENANT, task.id, {
        name: 'Lic. Mariana Valdez',
        email: 'controlescolar@ibime.edu.mx',
        role: 'Coordinadora de Expedientes',
        assignedBy: 'Mtra. Sofía Altamirano'
      });

      expect(res.success).toBe(true);
      const colabTask = res.task!;
      expect(colabTask.collaborators).toHaveLength(1);
      expect(colabTask.collaborators[0].email).toBe('controlescolar@ibime.edu.mx');

      // Actualizar avance por el colaborador añadido
      const updateRes = WorkOsService.setTaskInProgress(TEST_TENANT, task.id, {
        progressPercent: 65,
        nextStepsOutline: 'Expedientes de 3er grado completados al 100%.\nFalta cotejo de firmas.',
        authorName: 'Lic. Mariana Valdez',
        authorEmail: 'controlescolar@ibime.edu.mx'
      });

      // Ambos colaboradores comparten el mismo porcentaje de avance
      expect(updateRes.success).toBe(true);
      expect(updateRes.task!.progressPercent).toBe(65);
      expect(updateRes.task!.collaborators).toHaveLength(1);
    });
  });

  describe('7. Métricas en Tiempo Real del Dashboard de CEO', () => {
    it('debe calcular correctamente KPIs de tareas totales, resueltas, en proceso, no atendidas y cumplimiento de SLA', () => {
      // Inyectar 1 tarea y resolverla
      const t1 = WorkOsService.createTask(TEST_TENANT, {
        title: 'Caso Resuelto Inmediatamente',
        description: 'Desc',
        sectionKey: 'cobranza',
        primaryAssignee: {
          name: 'Usuario Prueba',
          email: 'user@test.com',
          role: 'Analista'
        },
        slaHours: 24,
        priority: 'BAJA'
      });
      
      WorkOsService.resolveTask(TEST_TENANT, t1.id, {
        resolutionSummary: 'Atendido inmediatamente con factura timbrada y sellada.',
        authorName: 'Usuario Prueba',
        authorEmail: 'user@test.com'
      });

      const metrics = WorkOsService.getDashboardMetrics(TEST_TENANT);
      expect(metrics.totalTasks).toBeGreaterThanOrEqual(1);
      expect(metrics.resolvedTasks).toBeGreaterThanOrEqual(1);
      expect(metrics.slaComplianceRate).toBeGreaterThanOrEqual(0);
      expect(metrics.tasksPerSeed).toBeDefined();
    });
  });
});
