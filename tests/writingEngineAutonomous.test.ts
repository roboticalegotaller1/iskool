import { describe, it, expect } from 'vitest';
import { AutonomousWritingEngineService } from '../src/services/writingEngineService';
import { LEVEL_EXAM_SPECS } from '../src/types/writingEngine';

describe('MOTOR AUTÓNOMO DE EVALUACIÓN Y TUTORÍA DE ESCRITURA (WRITING ENGINE)', () => {

  // ==========================================================================
  // COMANDO 1: CREAR_CONSIGNA
  // ==========================================================================
  describe('1. [COMANDO: CREAR_CONSIGNA] - Generación de Tareas Oficiales', () => {
    it('Genera tareas Cambridge con formato canónico ISK-EN-[LVL]-[UUID] y límites de palabras estrictos', () => {
      // B2 First (FCE): 140 - 190 palabras
      const promptB2 = AutonomousWritingEngineService.crearConsigna({
        idioma: 'en',
        nivel: 'B2',
        tema: 'Dispositivos Digitales en el Aula'
      });

      expect(promptB2.id).toMatch(/^ISK-EN-B2-\d{4}$/);
      expect(promptB2.framework).toBe('cambridge');
      expect(promptB2.limitePalabras.min).toBe(140);
      expect(promptB2.limitePalabras.max).toBe(190);
      expect(promptB2.puntosClaveObligatorios.length).toBeGreaterThanOrEqual(3);
      expect(promptB2.checklistPrevio.length).toBeGreaterThanOrEqual(3);

      // C1 Advanced (CAE): 220 - 260 palabras
      const promptC1 = AutonomousWritingEngineService.crearConsigna({
        idioma: 'en',
        nivel: 'C1'
      });
      expect(promptC1.id).toMatch(/^ISK-EN-C1-\d{4}$/);
      expect(promptC1.limitePalabras.min).toBe(220);
      expect(promptC1.limitePalabras.max).toBe(260);

      // Pre-A1 Starters: 1 - 25 palabras
      const promptPreA1 = AutonomousWritingEngineService.crearConsigna({
        idioma: 'en',
        nivel: 'Pre-A1'
      });
      expect(promptPreA1.limitePalabras.min).toBe(1);
      expect(promptPreA1.limitePalabras.max).toBe(25);
    });

    it('Genera tareas DELF-DALF con especificaciones oficiales de France Éducation International', () => {
      // DELF B2: Mínimo 250 palabras
      const promptDelfB2 = AutonomousWritingEngineService.crearConsigna({
        idioma: 'fr',
        nivel: 'B2',
        tema: 'Aménagement d\'un éco-quartier'
      });

      expect(promptDelfB2.id).toMatch(/^ISK-FR-B2-\d{4}$/);
      expect(promptDelfB2.framework).toBe('delf_dalf');
      expect(promptDelfB2.limitePalabras.min).toBe(250);
      expect(promptDelfB2.puntosClaveObligatorios.length).toBeGreaterThanOrEqual(3);

      // DALF C1: 450 - 520 palabras combinadas (Synthèse + Essai)
      const promptDalfC1 = AutonomousWritingEngineService.crearConsigna({
        idioma: 'fr',
        nivel: 'C1'
      });
      expect(promptDalfC1.limitePalabras.min).toBe(450);
      expect(promptDalfC1.consignaOficial).toContain('synthèse');
    });
  });

  // ==========================================================================
  // COMANDO 2: ANALIZAR_BORRADOR
  // ==========================================================================
  describe('2. [COMANDO: ANALIZAR_BORRADOR] - Andamiaje Socrático y Métricas en Tiempo Real', () => {
    it('Calcula con exactitud conteo de palabras, estado de longitud y TTR', () => {
      const draftText = 'In my opinion, technology in the classroom is very beneficial for all students.';
      const analysis = AutonomousWritingEngineService.analizarBorrador({
        idioma: 'en',
        nivel: 'B2',
        borrador_actual: draftText
      });

      expect(analysis.conteo_palabras).toBe(13);
      // Para B2 (140-190) 13 palabras debe ser 'deficiente'
      expect(analysis.estado_longitud).toBe('deficiente');
      expect(analysis.rango_esperado).toContain('140 - 190');
      expect(analysis.metricas_tiempo_real.diversidad_lexica_ttr).toBeGreaterThan(0.7);
    });

    it('Aplica andamiaje socrático en 3 niveles sin redactar el texto por el alumno', () => {
      // Texto con interferencia L1: "depend of" y "people is"
      const draftWithErrors = 'Many students believe learning depends of internet speed and people is happy with it.';
      const analysis = AutonomousWritingEngineService.analizarBorrador({
        idioma: 'en',
        nivel: 'B2',
        borrador_actual: draftWithErrors
      });

      expect(analysis.diagnosticos_detectados.length).toBeGreaterThanOrEqual(2);

      const dependOfDiagnostic = analysis.diagnosticos_detectados.find(d => d.segmento.toLowerCase().includes('depend'));
      expect(dependOfDiagnostic).toBeDefined();

      // Nivel 1: Pregunta socrática sutil (no da la respuesta)
      expect(dependOfDiagnostic?.pista_nivel_1).toContain('preposition');
      expect(dependOfDiagnostic?.pista_nivel_1).not.toContain('Use "depend on" instead of this sentence');

      // Nivel 2: Regla y contraste con el español L1
      expect(dependOfDiagnostic?.pista_nivel_2).toContain('depender de');
      expect(dependOfDiagnostic?.pista_nivel_2).toContain('depend ON');

      // Nivel 3: Modelo correctivo análogo (ejemplo diferente, no resuelve su frase literal)
      expect(dependOfDiagnostic?.pista_nivel_3_modelo).toBeDefined();
      expect(dependOfDiagnostic?.pista_nivel_3_modelo).not.toBe(draftWithErrors);
    });

    it('Detecta interferencias L1 en francés: "je suis 15 ans", "visiter à", "bien que + indicatif"', () => {
      const draftFr = 'Bonjour, je suis 15 ans et hier j\'ai visité à mes amis bien que il est tard.';
      const analysis = AutonomousWritingEngineService.analizarBorrador({
        idioma: 'fr',
        nivel: 'B1',
        borrador_actual: draftFr
      });

      expect(analysis.diagnosticos_detectados.some(d => d.segmento.toLowerCase().includes('je suis'))).toBe(true);
      expect(analysis.diagnosticos_detectados.some(d => d.segmento.toLowerCase().includes('visité à') || d.segmento.toLowerCase().includes('visiter à'))).toBe(true);
      expect(analysis.diagnosticos_detectados.some(d => d.segmento.toLowerCase().includes('bien que'))).toBe(true);
    });

    it('Detecta conectores discursivos esperados según el nivel MCER', () => {
      const b2TextWithConnectors = 'Furthermore, digital tools foster autonomous learning. However, students must avoid social media distractions. In conclusion, moderation is key.';
      const analysis = AutonomousWritingEngineService.analizarBorrador({
        idioma: 'en',
        nivel: 'B2',
        borrador_actual: b2TextWithConnectors
      });

      const connectors = analysis.metricas_tiempo_real.conectores_nivel_esperado;
      expect(connectors).toContain('furthermore');
      expect(connectors).toContain('in conclusion');
    });
  });

  // ==========================================================================
  // COMANDO 3: EVALUACION_FINAL
  // ==========================================================================
  describe('3. [COMANDO: EVALUACION_FINAL] - Rúbricas Oficiales Cambridge y DELF/DALF', () => {
    it('Evalúa redacción en inglés con grilla Cambridge (Content, Comm. Ach., Org., Language 0-5 y escala %)', () => {
      const b2Submission = `In the contemporary era, technological integration within pedagogical settings represents an indispensable asset. Furthermore, access to online research materials empowers students to cultivate autonomous inquiry. On the other hand, the pervasive temptation of non-academic notifications poses a tangible risk of cognitive dispersion. To conclude, establishing structured protocols ensures that technology serves as an accelerator of intellectual growth rather than a distraction.`;

      const result = AutonomousWritingEngineService.evaluarTextoFinal({
        idioma: 'en',
        nivel: 'B2',
        consigna: 'Essay on classroom technology',
        texto_final: b2Submission,
        studentName: 'Mateo Villanueva'
      });

      expect(result.rubricaCambridge).toBeDefined();
      expect(result.rubricaCambridge?.content).toBeGreaterThanOrEqual(1);
      expect(result.rubricaCambridge?.content).toBeLessThanOrEqual(5);
      expect(result.rubricaCambridge?.totalRaw).toBeGreaterThanOrEqual(4);
      expect(result.rubricaCambridge?.totalRaw).toBeLessThanOrEqual(20);
      expect(result.calificacionGlobal).toBeGreaterThanOrEqual(0);
      expect(result.calificacionGlobal).toBeLessThanOrEqual(100);

      // Desglose cualitativo con citas textuales y plan de acción
      expect(result.desgloseCualitativo.aciertosNotables.length).toBeGreaterThanOrEqual(1);
      expect(result.planAccionSiguienteSesion.objetivosMicroLinguisticos.length).toBe(2);
      expect(result.xpGanados).toBeGreaterThanOrEqual(150);
    });

    it('Evalúa redacción en francés con grilla oficial DELF (sobre 25 puntos oficiales y mención)', () => {
      const delfSubmission = `Monsieur le Maire, En tant que représentant des lycéens de notre commune, je me permets de vous adresser cette lettre afin d'exprimer notre vive inquiétude quant au projet de transformation de l'espace vert communal en zone commerciale. Certes, les retombées économiques sont indispensables pour la municipalité. Néanmoins, la préservation de la biodiversité urbaine et la santé respiratoire des citoyens demeurent une priorité absolue. Nous vous prions d'agréer, Monsieur le Maire, l'expression de notre considération distinguée.`;

      const result = AutonomousWritingEngineService.evaluarTextoFinal({
        idioma: 'fr',
        nivel: 'B2',
        consigna: 'Lettre argumentative au maire',
        texto_final: delfSubmission,
        studentName: 'Elena Rostova'
      });

      expect(result.rubricaDelf).toBeDefined();
      expect(result.rubricaDelf?.totalSur25).toBeGreaterThanOrEqual(5);
      expect(result.rubricaDelf?.totalSur25).toBeLessThanOrEqual(25);
      expect(['Très Bien', 'Bien', 'Assez Bien', 'Admis', 'Non admis']).toContain(result.rubricaDelf?.mention);
      expect(result.calificacionGlobal).toBeGreaterThanOrEqual(50);
    });
  });

  // ==========================================================================
  // COMANDO 4: DASHBOARD_DOCENTE
  // ==========================================================================
  describe('4. [COMANDO: DASHBOARD_DOCENTE] - Apple Clean UX, Semáforos y Patrones de Error', () => {
    it('Genera reporte de cohorte con resumen ejecutivo de 3 líneas y semáforo verde/ámbar/rojo', () => {
      const demoEvals = AutonomousWritingEngineService.obtenerEvaluacionesSemillaDemo();
      const report = AutonomousWritingEngineService.generarDashboardDocente({
        grupo: 'Grupo B2 Avanzado - Sede Montes',
        evaluaciones: demoEvals
      });

      expect(report.grupo).toBe('Grupo B2 Avanzado - Sede Montes');
      expect(report.totalEstudiantes).toBe(demoEvals.length);
      expect(report.promedioGlobal).toBeGreaterThan(0);

      // Resumen ejecutivo estricto de 3 líneas
      expect(report.resumenEjecutivo3Lineas.length).toBe(3);
      expect(report.resumenEjecutivo3Lineas[0]).toContain('Cohorte');

      // Semáforos
      const sem = report.semaforoCohorte;
      expect(sem.verdeAutonomosCount + sem.ambarRiesgoL1Count + sem.rojoBloqueoCount).toBe(demoEvals.length);
      expect(sem.verdeAutonomosPorcentaje + sem.ambarRiesgoL1Porcentaje + sem.rojoBloqueoPorcentaje).toBeGreaterThanOrEqual(99);

      // Top 3 patrones de error recurrentes
      expect(report.top3PatronesError.length).toBe(3);
      expect(report.top3PatronesError[0].patron).toBeDefined();
      expect(report.top3PatronesError[0].remedioDidactico).toBeDefined();

      // Intervención pedagógica para clase en vivo
      expect(report.recomendacionIntervencionPedagogicaClaseViva.focoPrincipal).toBeDefined();
      expect(report.recomendacionIntervencionPedagogicaClaseViva.actividadActivacion10Min).toBeDefined();
    });
  });

});
