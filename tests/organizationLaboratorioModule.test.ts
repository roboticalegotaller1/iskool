// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import {
  ORG_PALETTE_GROUPS,
  OrganizationServerService,
  autoOrganizeOrgNodes,
  generateInterleavedOrgPassword,
  generateTimetableSlots,
  getUnifiedInstitutionAccounts,
  isSuperiorInOrgChart,
  wouldCreateHierarchyCycle,
} from '../src/lib/services/organizationService';
import { CeoEmailSettingsService } from '../src/lib/services/ceoEmailSettingsService';
import { useOrganizationStore } from '../src/store/useOrganizationStore';
import { useSchoolAdminStore } from '../src/store/useSchoolAdminStore';
import { POST as postAuthSession } from '../src/app/api/auth/session/route';
import { POST as postRotateInitialPassword } from '../src/app/api/auth/rotate-initial-password/route';

describe('🏛️ Módulo 5. Organización — Laboratorio Pedagógico (Auditoría Quirúrgica Integral)', () => {
  beforeEach(() => {
    OrganizationServerService.resetForTests();
    useOrganizationStore.getState().resetSchoolOrganization('sch-test-case');
    useOrganizationStore.getState().resetSchoolOrganization('sch-ibime');
    useOrganizationStore.getState().resetSchoolOrganization('sch-jjrosseau');
    useOrganizationStore.getState().resetSchoolOrganization('emp-bmw');
  });

  it('1. Habilita 5. Organización en todas las cuentas con Visión CEO y renumera 6. Portal Académico y 7. iMail & Triage con aislamiento por colegio', () => {
    const ceoPath = path.join(process.cwd(), 'src/components/admin/CEOExecutiveDashboard.tsx');
    const content = fs.readFileSync(ceoPath, 'utf8');

    expect(content).toContain("id: 'organizacion'");
    expect(content).toContain("label: '5. Organización'");
    expect(content).toContain("label: '6. Portal Académico'");
    expect(content).toContain("label: isCorporate ? '6. iMail & Triage' : '7. iMail & Triage'");
    expect(content).toContain("activeTab === 'organizacion'");
    expect(content).toContain('schoolId={resolvedOrgSchoolId}');
  });

  it('2. Implementa exactamente los 4 bloques y sub-opciones del modelo Studio + 2D Radar Minimap + Auto-organizar Nodos', () => {
    expect(ORG_PALETTE_GROUPS).toHaveLength(4);

    const adminGroup = ORG_PALETTE_GROUPS[0];
    expect(adminGroup.title).toBe('Administración');
    expect(adminGroup.expandable).toBe(true);
    expect(adminGroup.items.map((i) => i.label)).toEqual([
      'Director General',
      'Finanzas',
      'Coordinador',
      'Control Escolar',
      'Servicio Médico',
      'Jurídico',
    ]);

    expect(ORG_PALETTE_GROUPS[1].title).toBe('Profesor');

    const intendenciaGroup = ORG_PALETTE_GROUPS[2];
    expect(intendenciaGroup.title).toBe('Intendencia y servicios');
    expect(intendenciaGroup.expandable).toBe(true);
    expect(intendenciaGroup.items.every((i) => i.accountTier === 'tipo_2')).toBe(true);
    expect(intendenciaGroup.items.map((i) => i.label)).toEqual([
      'Intendente',
      'Transporte',
      'Mantenimiento',
    ]);

    expect(ORG_PALETTE_GROUPS[3].title).toBe('Otros');

    // Verificar presencia del 2D Radar Minimap y Auto-organizar en el componente Studio
    const studioPath = path.join(
      process.cwd(),
      'src/components/admin/organization/CEOOrganizationStudio.tsx'
    );
    const studioContent = fs.readFileSync(studioPath, 'utf8');
    expect(studioContent).toContain('2D RADAR MINIMAP');
    expect(studioContent).toContain('Auto-organizar Nodos');

    // Probar algoritmo jerárquico sin traslapes ni ciclos
    const store = useOrganizationStore.getState();
    const dir = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'director_general',
      x: 500,
      y: 400,
    });
    const coord = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'coordinador',
      x: 500,
      y: 400,
    });
    const prof = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'profesor',
      x: 500,
      y: 400,
    });

    expect(store.connectNodes('sch-test-case', dir.nodeId, coord.nodeId).success).toBe(true);
    expect(store.connectNodes('sch-test-case', coord.nodeId, prof.nodeId).success).toBe(true);
    // Prevenir ciclos (prof -> dir)
    expect(
      wouldCreateHierarchyCycle(
        prof.nodeId,
        dir.nodeId,
        useOrganizationStore.getState().getGraph('sch-test-case').edges
      )
    ).toBe(true);
    expect(store.connectNodes('sch-test-case', prof.nodeId, dir.nodeId).success).toBe(false);

    store.autoOrganize('sch-test-case');
    const organized = useOrganizationStore.getState().getGraph('sch-test-case').nodes;
    const dPos = organized.find((n) => n.nodeId === dir.nodeId)!;
    const cPos = organized.find((n) => n.nodeId === coord.nodeId)!;
    const pPos = organized.find((n) => n.nodeId === prof.nodeId)!;

    expect(dPos.y).toBeLessThan(cPos.y);
    expect(cPos.y).toBeLessThan(pPos.y);
  });

  it('3. Genera contraseña automática de 6 caracteres (3 dígitos 0-9 y 3 letras Mayús/Minús intercaladas), soporta Recuperar contraseña e invalida clave inicial tras el primer ingreso', async () => {
    for (let i = 0; i < 60; i++) {
      const pwd = generateInterleavedOrgPassword();
      expect(pwd).toHaveLength(6);
      expect(pwd).toMatch(/^\d[A-Za-z]\d[A-Za-z]\d[A-Za-z]$/);
      expect(pwd).toMatch(/[A-Z]/);
      expect(pwd).toMatch(/[a-z]/);
    }

    const store = useOrganizationStore.getState();
    const node = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'finanzas',
    });

    const initialPassword = node.tempPasswordPreview!;
    expect(initialPassword).toMatch(/^\d[A-Za-z]\d[A-Za-z]\d[A-Za-z]$/);

    // Cerrar configuración crea el usuario automáticamente
    store.saveAndProvisionNode('sch-test-case', node.nodeId, {
      firstName: 'Laura',
      paternalLastName: 'Gómez',
      maternalLastName: 'Ruiz',
      username: 'l.gomez@laboratoriopedagogico.edu.mx',
    });

    // Sincronizar también en el servicio de servidor para validar endpoints HTTP reales
    OrganizationServerService.saveGraph(
      'sch-test-case',
      useOrganizationStore.getState().getGraph('sch-test-case')
    );

    // Recuperar contraseña genera y asigna automáticamente una nueva contraseña intercalada
    const recovered = store.recoverNodePassword('sch-test-case', node.nodeId);
    expect(recovered.newPassword).toMatch(/^\d[A-Za-z]\d[A-Za-z]\d[A-Za-z]$/);
    OrganizationServerService.saveGraph(
      'sch-test-case',
      useOrganizationStore.getState().getGraph('sch-test-case')
    );

    // En primer ingreso exige cambio obligatorio de contraseña
    const firstAttempt = useOrganizationStore
      .getState()
      .authenticateOrgAccount('l.gomez@laboratoriopedagogico.edu.mx', recovered.newPassword);
    expect(firstAttempt.matched).toBe(true);
    expect(firstAttempt.validPassword).toBe(true);
    expect(firstAttempt.mustChangePassword).toBe(true);

    // Validar respuesta 403 MUST_CHANGE_INITIAL_PASSWORD en /api/auth/session antes de rotar
    const preRotateReq = new NextRequest('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: recovered.newPassword,
        user: { email: 'l.gomez@laboratoriopedagogico.edu.mx' },
      }),
    });
    const preRotateRes = await postAuthSession(preRotateReq);
    expect(preRotateRes.status).toBe(403);
    const preRotateJson = await preRotateRes.json();
    expect(preRotateJson.code).toBe('MUST_CHANGE_INITIAL_PASSWORD');

    // Rotar contraseña en servidor y store
    const rotateReq = new NextRequest('http://localhost:3000/api/auth/rotate-initial-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'l.gomez@laboratoriopedagogico.edu.mx',
        currentPassword: recovered.newPassword,
        newPassword: 'MiClavePersonalSegura2026!',
      }),
    });
    const rotateRes = await postRotateInitialPassword(rotateReq);
    expect(rotateRes.status).toBe(200);

    await useOrganizationStore
      .getState()
      .completeFirstLoginPasswordRotation(
        'l.gomez@laboratoriopedagogico.edu.mx',
        recovered.newPassword,
        'MiClavePersonalSegura2026!'
      );

    // La contraseña dada por el CEO DEJA DE FUNCIONAR permanentemente
    const oldPassCheck = useOrganizationStore
      .getState()
      .authenticateOrgAccount('l.gomez@laboratoriopedagogico.edu.mx', recovered.newPassword);
    expect(oldPassCheck.validPassword).toBe(false);

    // La nueva contraseña personal ingresa limpiamente con sesión 200 y sin pedir cambio
    const newPassCheck = useOrganizationStore
      .getState()
      .authenticateOrgAccount(
        'l.gomez@laboratoriopedagogico.edu.mx',
        'MiClavePersonalSegura2026!'
      );
    expect(newPassCheck.validPassword).toBe(true);
    expect(newPassCheck.mustChangePassword).toBe(false);

    const postRotateSessionReq = new NextRequest('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'MiClavePersonalSegura2026!',
        user: { email: 'l.gomez@laboratoriopedagogico.edu.mx' },
      }),
    });
    const postRotateSessionRes = await postAuthSession(postRotateSessionReq);
    expect(postRotateSessionRes.status).toBe(200);
  });

  it('4. Consolida horas en Finanzas como UN SOLO PROFESOR aunque tenga múltiples materias, re-pregunta condiciones al cambiar de sede, preserva correos al revocar iMail y conserva historial al cambiar colaborador del nodo', () => {
    const store = useOrganizationStore.getState();

    // Crear profesor con 3 materias distintas
    const profNode = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'profesor',
    });

    // Por default todas las cuentas tienen acceso a iMail & Triage
    expect(profNode.permissions.imail_triage).toBe(true);

    const { updatedNode: provisionedProf } = store.saveAndProvisionNode(
      'sch-test-case',
      profNode.nodeId,
      {
        firstName: 'Alejandro',
        paternalLastName: 'Mendoza',
        maternalLastName: 'Peña',
        username: 'a.mendoza@laboratoriopedagogico.edu.mx',
        hourlyRateMxn: 300,
        subjects: [
          {
            id: 's1',
            subjectName: 'Matemáticas',
            contourColor: '#1D68FF',
            teachAnother: true,
          },
          {
            id: 's2',
            subjectName: 'Física',
            contourColor: '#059669',
            teachAnother: true,
          },
          {
            id: 's3',
            subjectName: 'Robótica',
            contourColor: '#D97706',
            teachAnother: false,
          },
        ],
      }
    );

    expect(provisionedProf?.isProvisioned).toBe(true);
    expect(provisionedProf?.academicPortalProvisioned).toBe(true);

    // Verificar reporte inmediato en perfil de Superusuario (staffUsers) y Portal Académico (teachersList)
    const adminState = useSchoolAdminStore.getState();
    expect(
      adminState.staffUsers.some((u) => u.email === 'a.mendoza@laboratoriopedagogico.edu.mx')
    ).toBe(true);
    expect(
      adminState.teachersList.some((t) => t.email === 'a.mendoza@laboratoriopedagogico.edu.mx')
    ).toBe(true);

    // Catálogo autodesplegable de materias guardadas con colores distintos
    const graphAfterSubjects = useOrganizationStore.getState().getGraph('sch-test-case');
    expect(graphAfterSubjects.savedSubjects.map((s) => s.name)).toEqual([
      'Matemáticas',
      'Física',
      'Robótica',
    ]);

    // Configurar horario escolar (bloques de 60 minutos, Lunes - Sábado)
    const cfg = store.configureCampusSchedule('sch-test-case', {
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      blockDurationMinutes: 60,
      entryTime: '08:00',
      exitTime: '12:00',
      workDays: 'lun_sab',
    });
    const slots = generateTimetableSlots(cfg);
    expect(slots).toHaveLength(4);

    // Asignar bloques de sus 3 materias distintas en el calendario semanal
    expect(
      store.placeSubjectBlockInTimetable({
        schoolId: 'sch-test-case',
        campusId: 'cmp-test-pri',
        day: 'Lunes',
        slotIndex: 0,
        startTime: '08:00',
        endTime: '09:00',
        durationMinutes: 60,
        teacherNodeId: profNode.nodeId,
        subjectId: 's1',
        subjectName: 'Matemáticas',
        contourColor: '#1D68FF',
      }).success
    ).toBe(true);

    expect(
      store.placeSubjectBlockInTimetable({
        schoolId: 'sch-test-case',
        campusId: 'cmp-test-pri',
        day: 'Martes',
        slotIndex: 1,
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        teacherNodeId: profNode.nodeId,
        subjectId: 's2',
        subjectName: 'Física',
        contourColor: '#059669',
      }).success
    ).toBe(true);

    expect(
      store.placeSubjectBlockInTimetable({
        schoolId: 'sch-test-case',
        campusId: 'cmp-test-pri',
        day: 'Sábado',
        slotIndex: 2,
        startTime: '10:00',
        endTime: '11:00',
        durationMinutes: 60,
        teacherNodeId: profNode.nodeId,
        subjectId: 's3',
        subjectName: 'Robótica',
        contourColor: '#D97706',
      }).success
    ).toBe(true);

    // Conteo en Finanzas: sigue siendo UN SOLO PROFESOR con la suma total de sus 3 horas/semana (12 horas/mes)
    const payroll = useOrganizationStore.getState().getPayrollSummary('sch-test-case');
    expect(payroll.totalTeachersConsolidatedCount).toBe(1);
    expect(payroll.rows).toHaveLength(1);
    expect(payroll.rows[0].subjectsCount).toBe(3);
    expect(payroll.rows[0].weeklyHours).toBe(3);
    expect(payroll.rows[0].monthlyHours).toBe(12);
    expect(payroll.rows[0].monthlyRecurringTotalMxn).toBe(3600); // 12h * $300

    // Quitar acceso a iMail & Triage: pausa sincronización pero NO borra correos históricos del CEO
    const { updatedNode: afterRevoke } = store.saveAndProvisionNode(
      'sch-test-case',
      profNode.nodeId,
      {
        permissions: {
          ...provisionedProf!.permissions,
          imail_triage: false,
        },
      }
    );
    expect(afterRevoke?.imailMailbox.syncActive).toBe(false);
    expect(afterRevoke?.imailMailbox.preservedHistoricalEmails.length).toBeGreaterThanOrEqual(2);

    // Cambio de colaborador y cambio de sede sobre el MISMO nodo: conserva nodeId, bloques e historial, y detecta cambio de sede
    const { updatedNode: afterTurnover, campusChanged } = store.saveAndProvisionNode(
      'sch-test-case',
      profNode.nodeId,
      {
        firstName: 'Elena',
        paternalLastName: 'Ruiz',
        maternalLastName: 'Soto',
        username: 'e.ruiz@laboratoriopedagogico.edu.mx',
        campusId: 'cmp-test-sec',
        campusName: 'Secundaria Laboratorio Demo',
      }
    );
    expect(afterTurnover?.nodeId).toBe(profNode.nodeId);
    expect(afterTurnover?.previousCollaborators).toHaveLength(1);
    expect(afterTurnover?.previousCollaborators[0].username).toBe(
      'a.mendoza@laboratoriopedagogico.edu.mx'
    );
    expect(campusChanged).toBe(true);

    // Los bloques de horario heredan automáticamente a la nueva titular sin perder información
    const placementsAfterTurnover = useOrganizationStore
      .getState()
      .getGraph('sch-test-case').timetablePlacements;
    expect(placementsAfterTurnover).toHaveLength(3);
    expect(placementsAfterTurnover[0].teacherFullName).toBe('Elena Ruiz Soto');
  });

  it('5. Reemplaza cuentas SLA por default con solo las cuentas generadas y dispara alertas vibratorias jerárquicas y de padre de familia', () => {
    const store = useOrganizationStore.getState();

    // Antes de crear cuentas en Laboratorio Pedagógico, las cuentas por default están eliminadas
    OrganizationServerService.saveGraph(
      'sch-test-case',
      store.getGraph('sch-test-case')
    );
    expect(CeoEmailSettingsService.getSettings('sch-test-case').delegates).toHaveLength(0);

    // Crear Director General (superior) -> Profesor (subordinado)
    const dir = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'director_general',
    });
    const prof = store.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'profesor',
    });

    store.saveAndProvisionNode('sch-test-case', dir.nodeId, {
      firstName: 'Roberto',
      paternalLastName: 'Salazar',
      maternalLastName: 'Díaz',
      username: 'r.salazar@laboratoriopedagogico.edu.mx',
    });
    store.saveAndProvisionNode('sch-test-case', prof.nodeId, {
      firstName: 'Sofía',
      paternalLastName: 'Ramos',
      maternalLastName: 'Luna',
      username: 's.ramos@laboratoriopedagogico.edu.mx',
    });
    store.connectNodes('sch-test-case', dir.nodeId, prof.nodeId);

    const currentGraph = useOrganizationStore.getState().getGraph('sch-test-case');
    OrganizationServerService.saveGraph('sch-test-case', currentGraph);

    // En la Matriz SLA SOLO aparecen las 2 cuentas generadas (0 cuentas por default)
    const delegates = CeoEmailSettingsService.getSettings('sch-test-case').delegates;
    expect(delegates).toHaveLength(2);
    expect(delegates.map((d) => d.delegateEmail)).toEqual([
      'r.salazar@laboratoriopedagogico.edu.mx',
      's.ramos@laboratoriopedagogico.edu.mx',
    ]);

    // Verificar jerarquía: dir es superior de prof, pero prof NO es superior de dir
    expect(isSuperiorInOrgChart(dir.nodeId, prof.nodeId, currentGraph.edges)).toBe(true);
    expect(isSuperiorInOrgChart(prof.nodeId, dir.nodeId, currentGraph.edges)).toBe(false);

    // Delegación desde superior dispara alerta vibratoria
    const superiorAlert = store.dispatchHierarchicalSlaAlert({
      schoolId: 'sch-test-case',
      fromNodeId: dir.nodeId,
      fromName: 'Roberto Salazar Díaz',
      fromRoleLabel: 'Director General',
      targetDelegateEmail: 's.ramos@laboratoriopedagogico.edu.mx',
      subject: 'Revisión urgente de planeación semanal',
      message: 'Favor de confirmar entrega antes de las 14:00 hrs.',
      slaHours: 4,
    });
    expect(superiorAlert.triggered).toBe(true);

    // Intento desde subordinado hacia superior NO dispara alerta de superior
    const nonSuperiorAttempt = store.dispatchHierarchicalSlaAlert({
      schoolId: 'sch-test-case',
      fromNodeId: prof.nodeId,
      fromName: 'Sofía Ramos Luna',
      fromRoleLabel: 'Profesor',
      targetDelegateEmail: 'r.salazar@laboratoriopedagogico.edu.mx',
      subject: 'Prueba inversa',
      message: 'No debe disparar alerta de superior',
      slaHours: 12,
    });
    expect(nonSuperiorAttempt.triggered).toBe(false);

    // Mensaje de padre de familia hacia profesor dispara alerta vibratoria y permite respuesta fluida
    const parentAlert = store.dispatchParentMessageAlert({
      schoolId: 'sch-test-case',
      parentName: 'Sr. Carlos Vega',
      studentName: 'Mateo Vega',
      targetTeacherUsername: 's.ramos@laboratoriopedagogico.edu.mx',
      targetTeacherName: 'Sofía Ramos Luna',
      subject: 'Consulta sobre proyecto de ciencias',
      message: 'Buenas tardes maestra, ¿qué material debe llevar Mateo mañana?',
    });
    expect(parentAlert.kind).toBe('parent_teacher_message');

    store.replyToVibratoryAlert(
      'sch-test-case',
      parentAlert.id,
      'Con gusto Sr. Vega, solo su cuaderno de laboratorio y bata blanca.'
    );
    const updatedAlerts = useOrganizationStore.getState().getGraph('sch-test-case').alerts;
    const replied = updatedAlerts.find((a) => a.id === parentAlert.id);
    expect(replied?.replyText).toContain('cuaderno de laboratorio');
  });

  it('6. Cumple al 100% la Regla No Negociable 1 (Marca Blanca Institucional sin marcas comerciales prohibidas)', () => {
    const newFiles = [
      'src/lib/services/organizationTypes.ts',
      'src/lib/services/organizationService.ts',
      'src/store/useOrganizationStore.ts',
      'src/app/api/admin/organization/route.ts',
      'src/app/api/auth/rotate-initial-password/route.ts',
      'src/components/admin/organization/NodeConfigureModal.tsx',
      'src/components/admin/organization/SchoolTimetableBuilder.tsx',
      'src/components/admin/organization/CEOOrganizationStudio.tsx',
      'src/components/auth/FirstLoginPasswordRotationModal.tsx',
      'src/components/alerts/VibratoryProtocolAlertOverlay.tsx',
      'src/components/admin/SuperUserAccountsControlModal.tsx',
    ];

    const forbidden = /\b(gemini|obsidian|obsidean|github|canvas\s*lms|blackboard)\b/i;
    for (const rel of newFiles) {
      const text = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
      expect(text).not.toMatch(forbidden);
    }
  });

  it('7. Garantiza aislamiento hermético multi-CEO (Cero contaminación entre IBIME, J.J. Rousseau, Laboratorio Pedagógico y Empresas B2B)', () => {
    const store = useOrganizationStore.getState();

    // 1. Crear Director y Profesor en IBIME (sch-ibime)
    const ibimeDir = store.addSeatNode({
      schoolId: 'sch-ibime',
      campusId: 'cmp-ibime-montes',
      campusName: 'Campus Montes',
      subRole: 'director_general',
    });
    const ibimeProf = store.addSeatNode({
      schoolId: 'sch-ibime',
      campusId: 'cmp-ibime-montes',
      campusName: 'Campus Montes',
      subRole: 'profesor',
    });

    expect(ibimeDir.username).toContain('@ibime.edu.mx');
    expect(ibimeProf.username).toContain('@ibime.edu.mx');

    store.saveAndProvisionNode('sch-ibime', ibimeDir.nodeId, {
      firstName: 'Patricia',
      paternalLastName: 'Sandoval',
      maternalLastName: 'Morales',
      username: 'p.sandoval@ibime.edu.mx',
      monthlyBaseSalaryMxn: 45000,
    });
    store.saveAndProvisionNode('sch-ibime', ibimeProf.nodeId, {
      firstName: 'Ricardo',
      paternalLastName: 'Cárdenas',
      maternalLastName: 'Vega',
      username: 'r.cardenas@ibime.edu.mx',
      hourlyRateMxn: 350,
      subjects: [
        { id: 'ib-s1', subjectName: 'Cálculo Diferencial', contourColor: '#1D68FF', teachAnother: false },
      ],
    });
    store.connectNodes('sch-ibime', ibimeDir.nodeId, ibimeProf.nodeId);

    // 2. Crear Coordinador en J.J. Rousseau (sch-jjrosseau)
    const jjrCoord = store.addSeatNode({
      schoolId: 'sch-jjrosseau',
      campusId: 'cmp-jjr-1',
      campusName: 'Campus Coyoacán',
      subRole: 'coordinador',
    });
    expect(jjrCoord.username).toContain('@jjrosseau.edu.mx');

    store.saveAndProvisionNode('sch-jjrosseau', jjrCoord.nodeId, {
      firstName: 'Mariana',
      paternalLastName: 'Villalobos',
      maternalLastName: 'Torres',
      username: 'm.villalobos@jjrosseau.edu.mx',
      monthlyBaseSalaryMxn: 28000,
    });

    // 3. Crear Gerente en Corporativo BMW (emp-bmw)
    const bmwNode = store.addSeatNode({
      schoolId: 'emp-bmw',
      campusId: 'cmp-bmw-slp',
      campusName: 'Planta SLP',
      subRole: 'director_general',
    });
    expect(bmwNode.username).toContain('@nexusmotors.mx');

    // 4. Verificar que los grafos, nóminas, materias y alertas de cada CEO están 100% aislados
    const ibimeGraph = useOrganizationStore.getState().getGraph('sch-ibime');
    const jjrGraph = useOrganizationStore.getState().getGraph('sch-jjrosseau');
    const labGraph = useOrganizationStore.getState().getGraph('sch-test-case');
    const bmwGraph = useOrganizationStore.getState().getGraph('emp-bmw');

    expect(ibimeGraph.nodes).toHaveLength(2);
    expect(jjrGraph.nodes).toHaveLength(1);
    expect(labGraph.nodes).toHaveLength(0);
    expect(bmwGraph.nodes).toHaveLength(1);

    // Catálogo de materias de IBIME NO contamina a J.J. Rousseau ni a Laboratorio
    expect(ibimeGraph.savedSubjects.map((s) => s.name)).toEqual(['Cálculo Diferencial']);
    expect(jjrGraph.savedSubjects).toHaveLength(0);
    expect(labGraph.savedSubjects).toHaveLength(0);

    // Nómina recurrente de IBIME ($45,000) NO contamina a J.J. Rousseau ($28,000) ni a Laboratorio ($0)
    const ibimePayroll = useOrganizationStore.getState().getPayrollSummary('sch-ibime');
    const jjrPayroll = useOrganizationStore.getState().getPayrollSummary('sch-jjrosseau');
    const labPayroll = useOrganizationStore.getState().getPayrollSummary('sch-test-case');

    expect(ibimePayroll.totalMonthlyPayrollMxn).toBe(45000);
    expect(jjrPayroll.totalMonthlyPayrollMxn).toBe(28000);
    expect(labPayroll.totalMonthlyPayrollMxn).toBe(0);

    // Delegados SLA de IBIME solo contienen @ibime.edu.mx y los de JJR solo @jjrosseau.edu.mx
    const ibimeDelegates = useOrganizationStore.getState().getDynamicSlaDelegates('sch-ibime');
    const jjrDelegates = useOrganizationStore.getState().getDynamicSlaDelegates('sch-jjrosseau');

    expect(ibimeDelegates.every((d) => d.delegateEmail.endsWith('@ibime.edu.mx'))).toBe(true);
    expect(jjrDelegates.every((d) => d.delegateEmail.endsWith('@jjrosseau.edu.mx'))).toBe(true);

    // Alerta vibratoria en IBIME NO contamina a J.J. Rousseau ni a Laboratorio
    const alertRes = store.dispatchHierarchicalSlaAlert({
      schoolId: 'sch-ibime',
      fromNodeId: ibimeDir.nodeId,
      fromName: 'Patricia Sandoval Morales',
      fromRoleLabel: 'Director General',
      targetDelegateEmail: 'r.cardenas@ibime.edu.mx',
      subject: 'Entrega de actas CCH',
      message: 'Confirmar cierre de actas de Cálculo.',
      slaHours: 6,
    });
    expect(alertRes.triggered).toBe(true);
    expect(useOrganizationStore.getState().getGraph('sch-ibime').alerts).toHaveLength(1);
    expect(useOrganizationStore.getState().getGraph('sch-jjrosseau').alerts).toHaveLength(0);
    expect(useOrganizationStore.getState().getGraph('sch-test-case').alerts).toHaveLength(0);
  });

  it('8. Refleja de forma inmediata en la vista de Super Usuario cada cuenta creada por el CEO en Administración y otorga al Super Usuario Control Total sobre cada cuenta', () => {
    const orgStore = useOrganizationStore.getState();

    // 1. Estado inicial antes de que el CEO cree cuentas en Administración
    const initialLabSummary = getUnifiedInstitutionAccounts(
      'sch-test-case',
      orgStore.getGraph('sch-test-case'),
      useSchoolAdminStore.getState().staffUsers
    );
    const baseStaffCount = initialLabSummary.nonOrgStaffCount;
    expect(initialLabSummary.orgTotalCount).toBe(0);
    expect(initialLabSummary.orgAdminCount).toBe(0);

    // 2. El CEO crea 3 cuentas en 1) Administración (Director General, Finanzas, Jurídico)
    const dirNode = orgStore.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'director_general',
    });
    const finNode = orgStore.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'finanzas',
    });
    const jurNode = orgStore.addSeatNode({
      schoolId: 'sch-test-case',
      campusId: 'cmp-test-pri',
      campusName: 'Primaria Laboratorio Demo',
      subRole: 'juridico',
    });

    // Desde el instante en que se crean en el lienzo, el Super Usuario ya las ve reflejadas y contabilizadas
    const afterCanvasSummary = getUnifiedInstitutionAccounts(
      'sch-test-case',
      useOrganizationStore.getState().getGraph('sch-test-case'),
      useSchoolAdminStore.getState().staffUsers
    );
    expect(afterCanvasSummary.orgTotalCount).toBe(3);
    expect(afterCanvasSummary.orgAdminCount).toBe(3);
    expect(afterCanvasSummary.totalAccountsCount).toBe(baseStaffCount + 3);

    // Configurar datos de Director General
    orgStore.saveAndProvisionNode('sch-test-case', dirNode.nodeId, {
      firstName: 'Héctor',
      paternalLastName: 'Castellanos',
      maternalLastName: 'Vega',
      username: 'h.castellanos@laboratoriopedagogico.edu.mx',
    });

    const canonicalDirUserId = `usr-org-${dirNode.nodeId}`;

    // Verificar que aparece inmediatamente en staffUsers del Super Usuario con su clave real de 6 caracteres
    const staffInAdminStore = useSchoolAdminStore
      .getState()
      .staffUsers.find((u) => u.id === canonicalDirUserId);
    expect(staffInAdminStore).toBeDefined();
    expect(staffInAdminStore?.email).toBe('h.castellanos@laboratoriopedagogico.edu.mx');
    expect(staffInAdminStore?.temporary_password).toBe(dirNode.tempPasswordPreview);

    // 3. Control Total del Super Usuario: Editar nombre, correo y permisos desde useSchoolAdminStore o useOrganizationStore
    useSchoolAdminStore.getState().updateStaffAccount(canonicalDirUserId, {
      first_name: 'Héctor Manuel',
      email: 'hm.castellanos@laboratoriopedagogico.edu.mx',
    });
    const updatedNodeAfterEdit = useOrganizationStore
      .getState()
      .getGraph('sch-test-case')
      .nodes.find((n) => n.nodeId === dirNode.nodeId)!;
    expect(updatedNodeAfterEdit.firstName).toBe('Héctor Manuel');
    expect(updatedNodeAfterEdit.username).toBe('hm.castellanos@laboratoriopedagogico.edu.mx');

    // 4. Control Total del Super Usuario: Cambiar / Regenerar contraseña bidireccionalmente
    const superUserAssignedPass = useSchoolAdminStore
      .getState()
      .changeStaffPassword(canonicalDirUserId, 'SuperClave2026!');
    expect(superUserAssignedPass).toBe('SuperClave2026!');

    const authWithSuperPass = useOrganizationStore
      .getState()
      .authenticateOrgAccount('hm.castellanos@laboratoriopedagogico.edu.mx', 'SuperClave2026!');
    expect(authWithSuperPass.matched).toBe(true);
    expect(authWithSuperPass.validPassword).toBe(true);

    // 5. Control Total del Super Usuario: Bloquear y Desbloquear cuenta (impide login inmediato)
    useSchoolAdminStore.getState().toggleStaffBlock(canonicalDirUserId, true);
    const blockedAuthAttempt = useOrganizationStore
      .getState()
      .authenticateOrgAccount('hm.castellanos@laboratoriopedagogico.edu.mx', 'SuperClave2026!');
    expect(blockedAuthAttempt.validPassword).toBe(false);
    expect(blockedAuthAttempt.node?.isBlocked).toBe(true);

    useSchoolAdminStore.getState().toggleStaffBlock(canonicalDirUserId, false);
    const unblockedAuthAttempt = useOrganizationStore
      .getState()
      .authenticateOrgAccount('hm.castellanos@laboratoriopedagogico.edu.mx', 'SuperClave2026!');
    expect(unblockedAuthAttempt.validPassword).toBe(true);

    // 6. Control Total del Super Usuario: Eliminar cuenta definitivamente y actualizar el conteo al instante
    useSchoolAdminStore.getState().deleteStaffAccount(canonicalDirUserId);
    const afterDeleteSummary = getUnifiedInstitutionAccounts(
      'sch-test-case',
      useOrganizationStore.getState().getGraph('sch-test-case'),
      useSchoolAdminStore.getState().staffUsers
    );
    expect(afterDeleteSummary.orgTotalCount).toBe(2);
    expect(afterDeleteSummary.orgAdminCount).toBe(2);
    expect(afterDeleteSummary.totalAccountsCount).toBe(baseStaffCount + 2);
    expect(
      useOrganizationStore
        .getState()
        .getGraph('sch-test-case')
        .nodes.some((n) => n.nodeId === dirNode.nodeId)
    ).toBe(false);
  });
});

