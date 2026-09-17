"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Network,
  Sparkles,
  Search,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  BookOpen,
  DollarSign,
  ShieldAlert,
  GraduationCap,
  Gamepad2,
  Building2,
  ArrowRight,
  Copy,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Activity,
  Check,
  FileText,
  Info,
  Edit3,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import Image from 'next/image';

// ============================================================================
// TIPOS DE NODOS Y ARISTAS DEL GRAFO NEURONAL (SEGUNDO CEREBRO INSTITUCIONAL)
// ============================================================================
export type NodeCluster = 
  | 'core'
  | 'pedagogico'
  | 'fiscal'
  | 'medico'
  | 'crm'
  | 'gamificacion';

export interface BrainNode {
  id: string;
  title: string;
  subtitle: string;
  cluster: NodeCluster;
  x: number; // Coordenada base en plano 1000x800
  y: number;
  radius: number;
  reads: number;
  bovedaPath: string;
  summary: string;
  keywords: string[];
  kpis?: Array<{ label: string; value: string }>;
  wikilinks: string[]; // Enlaces bidireccionales [[...]]
  actionLabel?: string;
  actionType?: string;
  customDictamenText?: string;
  isOptimized?: boolean;
  optimizedAt?: string;
  updatedAt?: string;
}

export interface BrainEdge {
  source: string;
  target: string;
  label?: string;
  strength: number; // Grosor/importancia 1 a 3
}

