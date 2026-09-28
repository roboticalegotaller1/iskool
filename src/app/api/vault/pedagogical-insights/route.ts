import { NextRequest, NextResponse } from 'next/server';
import { InstitutionalMemoryService } from '@/lib/institutionalMemory/memoryService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function extractGrade(gradeInput?: string | number): string | undefined {
  if (gradeInput === undefined || gradeInput === null) return undefined;
  const str = String(gradeInput).trim();
  const match = str.match(/\d+/);
  return match ? match[0] : str;
}

function normalizeSubject(subjectInput?: string): string | undefined {
  if (!subjectInput) return undefined;
  const clean = normalizeText(subjectInput);
  if (clean.includes('math') || clean.includes('mate')) return 'matematicas';
  if (clean.includes('cien') || clean.includes('natur') || clean.includes('fisic') || clean.includes('quim')) return 'ciencias';
  if (clean.includes('espa') || clean.includes('lengu') || clean.includes('lect')) return 'lenguajes';
  if (clean.includes('hist') || clean.includes('socia') || clean.includes('etica') || clean.includes('civid')) return 'historia';
  if (clean.includes('ingl') || clean.includes('engl')) return 'ingles';
  return clean;
}

export interface PedagogicalInsightsRequest {
  subjectId?: string;
  subject?: string;
  gradeLevel?: string | number;
  grade?: string | number;
  topicKeywords?: string[];
  topic?: string;
}

export interface FrictionPointInsight {
  friction: string;
  occurrences: number;
  severity: 'alta' | 'moderada' | 'baja';
  cycles: string[];
}

export interface ProvenInterventionInsight {
  intervention: string;
  reportedBy: string[];
  impactScore: number;
}

