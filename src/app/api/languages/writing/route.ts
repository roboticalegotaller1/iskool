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
import { checkRouteRateLimit, extractClientRateLimitKey } from '@/lib/security/routeRateLimit';

const MAX_WRITING_TEXT_CHARS = 25_000;
const MAX_CONSIGNA_CHARS = 4_000;
const MAX_DASHBOARD_EVALUATIONS = 200;

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

    const rateCheck = checkRouteRateLimit('languages:writing', extractClientRateLimitKey(req, auth.user.id), 30, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Límite de solicitudes por minuto alcanzado en el Motor de Escritura.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) } }
      );
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

    if (payload && typeof payload === 'object') {
      const p = payload as Record<string, unknown>;
      if (
        (typeof p.borrador_actual === 'string' && p.borrador_actual.length > MAX_WRITING_TEXT_CHARS) ||
        (typeof p.texto_final === 'string' && p.texto_final.length > MAX_WRITING_TEXT_CHARS) ||
        (typeof p.consigna === 'string' && p.consigna.length > MAX_CONSIGNA_CHARS) ||
        (Array.isArray(p.evaluaciones) && p.evaluaciones.length > MAX_DASHBOARD_EVALUATIONS)
      ) {
        return NextResponse.json(
          { error: 'El volumen de texto o evaluaciones enviado excede el límite máximo permitido.' },
          { status: 400 }
        );
      }
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