// ============================================================================
// TOPOLOGÍA DEL GRAFO DE CONOCIMIENTO INSTITUCIONAL
// (Bóveda Central de Conocimiento - Segundo Cerebro)
// ============================================================================
export const INSTITUTIONAL_GRAPH_NODES: BrainNode[] = [
  // 1. NÚCLEO INSTITUCIONAL
  {
    id: 'core-holding',
    title: 'Núcleo Institucional ISkool',
    subtitle: 'Holding Central • Segundo Cerebro Activo',
    cluster: 'core',
    x: 500,
    y: 400,
    radius: 36,
    reads: 9420,
    bovedaPath: 'boveda://corporativo/nucleo-directivo.md',
    summary: 'Centro de telemetría y convergencia de todas las normativas, finanzas, planeaciones NEM 2024 y protocolos operativos de la Red Nacional.',
    keywords: ['holding', 'cerebro', 'directivo', 'iskool', 'red', 'planteles', 'sedes', 'colegio', 'nacional'],
    kpis: [
      { label: 'Planteles', value: '4 Sedes' },
      { label: 'Matrícula', value: '5,784' },
      { label: 'Cobranza Consolidada', value: '94.2%' },
      { label: 'Tokens Consumidos', value: '0 Tokens' }
    ],
    wikilinks: ['hub-pedagogico', 'hub-fiscal', 'hub-medico', 'hub-crm', 'hub-gamificacion']
  },

  // 2. HUBS REGIONALES / TEMÁTICOS
  {
    id: 'hub-pedagogico',
    title: 'Pedagógico & NEM 2024',
    subtitle: 'Marco Oficial SEP & Cobertura Analítica',
    cluster: 'pedagogico',
    x: 260,
    y: 230,
    radius: 28,
    reads: 4180,
    bovedaPath: 'boveda://pedagogico/nem-2024/marco-general.md',
    summary: 'Directrices del Programa Analítico Nacional, articulación de las Fases 1 a 6, metodologías sociocríticas y proyectos comunitarios SEP.',
    keywords: ['nem', 'curricular', 'planeaciones', 'sep', 'programa', 'analitico', 'fases', 'pda', 'pedagogico', 'cobertura'],
    kpis: [
      { label: 'Cobertura Red', value: '94.2%' },
      { label: 'Fases Activas', value: '1 a 6' },
      { label: 'PDA Indexados', value: '1,240' }
    ],
    wikilinks: ['core-holding', 'node-nem-planeaciones', 'node-nem-fases', 'node-nem-rubricas', 'node-game-misiones']
  },
  {
    id: 'hub-fiscal',
    title: 'Tesorería & Fiscal SAT',
    subtitle: 'CFDI 4.0, IEDU & Aging de Cartera',
    cluster: 'fiscal',
    x: 740,
    y: 230,
    radius: 28,
    reads: 3620,
    bovedaPath: 'boveda://finanzas/fiscal/sat-cfdi-4.0.md',
    summary: 'Control automatizado de facturación escolar bajo Anexo 20 CFDI 4.0 con deducción de colegiaturas IEDU, conciliación bancaria SPEI y aging de mora.',
    keywords: ['cobranza', 'cfdi', 'sat', 'factura', 'iedu', 'timbrado', 'fiscal', 'pagos', 'recibo', 'colegiatura', 'pac', 'aging'],
    kpis: [
      { label: 'Cobranza Media', value: '94.2%' },
      { label: 'Timbrado PAC', value: 'Instantáneo' },
      { label: 'Complemento', value: 'IEDU 100%' }
    ],
    wikilinks: ['core-holding', 'node-fiscal-cfdi', 'node-fiscal-iedu', 'node-fiscal-aging', 'node-campus-pedregal']
  },
  {
    id: 'hub-medico',
    title: 'Salud & Protección Civil',
    subtitle: 'Expediente 360, Alergias y Evacuación',
    cluster: 'medico',
    x: 230,
    y: 560,
    radius: 28,
    reads: 2890,
    bovedaPath: 'boveda://seguridad/salud-proteccion-civil.md',
    summary: 'Protocolos de respuesta médica ante shock anafiláctico, caídas, sismos, contingencias y pase de lista biométrico en evacuación escolar.',
    keywords: ['emergencia', 'medica', 'alergia', 'sismo', 'evacuacion', 'salud', 'expediente', '360', 'enfermeria', 'proteccion', 'civil'],
    kpis: [
      { label: 'Tiempo Alerta', value: '< 3 min' },
      { label: 'Pase de Lista', value: '< 90 s' },
      { label: 'Expedientes', value: '100% Digital' }
    ],
    wikilinks: ['core-holding', 'node-medico-expediente', 'node-medico-sismo', 'node-crm-pipeline']
  },
  {
    id: 'hub-crm',
    title: 'Admisiones & Matrícula CRM',
    subtitle: 'Pipeline 5 Fases & Diagnóstico',
    cluster: 'crm',
    x: 750,
    y: 570,
    radius: 28,
    reads: 2410,
    bovedaPath: 'boveda://admisiones/pipeline-induccion.md',
    summary: 'Embudo de conversión de familias aspirantes desde primer contacto, tour escolar y diagnóstico psicopedagógico hasta inscripción oficial.',
    keywords: ['admision', 'admisiones', 'prospecto', 'inscripcion', 'psicopedagogico', 'diagnostico', 'nuevo', 'ingreso', 'pipeline'],
    kpis: [
      { label: 'Pipeline Activo', value: '23 Familias' },
      { label: 'Conversión', value: '68.4%' },
      { label: 'Diagnóstico', value: 'Psicopedagógico' }
    ],
    wikilinks: ['core-holding', 'node-crm-pipeline', 'node-crm-diagnostico', 'node-medico-expediente']
  },
  {
    id: 'hub-gamificacion',
    title: 'Gamificación & Lienzo Digital',
    subtitle: 'Misiones Comunitarias, XP y Maestría',
    cluster: 'gamificacion',
    x: 500,
    y: 690,
    radius: 27,
    reads: 3100,
    bovedaPath: 'boveda://academico/gamificacion-lienzo-digital.md',
    summary: 'Entorno lúdico de aprendizaje integrado al aula: misiones colaborativas, insignias de maestría, puntos de experiencia (XP) y retos en Lienzo Digital.',
    keywords: ['gamificacion', 'xp', 'misiones', 'lienzo', 'digital', 'actividades', 'insignias', 'recompensas', 'maestria'],
    kpis: [
      { label: 'Misiones Activas', value: '142' },
      { label: 'Participación', value: '91.8%' },
      { label: 'Nivel Máximo', value: 'Rango Élite' }
    ],
    wikilinks: ['core-holding', 'node-game-misiones', 'node-game-lienzo', 'node-nem-planeaciones']
  },

  // 3. NODOS HOJA ESPECÍFICOS (DOCUMENTOS NORMATIVOS Y DIRECTIVAS)
  {
    id: 'node-nem-planeaciones',
    title: 'Planeaciones de Aula Cronometradas',
    subtitle: 'Inicio • Desarrollo • Cierre • NEM 2024',
    cluster: 'pedagogico',
    x: 120,
    y: 150,
    radius: 21,
    reads: 1890,
    bovedaPath: 'boveda://pedagogico/nem-2024/planeaciones-cronometradas.md',
    summary: 'Estructura estándar de sesión pedagógica: apertura detonadora (10-15m), desarrollo activo basado en indagación (25-35m) y cierre reflexivo con entregable tangible.',
    keywords: ['planeacion', 'planeaciones', 'aula', 'cronometrada', 'inicio', 'desarrollo', 'cierre', 'nem', 'pda'],
    kpis: [
      { label: 'Estructura', value: '3 Momentos' },
      { label: 'Entregable', value: '100% Tangible' },
      { label: 'Validación SEP', value: 'Alineada PDA' }
    ],
    wikilinks: ['hub-pedagogico', 'node-nem-rubricas', 'node-game-lienzo'],
    actionLabel: 'Supervisar Planeaciones',
    actionType: 'academico'
  },
  {
    id: 'node-nem-fases',
    title: 'Mapeo Curricular Fases 1 a 6',
    subtitle: 'Preescolar, Primaria y Secundaria',
    cluster: 'pedagogico',
    x: 100,
    y: 310,
    radius: 20,
    reads: 1450,
    bovedaPath: 'boveda://pedagogico/nem-2024/fases-curriculares.md',
    summary: 'Catálogo exhaustivo de campos formativos (Lenguajes, Saberes y Pensamiento Científico, Ética, De lo Humano y lo Comunitario) con articulación vertical.',
    keywords: ['fases', 'fase', 'preescolar', 'primaria', 'secundaria', 'campos', 'formativos', 'ejes', 'articuladores'],
    kpis: [
      { label: 'Campos', value: '4 Formativos' },
      { label: 'Ejes', value: '7 Articuladores' },
      { label: 'Progresión', value: 'Fase 1 a 6' }
    ],
    wikilinks: ['hub-pedagogico', 'node-nem-planeaciones']
  },
  {
    id: 'node-nem-rubricas',
    title: 'Rúbricas Analíticas Formativas',
    subtitle: 'Niveles de Desempeño & Criterios SEP',
    cluster: 'pedagogico',
    x: 270,
    y: 90,
    radius: 19,
    reads: 1220,
    bovedaPath: 'boveda://pedagogico/evaluacion/rubricas-analiticas.md',
    summary: 'Instrumentos formativos de evaluación cuali-cuantitativa con 4 niveles de dominio (Receptivo, Resolutivo, Autónomo, Estratégico) y retroalimentación constructiva.',
    keywords: ['rubrica', 'rubricas', 'analitica', 'evaluacion', 'formativa', 'criterios', 'desempeño', 'calificacion'],
    kpis: [
      { label: 'Niveles', value: '4 Estratos' },
      { label: 'Tipo', value: 'Formativa NEM' },
      { label: 'Ponderación', value: 'Automatizada' }
    ],
    wikilinks: ['hub-pedagogico', 'node-nem-planeaciones', 'node-game-misiones']
  },

  {
    id: 'node-fiscal-cfdi',
    title: 'Manual de Facturación SAT CFDI 4.0',
    subtitle: 'Anexo 20 & Timbrado PAC Cero-Lag',
    cluster: 'fiscal',
    x: 880,
    y: 150,
    radius: 21,
    reads: 980,
    bovedaPath: 'boveda://finanzas/fiscal/manual-cfdi-4.0.md',
    summary: 'Protocolo de generación y sellado digital XML con PAC autorizado. Validaciones de RFC, régimen fiscal 605/612 y código postal del receptor legal.',
    keywords: ['cfdi', 'sat', 'facturacion', 'timbrado', 'pac', 'anexo20', 'xml', 'sello', 'digital'],
    kpis: [
      { label: 'Versión', value: 'CFDI 4.0' },
      { label: 'Velocidad', value: '< 200 ms' },
      { label: 'Estatus', value: 'Válido SAT' }
    ],
    wikilinks: ['hub-fiscal', 'node-fiscal-iedu', 'node-fiscal-aging'],
    actionLabel: 'Ver Facturación SAT',
    actionType: 'cobranza'
  },
  {
    id: 'node-fiscal-iedu',
    title: 'Complemento de Deducción IEDU',
    subtitle: 'Colegiaturas Deducibles ISR',
    cluster: 'fiscal',
    x: 910,
    y: 310,
    radius: 20,
    reads: 1110,
    bovedaPath: 'boveda://finanzas/fiscal/complemento-iedu.md',
    summary: 'Inclusión obligatoria de CURP del alumno, clave RVOE del plantel, nivel escolar e identificación de colegiatura deducible para la declaración anual de padres.',
    keywords: ['iedu', 'deduccion', 'decreto', 'colegiaturas', 'curp', 'rvoe', 'isr', 'deducible'],
    kpis: [
      { label: 'Decreto', value: 'Dof Escolar' },
      { label: 'Validación CURP', value: '100% RENAPO' },
      { label: 'Clave RVOE', value: 'Indexada' }
    ],
    wikilinks: ['hub-fiscal', 'node-fiscal-cfdi']
  },
  {
    id: 'node-fiscal-aging',
    title: 'Aging de Adeudos & Conciliación SPEI',
    subtitle: 'Cubo Financiero: Corriente a +90 días',
    cluster: 'fiscal',
    x: 730,
    y: 90,
    radius: 20,
    reads: 1340,
    bovedaPath: 'boveda://finanzas/cobranza/aging-cartera.md',
    summary: 'Matriz de estratificación de cartera vencida con alertas tempranas a 5, 10 y 15 días, mitigación preventiva de mora y convenios de pago digitales.',
    keywords: ['aging', 'cartera', 'vencida', 'mora', 'spei', 'conciliacion', 'adeudo', 'cuentas', 'cobrar'],
    kpis: [
      { label: 'Corriente', value: '88.4%' },
      { label: 'Mora >60d', value: '3.1%' },
      { label: 'Conciliación', value: 'Automática' }
    ],
    wikilinks: ['hub-fiscal', 'node-fiscal-cfdi', 'node-campus-pedregal'],
    actionLabel: 'Auditar Aging Cobranza',
    actionType: 'cobranza'
  },

  {
    id: 'node-medico-expediente',
    title: 'Expediente 360 & Alertas Médicas',
    subtitle: 'Alergias • Tipificación • Contacto Urgencias',
    cluster: 'medico',
    x: 100,
    y: 680,
    radius: 22,
    reads: 1420,
    bovedaPath: 'boveda://seguridad/medico/expediente-360-alergias.md',
    summary: 'Ficha médica digital inmutable: historial de alergias severas (anafilaxia), medicamentos administrados, grupo sanguíneo y contacto de pediatra de cabecera.',
    keywords: ['expediente', '360', 'medico', 'alergia', 'shock', 'enfermeria', 'pediatra', 'alergias', 'asma'],
    kpis: [
      { label: 'Acceso Directo', value: '< 2 clics' },
      { label: 'Bitácora Legal', value: 'Cripto-Foliada' },
      { label: 'Notif. Padres', value: '< 3 min' }
    ],
    wikilinks: ['hub-medico', 'node-medico-sismo', 'node-crm-pipeline'],
    actionLabel: 'Ver Expedientes 360',
    actionType: 'personas'
  },
  {
    id: 'node-medico-sismo',
    title: 'Protocolo de Sismo y Evacuación',
    subtitle: 'Repliegue, Puntos de Reunión y Biometría',
    cluster: 'medico',
    x: 290,
    y: 690,
    radius: 20,
    reads: 1150,
    bovedaPath: 'boveda://seguridad/proteccion-civil/protocolo-sismo.md',
    summary: 'Procedimiento operativo de emergencia sísmica: 30s de repliegue preventivo, repliegue a zonas seguras externas y pase de lista biométrico en menos de 90 segundos.',
    keywords: ['sismo', 'evacuacion', 'terremoto', 'proteccion', 'civil', 'brigadas', 'punto', 'reunion', 'simulacro'],
    kpis: [
      { label: 'Tiempo Repliegue', value: '30 s' },
      { label: 'Evacuación Total', value: '< 90 s' },
      { label: 'Pase Lista App', value: '100% Digital' }
    ],
    wikilinks: ['hub-medico', 'node-medico-expediente']
  },

  {
    id: 'node-crm-pipeline',
    title: 'Pipeline de Conversión Familiar',
    subtitle: '5 Fases de Inducción de Prospectos',
    cluster: 'crm',
    x: 910,
    y: 680,
    radius: 21,
    reads: 820,
    bovedaPath: 'boveda://admisiones/pipeline-conversion.md',
    summary: 'Metodología institucional de seguimiento y acompañamiento a familias: Prospecto -> Contactado -> Tour Guiado -> Diagnóstico -> Inscrito con Expediente 360.',
    keywords: ['pipeline', 'admision', 'familias', 'prospecto', 'lead', 'tour', 'inscrito', 'matricula'],
    kpis: [
      { label: 'En Proceso', value: '23 Familias' },
      { label: 'Cierre Mensual', value: '88%' },
      { label: 'Tiempo Ciclo', value: '12 días' }
    ],
    wikilinks: ['hub-crm', 'node-crm-diagnostico', 'node-medico-expediente'],
    actionLabel: 'Ver Pipeline CRM',
    actionType: 'admisiones'
  },
  {
    id: 'node-crm-diagnostico',
    title: 'Diagnóstico Psicopedagógico',
    subtitle: 'Evaluación de Perfil y Estilo de Aprendizaje',
    cluster: 'crm',
    x: 740,
    y: 710,
    radius: 19,
    reads: 690,
    bovedaPath: 'boveda://admisiones/diagnostico-psicopedagogico.md',
    summary: 'Batería diagnóstica institucional que identifica fortalezas socioemocionales, madurez cognitiva y competencias lectoescritoras de nuevos ingresos.',
    keywords: ['diagnostico', 'psicopedagogico', 'psicologia', 'evaluacion', 'ingreso', 'perfil', 'alumno'],
    kpis: [
      { label: 'Duración', value: '45 min' },
      { label: 'Dictamen', value: 'Inmediato' },
      { label: 'Entrega Padres', value: '24 hrs' }
    ],
    wikilinks: ['hub-crm', 'node-crm-pipeline']
  },

  {
    id: 'node-game-misiones',
    title: 'Misiones Comunitarias NEM',
    subtitle: 'Aprendizaje Basado en Proyectos (ABP)',
    cluster: 'gamificacion',
    x: 400,
    y: 810,
    radius: 21,
    reads: 970,
    bovedaPath: 'boveda://academico/gamificacion/misiones-comunitarias.md',
    summary: 'Dinámicas gamificadas de impacto real en la comunidad escolar: brigadas ecológicas, oratoria, ferias científicas y retos colaborativos con insignias.',
    keywords: ['misiones', 'comunitarias', 'proyectos', 'abp', 'insignias', 'xp', 'colaboracion', 'gamificacion'],
    kpis: [
      { label: 'Proyectos ABP', value: '38 Activos' },
      { label: 'Impacto Social', value: 'Local' },
      { label: 'Insignias Ganadas', value: '1,420' }
    ],
    wikilinks: ['hub-gamificacion', 'node-game-lienzo', 'hub-pedagogico']
  },
  {
    id: 'node-game-lienzo',
    title: 'Lienzo Digital de Actividades',
    subtitle: 'Estudio Interactivo de Clase en Vivo',
    cluster: 'gamificacion',
    x: 600,
    y: 810,
    radius: 21,
    reads: 1140,
    bovedaPath: 'boveda://academico/lienzo-digital/estudio-actividades.md',
    summary: 'Plataforma interactiva donde los alumnos resuelven retos, simuladores y cuestionarios gamificados con feedback en tiempo real y registro de dominio.',
    keywords: ['lienzo', 'digital', 'actividades', 'simulador', 'estudio', 'reto', 'quiz', 'interactivo'],
    kpis: [
      { label: 'Sesiones Diarias', value: '2,800' },
      { label: 'Feedback', value: 'En Vivo' },
      { label: 'Calificación', value: 'Al instante' }
    ],
    wikilinks: ['hub-gamificacion', 'node-game-misiones', 'node-nem-planeaciones'],
    actionLabel: 'Abrir Lienzo Digital',
    actionType: 'academico'
  },

  // 4. NODOS DE SEDES / PLANTELES
  {
    id: 'node-campus-cdmx',
    title: 'Anglo CDMX (Campus Central)',
    subtitle: '2,120 Alumnos • Cobertura NEM 96%',
    cluster: 'pedagogico',
    x: 390,
    y: 120,
    radius: 23,
    reads: 2100,
    bovedaPath: 'boveda://sedes/anglo-cdmx.md',
    summary: 'Plantel insignia en Ciudad de México. 142 docentes, excelencia curricular NEM del 96% y cobranza consolidada del 94%.',
    keywords: ['cdmx', 'central', 'campus', 'anglo', 'sede'],
    kpis: [
      { label: 'Matrícula', value: '2,120' },
      { label: 'Cobranza', value: '94%' },
      { label: 'Cobertura', value: '96%' }
    ],
    wikilinks: ['core-holding', 'hub-pedagogico'],
    actionLabel: 'Filtrar a CDMX',
    actionType: 'campus'
  },
  {
    id: 'node-campus-satelite',
    title: 'Anglo Satélite',
    subtitle: '1,894 Alumnos • Cobranza 96%',
    cluster: 'fiscal',
    x: 610,
    y: 120,
    radius: 23,
    reads: 1750,
    bovedaPath: 'boveda://sedes/anglo-satelite.md',
    summary: 'Plantel líder en eficiencia de cobranza financiera (96%). 134 docentes activos y 95% de avance en proyectos de aula comunitarios.',
    keywords: ['satelite', 'edomex', 'campus', 'anglo', 'sede'],
    kpis: [
      { label: 'Matrícula', value: '1,894' },
      { label: 'Cobranza', value: '96%' },
      { label: 'Cobertura', value: '95%' }
    ],
    wikilinks: ['core-holding', 'hub-fiscal'],
    actionLabel: 'Filtrar a Satélite',
    actionType: 'campus'
  },
  {
    id: 'node-campus-pedregal',
    title: 'Anglo Pedregal',
    subtitle: '980 Alumnos • Foco de Cobranza (91%)',
    cluster: 'fiscal',
    x: 880,
    y: 430,
    radius: 23,
    reads: 1980,
    bovedaPath: 'boveda://sedes/anglo-pedregal.md',
    summary: 'Plantel con plan de contingencia financiera en marcha: cobranza al 91% frente al umbral corporativo de 95%. Gestión de aging en proceso.',
    keywords: ['pedregal', 'sur', 'campus', 'foco', 'cobranza'],
    kpis: [
      { label: 'Matrícula', value: '980' },
      { label: 'Cobranza', value: '91% (Alerta)' },
      { label: 'Focos', value: '1 Activo' }
    ],
    wikilinks: ['core-holding', 'hub-fiscal', 'node-fiscal-aging'],
    actionLabel: 'Gestionar Foco Pedregal',
    actionType: 'cobranza'
  },
  {
    id: 'node-campus-guadalajara',
    title: 'Anglo Guadalajara',
    subtitle: '790 Alumnos • Cobertura NEM 94%',
    cluster: 'pedagogico',
    x: 650,
    y: 430,
    radius: 23,
    reads: 1620,
    bovedaPath: 'boveda://sedes/anglo-guadalajara.md',
    summary: 'Plantel de Occidente. 68 docentes activos, 94% de cumplimiento en proyectos comunitarios NEM y cobranza al 95.2%.',
    keywords: ['guadalajara', 'occidente', 'jalisco', 'campus', 'anglo', 'sede'],
    kpis: [
      { label: 'Matrícula', value: '790' },
      { label: 'Cobranza', value: '95.2%' },
      { label: 'Cobertura', value: '94%' }
    ],
    wikilinks: ['core-holding', 'hub-pedagogico'],
    actionLabel: 'Filtrar a Guadalajara',
    actionType: 'campus'
  }
];