export interface PedagogicalInsightsResponse {
  success: boolean;
  found: boolean;
  query: {
    subject?: string;
    gradeLevel?: string;
    topicKeywords: string[];
  };
  totalMemoriesFound: number;
  cyclesCovered: string[];
  metrics: {
    averageMasteryRate: number;
    totalStudentsEvaluated: number;
  };
  frictionPoints: FrictionPointInsight[];
  interventions: ProvenInterventionInsight[];
  recommendations: string[];
  citedMemories: Array<{
    cycle: string;
    cohort: string;
    teacher: string;
    activitySource?: string;
    wikiLink: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: PedagogicalInsightsRequest = await request.json().catch(() => ({}));

    // 1. Normalización de parámetros de búsqueda
    const rawSubject = body.subjectId || body.subject || '';
    const normalizedSubject = normalizeSubject(rawSubject);
    const rawGrade = body.gradeLevel !== undefined ? body.gradeLevel : body.grade;
    const normalizedGrade = extractGrade(rawGrade);

    let rawKeywords: string[] = [];
    if (Array.isArray(body.topicKeywords)) {
      rawKeywords = body.topicKeywords;
    } else if (typeof body.topicKeywords === 'string') {
      rawKeywords = [body.topicKeywords];
    }
    if (body.topic && typeof body.topic === 'string') {
      rawKeywords.push(...body.topic.split(/\s+/));
    }

    const cleanKeywords = Array.from(
      new Set(
        rawKeywords
          .map(k => normalizeText(k))
          .filter(k => k.length > 2 && !['para', 'como', 'sobre', 'ante', 'desde'].includes(k))
      )
    );

    // 2. Consulta de memorias existentes en la Bóveda Curricular
    const topicSearchTerm = cleanKeywords.join(' ');
    const memories = await InstitutionalMemoryService.queryMemoriesAsync({
      grade: normalizedGrade,
      subject: normalizedSubject,
      topic: topicSearchTerm || undefined
    });

    // Si la búsqueda estricta no arrojó resultados y hay palabras clave, buscar por palabras clave individuales
    let matchedMemories = memories;
    if (matchedMemories.length === 0 && cleanKeywords.length > 0) {
      const allMemories = await InstitutionalMemoryService.queryMemoriesAsync({
        grade: normalizedGrade,
        subject: normalizedSubject
      });

      matchedMemories = allMemories.filter(doc => {
        const docTopic = normalizeText(doc.frontmatter.topic);
        const docSubject = normalizeText(doc.frontmatter.subject);
        const docTags = (doc.frontmatter.tags || []).map(t => normalizeText(t));
        return cleanKeywords.some(kw =>
          docTopic.includes(kw) || docSubject.includes(kw) || docTags.some(t => t.includes(kw))
        );
      });
    }

    // 3. Si no hay coincidencias
    if (matchedMemories.length === 0) {
      const emptyResponse: PedagogicalInsightsResponse = {
        success: true,
        found: false,
        query: {
          subject: rawSubject || undefined,
          gradeLevel: normalizedGrade || undefined,
          topicKeywords: cleanKeywords
        },
        totalMemoriesFound: 0,
        cyclesCovered: [],
        metrics: {
          averageMasteryRate: 0,
          totalStudentsEvaluated: 0
        },
        frictionPoints: [],
        interventions: [],
        recommendations: [
          'No se registran fricciones conceptuales previas para este tema específico. Inicia la secuencia con una evaluación diagnóstica formativa.'
        ],
        citedMemories: []
      };
      return NextResponse.json(emptyResponse);
    }

    // 4. Síntesis y agregación multi-ciclo
    const synthesis = InstitutionalMemoryService.synthesizePriorCycleLearnings(
      matchedMemories,
      topicSearchTerm || 'Tema de Planeación'
    );

    // 5. Categorización de severidad y ordenamiento por relevancia de fricción
    const frictionPoints: FrictionPointInsight[] = synthesis.recurrentFrictionPoints.map(f => {
      let severity: 'alta' | 'moderada' | 'baja' = 'moderada';
      if (f.occurrences >= 2 || synthesis.averageMasteryRate < 0.70) {
        severity = 'alta';
      } else if (f.occurrences === 1 && synthesis.averageMasteryRate >= 0.85) {
        severity = 'baja';
      }
      return {
        friction: f.friction,
        occurrences: f.occurrences,
        severity,
        cycles: f.cycles
      };
    });

    // Ordenar fricciones: Severidad alta primero, luego mayor número de ocurrencias
    const severityWeight = { alta: 3, moderada: 2, baja: 1 };
    frictionPoints.sort((a, b) => {
      const diffSeverity = severityWeight[b.severity] - severityWeight[a.severity];
      if (diffSeverity !== 0) return diffSeverity;
      return b.occurrences - a.occurrences;
    });

    // 6. Ordenar intervenciones por impacto pedagógico descendente
    const interventions: ProvenInterventionInsight[] = [...synthesis.provenInterventions].sort(
      (a, b) => b.impactScore - a.impactScore
    );

    const response: PedagogicalInsightsResponse = {
      success: true,
      found: true,
      query: {
        subject: rawSubject || undefined,
        gradeLevel: normalizedGrade || undefined,
        topicKeywords: cleanKeywords
      },
      totalMemoriesFound: synthesis.totalMemoriesFound,
      cyclesCovered: synthesis.cyclesCovered,
      metrics: {
        averageMasteryRate: synthesis.averageMasteryRate,
        totalStudentsEvaluated: synthesis.totalStudentsEvaluated
      },
      frictionPoints,
      interventions,
      recommendations: synthesis.recommendationsForNextTeacher,
      citedMemories: synthesis.citedMemories
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error en POST /api/vault/pedagogical-insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error interno al consultar lecciones de la Bóveda Curricular'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId') || searchParams.get('subject') || undefined;
  const gradeLevel = searchParams.get('gradeLevel') || searchParams.get('grade') || undefined;
  const topic = searchParams.get('topic') || searchParams.get('q') || undefined;

  const mockPostReq = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subjectId,
      gradeLevel,
      topicKeywords: topic ? [topic] : []
    })
  });

  return POST(mockPostReq);
}
