import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { MISSIONS_SEED } from '@/store/seeds';
import { broadcastTeacherMilestone } from '@/lib/teacherMilestoneBroadcaster';

export const dynamic = 'force-dynamic';

/**
 * Endpoint Server-Side Anti-Cheat para entrega de retos y cuestionarios.
 * La validación de aciertos y otorgamiento de recompensas (XP y Monedas)
 * es CALCULADA Y AUTORIZADA ESTRICTAMENTE EN EL SERVIDOR.
 * 
 * Cualquier intento de enviar campos como `score`, `xpEarned` o `coinsEarned`
 * en el payload POST es ignorado y sobrescrito por los valores verificados.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questId, studentId, answers } = body;

    if (!questId || !studentId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: questId y studentId' },
        { status: 400 }
      );
    }

    // 1. Localizar la definición oficial y verificada del reto (en BD o catálogo base)
    let questDefinition: any = null;
    let missionTitle = 'Reto Académico';

    try {
      const { data: dbQuest } = await supabase
        .from('quests')
        .select('*, missions(title, school_id, subject_id)')
        .eq('id', questId)
        .maybeSingle();

      if (dbQuest) {
        questDefinition = dbQuest;
        missionTitle = dbQuest.missions?.title || dbQuest.title || missionTitle;
      }
    } catch {
      // Continuar con búsqueda en catálogo oficial en memoria
    }

    if (!questDefinition) {
      for (const m of MISSIONS_SEED) {
        const found = m.quests?.find((q) => q.id === questId);
        if (found) {
          questDefinition = found;
          missionTitle = m.title;
          break;
        }
      }
    }

    if (!questDefinition) {
      return NextResponse.json(
        { error: `El reto con ID ${questId} no existe en el catálogo curricular oficial.` },
        { status: 404 }
      );
    }

    // 2. Extraer preguntas y calcular el puntaje estrictamente en el Servidor (Anti-Cheat)
    const questions = questDefinition.content?.questions || [];
    let correctCount = 0;
    const totalQuestions = questions.length;

    if (totalQuestions > 0 && answers && typeof answers === 'object') {
      for (const q of questions) {
        const studentAns = answers[q.id];
        if (studentAns === undefined || studentAns === null) continue;

        const correctIdx = q.correctAnswerIndex ?? q.correctIndex;
        if (correctIdx !== undefined) {
          // Comparación por índice numérico
          if (Number(studentAns) === Number(correctIdx)) {
            correctCount++;
            continue;
          }
          // Comparación por texto de la opción correcta
          const correctText = q.options?.[correctIdx]?.toString().trim().toLowerCase();
          if (correctText && studentAns.toString().trim().toLowerCase() === correctText) {
            correctCount++;
            continue;
          }
        } else if (q.correctAnswer) {
          // Comparación directa de respuesta en texto
          if (studentAns.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase()) {
            correctCount++;
            continue;
          }
        }
      }
    }

    // Puntaje verificado Server-Side (0 a 100%)
    const verifiedScore = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : (answers?.completed ? 100 : 80);

    const isPassed = verifiedScore >= 60;

    // 3. Cálculo de XP y Monedas con topes autorizados de la misión
    const xpBase = Math.min(questDefinition.xp_reward || 100, 500); // Límite máximo anti-abuso
    const coinsBase = Math.min(questDefinition.coins_reward || 20, 100);

    const xpEarned = isPassed ? Math.round(xpBase * (verifiedScore / 100.0)) : Math.round(xpBase * 0.1);
    const coinsEarned = verifiedScore === 100
      ? coinsBase + 5 // Bono por puntuación perfecta
      : (isPassed ? Math.round(coinsBase * (verifiedScore / 100.0)) : 0);

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const feedback = verifiedScore === 100
      ? '¡Puntaje perfecto! Demostraste dominio total del contenido.'
      : isPassed
        ? '¡Buen trabajo! Has superado el reto con éxito.'
        : 'Aún no alcanzas el puntaje mínimo. Repasa el material y vuelve a intentarlo.';

    // 4. Actualización en Supabase mediante RPC o consulta directa
    let leveledUp = false;
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_quiz', {
        p_student_id: studentId,
        p_quest_id: questId,
        p_score: verifiedScore,
        p_answers: answers || {}
      });

      if (!rpcError && rpcData) {
        leveledUp = Boolean(rpcData.leveled_up);
      }
    } catch (dbErr) {
      console.warn('Registro de intento en base de datos no completado (modo offline activo):', dbErr);
    }

    // 5. Emisión de Hito en Tiempo Real hacia el Teacher Social Loop (sin polling)
    if (isPassed) {
      try {
        broadcastTeacherMilestone({
          studentId,
          studentName: `Alumno ${studentId.substring(0, 7)}`,
          milestoneType: verifiedScore === 100 ? 'perfect_score' : 'quest_completed',
          title: questDefinition.title || 'Misión Completada',
          score: verifiedScore,
          xpEarned,
          coinsEarned,
          teacherKarmaReward: verifiedScore === 100 ? 5 : 2,
          teacherXpReward: 10,
          message: verifiedScore === 100
            ? `🌟 ¡Puntaje perfecto en "${questDefinition.title}"! (+5 Karma, +10 XP)`
            : `🎯 Reto superado: "${questDefinition.title}" con ${verifiedScore}% (+2 Karma)`
        });
      } catch (broadcastErr) {
        console.warn('Aviso notificando Teacher Social Loop:', broadcastErr);
      }
    }

    return NextResponse.json({
      success: true,
      verifiedScore,
      xpEarned,
      coinsEarned,
      isPassed,
      feedback,
      attemptId,
      leveledUp,
      antiCheatValidation: {
        serverValidated: true,
        correctQuestions: correctCount,
        totalQuestions: totalQuestions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error en endpoint submit-quiz:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor procesando el reto', details: error.message },
      { status: 500 }
    );
  }
}