export const INSTITUTIONAL_GRAPH_EDGES: BrainEdge[] = [
  // Conexiones del Core a los 5 Hubs
  { source: 'core-holding', target: 'hub-pedagogico', label: 'Marco SEP', strength: 3 },
  { source: 'core-holding', target: 'hub-fiscal', label: 'SAT CFDI', strength: 3 },
  { source: 'core-holding', target: 'hub-medico', label: 'Salud 360', strength: 3 },
  { source: 'core-holding', target: 'hub-crm', label: 'Admisiones', strength: 3 },
  { source: 'core-holding', target: 'hub-gamificacion', label: 'Lienzo Vivo', strength: 3 },

  // Hub Pedagógico a Hojas
  { source: 'hub-pedagogico', target: 'node-nem-planeaciones', label: 'Planeación', strength: 2 },
  { source: 'hub-pedagogico', target: 'node-nem-fases', label: 'Fases 1-6', strength: 2 },
  { source: 'hub-pedagogico', target: 'node-nem-rubricas', label: 'Evaluación', strength: 2 },
  { source: 'hub-pedagogico', target: 'node-campus-cdmx', label: 'Sede Sólida', strength: 2 },
  { source: 'hub-pedagogico', target: 'node-campus-guadalajara', label: 'Sede Occidente', strength: 2 },

  // Hub Fiscal a Hojas
  { source: 'hub-fiscal', target: 'node-fiscal-cfdi', label: 'PAC SAT', strength: 2 },
  { source: 'hub-fiscal', target: 'node-fiscal-iedu', label: 'Deducción', strength: 2 },
  { source: 'hub-fiscal', target: 'node-fiscal-aging', label: 'Mora SPEI', strength: 2 },
  { source: 'hub-fiscal', target: 'node-campus-satelite', label: 'Líder 96%', strength: 2 },
  { source: 'hub-fiscal', target: 'node-campus-pedregal', label: 'Foco 91%', strength: 2 },

  // Hub Médico a Hojas
  { source: 'hub-medico', target: 'node-medico-expediente', label: 'Expediente', strength: 2 },
  { source: 'hub-medico', target: 'node-medico-sismo', label: 'Evacuación', strength: 2 },

  // Hub CRM a Hojas
  { source: 'hub-crm', target: 'node-crm-pipeline', label: 'Embudo CRM', strength: 2 },
  { source: 'hub-crm', target: 'node-crm-diagnostico', label: 'Psicometría', strength: 2 },

  // Hub Gamificación a Hojas
  { source: 'hub-gamificacion', target: 'node-game-misiones', label: 'Retos ABP', strength: 2 },
  { source: 'hub-gamificacion', target: 'node-game-lienzo', label: 'Lienzo Digital', strength: 2 },

  // Sinapsis Inter-Dominio Bidireccionales
  { source: 'node-nem-planeaciones', target: 'node-game-lienzo', label: 'Actividad en Aula', strength: 1 },
  { source: 'node-nem-rubricas', target: 'node-game-misiones', label: 'Criterios de Evaluación', strength: 1 },
  { source: 'node-medico-expediente', target: 'node-crm-pipeline', label: 'Alta Expediente', strength: 1 },
  { source: 'node-fiscal-cfdi', target: 'node-fiscal-iedu', label: 'Complemento Fiscal', strength: 2 },
  { source: 'node-fiscal-aging', target: 'node-campus-pedregal', label: 'Acción Correctiva', strength: 2 },
  { source: 'node-campus-cdmx', target: 'node-nem-planeaciones', label: 'Adopción NEM', strength: 1 },
  { source: 'core-holding', target: 'node-campus-guadalajara', label: 'Occidente', strength: 2 }
];

// Colores del Clúster
const CLUSTER_CONFIG: Record<NodeCluster, {
  color: string;
  fill: string;
  glow: string;
  border: string;
  badge: string;
  label: string;
}> = {
  core: {
    color: '#818CF8',
    fill: 'rgba(99, 102, 241, 0.25)',
    glow: 'rgba(99, 102, 241, 0.7)',
    border: '#6366F1',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    label: 'Núcleo Central'
  },
  pedagogico: {
    color: '#34D399',
    fill: 'rgba(16, 185, 129, 0.22)',
    glow: 'rgba(16, 185, 129, 0.65)',
    border: '#10B981',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'Pedagógico & NEM'
  },
  fiscal: {
    color: '#38BDF8',
    fill: 'rgba(6, 182, 212, 0.22)',
    glow: 'rgba(6, 182, 212, 0.65)',
    border: '#06B6D4',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    label: 'Tesorería & SAT'
  },
  medico: {
    color: '#FB7185',
    fill: 'rgba(244, 63, 94, 0.22)',
    glow: 'rgba(244, 63, 94, 0.65)',
    border: '#F43F5E',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    label: 'Salud & Urgencias'
  },
  crm: {
    color: '#A78BFA',
    fill: 'rgba(139, 92, 246, 0.22)',
    glow: 'rgba(139, 92, 246, 0.65)',
    border: '#8B5CF6',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    label: 'Admisiones CRM'
  },
  gamificacion: {
    color: '#F472B6',
    fill: 'rgba(236, 72, 153, 0.22)',
    glow: 'rgba(236, 72, 153, 0.65)',
    border: '#EC4899',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    label: 'Gamificación & Lienzo'
  }
};

// ============================================================================
// PROPS DEL COMPONENTE ESTUDIO DEL CEREBRO INSTITUCIONAL
// ============================================================================
export interface InstitutionalBrainStudioProps {
  isOpen: boolean;
  onClose: () => void;
  holdingName?: string;
  initialQuery?: string;
  onNavigateTab?: (tab: string) => void;
  isEmbeddedView?: boolean; // Para cuando se incrusta directo en la pestaña 'cerebro'
}

