/**
 * @module WritingEngineApiRoute
 * @description Endpoint autónomo para ejecución de comandos del Writing Engine de iSkool.
 * Admite:
 * - [COMANDO: CREAR_CONSIGNA]
 * - [COMANDO: ANALIZAR_BORRADOR]
 * - [COMANDO: EVALUACION_FINAL]
 * - [COMANDO: DASHBOARD_DOCENTE]
 */

import { NextRequest, NextResponse } from 'next/server';
import { AutonomousWritingEngineService } from '@/services/writingEngineService';
import { validateApiAuth } from '@/lib/authValidator';

const WRITING_STAFF_ROLES = new Set([
  'teacher',
  'coordinator',
  'director',
  'admin',
  'superadmin',
  'owner',
  'ceo'
]);

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Autenticación requerida para interactuar con el Motor de Escritura.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo JSON inválido o malformado.' }, { status: 400 });
    }
    const { comando, payload } = body;

    if (!comando) {
      return NextResponse.json(
        { error: 'Comando requerido: CREAR_CONSIGNA | ANALIZAR_BORRADOR | EVALUACION_FINAL | DASHBOARD_DOCENTE' },
        { status: 400 }
      );
    }

    const roleLower = (auth.user.role || '').toLowerCase();

    switch (comando) {
      case 'CREAR_CONSIGNA': {
        if (!WRITING_STAFF_ROLES.has(roleLower)) {
          return NextResponse.json(
            { error: 'Acceso denegado: Solo docentes o personal directivo pueden crear consignas de escritura.' },
            { status: 403 }
          );
        }
        const { idioma = 'en', nivel = 'B2', tipo_tarea, tema } = payload || {};
        const consigna = AutonomousWritingEngineService.crearConsigna({
          idioma,
          nivel,
          tipo_tarea,
          tema
        });
        return NextResponse.json({
          status: 'success',
          comando: 'CREAR_CONSIGNA',
          data: consigna
        });
      }

      case 'ANALIZAR_BORRADOR': {
        const { idioma = 'en', nivel = 'B2', consigna = '', borrador_actual = '' } = payload || {};
        const analisis = AutonomousWritingEngineService.analizarBorrador({
          idioma,
          nivel,
          consigna,
          borrador_actual
        });
        return NextResponse.json({
          status: 'success',
          comando: 'ANALIZAR_BORRADOR',
          data: analisis
        });
      }

      case 'EVALUACION_FINAL': {
        const {
          idioma = 'en',
          nivel = 'B2',
          consigna = '',
          texto_final = '',
          studentId,
          studentName
        } = payload || {};
        const evaluacion = AutonomousWritingEngineService.evaluarTextoFinal({
          idioma,
          nivel,
          consigna,
          texto_final,
          studentId,
          studentName
        });
        return NextResponse.json({
          status: 'success',
          comando: 'EVALUACION_FINAL',
          data: evaluacion
        });
      }

      case 'DASHBOARD_DOCENTE': {
        if (!WRITING_STAFF_ROLES.has(roleLower)) {
          return NextResponse.json(
            { error: 'Acceso denegado: Solo docentes o personal directivo pueden consultar el tablero docente.' },
            { status: 403 }
          );
        }
        const { grupo = 'Cohorte General', evaluaciones = [] } = payload || {};
        const dashboard = AutonomousWritingEngineService.generarDashboardDocente({
          grupo,
          evaluaciones
        });
        return NextResponse.json({
          status: 'success',
          comando: 'DASHBOARD_DOCENTE',
          data: dashboard
        });
      }

      default:
        return NextResponse.json(
          { error: `Comando '${comando}' no reconocido.` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error en WritingEngine API:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor en Writing Engine',
        ...(process.env.NODE_ENV !== 'production' ? { details: error?.message } : {})
      },
      { status: 500 }
    );
  }
}
