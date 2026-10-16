/**
 * Work OS Institucional ISkool - Servicio Principal
 * Lógica de Negocio, Automatizaciones, SLAs, Auditoría y Gestión de Evidencias
 */

import {
  WorkOsTask,
  WorkOsTaskStatus,
  WorkOsPriority,
  WorkOsSeedAccount,
  WorkOsAuditEntry,
  WorkOsEvidenceDoc,
  WorkOsAutomationRule,
  WorkOsDashboardMetrics,
  WorkOsTestScenario,
  WorkOsChecklistStep,
  getDefaultSeedAccounts,
  SEED_TEST_SCENARIOS,
  DEFAULT_WORK_OS_AUTOMATIONS
} from './workOsTypes';

// Memoria volátil compartida entre módulos en cliente
const tasksMemoryStore = new Map<string, WorkOsTask[]>();
const seedsMemoryStore = new Map<string, WorkOsSeedAccount[]>();
const automationsMemoryStore = new Map<string, WorkOsAutomationRule[]>();

export class WorkOsService {
  /**
   * Claves de almacenamiento local seguro
   */
  private static getTasksStorageKey(tenantId: string): string {
    return `iskool_work_os_tasks_${tenantId || 'default'}`;
  }

  private static getSeedsStorageKey(tenantId: string): string {
    return `iskool_work_os_seeds_${tenantId || 'default'}`;
  }

  private static getAutomationsStorageKey(tenantId: string): string {
    return `iskool_work_os_automations_${tenantId || 'default'}`;
  }

  // ==========================================================================
  // 1. CARGA Y GESTIÓN DE CUENTAS SEED (CON PERMISOS DIFERENCIADOS CEO vs ASIGNADO)
  // ==========================================================================

  public static getSeedAccounts(tenantId: string, schoolDomain = 'ibime.edu.mx'): WorkOsSeedAccount[] {
    const cleanTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';
    
    if (seedsMemoryStore.has(cleanTenant)) {
      return seedsMemoryStore.get(cleanTenant)!;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.getSeedsStorageKey(cleanTenant));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            seedsMemoryStore.set(cleanTenant, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[WorkOsService] Error al leer seeds de localStorage:', err);
      }
    }

