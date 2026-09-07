/**
 * @file aiPedagogicalService.ts
 * @description Servicio cliente frontend para comunicación con el Motor de Inteligencia Artificial Pedagógica.
 * Analiza el contexto de PerfilEstudiante.md, StoreAdministracion (useSchoolAdminStore)
 * e ISkool_Studio_Architecture (useActivityBuilderStore).
 */

import { useStudentStore } from '@/store/useStudentStore';
import { useSchoolAdminStore, resolveEffectiveSchoolId } from '@/store/useSchoolAdminStore';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { getStudentAcademicLevelInfo } from '@/lib/academicLevels';
import { supabase } from '@/lib/supabaseClient';
import { StudioActivityQuestion } from '@/types';

export interface PedagogicalChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedQuestion?: StudioActivityQuestion; // Acoplamiento con ISkool_Studio_Architecture
}

export interface StudentContextProfile {
  studentId: string;
  name: string;
  level: string;
  gradeLabel: string;
  schoolId: string;
  xp: number;
  playerLevel: number;
  currentStreak: number;
  coins: number;
  rpgClass?: string;
  rpgAttributes?: {
    strength: number;
    intelligence: number;
    defense: number;
    skillPoints: number;
  };
  petName?: string;
  learningFocus: string;
}

export interface PedagogicalAssistRequest {
  message: string;
  conversationHistory?: PedagogicalChatMessage[];
  contextType?: 'student' | 'teacher';
  activeQuestContext?: {
    questTitle?: string;
    subject?: string;
    score?: number;
    pdaNem?: string;
  };
}