export const InstitutionalBrainStudio: React.FC<InstitutionalBrainStudioProps> = ({
  isOpen,
  onClose,
  holdingName = 'Colegio Nacional Mexico',
  initialQuery = '',
  onNavigateTab,
  isEmbeddedView = false
}) => {
  // Estados de vista e interacción
  const [viewMode, setViewMode] = useState<'split' | 'graph' | 'assistant'>('split');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core-holding');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterCluster, setFilterCluster] = useState<NodeCluster | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Estados de Zoom & Pan en Canvas SVG
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Terminal de Inteligencia Artificial Pedagógica
  const [chatInput, setChatInput] = useState<string>(initialQuery || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeDictamen, setActiveDictamen] = useState<{
    title: string;
    text: string;
    source: string;
    bovedaPath: string;
    latencyMs: number;
    confidence: number;
    kpis?: Array<{ label: string; value: string }>;
    wikilinks: string[];
    actionLabel?: string;
    actionType?: string;
    isOptimized?: boolean;
    timestamp: string;
  } | null>(null);

  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const lastInitialQueryRef = useRef<string | null>(null);

  // Gestión Dinámica de Nodos y Protocolos (Persistencia en Bóveda Central)
  const [nodes, setNodes] = useState<BrainNode[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_boveda_nodes_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INSTITUTIONAL_GRAPH_NODES;
  });

  const [edges, setEdges] = useState<BrainEdge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_boveda_edges_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INSTITUTIONAL_GRAPH_EDGES;
  });

  // Notificación flotante de acción directiva
  const [actionToast, setActionToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3200);
  };

  // Estados del Modal de Edición / Creación de Protocolos
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState<boolean>(false);
  const [protocolModalMode, setProtocolModalMode] = useState<'create' | 'edit'>('edit');
  const [isOptimizingWithAI, setIsOptimizingWithAI] = useState<boolean>(false);

  // Formulario del Protocolo
  const [protocolForm, setProtocolForm] = useState<{
    id?: string;
    title: string;
    subtitle: string;
    cluster: NodeCluster;
    bovedaPath: string;
    summary: string;
    dictamenText: string;
    keywords: string;
    kpis: Array<{ label: string; value: string }>;
  }>({
    title: '',
    subtitle: '',
    cluster: 'medico',
    bovedaPath: '',
    summary: '',
    dictamenText: '',
    keywords: '',
    kpis: [
      { label: 'Tiempo de Acción', value: '< 60 s' },
      { label: 'Notificación', value: '< 3 min' },
      { label: 'Bitácora Legal', value: '100% Digital' }
    ]
  });

  // Guardar en persistencia local reactiva
  const saveGraphData = (newNodes: BrainNode[], newEdges: BrainEdge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    if (typeof window !== 'undefined') {
      localStorage.setItem('iskool_boveda_nodes_v2', JSON.stringify(newNodes));
      localStorage.setItem('iskool_boveda_edges_v2', JSON.stringify(newEdges));
    }
  };

  // Nodos indexados por ID
  const nodeMap = useMemo(() => {
    const map = new Map<string, BrainNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  const selectedNode = useMemo(() => {
    return nodeMap.get(selectedNodeId) || nodes[0];
  }, [nodeMap, selectedNodeId, nodes]);

  // Aristas conectadas al nodo seleccionado
  const activeEdges = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === selectedNodeId) {
        connected.add(edge.target);
      }
      if (edge.target === selectedNodeId) {
        connected.add(edge.source);
      }
    });
    return connected;
  }, [selectedNodeId, edges]);

  // Nodos filtrados para renderizado
  const filteredNodes = useMemo(() => {
    let list = nodes;
    if (filterCluster !== 'all') {
      list = list.filter(n => n.cluster === filterCluster || n.id === 'core-holding');
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.keywords.some(k => k.includes(q))
      );
    }
    return list;
  }, [nodes, filterCluster, searchFilter]);

  // Optimización instantánea del protocolo seleccionado con IA Pedagógica (0 Tokens)
  const handleOptimizeCurrentProtocol = () => {
    const node = nodeMap.get(selectedNodeId);
    if (!node) return;

    setIsOptimizingWithAI(true);
    setTimeout(() => {
      let enhancedText = '';
      let enhancedKpis = node.kpis ? [...node.kpis] : [];
      
      if (node.cluster === 'medico') {
        enhancedText = `**Protocolo Optimizado de Emergencia y Protección Civil (SEP 2024):**\n\nDirectiva auditada y reforzada con estándares de seguridad escolar vigentes:\n\n1. **Detección y Activación Inmediata (0-30s):** Alerta sonora y activación de brigada directiva/médica.\n2. **Respuesta Primaria (< 60s):** Aplicación de protocolo de contención, primeros auxilios o repliegue seguro.\n3. **Evacuación y Concentración (< 75s):** Traslado coordinado a puntos de reunión exteriores con señalética luminosa.\n4. **Pase de Lista Digital Geocercado (< 90s):** Conteo biométrico automatizado en app de dirección.\n5. **Comunicación Institucional (< 2m):** Envío de alerta push encriptada con confirmación de lectura a tutores legales.\n\n*Conformidad Legal:* Bitácora inmutable registrada en la Bóveda Central con firma digital escolar.`;
        enhancedKpis = [
          { label: 'Tiempo Repliegue', value: '30 s' },
          { label: 'Evacuación Total', value: '< 75 s (Mejorado)' },
          { label: 'Pase Lista App', value: '100% Digital' }
        ];
      } else if (node.cluster === 'pedagogico') {
        enhancedText = `**Protocolo Pedagógico Optimizado (Marco Curricular NEM 2024):**\n\nEstructura metodológica de clase mundial con articulación estricta a los PDA oficiales de la SEP:\n\n1. **Apertura y Detonación (15 min):** Pregunta detonante, activación comunitaria y conexión emocional.\n2. **Desarrollo Socioformativo Guiado (30 min):** Trabajo colaborativo por proyectos (ABP) y experimentación.\n3. **Cierre Reflexivo & Evaluación (15 min):** Autoevaluación formativa, rúbrica analítica y entregable verificable.\n\n*Auditoría:* Sincronización automática de evidencias en el expediente del educando a 0 Tokens.`;
        enhancedKpis = [
          { label: 'Estructura', value: '3 Momentos' },
          { label: 'Validación SEP', value: '100% PDA' },
          { label: 'Entregable', value: 'Tangible' }
        ];
      } else if (node.cluster === 'fiscal') {
        enhancedText = `**Directiva de Recaudación y Cumplimiento SAT CFDI 4.0:**\n\nOptimización de flujo financiero escolar con conciliación bancaria instantánea:\n\n1. **Timbrado PAC Automatizado (< 200 ms):** Emisión simultánea de CFDI con complemento IEDU.\n2. **Conciliación SPEI en Tiempo Real:** Detección de depósitos referenciados y liquidación de adeudos en ledger.\n3. **Mapeo Preventivo de Aging:** Escalamiento automático de cartera con avisos amigables a tutores a 5, 10 y 15 días.`;
        enhancedKpis = [
          { label: 'Versión', value: 'CFDI 4.0' },
          { label: 'Velocidad', value: '< 180 ms' },
          { label: 'Complemento', value: 'IEDU 100%' }
        ];
      } else {
        enhancedText = `**Directiva Institucional Optimizada por Inteligencia Artificial Pedagógica:**\n\n${node.summary}\n\n*Mejoras incorporadas:* Estandarización de 5 etapas operativas, mitigación de riesgos con bitácora digital, y validación continua con la Red Nacional ISkool.`;
      }

      const nowStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const updatedNodes = nodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            summary: n.summary.includes('Optimizado') ? n.summary : `${n.summary} (Optimizado con lineamientos SEP 2024)`,
            kpis: enhancedKpis,
            customDictamenText: enhancedText,
            isOptimized: true,
            optimizedAt: nowStr,
            updatedAt: nowStr
          };
        }
        return n;
      });

      // 1. Guardar en memoria reactiva y almacenamiento local persistente
      saveGraphData(updatedNodes, edges);

      // 2. Persistir archivo físico Markdown en la Bóveda Curricular en servidor
      try {
        fetch('/api/vault/protocol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: node.id,
            title: node.title,
            cluster: node.cluster,
            bovedaPath: node.bovedaPath,
            content: enhancedText,
            kpis: enhancedKpis,
            summary: node.summary,
            isOptimized: true,
            wikilinks: node.wikilinks
          })
        }).catch(err => console.warn('Aviso de sincronización en Bóveda:', err));
      } catch (e) {}

      setActiveDictamen(prev => prev ? {
        ...prev,
        text: enhancedText,
        kpis: enhancedKpis,
        confidence: 99,
        isOptimized: true,
        timestamp: nowStr
      } : null);

      setIsOptimizingWithAI(false);
      showToast('¡Protocolo optimizado y guardado permanentemente en la Bóveda Central!');
    }, 350);
  };

  // Abrir modal de edición para el nodo actual
  const handleOpenEditModal = () => {
    const node = nodeMap.get(selectedNodeId);
    if (!node) return;
    setProtocolModalMode('edit');
    setProtocolForm({
      id: node.id,
      title: node.title,
      subtitle: node.subtitle,
      cluster: node.cluster,
      bovedaPath: node.bovedaPath,
      summary: node.summary,
      dictamenText: activeDictamen?.text || node.summary,
      keywords: node.keywords.join(', '),
      kpis: node.kpis && node.kpis.length >= 3 ? node.kpis : [
        { label: 'Tiempo Respuesta', value: '< 60 s' },
        { label: 'Estatus', value: 'Vigente' },
        { label: 'Bitácora', value: '100% Digital' }
      ]
    });
    setIsProtocolModalOpen(true);
  };

  // Abrir modal de creación de nuevo protocolo
  const handleOpenCreateModal = () => {
    setProtocolModalMode('create');
    const defaultCluster: NodeCluster = filterCluster !== 'all' ? filterCluster : 'medico';
    setProtocolForm({
      title: '',
      subtitle: '',
      cluster: defaultCluster,
      bovedaPath: `boveda://institucional/${defaultCluster}/nuevo-protocolo.md`,
      summary: '',
      dictamenText: '',
      keywords: 'protocolo, directiva, escolar, seguridad, sep',
      kpis: [
        { label: 'Tiempo de Acción', value: '< 60 s' },
        { label: 'Notificación', value: '< 3 min' },
        { label: 'Estatus Bóveda', value: 'Indexado' }
      ]
    });
    setIsProtocolModalOpen(true);
  };

  // Guardar creación o modificación de protocolo
  const handleSaveProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolForm.title.trim()) return;

    const cleanKeywords = protocolForm.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    if (protocolModalMode === 'edit' && protocolForm.id) {
      // Modificar existente
      const nowStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newCustomText = protocolForm.dictamenText.trim() || protocolForm.summary.trim();

      const updatedNodes = nodes.map(n => {
        if (n.id === protocolForm.id) {
          return {
            ...n,
            title: protocolForm.title.trim(),
            subtitle: protocolForm.subtitle.trim(),
            cluster: protocolForm.cluster,
            bovedaPath: protocolForm.bovedaPath.trim(),
            summary: protocolForm.summary.trim(),
            keywords: cleanKeywords.length > 0 ? cleanKeywords : n.keywords,
            kpis: protocolForm.kpis,
            customDictamenText: newCustomText,
            updatedAt: nowStr,
            isOptimized: n.isOptimized || false
          };
        }
        return n;
      });

      saveGraphData(updatedNodes, edges);

      // Persistir archivo físico Markdown en la Bóveda Curricular
      try {
        fetch('/api/vault/protocol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: protocolForm.id,
            title: protocolForm.title.trim(),
            cluster: protocolForm.cluster,
            bovedaPath: protocolForm.bovedaPath.trim(),
            content: newCustomText,
            kpis: protocolForm.kpis,
            summary: protocolForm.summary.trim(),
            isOptimized: true,
            wikilinks: [protocolForm.cluster]
          })
        }).catch(err => console.warn('Aviso de sincronización en Bóveda:', err));
      } catch (e) {}

      setActiveDictamen(prev => prev ? {
        ...prev,
        title: protocolForm.title.trim(),
        text: newCustomText,
        bovedaPath: protocolForm.bovedaPath.trim(),
        kpis: protocolForm.kpis,
        isOptimized: true,
        timestamp: nowStr
      } : null);

      setIsProtocolModalOpen(false);
      showToast('Protocolo actualizado y guardado en la Bóveda Central.');
    } else {
      // Crear nuevo protocolo en la constelación
      const newId = `node-custom-${Date.now()}`;
      const nowStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Coordenadas armónicas alrededor del Hub del clúster
      const hubMap: Record<NodeCluster, { id: string; x: number; y: number }> = {
        core: { id: 'core-holding', x: 500, y: 400 },
        pedagogico: { id: 'hub-pedagogico', x: 260, y: 230 },
        fiscal: { id: 'hub-fiscal', x: 740, y: 230 },
        medico: { id: 'hub-medico', x: 230, y: 560 },
        crm: { id: 'hub-crm', x: 750, y: 570 },
        gamificacion: { id: 'hub-gamificacion', x: 500, y: 690 }
      };

      const hub = hubMap[protocolForm.cluster];
      const clusterNodeCount = nodes.filter(n => n.cluster === protocolForm.cluster).length;
      const angle = (clusterNodeCount * 0.95) + 0.4;
      const radius = 120 + (clusterNodeCount * 12);
      const rawX = hub.x + Math.cos(angle) * radius;
      const rawY = hub.y + Math.sin(angle) * radius;
      const x = Math.max(90, Math.min(910, Math.round(rawX)));
      const y = Math.max(90, Math.min(790, Math.round(rawY)));

      const newCustomText = protocolForm.dictamenText.trim() || `**Dictamen Institucional Registrado:**\n\n${protocolForm.summary.trim() || protocolForm.title.trim()}\n\n*Validación Bóveda:* Protocolo activo y vinculado a la Red Nacional.`;

      const newNode: BrainNode = {
        id: newId,
        title: protocolForm.title.trim(),
        subtitle: protocolForm.subtitle.trim() || 'Directiva Escolar Registrada',
        cluster: protocolForm.cluster,
        x,
        y,
        radius: 22,
        reads: 1,
        bovedaPath: protocolForm.bovedaPath.trim() || `boveda://${protocolForm.cluster}/${newId}.md`,
        summary: protocolForm.summary.trim() || protocolForm.title.trim(),
        keywords: cleanKeywords.length > 0 ? cleanKeywords : [protocolForm.title.toLowerCase()],
        kpis: protocolForm.kpis,
        wikilinks: [hub.id, 'core-holding'],
        customDictamenText: newCustomText,
        isOptimized: true,
        updatedAt: nowStr
      };

      const newEdge: BrainEdge = {
        source: hub.id,
        target: newId,
        label: 'Directiva',
        strength: 2
      };

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];

      saveGraphData(updatedNodes, updatedEdges);

      // Persistir archivo físico Markdown en la Bóveda Curricular
      try {
        fetch('/api/vault/protocol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newId,
            title: newNode.title,
            cluster: newNode.cluster,
            bovedaPath: newNode.bovedaPath,
            content: newCustomText,
            kpis: newNode.kpis,
            summary: newNode.summary,
            isOptimized: true,
            wikilinks: newNode.wikilinks
          })
        }).catch(err => console.warn('Aviso de sincronización en Bóveda:', err));
      } catch (e) {}

      setSelectedNodeId(newId);
      centerOnNode(newNode, 1.45);

      setActiveDictamen({
        title: newNode.title,
        text: newCustomText,
        source: newNode.title,
        bovedaPath: newNode.bovedaPath,
        latencyMs: 0.8,
        confidence: 99,
        kpis: newNode.kpis,
        wikilinks: newNode.wikilinks,
        isOptimized: true,
        timestamp: nowStr
      });

      setIsProtocolModalOpen(false);
      showToast(`Protocolo "${newNode.title}" creado y conectado a la Bóveda.`);
    }
  };

  // Eliminar protocolo seleccionado
  const handleDeleteProtocol = () => {
    if (selectedNodeId === 'core-holding') return;
    const node = nodeMap.get(selectedNodeId);
    if (!node) return;

    if (window.confirm(`¿Confirmas eliminar el protocolo "${node.title}" de la Bóveda Central de Conocimiento?`)) {
      const updatedNodes = nodes.filter(n => n.id !== node.id);
      const updatedEdges = edges.filter(e => e.source !== node.id && e.target !== node.id);
      saveGraphData(updatedNodes, updatedEdges);

      // Eliminar archivo físico de la Bóveda Curricular si existe
      try {
        fetch(`/api/vault/protocol?title=${encodeURIComponent(node.title)}`, {
          method: 'DELETE'
        }).catch(e => console.warn('Aviso de eliminación en Bóveda:', e));
      } catch (e) {}
      
      // Regresar al núcleo central
      setSelectedNodeId('core-holding');
      const coreNode = updatedNodes.find(n => n.id === 'core-holding') || updatedNodes[0];
      centerOnNode(coreNode, 1);
      executeQuery(coreNode.title);
      showToast(`Protocolo "${node.title}" eliminado de la Bóveda.`);
    }
  };

  // Asistente IA para generar borrador de protocolo en el modal
  const handleGenerateAIDraftInModal = () => {
    const t = protocolForm.title.trim() || 'Protocolo Institucional';
    
    const draft = `**Directiva Operativa: ${t}**\n\nProtocolo de observancia general para los planteles de la Red Nacional conforme a los lineamientos oficiales vigentes:\n\n1. **Fase de Activación y Valoración (< 30s):** El personal a cargo detecta la contingencia y emite alerta inmediata a dirección escolar.\n2. **Fase de Intervención y Contención (< 90s):** Ejecución de maniobras estandarizadas y resguardo de la comunidad educativa.\n3. **Notificación y Registro Digital (< 3m):** Registro con folio criptográfico en Bóveda Central y comunicación a tutores legales.\n\n*Supervisión:* Auditoría permanente con telemetría en vivo a 0 Tokens.`;
    
    setProtocolForm(prev => ({
      ...prev,
      dictamenText: draft,
      summary: prev.summary || `Procedimiento estructurado de respuesta y control para ${t.toLowerCase()}.`
    }));
  };

  // ============================================================================
  // CENTRADO DINÁMICO Y ENFOQUE DE CÁMARA EN EL NODO OBJETIVO
  // (Transformación del plano SVG 1000x850 con centro exacto en (500, 425))
  // ============================================================================
  const centerOnNode = useCallback((node: BrainNode, targetZoom = 1.35) => {
    const cx = 500;
    const cy = 425;
    const newPanX = cx - (node.x * targetZoom);
    const newPanY = cy - (node.y * targetZoom);
    setZoom(targetZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, []);

  // ============================================================================
  // EJECUTOR DE CONSULTA EN INTELIGENCIA ARTIFICIAL PEDAGÓGICA (0 TOKENS)
  // Dependiendo de la pregunta, posiciona la cámara en el nodo y entrega el dictamen
  // ============================================================================
  const executeQuery = useCallback((queryText: string) => {
    const clean = (queryText || '').trim();
    if (!clean) return;

    setIsGenerating(true);
    const t0 = performance.now();
    const qLower = clean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const qWords = qLower.split(/\s+/).filter(w => w.length > 2);

    // Búsqueda inteligente del nodo con mayor afrenta semántica en memoria local
    let bestScore = -1;
    let bestNode = nodes[0] || INSTITUTIONAL_GRAPH_NODES[0];

    nodes.forEach(node => {
      let score = 0;
      const nid = node.id.toLowerCase();
      const nTitle = node.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const nSub = node.subtitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Coincidencias de alto rango
      if (qLower.includes(nid)) score += 35;
      if (nTitle.includes(qLower) || qLower.includes(nTitle)) score += 30;

      // Ponderación precisa por intenciones clave
      if (qLower.includes('pedregal') && nid.includes('pedregal')) score += 45;
      if (qLower.includes('satelite') && nid.includes('satelite')) score += 45;
      if ((qLower.includes('cdmx') || qLower.includes('central')) && nid.includes('cdmx')) score += 45;
      if ((qLower.includes('guadalajara') || qLower.includes('jalisco') || qLower.includes('occidente')) && nid.includes('guadalajara')) score += 45;
      if ((qLower.includes('sede') || qLower.includes('sedes') || qLower.includes('plantel') || qLower.includes('planteles') || qLower.includes('sucursal')) && nid === 'core-holding') score += 30;

      if ((qLower.includes('planeacion') || qLower.includes('planeaciones') || qLower.includes('inicio desarrollo cierre') || qLower.includes('momento')) && nid === 'node-nem-planeaciones') score += 45;
      if ((qLower.includes('rubrica') || qLower.includes('rubricas') || qLower.includes('criterio') || qLower.includes('formativa') || qLower.includes('evaluacion')) && nid === 'node-nem-rubricas') score += 45;
      if ((qLower.includes('fase') || qLower.includes('fases') || qLower.includes('pda') || qLower.includes('curricular') || qLower.includes('campo')) && nid === 'node-nem-fases') score += 45;
      if ((qLower.includes('nem') || qLower.includes('programa analitico') || qLower.includes('pedagogico') || qLower.includes('sep')) && nid === 'hub-pedagogico') score += 25;

      if ((qLower.includes('cfdi') || qLower.includes('factura') || qLower.includes('facturacion') || qLower.includes('timbrado') || qLower.includes('pac')) && nid === 'node-fiscal-cfdi') score += 45;
      if ((qLower.includes('iedu') || qLower.includes('deduccion') || qLower.includes('deducible') || qLower.includes('colegiaturas')) && nid === 'node-fiscal-iedu') score += 45;
      if ((qLower.includes('aging') || qLower.includes('cartera') || qLower.includes('mora') || qLower.includes('vencida') || qLower.includes('spei') || qLower.includes('adeudo')) && nid === 'node-fiscal-aging') score += 45;
      if ((qLower.includes('cobranza') || qLower.includes('sat') || qLower.includes('fiscal') || qLower.includes('tesoreria')) && (nid === 'hub-fiscal' || nid === 'node-fiscal-cfdi')) score += 25;

      if ((qLower.includes('alergia') || qLower.includes('alergias') || qLower.includes('expediente 360') || qLower.includes('enfermeria') || qLower.includes('shock') || qLower.includes('urgencia')) && nid === 'node-medico-expediente') score += 45;
      if ((qLower.includes('sismo') || qLower.includes('evacuacion') || qLower.includes('terremoto') || qLower.includes('temblor') || qLower.includes('proteccion civil') || qLower.includes('simulacro')) && nid === 'node-medico-sismo') score += 45;

      if ((qLower.includes('pipeline') || qLower.includes('prospecto') || qLower.includes('prospectos') || qLower.includes('lead') || qLower.includes('tour') || qLower.includes('familias')) && nid === 'node-crm-pipeline') score += 45;
      if ((qLower.includes('diagnostico') || qLower.includes('psicopedagogico') || qLower.includes('psicologia') || qLower.includes('madurez')) && nid === 'node-crm-diagnostico') score += 45;

      if ((qLower.includes('lienzo') || qLower.includes('actividad') || qLower.includes('actividades') || qLower.includes('estudio') || qLower.includes('interactivo')) && nid === 'node-game-lienzo') score += 45;
      if ((qLower.includes('mision') || qLower.includes('misiones') || qLower.includes('abp') || qLower.includes('insignia') || qLower.includes('insignias') || qLower.includes('gamificacion')) && nid === 'node-game-misiones') score += 45;

      // Ponderación por palabras clave asociadas
      node.keywords.forEach(kw => {
        if (qLower.includes(kw)) score += 5;
        qWords.forEach(w => {
          if (kw.includes(w)) score += 2;
        });
      });
      qWords.forEach(w => {
        if (nTitle.includes(w)) score += 6;
        if (nSub.includes(w)) score += 3;
      });

      if (score > bestScore) {
        bestScore = score;
        bestNode = node;
      }
    });

    const elapsed = Math.max(0.6, Math.round((performance.now() - t0) * 10) / 10);

    // Dictamen detallado de clase directiva adaptado al nodo seleccionado
    let finalTitle = bestNode.title;
    let finalText = '';

    // Prioridad Absoluta: Si el nodo fue optimizado con IA o editado en Bóveda Central, se usa su contenido persistido
    if (bestNode.customDictamenText && bestNode.customDictamenText.trim().length > 0) {
      finalText = bestNode.customDictamenText;
    } else {
      // Fallbacks por defecto para nodos institucionales que no han sido modificados
      if (bestNode.id === 'node-nem-planeaciones') {
        finalText = `**Matriz de Planeaciones Curriculares NEM 2024 (SEP Oficial):**\n\nEl 100% de las planeaciones se estructuran cronometradamente en tres momentos de aula esenciales:\n\n1. **Apertura y Detonación (15m):** Activación de saberes previos y conexión comunitaria.\n2. **Desarrollo Socioformativo (30m):** Indagación guiada articulada a los PDA de la fase escolar correspondiente.\n3. **Cierre Reflexivo & Evaluación (15m):** Entregable verificable, autoevaluación y registro en bitácora.\n\n*Persistencia:* Sincronizada instantáneamente en la Bóveda Curricular y ejecutable en el Lienzo Digital de ISkool.`;
      } else if (bestNode.id === 'node-nem-rubricas') {
        finalText = `**Rúbricas Analíticas Formativas (SEP Oficial):**\n\nInstrumentos de evaluación cuali-cuantitativa alineados a los 4 niveles de dominio formativo de la Nueva Escuela Mexicana:\n\n1. **Receptivo:** Comprensión inicial de conceptos clave y nociones básicas.\n2. **Resolutivo:** Aplicación práctica en situaciones contextualizadas y problemas guiados.\n3. **Autónomo:** Argumentación, síntesis y resolución crítica independiente.\n4. **Estratégico:** Innovación, transferencia comunitaria y propuesta de mejora continua.\n\n*Automatización:* Ponderación inmediata y retroalimentación constructiva archivada en el expediente escolar.`;
      } else if (bestNode.id === 'node-nem-fases') {
        finalText = `**Mapeo Curricular Oficial Fases 1 a 6 (NEM 2024):**\n\nArticulación pedagógica integral que abarca Educación Inicial hasta Secundaria:\n\n- **Fases 1 y 2:** Educación Inicial y Preescolar (Desarrollo integral, motricidad y lenguaje detonante).\n- **Fases 3, 4 y 5:** Primaria (Lenguajes, Pensamiento Científico, Ética/Naturaleza y De lo Humano a lo Comunitario).\n- **Fase 6:** Secundaria (Disciplinas articuladas, proyectos sociocríticos y vinculación comunitaria).\n\n*Indexación:* 1,240 PDA de la SEP precargados en la Bóveda Curricular listos para planeación docente.`;
      } else if (bestNode.id === 'node-fiscal-cfdi' || bestNode.id === 'hub-fiscal') {
        finalText = `**Auditoría Fiscal & Facturación SAT CFDI 4.0:**\n\nLa recaudación opera bajo timbrado PAC instantáneo a **0 tokens**. Se expiden comprobantes digitales con complemento IEDU validando en tiempo real la CURP del educando, la clave RVOE del plantel y el desglose de conceptos deducibles para el tutor legal ante el SAT.\n\n*Estado de Conciliación:* Ledger bancario SPEI 100% automatizado con aging preventivo a 30, 60 y 90 días.`;
      } else if (bestNode.id === 'node-fiscal-iedu') {
        finalText = `**Complemento de Deducción de Colegiaturas IEDU (SAT CFDI 4.0):**\n\nEmisión automatizada del complemento fiscal para deducción en la declaración anual de los padres de familia:\n\n- **Validación RENAPO:** Comprobación estricta de CURP del estudiante en cada factura emitida.\n- **Identificador RVOE:** Clave de validez oficial del plantel incorporada en los atributos del XML.\n- **Desglose de Conceptos:** Separación automática entre colegiaturas deducibles y servicios complementarios (transporte, talleres).`;
      } else if (bestNode.id === 'node-fiscal-aging') {
        finalText = `**Aging de Adeudos & Conciliación SPEI:**\n\nCubo de estratificación de cartera escolar con alertas preventivas multinivel:\n\n- **Corriente (0-30 días):** 88.4% de la recaudación consolidada.\n- **Atención Preventiva (31-60 días):** 8.5% con recordatorios automáticos y opciones de pago digital.\n- **Mora Crítica (> 60 días):** 3.1% con convenios estructurados y atención directa de dirección.\n\n*Conciliación:* Identificación inmediata de transferencias bancarias SPEI con referencia alfanumérica única por estudiante.`;
      } else if (bestNode.id === 'node-medico-expediente') {
        finalText = `**Protocolo Médico y Alergias en Expediente 360:**\n\nLa enfermería y cuerpo directivo tienen acceso inmediato (< 2 clics) a las directivas de choque anafiláctico y antecedentes de alergias de cada estudiante. Ante cualquier contingencia:\n\n- Aplicación de estabilización primaria en menos de 90 segundos.\n- Notificación push certificada a tutores legales en < 3 minutos.\n- Asignación de folio único de bitácora médico-legal protegida.`;
      } else if (bestNode.id === 'node-medico-sismo') {
        finalText = `**Protocolo Institucional de Protección Civil y Sismo:**\n\nDirectivas de evacuación y repliegue seguro para los 4 planteles de la red:\n\n1. **Fase de Repliegue (Primeros 30s):** Colocación en zonas de menor riesgo dentro del aula.\n2. **Evacuación Guiada (< 90s):** Traslado a los puntos de reunión exteriores por brigadas escolares certificadas.\n3. **Pase de Lista Digital:** Conteo biométrico en tiempo real desde la aplicación directiva con reporte inmediato a central.`;
      } else if (bestNode.id === 'node-campus-pedregal') {
        finalText = `**Auditoría Directiva Anglo Pedregal (Foco de Cobranza):**\n\nEl plantel registra una cobranza del 91.0% frente al umbral institucional del 95.0%. Acciones inmediatas en curso:\n\n1. **Gestión de Cartera Vencida:** 3.1% de mora > 60 días con 14 convenios de pago digitales vía SPEI activados.\n2. **Comunicación Preventiva:** Notificaciones automatizadas sin fricción a tutores legales antes del corte mensual.\n3. **Mesa de Acompañamiento:** Dirección administrativa y tesorería en revisión diaria con el holding corporativo.`;
      } else if (bestNode.id === 'node-campus-cdmx') {
        finalText = `**Reporte Operativo Anglo CDMX (Campus Central):**\n\nPlantel insignia con 2,120 estudiantes y 142 docentes. Indicadores clave:\n\n- **Adopción NEM 2024:** 96.0% de planeaciones estructuradas en 3 momentos y articuladas a los PDA SEP.\n- **Salud Financiera:** Cobranza consolidada al 94.0% con timbrado PAC automatizado.\n- **Proyectos de Aula:** 38 iniciativas comunitarias activas con impacto directo en la comunidad escolar.`;
      } else if (bestNode.id === 'node-campus-satelite') {
        finalText = `**Reporte Operativo Anglo Satélite:**\n\nPlantel líder en eficiencia de cobranza con 1,894 estudiantes y 134 docentes:\n\n- **Eficiencia Financiera:** 96.0% de cobranza corriente, el índice más alto de la Red Nacional.\n- **Cobertura Curricular:** 95.0% de avance analítico NEM con proyectos comunitarios y rúbricas formativas.\n- **Comunidad Digital:** 92.4% de participación de familias en la app escolar de seguimiento.`;
      } else if (bestNode.id === 'node-campus-guadalajara') {
        finalText = `**Reporte Operativo Anglo Guadalajara:**\n\nSede Occidente con 790 alumnos y 68 docentes activos:\n\n- **Rendimiento Académico:** 94.0% de cobertura curricular NEM con proyectos de vinculación comunitaria.\n- **Tesorería:** 95.2% de recaudación en tiempo y forma bajo conciliación bancaria SPEI.\n- **Admisiones:** 18 prospectos en fase de inducción para el próximo ciclo escolar.`;
      } else if (bestNode.id === 'node-crm-pipeline') {
        finalText = `**Pipeline de Conversión Familiar (Admisiones CRM):**\n\nProceso estructurado de acompañamiento a familias aspirantes en 5 fases:\n\n1. **Prospecto Digital:** Registro de contacto y perfil de interés educativo.\n2. **Tour de Experiencia:** Recorrido guiado por instalaciones y presentación del modelo pedagógico.\n3. **Diagnóstico Psicopedagógico:** Sesión de evaluación de estilo de aprendizaje y madurez.\n4. **Entrevista Directiva:** Alineación de valores familiares y plan de formación.\n5. **Inscripción & Expediente 360:** Formalización contractual y apertura de expediente integral.`;
      } else if (bestNode.id === 'node-crm-diagnostico') {
        finalText = `**Batería de Diagnóstico Psicopedagógico:**\n\nEvaluación integral para el ingreso y seguimiento del estudiante:\n\n- **Dimensión Cognitiva:** Madurez de razonamiento lógico-matemático y comprensión lectora.\n- **Dimensión Socioemocional:** Autorregulación, empatía y adaptación grupal.\n- **Estilo de Aprendizaje:** Canales preferentes (visual, auditivo, kinestésico) para orientación al docente titular.\n\n*Dictamen:* Informe ejecutivo generado en 24 horas y compartido confidencialmente con los tutores.`;
      } else if (bestNode.id === 'node-game-misiones') {
        finalText = `**Misiones Comunitarias NEM & Proyectos ABP:**\n\nGamificación aplicada a proyectos con impacto comunitario real:\n\n- **Aprendizaje Basado en Proyectos (ABP):** 38 proyectos activos en áreas de ecología, ciencia y cultura.\n- **Sistema de Maestría:** Insignias digitales y puntos de experiencia (XP) por colaboración y perseverancia.\n- **Reconocimiento Público:** Muestra de logros bimestral ante la comunidad escolar y padres de familia.`;
      } else if (bestNode.id === 'node-game-lienzo') {
        finalText = `**Lienzo Digital de Actividades en Vivo:**\n\nEstudio interactivo de clase para resolución de retos y simuladores formativos:\n\n- **Interactividad en Tiempo Real:** Cuestionarios, retos prácticos y simulaciones ejecutables desde cualquier dispositivo.\n- **Analítica de Dominio:** Detección instantánea de áreas de oportunidad por estudiante y por grupo.\n- **Sincronización Curricular:** Vinculación directa con los PDA de la sesión pedagógica planificada.`;
      } else if (bestNode.id === 'core-holding') {
        finalText = `**Núcleo Directivo ISkool • Holding Escolar Nacional:**\n\nConsolidado ejecutivo de los 4 planteles (Anglo CDMX, Anglo Satélite, Anglo Pedregal y Anglo Guadalajara):\n\n- **Matrícula Total:** 5,784 estudiantes activos.\n- **Eficacia de Cobranza:** 94.2% global consolidado.\n- **Alineación NEM:** 94.2% de cobertura analítica en todas las fases escolares.\n- **Consumo de Recursos:** Operación autónoma en memoria a 0 Tokens.`;
      } else {
        finalText = `**Dictamen del Motor Pedagógico Institucional:**\n\n${bestNode.summary}\n\nConforme a los lineamientos vigentes registrados en la **Bóveda Central de Conocimiento**, este procedimiento cuenta con indexación inmutable y vinculación directa con el Sistema Escolar de ISkool. Todo evento asociado genera bitácora auditada sin incurrir en consumo de tokens externos.`;
      }
    }

    setActiveDictamen({
      title: finalTitle,
      text: finalText,
      source: bestNode.title,
      bovedaPath: bestNode.bovedaPath,
      latencyMs: elapsed,
      confidence: bestScore > 0 ? Math.min(99, 85 + bestScore * 2) : 92,
      kpis: bestNode.kpis || [
        { label: 'Estatus', value: 'Vigente' },
        { label: 'Bóveda', value: 'Indexada' },
        { label: 'Consumo', value: '0 Tokens' }
      ],
      wikilinks: bestNode.wikilinks,
      actionLabel: bestNode.actionLabel,
      actionType: bestNode.actionType,
      isOptimized: Boolean(bestNode.isOptimized),
      timestamp: bestNode.updatedAt || bestNode.optimizedAt || new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    // POSICIONAMIENTO AUTOMÁTICO EN EL NODO REQUERIDO
    setSelectedNodeId(bestNode.id);
    centerOnNode(bestNode, 1.45);
    setFilterCluster('all'); // Garantiza que el nodo destino sea visible en el grafo

    setIsGenerating(false);

    // Scroll suave en terminal
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, [nodes, centerOnNode]);

  // Al abrir o cambiar initialQuery desde el exterior (protegido contra sobreescritura de re-renders periódicos)
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery !== lastInitialQueryRef.current) {
        lastInitialQueryRef.current = initialQuery;
        setChatInput(initialQuery);
        executeQuery(initialQuery);
      } else if (!activeDictamen && !lastInitialQueryRef.current) {
        const def = 'Matriz de Cobertura Curricular y Planeaciones NEM 2024';
        lastInitialQueryRef.current = def;
        setChatInput(def);
        executeQuery(def);
      }
    } else {
      lastInitialQueryRef.current = null;
    }
  }, [isOpen, initialQuery, executeQuery, activeDictamen]);

  // Selección de un nodo en el grafo con auto-posicionamiento
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodeMap.get(nodeId);
    if (node) {
      centerOnNode(node, 1.45);
      setChatInput(node.title);
      executeQuery(node.title);
    }
  };

  // Controles de Zoom & Pan
  const handleZoomIn = () => setZoom(z => Math.min(2.5, z + 0.2));
  const handleZoomOut = () => setZoom(z => Math.max(0.6, z - 0.2));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId('core-holding');
  };

  // Drag & Pan en SVG
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Copiar dictamen al portapapeles
  const handleCopyDictamen = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2200);
  };

  if (!isOpen && !isEmbeddedView) return null;

  // Renderizado del contenido del Estudio
  const studioContent = (
    <div className={`flex flex-col h-full bg-slate-950 text-white ${isEmbeddedView ? 'rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden' : ''}`}>
      {/* ==================================================================== */}
      {/* 1. BARRA DE ENCABEZADO HOLOGRÁFICA & METADATOS DE BÓVEDA               */}
      {/* ==================================================================== */}
      <header className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Network size={20} className="text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Bóveda Central de Conocimiento</span>
                <span className="text-[10px] text-slate-400 font-normal hidden md:inline">| Segundo Cerebro {holdingName}</span>
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>0 Tokens</span>
              </span>
            </div>
            <p className="text-[11px] text-indigo-300/80 hidden sm:block">
              Grafo Neuronal Sináptico de Normativas, NEM 2024, Cobranza SAT CFDI y Telemetría en Vivo
            </p>
          </div>
        </div>

        {/* SELECTOR DE VISTAS (Split / Grafo / Terminal) */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'split' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span className="hidden sm:inline">Modo Dual (Grafo + IA)</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'graph' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network size={13} />
              <span className="hidden sm:inline">Constelación</span>
            </button>
            <button
              onClick={() => setViewMode('assistant')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'assistant' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} className="text-amber-300" />
              <span className="hidden sm:inline">Terminal IA</span>
            </button>
          </div>

          {/* BOTÓN REGISTRAR NUEVO PROTOCOLO */}
          <button
            onClick={handleOpenCreateModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95 border border-indigo-400/40 shrink-0"
            title="Registrar un nuevo protocolo o directiva en la Bóveda Central"
          >
            <Plus size={14} className="stroke-[3]" />
            <span className="hidden md:inline">Nuevo Protocolo</span>
          </button>

          {!isEmbeddedView && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              title="Cerrar Bóveda"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. ÁREA DE TRABAJO PRINCIPAL: GRAFO NEURONAL + TERMINAL PEDAGÓGICA    */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* ------------------------------------------------------------------ */}
        {/* PANEL IZQUIERDO: GRAFO NEURONAL INTERACTIVO ("SEGUNDO CEREBRO")   */}
        {/* ------------------------------------------------------------------ */}
        {(viewMode === 'split' || viewMode === 'graph') && (
          <div className={`relative flex-1 bg-slate-950 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 ${
            viewMode === 'split' ? 'lg:w-[58%]' : 'w-full'
          }`}>

            {/* FILTROS DE CLÚSTER SUPERIORES */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[80%] pointer-events-auto scrollbar-none">
                <button
                  onClick={() => setFilterCluster('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer shrink-0 border ${
                    filterCluster === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  Constelación Completa ({nodes.length})
                </button>
                {(['pedagogico', 'fiscal', 'medico', 'crm', 'gamificacion'] as NodeCluster[]).map(cluster => {
                  const cfg = CLUSTER_CONFIG[cluster];
                  const isActive = filterCluster === cluster;
                  return (
                    <button
                      key={cluster}
                      onClick={() => setFilterCluster(cluster)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer shrink-0 border flex items-center gap-1 ${
                        isActive
                          ? `${cfg.badge} shadow-md`
                          : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CONTROLES DE ZOOM Y CENTRADO */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-lg pointer-events-auto shrink-0">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Restablecer Vista"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* CANVAS SVG DEL GRAFO DE CONOCIMIENTO */}
            <div 
              className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* ATMÓSFERA CÓSMICA / MALLA DE FONDO */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:28px_28px]" />

              <svg
                className="w-full h-full"
                viewBox="0 0 1000 850"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Filtro de resplandor para nodos seleccionados */}
                  <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradientes para aristas sinápticas */}
                  <linearGradient id="edge-gradient-core" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                <g 
                  transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                  style={{
                    transition: isPanning ? 'none' : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* 1. ARISTAS / SINAPSIS INTERACTIVAS */}
                  {edges.map((edge, idx) => {
                    const sourceNode = nodeMap.get(edge.source);
                    const targetNode = nodeMap.get(edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const isConnectedToSelected = 
                      edge.source === selectedNodeId || edge.target === selectedNodeId;
                    const isHovered = 
                      edge.source === hoveredNodeId || edge.target === hoveredNodeId;

                    return (
                      <g key={idx}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={isConnectedToSelected || isHovered ? '#818CF8' : '#334155'}
                          strokeWidth={isConnectedToSelected ? 2.5 : edge.strength}
                          strokeOpacity={isConnectedToSelected ? 0.9 : 0.45}
                          strokeDasharray={isConnectedToSelected ? '6,3' : undefined}
                          className={isConnectedToSelected ? 'animate-pulse' : ''}
                        />
                        {/* Etiqueta flotante en aristas clave seleccionadas */}
                        {isConnectedToSelected && edge.label && (
                          <text
                            x={(sourceNode.x + targetNode.x) / 2}
                            y={(sourceNode.y + targetNode.y) / 2 - 6}
                            fill="#C7D2FE"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="pointer-events-none select-none bg-slate-950 px-1 py-0.5"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* 2. NODOS DE CONOCIMIENTO Y PROCEDIMIENTOS */}
                  {filteredNodes.map(node => {
                    const isSelected = node.id === selectedNodeId;
                    const isHovered = node.id === hoveredNodeId;
                    const isConnected = activeEdges.has(node.id);
                    const cfg = CLUSTER_CONFIG[node.cluster];

                    // Opacidad si hay selección activa
                    const opacity = (selectedNodeId && !isSelected && !isConnected) ? 0.35 : 1;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNode(node.id);
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-all duration-300"
                        style={{ opacity }}
                      >
                        {/* Halo radiante exterior al estar seleccionado o hovered */}
                        {(isSelected || isHovered) && (
                          <circle
                            r={node.radius + 12}
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="2"
                            strokeOpacity="0.8"
                            filter="url(#neon-glow)"
                            className="animate-ping"
                          />
                        )}

                        {/* Anillo de pulso continuo */}
                        {isSelected && (
                          <circle
                            r={node.radius + 6}
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="1.5"
                            strokeDasharray="4,4"
                            className="animate-spin"
                            style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                          />
                        )}

                        {/* Círculo base del nodo */}
                        <circle
                          r={node.radius}
                          fill={isSelected ? cfg.color : '#0F172A'}
                          stroke={cfg.color}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-transform duration-200 hover:scale-110"
                        />

                        {/* Icono temático o inicial central */}
                        <text
                          y={node.radius > 24 ? 4 : 3}
                          fill={isSelected ? '#0F172A' : '#FFFFFF'}
                          fontSize={node.radius > 26 ? '12' : '10'}
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none select-none font-mono"
                        >
                          {node.cluster === 'core' ? 'CORE' : node.title.charAt(0)}
                        </text>

                        {/* Etiqueta textual del nodo */}
                        <text
                          y={node.radius + 15}
                          fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                          fontSize={node.radius > 26 ? '11' : '10'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                        >
                          {node.title.length > 22 ? `${node.title.slice(0, 20)}…` : node.title}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* CARD DE PREVIA FLOTANTE EN GRAFO */}
              {selectedNode && (
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/30 shadow-2xl z-10 pointer-events-auto">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CLUSTER_CONFIG[selectedNode.cluster].badge}`}>
                        {CLUSTER_CONFIG[selectedNode.cluster].label}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-1">
                        {selectedNode.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selectedNode.bovedaPath}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30 shrink-0">
                      {selectedNode.reads} consultas
                    </span>
                  </div>

                  {/* Enlaces Bidireccionales Wikilinks [[...]] */}
                  {selectedNode.wikilinks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                        Sinapsis:
                      </span>
                      {selectedNode.wikilinks.map((linkId, i) => {
                        const target = nodeMap.get(linkId);
                        if (!target) return null;
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelectNode(linkId)}
                            className="text-[10px] bg-slate-800 hover:bg-indigo-600/40 text-indigo-200 hover:text-white px-2 py-0.5 rounded-md border border-indigo-500/30 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>[[{target.title.split(' ')[0]}]]</span>
                            <ArrowRight size={10} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PANEL DERECHO: TERMINAL DE INTELIGENCIA ARTIFICIAL PEDAGÓGICA      */}
        {/* ------------------------------------------------------------------ */}
        {(viewMode === 'split' || viewMode === 'assistant') && (
          <div className={`flex flex-col bg-slate-900/95 overflow-hidden ${
            viewMode === 'split' ? 'lg:w-[42%]' : 'w-full'
          }`}>

            {/* CABECERA DE LA TERMINAL */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Terminal Pedagógica Directiva
                  </h3>
                  <p className="text-[11px] text-indigo-300">
                    Motor de Inteligencia Artificial • Respuestas Inmediatas a 0 Tokens
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Latencia: <strong className="text-emerald-400">{activeDictamen?.latencyMs || 0.8} ms</strong>
                </span>
              </div>
            </div>

            {/* CUERPO CONVERSACIONAL DE DICTÁMENES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* CARD DE DICTAMEN GENERADO */}
              {activeDictamen ? (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3.5 shadow-xl animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {activeDictamen.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {activeDictamen.isOptimized && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Check size={11} className="text-emerald-400 stroke-[3]" />
                          <span>Guardado en Bóveda</span>
                        </span>
                      )}
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                        0 Tokens
                      </span>
                      <span className="text-indigo-300">
                        {activeDictamen.confidence}% Afinidad
                      </span>
                    </div>
                  </div>

                  {/* Texto de Dictamen */}
                  <div className="text-xs text-indigo-100 whitespace-pre-wrap leading-relaxed">
                    {activeDictamen.text}
                  </div>

                  {/* Grid de KPIs Extraídos en Tiempo Real */}
                  {activeDictamen.kpis && activeDictamen.kpis.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {activeDictamen.kpis.map((kpi, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-indigo-800/50 text-center">
                          <span className="text-[10px] text-indigo-300 block font-medium">
                            {kpi.label}
                          </span>
                          <span className="text-xs font-bold text-white block mt-0.5 font-mono">
                            {kpi.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metadatos de la Bóveda y Wikilinks */}
                  <div className="pt-2 border-t border-indigo-900/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono truncate max-w-[65%] text-indigo-300 flex items-center gap-1">
                        <FileText size={12} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{activeDictamen.bovedaPath}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeDictamen.isOptimized ? 'Guardado:' : 'Auditado:'} {activeDictamen.timestamp}
                      </span>
                    </div>

                    {/* Barra de Gestión de Protocolo (Modificar / Mejorar con IA / Eliminar) */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-indigo-900/50 flex-wrap">
                      <button
                        onClick={handleOpenEditModal}
                        className="text-[11px] bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-500/30 active:scale-95"
                        title="Modificar contenido, KPIs o metadatos de este protocolo"
                      >
                        <Edit3 size={13} className="text-indigo-400" />
                        <span>Editar Protocolo</span>
                      </button>

                      <button
                        onClick={handleOptimizeCurrentProtocol}
                        disabled={isOptimizingWithAI}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 shadow-xs ${
                          activeDictamen.isOptimized
                            ? 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/50'
                            : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-500/40'
                        }`}
                        title="Optimizar directiva y tiempos con IA Pedagógica (0 Tokens)"
                      >
                        <Sparkles size={13} className={activeDictamen.isOptimized ? "text-emerald-400" : "text-amber-400 animate-pulse"} />
                        <span>
                          {isOptimizingWithAI
                            ? 'Guardando...'
                            : activeDictamen.isOptimized
                              ? '✓ Optimizado y Guardado'
                              : 'Mejorar con IA'}
                        </span>
                      </button>

                      {selectedNodeId !== 'core-holding' && (
                        <button
                          onClick={handleDeleteProtocol}
                          className="text-[11px] bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-rose-800/40 ml-auto active:scale-95"
                          title="Eliminar este protocolo de la Bóveda Central"
                        >
                          <Trash2 size={13} className="text-rose-400" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>

                    {/* Botones de Acción Directa */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleCopyDictamen(`${activeDictamen.title}\n\n${activeDictamen.text}`)}
                        className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-indigo-900/50 transition-colors cursor-pointer"
                      >
                        {copiedNotification ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedNotification ? 'Copiado al Portapapeles' : 'Copiar Dictamen'}</span>
                      </button>

                      {activeDictamen.actionLabel && onNavigateTab && (
                        <button
                          onClick={() => {
                            if (activeDictamen.actionType === 'cobranza') onNavigateTab('finanzas');
                            else if (activeDictamen.actionType === 'academico') onNavigateTab('academico');
                            else if (activeDictamen.actionType === 'admisiones') onNavigateTab('admisiones');
                            else if (activeDictamen.actionType === 'personas') onNavigateTab('personas');
                            else onNavigateTab('colegios');
                            if (!isEmbeddedView) onClose();
                          }}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <span>{activeDictamen.actionLabel}</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Network size={32} className="mx-auto text-indigo-500/40 animate-pulse" />
                  <p className="text-xs">Selecciona un nodo en la constelación o escribe una consulta directiva.</p>
                </div>
              )}

              {/* CONSULTAS FRECUENTES SUGERIDAS (CARROUSEL FLUIDO) */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Consultas Frecuentes Directivas:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    'Matriz de Cobertura Curricular y Planeaciones NEM 2024',
                    'Manual de Facturación SAT CFDI 4.0',
                    'Expediente 360 & Alertas Médicas',
                    'Protocolo de Sismo y Evacuación',
                    'Pipeline de Conversión Familiar',
                    'Lienzo Digital de Actividades'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(chip);
                        executeQuery(chip);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-900/60 hover:text-indigo-200 border border-slate-700/80 text-slate-300 text-[11px] transition-all cursor-pointer text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={chatBottomRef} />
            </div>

            {/* BARRA DE ENTRADA CONVERSACIONAL ESTILO TERMINAL IA */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeQuery(chatInput);
                }}
                className="relative flex items-center"
              >
                <div className="absolute left-3.5 text-indigo-400 flex items-center pointer-events-none">
                  <Sparkles size={16} />
                </div>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pregunta a la Inteligencia Pedagógica (ej. ¿Cómo opera el CFDI 4.0?)"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-2xl py-3 pl-10 pr-36 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner select-text"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {chatInput.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setChatInput('')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Borrar texto de consulta"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isGenerating || !chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    {isGenerating ? (
                      <Clock size={14} className="animate-spin text-indigo-200" />
                    ) : (
                      <>
                        <span>Consultar</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
                <span>Motor de Inteligencia Artificial Pedagógica • ISkool</span>
                <span className="font-mono text-emerald-400">Consumo: 0 Tokens</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* TOAST FLOTANTE DE NOTIFICACIÓN DE BÓVEDA */}
      {actionToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/95 backdrop-blur-xl border border-indigo-400/60 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* MODAL DE GESTIÓN Y CREACIÓN DE PROTOCOLOS (BÓVEDA CENTRAL) */}
      {isProtocolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(99,102,241,0.35)] overflow-hidden">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {protocolModalMode === 'create' ? <Plus size={18} /> : <Edit3 size={18} />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {protocolModalMode === 'create' ? 'Registrar Nuevo Protocolo en Bóveda' : 'Modificar Protocolo / Directiva'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {protocolModalMode === 'create' 
                      ? 'Se indexará como un nodo vivo en la constelación del Segundo Cerebro'
                      : `Actualizando: ${protocolForm.title}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProtocolModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveProtocol} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
              
              {/* Título & Subtítulo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Título del Protocolo / Directiva *</label>
                  <input
                    type="text"
                    required
                    value={protocolForm.title}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Protocolo de Golpe de Calor y Deshidratación"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Subtítulo / Alcance *</label>
                  <input
                    type="text"
                    required
                    value={protocolForm.subtitle}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Ej. Atención Médica Inmediata y Alertas a Familias"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Clúster & Ruta Bóveda */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Clúster Temático *</label>
                  <select
                    value={protocolForm.cluster}
                    onChange={(e) => {
                      const newCluster = e.target.value as NodeCluster;
                      setProtocolForm(prev => ({
                        ...prev,
                        cluster: newCluster,
                        bovedaPath: `boveda://${newCluster}/${prev.title ? prev.title.toLowerCase().replace(/\s+/g, '-') : 'protocolo'}.md`
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-400 focus:outline-none cursor-pointer"
                  >
                    <option value="medico">Salud & Urgencias Médicas</option>
                    <option value="pedagogico">Pedagógico & NEM 2024</option>
                    <option value="fiscal">Tesorería & Fiscal SAT</option>
                    <option value="crm">Admisiones & Matrícula CRM</option>
                    <option value="gamificacion">Gamificación & Lienzo Digital</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Ruta Canónica Bóveda Curricular</label>
                  <input
                    type="text"
                    value={protocolForm.bovedaPath}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, bovedaPath: e.target.value }))}
                    placeholder="boveda://seguridad/protocolo.md"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-indigo-300 font-mono text-[11px] focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Resumen Ejecutivo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Resumen Ejecutivo del Nodo *</label>
                <input
                  type="text"
                  required
                  value={protocolForm.summary}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Breve síntesis directiva que se despliega al pasar el cursor o en el índice"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Procedimiento Detallado / Dictamen */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">Contenido / Fases Procedimentales (Markdown) *</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDraftInModal}
                    className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg transition-colors cursor-pointer active:scale-95"
                  >
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Redactar con IA Pedagógica</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={protocolForm.dictamenText}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, dictamenText: e.target.value }))}
                  placeholder="Escribe las directivas, etapas cronometradas, entregables o lineamientos de contingencia..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              {/* KPIs (3 Indicadores Clave) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Indicadores Clave del Protocolo (3 KPIs)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {protocolForm.kpis.map((kpi, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <input
                        type="text"
                        value={kpi.label}
                        onChange={(e) => {
                          const updated = [...protocolForm.kpis];
                          updated[idx].label = e.target.value;
                          setProtocolForm(prev => ({ ...prev, kpis: updated }));
                        }}
                        placeholder="Etiqueta KPI"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-[11px] text-indigo-300"
                      />
                      <input
                        type="text"
                        value={kpi.value}
                        onChange={(e) => {
                          const updated = [...protocolForm.kpis];
                          updated[idx].value = e.target.value;
                          setProtocolForm(prev => ({ ...prev, kpis: updated }));
                        }}
                        placeholder="Valor (ej. < 60s)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-[11px] font-bold text-white font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Palabras Clave (Keywords) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Palabras Clave de Búsqueda Conversacional (separadas por comas)</label>
                <input
                  type="text"
                  value={protocolForm.keywords}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="ej. calor, deshidratacion, golpe, sol, enfermeria, salud"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-300 text-[11px] focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Footer del Modal */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsProtocolModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <Save size={14} />
                  <span>Guardar en Bóveda Central</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Si es vista incrustada en la pestaña 'cerebro' del dashboard
  if (isEmbeddedView) {
    return (
      <div className="w-full h-[85vh] rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl">
        {studioContent}
      </div>
    );
  }

  // Si es vista modal de pantalla completa
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in zoom-in duration-150">
      <div className="w-full max-w-7xl h-[92vh] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.25)] border border-indigo-500/40">
        {studioContent}
      </div>
    </div>
  );
};