    const defaults = getDefaultSeedAccounts(cleanTenant, schoolDomain);
    seedsMemoryStore.set(cleanTenant, defaults);
    this.saveSeeds(cleanTenant, defaults);
    return defaults;
  }

  public static saveSeeds(tenantId: string, seeds: WorkOsSeedAccount[]): void {
    const cleanTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';
    seedsMemoryStore.set(cleanTenant, seeds);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getSeedsStorageKey(cleanTenant), JSON.stringify(seeds));
      } catch (err) {
        console.warn('[WorkOsService] Error al guardar seeds en localStorage:', err);
      }
    }
  }

  /**
   * Actualiza una cuenta seed respetando la matriz de permisos:
   * - CEO: Control total (puede modificar nombre del departamento, correo de departamento, SLA, nombre y correo personal).
   * - Asignado / Delegado: Únicamente puede modificar su información personal (nombre y correo personal),
   *   SIN PODER alterar el nombre de la cuenta departamental ni las cuentas de sus colegas.
   */
  public static updateSeedAccount(
    tenantId: string,
    sectionKey: string,
    updates: {
      sectionName?: string;
      delegateName?: string;
      personalEmail?: string;
      departmentAccount?: string;
      slaHours?: number;
      keywords?: string[];
      isRealAccountSwapped?: boolean;
    },
    isCeo: boolean
  ): { success: boolean; updatedSeed?: WorkOsSeedAccount; error?: string } {
    const seeds = this.getSeedAccounts(tenantId);
    const index = seeds.findIndex(s => s.sectionKey === sectionKey);

    if (index === -1) {
      return { success: false, error: 'Cuenta seed no encontrada para esta sección.' };
    }

    const current = seeds[index];

    let updated: WorkOsSeedAccount;

    if (isCeo) {
      // CEO tiene permisos absolutos en toda la plantilla (nombres, correos, SLAs)
      updated = {
        ...current,
        sectionName: updates.sectionName?.trim() || current.sectionName,
        delegateName: updates.delegateName?.trim() || current.delegateName,
        personalEmail: updates.personalEmail?.trim() || current.personalEmail,
        departmentAccount: updates.departmentAccount?.trim() || current.departmentAccount,
        slaHours: updates.slaHours !== undefined ? Number(updates.slaHours) : current.slaHours,
        keywords: updates.keywords || current.keywords,
        isRealAccountSwapped: updates.isRealAccountSwapped !== undefined ? updates.isRealAccountSwapped : current.isRealAccountSwapped
      };
    } else {
      // Usuario Asignado: SOLO puede modificar su información personal
      updated = {
        ...current,
        delegateName: updates.delegateName?.trim() || current.delegateName,
        personalEmail: updates.personalEmail?.trim() || current.personalEmail
        // departmentAccount y slaHours quedan bloqueados intencionalmente
      };
    }

    seeds[index] = updated;
    this.saveSeeds(tenantId, seeds);

    return { success: true, updatedSeed: updated };
  }

  /**
   * Conmuta la cuenta entre sistema interno simulado y cuenta de correo real
   */
  public static toggleSeedAccountMode(tenantId: string, sectionKey: string, swapToReal: boolean): WorkOsSeedAccount | null {
    const seeds = this.getSeedAccounts(tenantId);
    const target = seeds.find(s => s.sectionKey === sectionKey);
    if (!target) return null;

    target.isRealAccountSwapped = swapToReal;
    this.saveSeeds(tenantId, seeds);
    return target;
  }

  // ==========================================================================
  // 2. GESTIÓN DE TAREAS Y EXPEDIENTES WORK OS
  // ==========================================================================

  public static getTasks(tenantId: string): WorkOsTask[] {
    const cleanTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';

    if (tasksMemoryStore.has(cleanTenant)) {
      return tasksMemoryStore.get(cleanTenant)!;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.getTasksStorageKey(cleanTenant));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            tasksMemoryStore.set(cleanTenant, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[WorkOsService] Error al leer tareas de localStorage:', err);
      }
    }

    // Inicializar con 3 tareas iniciales representativas si está vacío
    const initialTasks = this.generateInitialDemoTasks(cleanTenant);
    tasksMemoryStore.set(cleanTenant, initialTasks);
    this.saveTasks(cleanTenant, initialTasks);
    return initialTasks;
  }

  public static saveTasks(tenantId: string, tasks: WorkOsTask[]): void {
    const cleanTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';
    tasksMemoryStore.set(cleanTenant, tasks);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getTasksStorageKey(cleanTenant), JSON.stringify(tasks));
      } catch (err) {
        console.warn('[WorkOsService] Error al persistir tareas en localStorage:', err);
      }
    }
  }

  public static getTaskById(tenantId: string, taskId: string): WorkOsTask | undefined {
    const tasks = this.getTasks(tenantId);
    return tasks.find(t => t.id === taskId);
  }

  /**
   * Crea una nueva tarea en el Work OS
   */
  public static createTask(tenantId: string, taskData: Partial<WorkOsTask>): WorkOsTask {
    const tasks = this.getTasks(tenantId);
    const now = new Date().toISOString();
    const slaHours = taskData.slaHours || 24;
    const deadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();
    const code = taskData.matterCode || `EXP-${now.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTask: WorkOsTask = {
      id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      matterCode: code,
      title: taskData.title || 'Asunto Institucional sin Título',
      description: taskData.description || '',
      category: taskData.category || 'General',
      sectionKey: taskData.sectionKey || 'cobranza',
      sectionName: taskData.sectionName || 'Departamento Administrativo / Cobranza',
      status: taskData.status || 'PENDIENTE',
      priority: taskData.priority || 'ALTA',
      primaryAssignee: taskData.primaryAssignee || {
        name: 'C.P. Claudia Albarrán',
        email: 'finanzas@ibime.edu.mx',
        role: 'Responsable de Cobranza'
      },
      collaborators: taskData.collaborators || [],
      createdAt: now,
      slaHours,
      slaDeadline: taskData.slaDeadline || deadline,
      progressPercent: taskData.progressPercent || 0,
      checklist: taskData.checklist || [
        { id: 'chk-1', title: 'Recepción y apertura del expediente', completed: true, completedAt: now },
        { id: 'chk-2', title: 'Contacto preliminar y diagnóstico', completed: false },
        { id: 'chk-3', title: 'Acción de resolución y documentación', completed: false }
      ],
      evidenceDocs: taskData.evidenceDocs || [],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          authorName: 'Dirección General / CEO',
          authorEmail: 'direccion@ibime.edu.mx',
          action: 'Creación y delegación inicial de tarea',
          type: 'status_change',
          details: `Caso asignado a ${taskData.primaryAssignee?.name || 'Responsable'} con SLA de ${slaHours} horas.`
        }
      ],
      isOverdue: false,
      isNeglected: false,
      isEscalatedToCeo: false,
      sourceEmail: taskData.sourceEmail
    };

    tasks.unshift(newTask);
    this.saveTasks(tenantId, tasks);
    return newTask;
  }

  /**
   * Marca que el correo/tarea fue abierto por primera vez por el asignado
   */
  public static markTaskOpened(tenantId: string, taskId: string, openerName = 'Responsable'): WorkOsTask | null {
    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    if (!task.firstOpenedAt) {
      const now = new Date().toISOString();
      task.firstOpenedAt = now;
      task.auditTrail.unshift({
        id: `aud-${Date.now()}`,
        timestamp: now,
        authorName: openerName,
        authorEmail: task.primaryAssignee.email,
        action: 'Apertura de correo y lectura del expediente',
        type: 'opened',
        details: 'El delegado abrió el correo y comenzó el tiempo de atención directa.'
      });
      this.saveTasks(tenantId, tasks);
    }

    return task;
  }

  // ==========================================================================
  // 3. FLUJO DE RESOLUCIÓN COMPLETA (MARCAR COMO "RESUELTO" 100%)
  // ==========================================================================

  public static resolveTask(
    tenantId: string,
    taskId: string,
    params: {
      resolutionSummary: string; // Explicación obligatoria de las acciones realizadas
      authorName: string;
      authorEmail: string;
      appointmentDate?: string; // Opcional si se agendó cita
      appointmentNotes?: string;
      uploadedEvidence?: {
        fileName: string;
        fileSize: number;
        fileType: 'pdf' | 'jpg' | 'jpeg' | 'doc' | 'docx';
        dataUrl?: string;
        notes?: string;
      }[];
    }
  ): { success: boolean; task?: WorkOsTask; error?: string } {
    if (!params.resolutionSummary || params.resolutionSummary.trim().length < 10) {
      return { success: false, error: 'Es obligatorio proporcionar una explicación detallada de las acciones realizadas para resolver el caso.' };
    }

    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Tarea no encontrada.' };

    const now = new Date().toISOString();
    const createdTime = new Date(task.createdAt).getTime();
    const resolvedTime = new Date(now).getTime();
    const elapsedMinutes = Math.max(1, Math.round((resolvedTime - createdTime) / (1000 * 60)));

    task.status = 'RESUELTO';
    task.progressPercent = 100;
    task.resolvedAt = now;
    task.resolutionSummary = params.resolutionSummary.trim();
    task.resolutionTimeMinutes = elapsedMinutes;
    task.isNeglected = false;
    task.isOverdue = false;

    // Registrar cita si fue programada
    if (params.appointmentDate) {
      task.scheduledAppointment = {
        date: params.appointmentDate,
        locationOrLink: 'Plantel Matriz / Sala de Juntas',
        notes: params.appointmentNotes || 'Reunión de seguimiento con padres de familia.',
        isBeyondSla: false
      };
    }

    // Agregar evidencias documentales adjuntas
    if (params.uploadedEvidence && params.uploadedEvidence.length > 0) {
      for (const ev of params.uploadedEvidence) {
        task.evidenceDocs.push({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          taskId: task.id,
          fileName: ev.fileName,
          fileSize: ev.fileSize,
          fileType: ev.fileType,
          uploadedAt: now,
          uploadedBy: params.authorName,
          dataUrl: ev.dataUrl,
          notes: ev.notes || 'Documento adjunto probatorio de resolución',
          category: 'resolucion'
        });
      }
    }

    // Marcar todos los pasos de checklist como completados
    task.checklist = task.checklist.map(c => ({ ...c, completed: true, completedAt: now }));

    // Auditoría inmutable completa con estampa de tiempo precisa
    task.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      authorName: params.authorName,
      authorEmail: params.authorEmail,
      action: 'Resolución definitiva del caso (100%)',
      type: 'resolved',
      details: `Caso concluido exitosamente en ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m. Acciones: ${params.resolutionSummary}`,
      metadata: {
        slaHours: task.slaHours,
        actualMinutes: elapsedMinutes,
        hasAppointment: Boolean(params.appointmentDate),
        evidenceCount: params.uploadedEvidence?.length || 0
      }
    });

    this.saveTasks(tenantId, tasks);
    return { success: true, task };
  }

  // ==========================================================================
  // 4. FLUJO EN PROCESO (PASOS RESTANTES, CITAS Y PORCENTAJE DINÁMICO)
  // ==========================================================================

  public static setTaskInProgress(
    tenantId: string,
    taskId: string,
    params: {
      authorName: string;
      authorEmail: string;
      nextStepsOutline: string; // Pasos restantes a realizar
      progressPercent: number; // 1 a 99%
      scheduledAppointmentDate?: string; // Cita más allá del SLA
      appointmentNotes?: string;
      checklistUpdates?: WorkOsChecklistStep[];
      uploadedEvidence?: {
        fileName: string;
        fileSize: number;
        fileType: 'pdf' | 'jpg' | 'jpeg' | 'doc' | 'docx';
        dataUrl?: string;
        notes?: string;
      }[];
    }
  ): { success: boolean; task?: WorkOsTask; error?: string } {
    if (!params.nextStepsOutline || params.nextStepsOutline.trim().length < 5) {
      return { success: false, error: 'Debe especificar el desglose de los siguientes pasos programados para continuar en proceso.' };
    }

    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Tarea no encontrada.' };

    const now = new Date().toISOString();
    const clampedPercent = Math.min(99, Math.max(15, params.progressPercent));

    task.status = 'EN_PROCESO';
    task.progressPercent = clampedPercent;
    task.nextStepsOutline = params.nextStepsOutline.trim();

    // Actualizar o generar checklist dinámico basado en los pasos
    if (params.checklistUpdates && params.checklistUpdates.length > 0) {
      task.checklist = params.checklistUpdates;
    } else {
      const stepLines = params.nextStepsOutline.split('\n').filter(l => l.trim().length > 0);
      if (stepLines.length > 0) {
        task.checklist = stepLines.map((line, idx) => ({
          id: `step-${idx}-${Date.now()}`,
          title: line.replace(/^[-*•0-9.)\s]+/, '').trim(),
          completed: idx === 0, // Primer paso avanzado
          completedAt: idx === 0 ? now : undefined
        }));
      }
    }

    // Programar cita más allá del SLA si aplica
    if (params.scheduledAppointmentDate) {
      const appDate = new Date(params.scheduledAppointmentDate).getTime();
      const deadlineDate = new Date(task.slaDeadline).getTime();
      const isBeyond = appDate > deadlineDate;

      task.scheduledAppointment = {
        date: params.scheduledAppointmentDate,
        locationOrLink: 'Dirección de Plantel / Virtual',
        notes: params.appointmentNotes || 'Cita de seguimiento agendada en proceso.',
        isBeyondSla: isBeyond
      };
    }

    // Evidencias de avance
    if (params.uploadedEvidence && params.uploadedEvidence.length > 0) {
      for (const ev of params.uploadedEvidence) {
        task.evidenceDocs.push({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          taskId: task.id,
          fileName: ev.fileName,
          fileSize: ev.fileSize,
          fileType: ev.fileType,
          uploadedAt: now,
          uploadedBy: params.authorName,
          dataUrl: ev.dataUrl,
          notes: ev.notes || 'Documento de avance en proceso',
          category: 'en_proceso'
        });
      }
    }

    // Auditoría inmutable de avance
    task.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      authorName: params.authorName,
      authorEmail: params.authorEmail,
      action: `Actualización de avance: ${clampedPercent}%`,
      type: 'progress_update',
      details: `Pasos siguientes: ${params.nextStepsOutline} ${params.scheduledAppointmentDate ? `· Cita agendada para: ${params.scheduledAppointmentDate}` : ''}`,
      metadata: {
        progressPercent: clampedPercent,
        hasAppointment: Boolean(params.scheduledAppointmentDate)
      }
    });

    this.saveTasks(tenantId, tasks);
    return { success: true, task };
  }

  // ==========================================================================
  // 5. ESCALAMIENTO AL CEO ("ESCALAR A CEO")
  // ==========================================================================

  public static escalateToCeo(
    tenantId: string,
    taskId: string,
    params: {
      authorName: string;
      authorEmail: string;
      reason: string;
    }
  ): { success: boolean; task?: WorkOsTask; error?: string } {
    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, error: 'Debe ingresar el motivo de escalamiento a Dirección General.' };
    }

    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Tarea no encontrada.' };

    const now = new Date().toISOString();
    task.status = 'ESCALADO_CEO';
    task.isEscalatedToCeo = true;
    task.escalationReason = params.reason.trim();
    task.priority = 'CRITICA';

    task.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      authorName: params.authorName,
      authorEmail: params.authorEmail,
      action: 'Escalamiento formal a Dirección General (CEO)',
      type: 'escalated',
      details: `Motivo: ${params.reason.trim()}`
    });

    this.saveTasks(tenantId, tasks);
    return { success: true, task };
  }

  // ==========================================================================
  // 6. DELEGACIÓN COLABORATIVA MULTI-PERSONA (2 O MÁS MIEMBROS)
  // ==========================================================================

  public static addCollaboratorToTask(
    tenantId: string,
    taskId: string,
    collaborator: {
      name: string;
      email: string;
      role: string;
      assignedBy: string;
    }
  ): { success: boolean; task?: WorkOsTask; error?: string } {
    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Tarea no encontrada.' };

    if (task.collaborators.some(c => c.email.toLowerCase() === collaborator.email.toLowerCase())) {
      return { success: false, error: 'El colaborador ya está asignado a este caso.' };
    }

    const now = new Date().toISOString();
    task.collaborators.push({
      name: collaborator.name,
      email: collaborator.email,
      role: collaborator.role,
      joinedAt: now,
      assignedBy: collaborator.assignedBy,
      contributionPercent: 0
    });

    task.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      authorName: collaborator.assignedBy,
      authorEmail: 'direccion@ibime.edu.mx',
      action: 'Incorporación de colaborador al caso (Delegación Compartida)',
      type: 'status_change',
      details: `Se integró a ${collaborator.name} (${collaborator.role}) para trabajo en equipo con barra de progreso complementaria.`
    });

    this.saveTasks(tenantId, tasks);
    return { success: true, task };
  }

  // ==========================================================================
  // 6.B REASIGNACIÓN DE CASOS Y TRASLADOS EN TABLERO KANBAN
  // ==========================================================================

  /**
   * Reasigna formalmente una tarea a un nuevo responsable o departamento
   * (Requerido cuando un caso Urgente / No Atendido se mueve a Recién Delegados)
   */
  public static reassignTask(
    tenantId: string,
    taskId: string,
    params: {
      newAssigneeName: string;
      newAssigneeEmail: string;
      newAssigneeRole: string;
      sectionKey: string;
      sectionName: string;
      slaHours: number;
      delegationNotes?: string;
      reassignedByName?: string;
      reassignedByEmail?: string;
    }
  ): { success: boolean; task?: WorkOsTask; error?: string } {
    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Expediente no encontrado.' };

    const now = new Date().toISOString();
    const newDeadline = new Date(Date.now() + params.slaHours * 3600 * 1000).toISOString();

    task.sectionKey = params.sectionKey;
    task.sectionName = params.sectionName;
    task.primaryAssignee = {
      name: params.newAssigneeName.trim(),
      email: params.newAssigneeEmail.trim(),
      role: params.newAssigneeRole.trim()
    };
    task.slaHours = params.slaHours;
    task.slaDeadline = newDeadline;
    task.status = 'PENDIENTE';
    task.priority = 'ALTA';
    task.progressPercent = 0; // Se reinicia el porcentaje automáticamente
    task.firstOpenedAt = undefined;
    task.isNeglected = false;
    task.isOverdue = false;

    task.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      authorName: params.reassignedByName || 'Dirección General / CEO',
      authorEmail: params.reassignedByEmail || 'direccion@ibime.edu.mx',
      action: `Reasignación y nueva delegación (${params.sectionName})`,
      type: 'status_change',
      details: `Expediente reasignado formalmente a ${params.newAssigneeName} (${params.newAssigneeEmail}) con nuevo SLA de ${params.slaHours}h. Notas de transferencia: ${params.delegationNotes?.trim() || 'Sin notas adicionales'}. Progreso reiniciado al 0%.`
    });

    this.saveTasks(tenantId, tasks);
    return { success: true, task };
  }

  /**
   * Mueve una tarjeta de segmento en el Tablero Kanban y actualiza
   * automáticamente el porcentaje de avance según la columna de destino
   */
  public static moveTaskKanbanSegment(
    tenantId: string,
    taskId: string,
    targetSegment: 'URGENTE' | 'PENDIENTE' | 'EN_PROCESO' | 'ESCALADO_CEO' | 'RESUELTO',
    authorName = 'Dirección General / CEO',
    authorEmail = 'direccion@ibime.edu.mx'
  ): { success: boolean; task?: WorkOsTask; requiresReassignmentModal?: boolean; error?: string } {
    const tasks = this.getTasks(tenantId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Expediente no encontrado.' };

    // Regla Mandatoria: si viene de Urgentes o No Atendidos hacia Recién Delegados,
    // requiere pop-up para definir el nuevo delegado responsable
    if (targetSegment === 'PENDIENTE' && (task.status === 'URGENTE' || task.status === 'NO_ATENDIDO')) {
      return { success: false, requiresReassignmentModal: true, task };
    }

    const now = new Date().toISOString();

    switch (targetSegment) {
      case 'PENDIENTE':
        task.status = 'PENDIENTE';
        task.progressPercent = 0; // Cambio automático al 0%
        task.firstOpenedAt = undefined;
        task.isNeglected = false;
        task.auditTrail.unshift({
          id: `aud-${Date.now()}`,
          timestamp: now,
          authorName,
          authorEmail,
          action: 'Transferencia a Recién Delegados (Kanban)',
          type: 'status_change',
          details: 'Expediente transferido a la columna de Recién Delegados. Porcentaje de avance ajustado automáticamente al 0%.'
        });
        break;

      case 'EN_PROCESO':
        task.status = 'EN_PROCESO';
        // Cambio automático de porcentaje: si estaba en < 30%, se fija al 50% (nivel intermedio naranja)
        if (task.progressPercent < 30) {
          task.progressPercent = 50;
        } else if (task.progressPercent >= 100) {
          task.progressPercent = 85;
        }
        task.isNeglected = false;
        task.auditTrail.unshift({
          id: `aud-${Date.now()}`,
          timestamp: now,
          authorName,
          authorEmail,
          action: `Transición a En Proceso Activo (${task.progressPercent}%)`,
          type: 'progress_update',
          details: `Expediente movido a En Proceso Activo en Kanban. Porcentaje actualizado automáticamente a ${task.progressPercent}%.`
        });
        break;

      case 'RESUELTO':
        task.status = 'RESUELTO';
        task.progressPercent = 100; // Cambio automático al 100% (Verde)
        task.resolvedAt = now;
        task.isNeglected = false;
        task.isOverdue = false;
        if (!task.resolutionSummary) {
          task.resolutionSummary = 'Caso validado y resuelto directamente en el tablero Kanban institucional.';
        }
        task.checklist = task.checklist.map(c => ({ ...c, completed: true, completedAt: now }));
        task.auditTrail.unshift({
          id: `aud-${Date.now()}`,
          timestamp: now,
          authorName,
          authorEmail,
          action: 'Resolución manual desde Kanban (100%)',
          type: 'resolved',
          details: 'Expediente marcado como RESUELTO al 100% mediante arrastre manual en Kanban.'
        });
        break;

      case 'URGENTE':
        task.status = 'URGENTE';
        task.priority = 'CRITICA';
        if (task.progressPercent >= 100) {
          task.progressPercent = 20; // Reabierto o crítico
        }
        task.auditTrail.unshift({
          id: `aud-${Date.now()}`,
          timestamp: now,
          authorName,
          authorEmail,
          action: 'Elevación a Urgentes & No Atendidos',
          type: 'status_change',
          details: `Expediente clasificado como Urgente de atención inmediata desde el tablero Kanban. Progreso: ${task.progressPercent}%.`
        });
        break;

      case 'ESCALADO_CEO':
        task.status = 'ESCALADO_CEO';
        task.isEscalatedToCeo = true;
        task.priority = 'CRITICA';
        if (!task.escalationReason) {
          task.escalationReason = 'Escalamiento manual solicitado mediante arrastre directo a Dirección General en Kanban.';
        }
        task.auditTrail.unshift({
          id: `aud-${Date.now()}`,
          timestamp: now,
          authorName,
          authorEmail,
          action: 'Escalamiento a Dirección General (CEO)',
          type: 'escalated',
          details: 'Expediente arrastrado a la columna de Escalados a CEO.'
        });
        break;
    }

    this.saveTasks(tenantId, tasks);
    return { success: true, task };
  }

  // ==========================================================================
  // 7. CÁLCULO DE SLA, TIEMPOS, ESTADOS NO ATENDIDOS Y COLORES
  // ==========================================================================

  /**
   * Determina el color oficial según el porcentaje de progreso:
   * - Rojo: < 30%
   * - Naranja: 30% - 80%
   * - Amarillo: 81% - 99%
   * - Verde: 100% (Resuelto)
   */
  public static getProgressColor(percent: number): {
    colorName: 'red' | 'orange' | 'yellow' | 'green';
    bgClass: string;
    textClass: string;
    borderClass: string;
    barGradient: string;
  } {
    if (percent >= 100) {
      return {
        colorName: 'green',
        bgClass: 'bg-emerald-500',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        borderClass: 'border-emerald-300 dark:border-emerald-700',
        barGradient: 'from-emerald-500 to-teal-500'
      };
    }
    if (percent >= 81) {
      return {
        colorName: 'yellow',
        bgClass: 'bg-yellow-400',
        textClass: 'text-yellow-600 dark:text-yellow-400',
        borderClass: 'border-yellow-300 dark:border-yellow-700',
        barGradient: 'from-yellow-400 to-amber-400'
      };
    }
    if (percent >= 30) {
      return {
        colorName: 'orange',
        bgClass: 'bg-orange-500',
        textClass: 'text-orange-600 dark:text-orange-400',
        borderClass: 'border-orange-300 dark:border-orange-700',
        barGradient: 'from-orange-500 to-amber-500'
      };
    }
    return {
      colorName: 'red',
      bgClass: 'bg-rose-500',
      textClass: 'text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-300 dark:border-rose-700',
      barGradient: 'from-rose-500 to-red-600'
    };
  }

  /**
   * Calcula el tiempo restante o vencido del SLA
   */
  public static getSlaCountdown(task: WorkOsTask): {
    remainingFormatted: string;
    isOverdue: boolean;
    hoursLeft: number;
    minutesLeft: number;
    percentElapsed: number;
  } {
    if (task.status === 'RESUELTO') {
      const minutes = task.resolutionTimeMinutes || 60;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return {
        remainingFormatted: `Resuelto en ${h}h ${m}m`,
        isOverdue: false,
        hoursLeft: 0,
        minutesLeft: 0,
        percentElapsed: 100
      };
    }

    const now = Date.now();
    const created = new Date(task.createdAt).getTime();
    const deadline = new Date(task.slaDeadline).getTime();
    const totalDuration = Math.max(1, deadline - created);
    const diff = deadline - now;

    const percentElapsed = Math.min(100, Math.max(0, Math.round(((now - created) / totalDuration) * 100)));

    if (diff <= 0) {
      const overdueMs = Math.abs(diff);
      const h = Math.floor(overdueMs / (1000 * 60 * 60));
      const m = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
      return {
        remainingFormatted: `⚠️ Vencido por ${h}h ${m}m`,
        isOverdue: true,
        hoursLeft: -h,
        minutesLeft: -m,
        percentElapsed: 100
      };
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      remainingFormatted: `⏱️ ${h}h ${m}m restantes`,
      isOverdue: false,
      hoursLeft: h,
      minutesLeft: m,
      percentElapsed
    };
  }

  /**
   * Evalúa la salud de las tareas y detecta casos "(NO ATENDIDO)":
   * Si permanece sin abrir o el progreso no supera el 25% dentro del tiempo establecido.
   */
  public static runHealthAndNeglectAudit(tenantId: string): { updatedCount: number; neglectedTasks: WorkOsTask[] } {
    const tasks = this.getTasks(tenantId);
    let updatedCount = 0;
    const neglectedTasks: WorkOsTask[] = [];
    const now = Date.now();

    for (const task of tasks) {
      if (task.status === 'RESUELTO') continue;

      const createdTime = new Date(task.createdAt).getTime();
      const elapsedHours = (now - createdTime) / (1000 * 60 * 60);

      // Regla: si lleva más de 6 horas sin abrir, o más de 12 horas con progreso < 25%
      const isUnopenedLong = !task.firstOpenedAt && elapsedHours >= 4;
      const isLowProgress = task.progressPercent < 25 && elapsedHours >= 8;

      if (isUnopenedLong || isLowProgress) {
        if (!task.isNeglected || task.status !== 'NO_ATENDIDO') {
          task.isNeglected = true;
          task.status = 'NO_ATENDIDO';
          task.priority = 'CRITICA';
          task.auditTrail.unshift({
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            authorName: 'Motor de Auditoría Work OS',
            authorEmail: 'sistema@ibime.edu.mx',
            action: 'Clasificación automática como (NO ATENDIDO)',
            type: 'status_change',
            details: `Caso sin atención adecuada (${task.firstOpenedAt ? `Progreso en ${task.progressPercent}% tras ${Math.round(elapsedHours)}h` : 'Correo sin abrir'}). Reaparece con alta prioridad en pantalla del CEO.`
          });
          updatedCount++;
          neglectedTasks.push(task);
        }
      }
    }

    if (updatedCount > 0) {
      this.saveTasks(tenantId, tasks);
    }

    return { updatedCount, neglectedTasks };
  }

  // ==========================================================================
  // 8. ESCENARIOS DE PRUEBA INTERACTIVOS (INYECCIÓN DE LOS 25 ESCENARIOS)
  // ==========================================================================

  public static getTestScenarios(seedKey?: string): WorkOsTestScenario[] {
    if (!seedKey) return SEED_TEST_SCENARIOS;
    return SEED_TEST_SCENARIOS.filter(s => s.seedKey === seedKey);
  }

  /**
   * Inyecta un escenario de prueba en vivo para validación inmediata
   */
  public static injectScenario(tenantId: string, scenarioId: string): WorkOsTask | null {
    const scenario = SEED_TEST_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return null;

    const seeds = this.getSeedAccounts(tenantId);
    const seed = seeds.find(s => s.sectionKey === scenario.seedKey) || seeds[0];
    const now = new Date().toISOString();

    const sampleDocs: WorkOsEvidenceDoc[] = [];
    if (scenario.sampleEvidenceFileName) {
      sampleDocs.push({
        id: `ev-init-${Date.now()}`,
        taskId: `task-${Date.now()}`,
        fileName: scenario.sampleEvidenceFileName,
        fileSize: 245000,
        fileType: scenario.sampleEvidenceType || 'pdf',
        uploadedAt: now,
        uploadedBy: scenario.senderName,
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAEr5HIKWbBhWlBAQEFBAQA24gTOCmVuZHN0cmVhbQplbmRvYmoK',
        notes: 'Documento adjunto en el correo remitente',
        category: 'general'
      });
    }

    const newTask = this.createTask(tenantId, {
      title: scenario.title,
      description: scenario.description,
      category: seed.sectionName,
      sectionKey: seed.sectionKey,
      sectionName: seed.sectionName,
      status: 'URGENTE',
      priority: scenario.urgency,
      slaHours: scenario.slaHours,
      primaryAssignee: {
        name: seed.delegateName,
        email: seed.departmentAccount,
        role: seed.sectionName
      },
      evidenceDocs: sampleDocs,
      checklist: scenario.suggestedSteps.map((step, idx) => ({
        id: `step-${idx}-${Date.now()}`,
        title: step,
        completed: idx === 0,
        completedAt: idx === 0 ? now : undefined
      })),
      sourceEmail: {
        id: `email-${Date.now()}`,
        senderName: scenario.senderName,
        senderEmail: scenario.senderEmail,
        subject: scenario.title,
        snippet: scenario.description,
        receivedAt: now,
        campus: 'IBIME Sede Matriz'
      },
      aiAnalysis: {
        riskScore: scenario.urgency === 'CRITICA' ? 92 : scenario.urgency === 'ALTA' ? 74 : 35,
        riskLevel: scenario.urgency === 'CRITICA' ? 'CRITICO' : scenario.urgency === 'ALTA' ? 'ALTO' : 'MODERADO',
        summary: `Asunto ingresado de ${scenario.senderName}. Requiere atención prioritaria por ${seed.delegateName} dentro de las ${scenario.slaHours} horas reglamentarias.`,
        suggestedNextAction: scenario.suggestedSteps[0] || 'Iniciar contacto inmediato',
        draftReply: `Estimado(a) ${scenario.senderName}:\n\nHemos recibido formalmente su solicitud en la Dirección General de Instituto Bilingüe IBIME con folio institucional. Se ha canalizado de inmediato a ${seed.delegateName} (${seed.sectionName}) quien atenderá su requerimiento puntualmente.\n\nAtentamente,\nDirección General Institucional`
      }
    });

    newTask.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      authorName: 'Simulador de Escenarios Work OS',
      authorEmail: 'sistema@ibime.edu.mx',
      action: `Inyección de Escenario Oficial: ${scenario.title}`,
      type: 'status_change',
      details: `Caso inyectado para pruebas del departamento ${seed.sectionName}. SLA activo de ${scenario.slaHours}h.`
    });
    this.saveTasks(tenantId, this.getTasks(tenantId).map(t => t.id === newTask.id ? newTask : t));

    return newTask;
  }

  // ==========================================================================
  // 9. AUTOMATIZACIONES Y MOTOR DE REGLAS
  // ==========================================================================

  public static getAutomations(tenantId: string): WorkOsAutomationRule[] {
    const cleanTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';

    if (automationsMemoryStore.has(cleanTenant)) {
      return automationsMemoryStore.get(cleanTenant)!;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.getAutomationsStorageKey(cleanTenant));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            automationsMemoryStore.set(cleanTenant, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[WorkOsService] Error al leer automatizaciones:', err);
      }
    }

    automationsMemoryStore.set(cleanTenant, DEFAULT_WORK_OS_AUTOMATIONS);
    this.saveAutomations(cleanTenant, DEFAULT_WORK_OS_AUTOMATIONS);
    return DEFAULT_WORK_OS_AUTOMATIONS;
  }

  public static saveAutomations(tenantId: string, rules: WorkOsAutomationRule[]): void {
    const cleanTenant = tenantId || 'e1000000-0000-0000-0000-000000000001';
    automationsMemoryStore.set(cleanTenant, rules);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getAutomationsStorageKey(cleanTenant), JSON.stringify(rules));
      } catch (err) {
        console.warn('[WorkOsService] Error al persistir automatizaciones:', err);
      }
    }
  }

  public static toggleAutomationRule(tenantId: string, ruleId: string): boolean {
    const rules = this.getAutomations(tenantId);
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return false;

    rule.enabled = !rule.enabled;
    this.saveAutomations(tenantId, rules);
    return rule.enabled;
  }

  // ==========================================================================
  // 10. MÉTRICAS CONSOLIDADAS DEL DASHBOARD EN TIEMPO REAL
  // ==========================================================================

  public static getDashboardMetrics(tenantId: string): WorkOsDashboardMetrics {
    const tasks = this.getTasks(tenantId);

    const totalTasks = tasks.length;
    const resolvedTasks = tasks.filter(t => t.status === 'RESUELTO').length;
    const inProgressTasks = tasks.filter(t => t.status === 'EN_PROCESO').length;
    const urgentTasks = tasks.filter(t => t.status === 'URGENTE').length;
    const noAtendidoTasks = tasks.filter(t => t.status === 'NO_ATENDIDO').length;
    const escalatedTasks = tasks.filter(t => t.status === 'ESCALADO_CEO').length;

    // Calcular tasa de cumplimiento de SLA
    const resolvedList = tasks.filter(t => t.status === 'RESUELTO');
    let resolvedOnTime = 0;
    let totalResolutionMinutes = 0;

    for (const r of resolvedList) {
      const minutes = r.resolutionTimeMinutes || 60;
      totalResolutionMinutes += minutes;
      if (minutes <= r.slaHours * 60) {
        resolvedOnTime++;
      }
    }

    const slaComplianceRate = resolvedList.length > 0 
      ? Math.round((resolvedOnTime / resolvedList.length) * 100) 
      : 96;

    const avgResolutionHours = resolvedList.length > 0
      ? Number((totalResolutionMinutes / (resolvedList.length * 60)).toFixed(1))
      : 12.4;

    const tasksPerSeed: Record<string, number> = {};
    let totalEvidenceDocs = 0;
    const collaboratorsSet = new Set<string>();

    for (const t of tasks) {
      tasksPerSeed[t.sectionName] = (tasksPerSeed[t.sectionName] || 0) + 1;
      totalEvidenceDocs += t.evidenceDocs.length;
      if (t.primaryAssignee?.email) collaboratorsSet.add(t.primaryAssignee.email);
      for (const c of t.collaborators) {
        collaboratorsSet.add(c.email);
      }
    }

    return {
      totalTasks,
      resolvedTasks,
      inProgressTasks,
      urgentTasks,
      noAtendidoTasks,
      escalatedTasks,
      slaComplianceRate,
      avgResolutionHours,
      tasksPerSeed,
      activeCollaboratorsCount: collaboratorsSet.size,
      totalEvidenceDocs
    };
  }

  // ==========================================================================
  // 11. TAREAS DEMO INICIALES
  // ==========================================================================

  private static generateInitialDemoTasks(tenantId: string): WorkOsTask[] {
    const now = new Date();
    const isoNow = now.toISOString();
    const fourHoursAgo = new Date(now.getTime() - 4 * 3600 * 1000).toISOString();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 3600 * 1000).toISOString();

    return [
      {
        id: `task-demo-01-${tenantId}`,
        matterCode: 'EXP-IBIME-2026-0042',
        title: 'Solicitud de CFDI 4.0 con complemento IEDU y reajuste de factura',
        description: 'Padre de familia solicita corrección de RFC y emisión de factura con deducción IEDU con CURP del alumno para deducción anual SAT.',
        category: 'Departamento Administrativo / Cobranza',
        sectionKey: 'cobranza',
        sectionName: 'Departamento Administrativo / Cobranza',
        status: 'EN_PROCESO',
        priority: 'ALTA',
        primaryAssignee: {
          name: 'C.P. Claudia Albarrán',
          email: 'finanzas@ibime.edu.mx',
          role: 'Responsable de Cobranza'
        },
        collaborators: [
          {
            name: 'Lic. Salvador Vega',
            email: 'auditoria@ibime.edu.mx',
            role: 'Auditor Financiero',
            joinedAt: fourHoursAgo,
            assignedBy: 'Dirección General / CEO',
            contributionPercent: 30
          }
        ],
        createdAt: fourHoursAgo,
        firstOpenedAt: fourHoursAgo,
        slaHours: 24,
        slaDeadline: new Date(now.getTime() + 20 * 3600 * 1000).toISOString(),
        progressPercent: 65,
        nextStepsOutline: '1. Validación de RFC en padrón SAT completada.\n2. Verificando constancia de situación fiscal.\n3. Timbrado programado ante PAC para las 15:00 hrs.',
        checklist: [
          { id: 'c-1', title: 'Recepción de cédula fiscal', completed: true, completedAt: fourHoursAgo },
          { id: 'c-2', title: 'Cotejo de CURP del alumno', completed: true, completedAt: fourHoursAgo },
          { id: 'c-3', title: 'Generación de pre-factura', completed: false },
          { id: 'c-4', title: 'Timbrado CFDI 4.0 definitivo', completed: false }
        ],
        evidenceDocs: [
          {
            id: 'ev-demo-1',
            taskId: `task-demo-01-${tenantId}`,
            fileName: 'Constancia_Situacion_Fiscal_Tutor.pdf',
            fileSize: 184000,
            fileType: 'pdf',
            uploadedAt: fourHoursAgo,
            uploadedBy: 'C.P. Claudia Albarrán',
            category: 'financiera'
          }
        ],
        auditTrail: [
          {
            id: 'aud-demo-1',
            timestamp: fourHoursAgo,
            authorName: 'C.P. Claudia Albarrán',
            authorEmail: 'finanzas@ibime.edu.mx',
            action: 'Apertura de caso y avance al 65%',
            type: 'progress_update',
            details: 'Se cotejó la constancia de situación fiscal del tutor con homoclave correcta.'
          }
        ],
        isOverdue: false,
        isNeglected: false,
        isEscalatedToCeo: false,
        aiAnalysis: {
          riskScore: 28,
          riskLevel: 'BAJO',
          summary: 'Trámite fiscal estándar con documentación completa. Se anticipa cumplimiento holgado del SLA.',
          suggestedNextAction: 'Timbrar CFDI 4.0 y enviar por correo al tutor.'
        }
      },
      {
        id: `task-demo-02-${tenantId}`,
        matterCode: 'EXP-IBIME-2026-0043',
        title: 'Protocolo urgente de alergia severa a frutos secos y EpiPen',
        description: 'Madre de alumno de nuevo ingreso informa que su hijo es anafiláctico a cacahuates y entrega autoinyector de epinefrina.',
        category: 'Servicio Médico y Salud Escolar',
        sectionKey: 'servicio_medico',
        sectionName: 'Servicio Médico y Salud Escolar',
        status: 'RESUELTO',
        priority: 'CRITICA',
        primaryAssignee: {
          name: 'Dra. Andrea Palacios',
          email: 'enfermeria@ibime.edu.mx',
          role: 'Médico Escolar'
        },
        collaborators: [],
        createdAt: twelveHoursAgo,
        firstOpenedAt: twelveHoursAgo,
        slaHours: 12,
        slaDeadline: new Date(now.getTime() + 0 * 3600 * 1000).toISOString(),
        progressPercent: 100,
        resolvedAt: fourHoursAgo,
        resolutionSummary: 'Protocolo de emergencia médica activado. Alerta médica roja fijada en el Expediente 360 del alumno en ISkool. EpiPen rotulado y resguardado en botiquín de primeros auxilios. Docentes titulares capacitados en signos tempranos de anafilaxia.',
        resolutionTimeMinutes: 240, // 4 horas
        checklist: [
          { id: 'c-1', title: 'Registro en bitácora clínica', completed: true },
          { id: 'c-2', title: 'Resguardo de medicamento de urgencia', completed: true },
          { id: 'c-3', title: 'Capacitación a docentes de aula', completed: true }
        ],
        evidenceDocs: [
          {
            id: 'ev-demo-2',
            taskId: `task-demo-02-${tenantId}`,
            fileName: 'Protocolo_Alergias_Expediente_360.pdf',
            fileSize: 310000,
            fileType: 'pdf',
            uploadedAt: twelveHoursAgo,
            uploadedBy: 'Dra. Andrea Palacios',
            category: 'medica'
          }
        ],
        auditTrail: [
          {
            id: 'aud-demo-2',
            timestamp: fourHoursAgo,
            authorName: 'Dra. Andrea Palacios',
            authorEmail: 'enfermeria@ibime.edu.mx',
            action: 'Resolución de protocolo de emergencia médica (100%)',
            type: 'resolved',
            details: 'EpiPen resguardado y alerta médica emitida en el sistema escolar.'
          }
        ],
        isOverdue: false,
        isNeglected: false,
        isEscalatedToCeo: false
      },
      {
        id: `task-demo-03-${tenantId}`,
        matterCode: 'EXP-IBIME-2026-0044',
        title: 'Retraso de 25 minutos en Ruta 4 matutina por cierre vial de obras',
        description: 'Padres de familia reportan que la unidad de transporte escolar quedó atrapada en desviación vial sin notificación previa.',
        category: 'Coordinación de Logística y Prefectura',
        sectionKey: 'transporte',
        sectionName: 'Coordinación de Logística y Prefectura',
        status: 'URGENTE',
        priority: 'ALTA',
        primaryAssignee: {
          name: 'Prof. Mario Alberto Torres',
          email: 'transporte@ibime.edu.mx',
          role: 'Prefecto y Coordinador de Transporte'
        },
        collaborators: [],
        createdAt: fourHoursAgo,
        slaHours: 24,
        slaDeadline: new Date(now.getTime() + 20 * 3600 * 1000).toISOString(),
        progressPercent: 20,
        checklist: [
          { id: 'c-1', title: 'Llamada por radio al operador de la unidad', completed: true },
          { id: 'c-2', title: 'Justificación formal de retardo a 14 alumnos', completed: false },
          { id: 'c-3', title: 'Envío de comunicado push a familias afectadas', completed: false }
        ],
        evidenceDocs: [],
        auditTrail: [
          {
            id: 'aud-demo-3',
            timestamp: fourHoursAgo,
            authorName: 'Dirección General / CEO',
            authorEmail: 'direccion@ibime.edu.mx',
            action: 'Delegación inicial urgente',
            type: 'status_change',
            details: 'Se requiere resolución y reporte de telemetría GPS del recorrido.'
          }
        ],
        isOverdue: false,
        isNeglected: false,
        isEscalatedToCeo: false
      }
    ];
  }
}