export class AIPedagogicalService {
  /**
   * Extrae y sintetiza el perfil integral del estudiante según PerfilEstudiante.md
   * y garantiza aislamiento multi-plantel mediante StoreAdministracion (useSchoolAdminStore).
   */
  static getSynthesizedStudentContext(studentId?: string): StudentContextProfile {
    const studentStore = useStudentStore.getState();
    const adminStore = useSchoolAdminStore.getState();
    
    // Obtener plantel activo desde StoreAdministracion (useSchoolAdminStore) con protección multi-colegio
    let sessionUser: any = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('iskool_session_user') || localStorage.getItem('auth_current_user');
        if (stored) sessionUser = JSON.parse(stored);
      }
    } catch (e) {}
    const currentSchoolId = resolveEffectiveSchoolId(sessionUser, adminStore.activeSchoolId, 'sch-jjrosseau');
    const activeId = studentId || studentStore.activeStudentId || 'std-pa';

    // 1. Buscar si el alumno está registrado en el plantel activo
    const detailedStudent = adminStore.detailedStudents.find(
      s => (s.id === activeId || s.email?.toLowerCase().includes(activeId.toLowerCase())) &&
           (s.school_id === currentSchoolId || !s.school_id)
    );

    const stats = studentStore.allStats[activeId];
    const avatar = studentStore.allAvatars[activeId];

    let studentSeedParam: any = { level: 'primaria', grade: '4º' };
    if (detailedStudent) {
      studentSeedParam = {
        level: detailedStudent.level,
        grade: detailedStudent.grade,
        campus_name: detailedStudent.campus_name
      };
    } else if (activeId === 'std-pb') {
      studentSeedParam = { level: 'primaria', grade: '1º' };
    } else if (activeId === 'std-pa') {
      studentSeedParam = { level: 'primaria', grade: '4º' };
    } else if (activeId === 'std-sec') {
      studentSeedParam = { level: 'secundaria', grade: '2º' };
    } else if (activeId === 'std-prep') {
      studentSeedParam = { level: 'preparatoria', grade: '4º Semestre' };
    }

    const academicInfo = getStudentAcademicLevelInfo(studentSeedParam);

    let learningFocus = 'Desarrollo de saberes y pensamiento científico.';
    if (academicInfo.subLevel === 'primaria_baja') {
      learningFocus = 'Lectoescritura inicial, comprensión oral y convivencia afectiva.';
    } else if (academicInfo.subLevel === 'secundaria') {
      learningFocus = 'Pensamiento crítico, algoritmia y rol cooperativo en misiones RPG.';
    } else if (academicInfo.subLevel === 'preparatoria') {
      learningFocus = 'Proyectos socioproductivos, gestión de recursos y visión preuniversitaria.';
    }

    const studentName = detailedStudent?.first_name || 
      (activeId === 'std-pa' ? 'Lucas' :
       activeId === 'std-sec' ? 'Elena' :
       activeId === 'std-pb' ? 'Santi' :
       activeId === 'std-prep' ? 'Mateo' : 'Estudiante');

    return {
      studentId: activeId,
      name: studentName,
      level: academicInfo.subLevel,
      gradeLabel: academicInfo.fullGradeLabel,
      schoolId: currentSchoolId,
      xp: stats?.xp || 0,
      playerLevel: stats?.level || 1,
      currentStreak: stats?.current_streak || 0,
      coins: stats?.coins || 0,
      rpgClass: stats?.rpg_class || undefined,
      rpgAttributes: stats?.rpg_class ? {
        strength: stats.attribute_strength || 10,
        intelligence: stats.attribute_intelligence || 10,
        defense: stats.attribute_defense || 10,
        skillPoints: stats.skill_points || 0
      } : undefined,
      petName: avatar?.pet_name || 'Compañero Mágico',
      learningFocus
    };
  }

  /**
   * Envía la consulta al endpoint seguro enviando el JWT de Supabase para evitar suplantación de identidad.
   */
  static async sendPedagogicalPrompt(req: PedagogicalAssistRequest): Promise<{
    reply: string;
    suggestions?: string[];
    suggestedQuestion?: StudioActivityQuestion;
    error?: string;
  }> {
    const studentContext = AIPedagogicalService.getSynthesizedStudentContext();

    // Obtener sesión activa de Supabase para firma criptográfica
    let bearerToken = '';
    try {
      const { data } = await supabase.auth.getSession();
      bearerToken = data?.session?.access_token || '';
    } catch {
      // fallback sin token si está offline
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': studentContext.studentId,
        'x-user-role': req.contextType || 'student'
      };

      if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
      }

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: req.message,
          schoolId: studentContext.schoolId,
          studentContext,
          activeQuestContext: req.activeQuestContext,
          conversationHistory: req.conversationHistory || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error en el servidor de IA (${response.status})`);
      }

      const data = await response.json();
      return {
        reply: data.reply,
        suggestions: data.suggestions || [],
        suggestedQuestion: data.suggestedQuestion
      };
    } catch (err: any) {
      console.warn('Fallo en la comunicación con el endpoint de IA, generando respuesta de contingencia:', err);
      
      const fallbackReply = AIPedagogicalService.generateFallbackGuidance(req.message, studentContext);
      return {
        reply: fallbackReply,
        suggestions: [
          '¿Cómo puedo ganar más XP en esta lección?',
          'Explícame la relación con mi clase RPG',
          'Quiero revisar mi racha actual'
        ]
      };
    }
  }

  /**
   * Conexión con ISkool_Studio_Architecture:
   * Inyecta una pregunta sugerida por el Asistente directamente al constructor de actividades en 1 Clic.
   */
  static injectQuestionIntoStudio(question: StudioActivityQuestion): boolean {
    try {
      const studioStore = useActivityBuilderStore.getState();
      const newBlockId = studioStore.addBlock('quiz_question');
      
      studioStore.updateBlockData(newBlockId, {
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: 'Reactivo generado y validado con Inteligencia Artificial Pedagógica.'
      });

      return true;
    } catch (err) {
      console.error('Error al inyectar reactivo en el Estudio ISkool:', err);
      return false;
    }
  }

  /**
   * Genera orientación pedagógica inmediata de respaldo alineada al PerfilEstudiante.md
   */
  private static generateFallbackGuidance(query: string, ctx: StudentContextProfile): string {
    const q = query.toLowerCase();

    if (q.includes('rpg') || q.includes('clase') || q.includes('atributo')) {
      if (ctx.rpgClass) {
        return `¡Hola ${ctx.name}! Como **${ctx.rpgClass.toUpperCase()}** de Nivel ${ctx.playerLevel}, tu atributo clave es la Inteligencia (${ctx.rpgAttributes?.intelligence || 10}) y Fuerza (${ctx.rpgAttributes?.strength || 10}). Te recomiendo resolver los cuestionarios con precisión para ganar puntos de habilidad adicionales.`;
      }
      return `¡Hola ${ctx.name}! Al llegar a Secundaria podrás elegir tu clase RPG (Guerrero, Mago o Explorador). Por ahora, sigue completando retos para acumular XP y monedas.`;
    }

    if (q.includes('racha') || q.includes('días')) {
      return `Tienes una racha de **${ctx.currentStreak} días consecutivos**. Cada día que completas una actividad formativa multiplicas tu experiencia acumulada.`;
    }

    if (ctx.level === 'primaria_baja') {
      return `¡Hola ${ctx.name}! Tu mascota **${ctx.petName}** está feliz de que estés aquí. Para seguir aprendiendo, escucha con atención la lectura y completa tu misión de hoy.`;
    }

    return `¡Excelente iniciativa, ${ctx.name}! Para avanzar en ${ctx.gradeLabel}, enfócate en el objetivo formativo de la lección. Si tienes dudas con una pregunta, analiza los conceptos clave antes de responder.`;
  }
}
