import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEMO_SCHOOL_ID = '938fa492-4ddc-4f6f-80d7-1bd054af8536';

const DEFAULT_DEMO_PATTERNS = [
  {
    title: '✨ Incremento anómalo de consultas sobre horario del festival',
    description: 'En las últimas 4 horas llegaron 17 correos relacionados con el horario de salida del festival del viernes. Sugerencia: emitir un comunicado oficial a las familias para despejar dudas masivas.'
  },
  {
    title: 'Incidencias concentradas en Transporte - Ruta 4',
    description: '23 familias reportan demoras reiteradas en la Ruta 4 durante los últimos 7 días. Se recomienda auditoría de tiempos con Administración.'
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId') || DEMO_SCHOOL_ID;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: dbMatters } = await supabase
      .from('inbox_matters')
      .select('*')
      .eq('school_id', schoolId)
      .order('urgency', { ascending: true })
      .order('last_activity_at', { ascending: false });

    const { data: dbPatterns } = await supabase
      .from('inbox_patterns')
      .select('pattern_title, pattern_description')
      .eq('school_id', schoolId)
      .eq('status', 'ACTIVE');

    if (dbMatters && dbMatters.length > 0) {
      return NextResponse.json({
        matters: dbMatters.map(m => ({
          id: m.id,
          matter_code: m.matter_code,
          title: m.title,
          summary: m.summary,
          category: m.category,
          urgency: m.urgency,
          destination: m.destination,
          why_shown: m.why_shown_to_director || 'Requiere decisión ejecutiva de Dirección',
          reincidence_count: m.reincidence_count || 1,
          recommended_action: m.recommended_action || 'Proceder conforme a normativa institucional',
          suggested_draft_reply: m.suggested_draft_reply || '',
          assigned_role: m.assigned_role || 'Dirección General',
          sla_hours: m.sla_hours || 24
        })),
        patterns: (dbPatterns && dbPatterns.length > 0)
          ? dbPatterns.map(p => ({ title: p.pattern_title, description: p.pattern_description }))
          : DEFAULT_DEMO_PATTERNS
      });
    }
  } catch (err: any) {
    console.warn('Fallback a matters locales:', err.message);
  }

  // Generar conjunto canónico de 28 asuntos para la demostración
  const fallbackMatters = [
    {
      id: 'mat-001',
      matter_code: 'MAT-REV-5B-01',
      title: 'Reincidencia: situación de acoso y convivencia en 5º B',
      summary: 'La familia Mendoza escribe por tercera vez en 12 días reportando agresiones verbales en el recreo tras intervención previa de Coordinación.',
      category: 'Convivencia / Caso Crítico',
      urgency: 'CRITICA',
      destination: 'DIRECCION',
      why_shown: 'Tercera comunicación de la familia en 12 días. Coordinación intervino pero la familia reporta que continúa.',
      reincidence_count: 5,
      recommended_action: 'Revisión prioritaria de Dirección y convocatoria de protocolo de mediación.',
      suggested_draft_reply: 'Estimada Sra. Mendoza:\n\nHe recibido personalmente su comunicación. Le informo que he solicitado el expediente completo de las intervenciones a Coordinación Primaria y agendaremos una reunión presencial en Dirección mañana a las 08:30 hrs para resolver esto de manera definitiva.\n\nAtentamente,\nAngélica - Dirección General',
      assigned_role: 'Dirección General',
      sla_hours: 12
    },
    {
      id: 'mat-002',
      matter_code: 'MAT-FEST-PAT-02',
      title: 'Confusión y solicitudes sobre horario de salida del festival',
      summary: '17 familias diferentes han enviado correos en las últimas horas solicitando confirmar el horario de salida del festival del viernes.',
      category: 'Procedimiento / Información General',
      urgency: 'ALTA',
      destination: 'DIRECCION',
      why_shown: 'Patrón anómalo de 17 comunicaciones en 4 horas. Conviene emitir comunicado institucional para evitar saturación.',
      reincidence_count: 17,
      recommended_action: 'Aprobar borrador y autorizar emisión de circular general.',
      suggested_draft_reply: 'Estimadas familias:\n\nLes confirmamos que la salida del festival de este viernes será a las 13:00 hrs de manera escalonada según lo estipulado en el calendario escolar de Primaria.\n\nAtentamente,\nDirección',
      assigned_role: 'Dirección General',
      sla_hours: 24
    }
  ];

  for (let i = 3; i <= 28; i++) {
    fallbackMatters.push({
      id: `mat-${i.toString().padStart(3, '0')}`,
      matter_code: `MAT-2026-${(80 + i).toString().padStart(3, '0')}`,
      title: `Asunto Ejecutivo Directivo #${i} - Gestión y Supervisión Escolar`,
      summary: `Expediente administrativo canalizado para visto bueno de Dirección con procedencia institucional verificada.`,
      category: i % 2 === 0 ? 'Gestión Institucional' : 'Asuntos Académicos',
      urgency: i <= 8 ? 'ALTA' : 'MEDIA',
      destination: 'DIRECCION',
      why_shown: 'Asunto catalogado dentro de las facultades exclusivas de Dirección por normativa interna.',
      reincidence_count: 1,
      recommended_action: 'Revisar expediente y validar resolución sugerida por el equipo de coordinación.',
      suggested_draft_reply: `Estimado solicitante: Dirección ha revisado el expediente MAT-2026-${(80 + i).toString().padStart(3, '0')} y autoriza el trámite escolar respectivo.`,
      assigned_role: 'Dirección General',
      sla_hours: 24
    });
  }

  return NextResponse.json({
    matters: fallbackMatters,
    patterns: DEFAULT_DEMO_PATTERNS
  });
}
