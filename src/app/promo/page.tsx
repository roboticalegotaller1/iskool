"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Heart,
  Users,
  ShieldAlert,
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Star,
  Clock,
  Shield,
  Layers,
  Award,
  Maximize2,
  DollarSign,
  MonitorPlay,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkle,
  Grid,
  FileText
} from "lucide-react";

// Tipos de diapositiva
type SlideType = "curtain" | "showcase";

interface SlideData {
  id: number;
  type: SlideType;
  portalName: string;
  badge: string;
  title: string;
  subtitle: string;
  narrativeCaption: string;
  colorTheme: "blue" | "emerald" | "rose" | "purple" | "amber" | "indigo" | "teal" | "cyan";
  metrics: { label: string; value: string }[];
  features: { iconName: string; title: string; desc: string }[];
  portalUrl?: string;
  portalCode?: string;
  highlightCategory: string;
}

const SLIDES: SlideData[] = [
  // SLIDE 0: INTRO GRAND PITCH
  {
    id: 0,
    type: "curtain",
    portalName: "ISKOOL 2026",
    highlightCategory: "Ecosistema Global",
    badge: "Plataforma EdTech Integral · Presentación Oficial 2026",
    title: "La Revolución del Aprendizaje Digital en México",
    subtitle: "Conectando a toda la comunidad escolar en una sola suite inmersiva, gamificada y alineada 100% a la Nueva Escuela Mexicana (NEM).",
    narrativeCaption: "ISkool 2026: La plataforma educativa todo-en-uno que une gamificación, pedagogía oficial NEM y gestión escolar de alto rendimiento.",
    colorTheme: "indigo",
    metrics: [
      { label: "Engagement Estudiantil", value: "+96%" },
      { label: "Eficiencia Docente", value: "5x" },
      { label: "Retención Escolar", value: "99.8%" },
      { label: "Alineación Curricular", value: "100% SEP" }
    ],
    features: [
      { iconName: "Trophy", title: "Estudio Docente & Retos", desc: "Constructor de flujos interactivos con 14+ tipos de bloques y despliegue automático." },
      { iconName: "Sparkles", title: "Camino del Héroe & Recompensas", desc: "Sendero de misiones, XP, galeones/monedas, mascota en PixiJS y tienda mágica." },
      { iconName: "BookOpen", title: "Bóveda Curricular & IA", desc: "+1,500 nodos oficiales NEM, planeación analítica y evaluación formativa SEP." },
      { iconName: "ShieldAlert", title: "Control & Facturación SAT", desc: "Expedientes NEM, generador de horarios, cobranza digital y multi-plantel." }
    ]
  },

  // SLIDE 1: CORTINA ESTUDIO DOCENTE / STUDIO
  {
    id: 1,
    type: "curtain",
    portalName: "ESTUDIO DOCENTE ISKOOL",
    highlightCategory: "Creación de Retos",
    badge: "Módulo 01 · Estudio de Actividades & Constructor de Flujos",
    title: "Estudio Docente: Diseña Experiencias Memorables",
    subtitle: "Constructor visual de actividades por nodos con 14+ bloques interactivos: lógica computacional, lectura cronometrada (PPM), circuitos booleanos, combate de jefes, escape room y preguntas con feedback de IA.",
    narrativeCaption: "Estudio Docente: Permite a los profesores crear retos gamificados e interactivos en minutos con asignación inmediata por grado y grupo.",
    colorTheme: "cyan",
    metrics: [
      { label: "Tipos de Bloques", value: "14+ Módulos" },
      { label: "Tiempo de Creación", value: "< 3 Minutos" },
      { label: "Interactividad", value: "+98%" },
      { label: "Alineación Pedagógica", value: "NEM / SEP" }
    ],
    features: [
      { iconName: "Layers", title: "Constructor Visual por Nodos", desc: "Arrastra y conecta retos de lógica, preguntas, videos, acertijos y cofres." },
      { iconName: "Zap", title: "Asignación Directa por Grado", desc: "Envío instantáneo a 4º Primaria, 1º Primaria, Secundaria RPG y Preparatoria." },
      { iconName: "Award", title: "Calibración de Recompensas", desc: "Configura puntos de experiencia (XP) y monedas otorgadas al superar el reto." }
    ],
    portalUrl: "/teacher/studio"
  },

  // SLIDE 2: SHOWCASE ESTUDIO DOCENTE
  {
    id: 2,
    type: "showcase",
    portalName: "ESTUDIO DOCENTE EN ACCIÓN",
    highlightCategory: "Creación de Retos",
    badge: "Demostración Interactiva del Estudio Docente",
    title: "Constructor de Flujos y Asignación en Tiempo Real",
    subtitle: "Interfaz visual donde el maestro ensambla la experiencia formativa y la envía directamente a la clase.",
    narrativeCaption: "Vista en vivo del Estudio Docente: crea, simula y publica actividades interactivas con sincronización inmediata.",
    colorTheme: "cyan",
    metrics: [
      { label: "Bloques Activos", value: "Flujo Interactivo" },
      { label: "Sincronización", value: "Instantánea" }
    ],
    features: [],
    portalUrl: "/teacher/studio"
  },

  // SLIDE 3: CORTINA CAMINO DEL HÉROE & PORTAL DEL ALUMNO
  {
    id: 3,
    type: "curtain",
    portalName: "PORTAL DEL ALUMNO & CAMINO DEL HÉROE",
    highlightCategory: "Estudiantes & Gamificación",
    badge: "Módulo 02 · Sendero de Aventuras & Motivación Continua",
    title: "El Camino del Héroe: Misiones Adaptadas por Grado",
    subtitle: "Los alumnos recorren un sendero orgánico de retos adaptado a su nivel escolar: Primaria Baja, Primaria Alta (Galaxia), Secundaria RPG y Preparatoria Innovación.",
    narrativeCaption: "Camino del Héroe: Transforma las tareas escolares en misiones heroicas donde cada actividad del maestro aparece al instante.",
    colorTheme: "blue",
    metrics: [
      { label: "Misiones Superadas", value: "24,800+" },
      { label: "Satisfacción Alumnos", value: "4.9/5 ★" },
      { label: "Racha Promedio", value: "16 Días" },
      { label: "Retención Activa", value: "99.2%" }
    ],
    features: [
      { iconName: "Trophy", title: "Sendero de Misiones en Vivo", desc: "Cada actividad creada en el Estudio aparece como un nuevo nodo de desafío." },
      { iconName: "Sparkles", title: "Mascota & Avatar en PixiJS", desc: "Animación gráfica fluida que responde al progreso académico y cuidados." },
      { iconName: "BookOpen", title: "Portafolio Digital de Evidencias", desc: "Bitácora automática de trabajos, reflexiones y audios del estudiante." }
    ],
    portalUrl: "/student"
  },

  // SLIDE 4: SHOWCASE PORTAL ALUMNO
  {
    id: 4,
    type: "showcase",
    portalName: "PORTAL DEL ALUMNO EN ACCIÓN",
    highlightCategory: "Estudiantes & Gamificación",
    badge: "Demostración Interactiva del Alumno",
    title: "Sendero de Misiones y Combates Mágicos",
    subtitle: "Interfaz inmersiva con seguimiento de nivel, experiencia (XP), galeones acumulados y mapa del laberinto académico.",
    narrativeCaption: "Vista en vivo del panel de alumno: resuelve los retos del profesor, gana recompensas y fortalece su aprendizaje.",
    colorTheme: "blue",
    metrics: [
      { label: "Nivel Actual", value: "Nivel 2 (En Ascenso)" },
      { label: "Monedas Ganadas", value: "46 Galeones" }
    ],
    features: [],
    portalUrl: "/student"
  },

  // SLIDE 5: CORTINA RECOMPENSAS & TIENDA MÁGICA
  {
    id: 5,
    type: "curtain",
    portalName: "TIENDA MÁGICA & RECOMPENSAS",
    highlightCategory: "Economía del Juego",
    badge: "Módulo 03 · Sistema Integral de Recompensas & Canje",
    title: "Recompensas Reales: XP, Galeones & Tienda Mágica",
    subtitle: "Las monedas obtenidas al superar retos se sincronizan al instante en el encabezado y en la Tienda Mágica para canjear artefactos, pociones y mejoras cosméticas.",
    narrativeCaption: "Sistema de Recompensas: Acreditación exacta y en tiempo real de XP, monedas y subida de nivel utilizables en la Tienda Mágica.",
    colorTheme: "amber",
    metrics: [
      { label: "Acreditación", value: "Tiempo Real" },
      { label: "Artefactos Mágicos", value: "20+ Ítems" },
      { label: "Subida de Nivel", value: "Automática" },
      { label: "Persistencia", value: "100% Garantizada" }
    ],
    features: [
      { iconName: "Award", title: "Acreditación Transparente", desc: "Cada punto de XP y moneda ganada se refleja inmediatamente en el perfil." },
      { iconName: "Sparkles", title: "Tienda de Artefactos", desc: "Pociones de perseverancia, plumas fénix y cosméticos para personalizar el avatar." },
      { iconName: "TrendingUp", title: "Árbol de Habilidades", desc: "Puntos de atributo desbloqueados al subir de nivel para potenciar su poder académico." }
    ],
    portalUrl: "/student/shop"
  },

  // SLIDE 6: SHOWCASE TIENDA MÁGICA
  {
    id: 6,
    type: "showcase",
    portalName: "TIENDA MÁGICA EN ACCIÓN",
    highlightCategory: "Economía del Juego",
    badge: "Demostración de la Tienda de Artefactos",
    title: "Catálogo de Mejoras y Canje de Galeones",
    subtitle: "Los estudiantes administran sus monedas ganadas con esfuerzo académico para adquirir ítems motivacionales.",
    narrativeCaption: "Vista en vivo de la Tienda Mágica: saldo de monedas actualizado y catálogo de artefactos formativos.",
    colorTheme: "amber",
    metrics: [
      { label: "Saldo Disponible", value: "46 Monedas" },
      { label: "Inventario", value: "Sincronizado" }
    ],
    features: [],
    portalUrl: "/student/shop"
  },

  // SLIDE 7: CORTINA PORTAL DOCENTE & BÓVEDA CURRICULAR
  {
    id: 7,
    type: "curtain",
    portalName: "PORTAL DOCENTE & BÓVEDA CURRICULAR",
    highlightCategory: "Docentes & Pedagogía",
    badge: "Módulo 04 · Bóveda Curricular (+1,500 Nodos) & IA Pedagógica",
    title: "Potenciando al Maestro: Bóveda Curricular & IA",
    subtitle: "Acceso inmediato a más de 1,500 nodos curriculares oficiales de la NEM (Fases 1 a 6). Planeación analítica instantánea, evaluación formativa y Boleta SEP oficial.",
    narrativeCaption: "Módulo Docente: Planeación curricular inteligente basada en la Bóveda de Conocimiento Oficial y evaluación automática en Boleta SEP.",
    colorTheme: "emerald",
    metrics: [
      { label: "Bóveda Curricular", value: "1,500+ Nodos NEM" },
      { label: "Ahorro Semanal", value: "14 Horas" },
      { label: "Evaluación SEP", value: "100% Automatizada" },
      { label: "Alerta SOS Escolar", value: "< 3 Segundos" }
    ],
    features: [
      { iconName: "BookOpen", title: "Bóveda Curricular Central", desc: "Estructura completa de fases, grados, disciplinas y PDAs oficiales de la SEP." },
      { iconName: "Zap", title: "Motor de IA Pedagógica", desc: "Generación de proyectos formativos, cronogramas y rúbricas analíticas." },
      { iconName: "Shield", title: "Botón SOS de Emergencia", desc: "Protocolo de seguridad con notificación en tiempo real a directivos y brigadas." }
    ],
    portalUrl: "/teacher"
  },

  // SLIDE 8: SHOWCASE PORTAL DOCENTE
  {
    id: 8,
    type: "showcase",
    portalName: "PORTAL DEL DOCENTE EN ACCIÓN",
    highlightCategory: "Docentes & Pedagogía",
    badge: "Demostración Interactiva del Profesor",
    title: "Planeación Curricular y Revisión de Evidencias",
    subtitle: "Revisión de trabajos enviados por los alumnos, pase de lista compendiado, retroalimentación formativa y cálculo de Boleta SEP.",
    narrativeCaption: "Vista en vivo del panel docente: control de grupos, expedientes de evidencias y evaluación formativa oficial.",
    colorTheme: "emerald",
    metrics: [
      { label: "Planeaciones NEM", value: "Al Día" },
      { label: "Boleta SEP", value: "Formativa" }
    ],
    features: [],
    portalUrl: "/teacher"
  },

  // SLIDE 9: CORTINA PORTAL PADRES
  {
    id: 9,
    type: "curtain",
    portalName: "PORTAL DE PADRES & FAMILIAS",
    highlightCategory: "Familias & Tutores",
    badge: "Módulo 05 · Vinculación Familia-Escuela Transparente",
    title: "Padres Involucrados, Estudiantes Felices",
    subtitle: "Una ventana comprensible y motivadora al crecimiento escolar: muro de reconocimientos en tiempo real, notas de aliento y boletas sin tecnicismos.",
    narrativeCaption: "Módulo de Padres: Conexión emocional positiva entre el hogar y la escuela a través de felicitaciones y reportes transparentes.",
    colorTheme: "rose",
    metrics: [
      { label: "Participación Familiar", value: "+94%" },
      { label: "Mensajes de Aliento", value: "28,000+" },
      { label: "Satisfacción Padres", value: "99.5%" },
      { label: "Claridad de Boleta", value: "10/10" }
    ],
    features: [
      { iconName: "Heart", title: "Muro de Logros en Vivo", desc: "Notificaciones inmediatas cuando el estudiante destaca o concluye una misión." },
      { iconName: "Star", title: "Notas de Aliento Directas", desc: "Envío de mensajes afectivos que aumentan la autoestima y rendimiento escolar." },
      { iconName: "TrendingUp", title: "Avance Visual sin Estrés", desc: "Seguimiento pedagógico intuitivo con traducción directa a la escala SEP." }
    ],
    portalUrl: "/parent"
  },

  // SLIDE 10: SHOWCASE PORTAL PADRES
  {
    id: 10,
    type: "showcase",
    portalName: "PORTAL DE PADRES EN ACCIÓN",
    highlightCategory: "Familias & Tutores",
    badge: "Demostración Interactiva del Tutor",
    title: "Acompañamiento Escolar en Tiempo Real",
    subtitle: "Muro de logros, galería de evidencias destacadas, notas motivacionales y calificaciones periódicas.",
    narrativeCaption: "Vista en vivo del panel de tutores: un espacio cálido, transparente y altamente participativo.",
    colorTheme: "rose",
    metrics: [
      { label: "Vínculo Tutor", value: "Activo" },
      { label: "Promedio Formativo", value: "10.0 (Excelente)" }
    ],
    features: [],
    portalUrl: "/parent"
  },

  // SLIDE 11: CORTINA PORTAL COORDINADOR & CONTROL ESCOLAR
  {
    id: 11,
    type: "curtain",
    portalName: "PORTAL DEL COORDINADOR & CONTROL ESCOLAR",
    highlightCategory: "Gestión Directiva",
    badge: "Módulo 06 · Control Escolar, Horarios Inteligentes & Cobranza",
    title: "Control Operativo & Expedientes Digitales NEM",
    subtitle: "Supervisión integral de grupos, expedientes oficiales de alumnos y docentes, algoritmo generador de horarios sin empalmes y alertas preventivas.",
    narrativeCaption: "Módulo del Coordinador: Control administrativo de alto nivel con expedientes digitales centralizados, cobranza y horarios.",
    colorTheme: "purple",
    metrics: [
      { label: "Expedientes Digitales", value: "100% Organizados" },
      { label: "Horarios sin Cruces", value: "10x Más Rápido" },
      { label: "Cobranza & Conciliación", value: "Automatizada" },
      { label: "Facturación SAT 4.0", value: "Integrada" }
    ],
    features: [
      { iconName: "Users", title: "Expedientes Digitales NEM", desc: "Historial completo de asistencias, evidencias, conductas y salud escolar." },
      { iconName: "Clock", title: "Generador de Horarios", desc: "Algoritmo inteligente para optimizar disponibilidad de docentes y aulas." },
      { iconName: "DollarSign", title: "Módulo de Cobranza & Fiscal", desc: "Conciliación de colegiaturas y facturación CFDI 4.0 con el SAT." }
    ],
    portalUrl: "/coordinator"
  },

  // SLIDE 12: CORTINA SUPER USUARIO & MULTI-PLANTEL
  {
    id: 12,
    type: "curtain",
    portalName: "PORTAL DE SUPER USUARIO",
    highlightCategory: "Administración Global",
    badge: "Módulo 07 · Control Multi-Colegio & Licencias Globales",
    title: "Super Usuario: Escalabilidad Multi-Plantel",
    subtitle: "Panel supremo para la dirección general y corporativos educativos: administración de múltiples colegios, asignación de licencias y auditoría global.",
    narrativeCaption: "Módulo Super Usuario: Capacidad multi-sede para redes escolares, gestión de catálogos institucionales y configuración avanzada.",
    colorTheme: "amber",
    metrics: [
      { label: "Planteles Vinculados", value: "Multi-Colegio" },
      { label: "Disponibilidad SLA", value: "99.99%" },
      { label: "Auditoría en Vivo", value: "100% Trazable" },
      { label: "Control de Licencias", value: "Centralizado" }
    ],
    features: [
      { iconName: "ShieldAlert", title: "Gestión Multi-Plantel", desc: "Administra múltiples sedes escolares desde una única interfaz corporativa." },
      { iconName: "Award", title: "Control Global de Licencias", desc: "Activación y asignación de cupos para alumnos, maestros y directivos." },
      { iconName: "Grid", title: "Catálogo Maestro de Materias", desc: "Estandarización de programas académicos y sincronización institucional." }
    ],
    portalUrl: "/admin"
  },

  // SLIDE 13: SHOWCASE SUPER USUARIO
  {
    id: 13,
    type: "showcase",
    portalName: "PORTAL DE SUPER USUARIO EN ACCIÓN",
    highlightCategory: "Administración Global",
    badge: "Demostración del Centro de Mando",
    title: "Centro de Mando Corporativo & Auditoría Global",
    subtitle: "Visualización de colegios activos, distribución de usuarios globales, catálogo institucional y registros de auditoría.",
    narrativeCaption: "Vista en vivo del panel de Super Usuario: máxima gobernanza institucional y monitoreo de infraestructura.",
    colorTheme: "amber",
    metrics: [
      { label: "Sedes Activas", value: "Red Escolar ISkool" },
      { label: "Infraestructura", value: "Alta Disponibilidad" }
    ],
    features: [],
    portalUrl: "/admin"
  },

  // SLIDE 14: CONCLUSIÓN GRAND FINALE
  {
    id: 14,
    type: "curtain",
    portalName: "EL FUTURO ES ISKOOL",
    highlightCategory: "Ecosistema Global",
    badge: "Conclusión · La Plataforma Educativa Todo en Uno",
    title: "Todo el Ecosistema Educativo Conectado",
    subtitle: "ISkool transforma la educación integrando pedagogía oficial SEP, inteligencia artificial pedagógica, gamificación inmersiva y gestión escolar integral.",
    narrativeCaption: "ISkool 2026: Una inversión estratégica que eleva el prestigio, la retención y la excelencia académica de su institución.",
    colorTheme: "indigo",
    metrics: [
      { label: "Portales Integrados", value: "6 en 1" },
      { label: "Normativa Oficial", value: "100% NEM / SEP" },
      { label: "Infraestructura", value: "Nube Segura" },
      { label: "Impacto Académico", value: "Inmediato" }
    ],
    features: [
      { iconName: "Trophy", title: "Alumnos Motivados", desc: "Aprendizaje lúdico con misiones, mascotas y tienda de recompensas." },
      { iconName: "Zap", title: "Docentes Empoderados", desc: "Estudio visual de retos y Bóveda curricular oficial con asistente de IA pedagógica." },
      { iconName: "Users", title: "Comunidad Unida", desc: "Padres satisfechos, coordinadores eficientes y dirección con control multi-plantel." }
    ],
    portalUrl: "/"
  }
];

export default function PromoPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [audioSynthEnabled, setAudioSynthEnabled] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Duración base por diapositiva (4.2 segundos por diapositiva en velocidad 1x)
  const BASE_SLIDE_DURATION = 4200;
  const currentDuration = BASE_SLIDE_DURATION / playbackSpeed;

  const currentSlide = SLIDES[currentIndex];

  // Avance automático
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / currentDuration) * 100);
      setProgress(pct);
    }, 40);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, currentDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, playbackSpeed, currentDuration]);

  // Teclado para controlar la presentación (Flecha Derecha, Flecha Izquierda, Espacio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleSpeed = () => {
    setPlaybackSpeed(prev => {
      if (prev === 1) return 1.25;
      if (prev === 1.25) return 1.5;
      return 1;
    });
  };

  const restartPresentation = () => {
    setCurrentIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Heart":
        return <Heart className={className} />;
      case "Users":
        return <Users className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Award":
        return <Award className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "ShieldAlert":
        return <ShieldAlert className={className} />;
      case "Star":
        return <Star className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "Clock":
        return <Clock className={className} />;
      case "TrendingUp":
        return <TrendingUp className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "DollarSign":
        return <DollarSign className={className} />;
      case "FileText":
        return <FileText className={className} />;
      case "Grid":
        return <Grid className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Tema de colores gradientes por cortina
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case "blue":
        return {
          gradientBg: "from-blue-950 via-slate-900 to-indigo-950",
          accentText: "text-blue-400",
          badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          glowColor: "shadow-blue-500/20",
          borderAccent: "border-blue-500/40",
          buttonBg: "bg-blue-600 hover:bg-blue-500 text-white",
          pillBg: "bg-blue-500"
        };
      case "emerald":
        return {
          gradientBg: "from-emerald-950 via-slate-900 to-teal-950",
          accentText: "text-emerald-400",
          badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          glowColor: "shadow-emerald-500/20",
          borderAccent: "border-emerald-500/40",
          buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
          pillBg: "bg-emerald-500"
        };
      case "rose":
        return {
          gradientBg: "from-rose-950 via-slate-900 to-pink-950",
          accentText: "text-rose-400",
          badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          glowColor: "shadow-rose-500/20",
          borderAccent: "border-rose-500/40",
          buttonBg: "bg-rose-600 hover:bg-rose-500 text-white",
          pillBg: "bg-rose-500"
        };
      case "purple":
        return {
          gradientBg: "from-purple-950 via-slate-900 to-violet-950",
          accentText: "text-purple-400",
          badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          glowColor: "shadow-purple-500/20",
          borderAccent: "border-purple-500/40",
          buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
          pillBg: "bg-purple-500"
        };
      case "amber":
        return {
          gradientBg: "from-amber-950 via-slate-900 to-orange-950",
          accentText: "text-amber-400",
          badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          glowColor: "shadow-amber-500/20",
          borderAccent: "border-amber-500/40",
          buttonBg: "bg-amber-600 hover:bg-amber-500 text-white",
          pillBg: "bg-amber-500"
        };
      case "teal":
        return {
          gradientBg: "from-teal-950 via-slate-900 to-emerald-950",
          accentText: "text-teal-400",
          badgeBg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
          glowColor: "shadow-teal-500/20",
          borderAccent: "border-teal-500/40",
          buttonBg: "bg-teal-600 hover:bg-teal-500 text-white",
          pillBg: "bg-teal-500"
        };
      case "cyan":
        return {
          gradientBg: "from-cyan-950 via-slate-900 to-blue-950",
          accentText: "text-cyan-400",
          badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          glowColor: "shadow-cyan-500/20",
          borderAccent: "border-cyan-500/40",
          buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
          pillBg: "bg-cyan-500"
        };
      default:
        return {
          gradientBg: "from-indigo-950 via-slate-900 to-purple-950",
          accentText: "text-indigo-400",
          badgeBg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          glowColor: "shadow-indigo-500/20",
          borderAccent: "border-indigo-500/40",
          buttonBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
          pillBg: "bg-indigo-500"
        };
    }
  };

  const themeStyles = getThemeStyles(currentSlide.colorTheme);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full bg-gradient-to-br ${themeStyles.gradientBg} text-white font-sans overflow-hidden flex flex-col justify-between transition-all duration-700 select-none`}
    >
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header / Player Controls */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ISkool Promo 2026
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  EdTech Institucional Multi-Portal
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Dynamic Progress Bar & Slide Tracker */}
        <div className="hidden md:flex flex-col items-center gap-1.5 w-2/5 max-w-md">
          <div className="flex justify-between w-full text-[11px] font-semibold text-slate-300">
            <span className="truncate max-w-[200px] font-bold text-white flex items-center gap-1">
              <span className="text-blue-400">●</span> {currentSlide.portalName}
            </span>
            <span className="text-slate-400 font-mono">
              {currentIndex + 1} / {SLIDES.length}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-75 ease-linear shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <button
            onClick={toggleSpeed}
            title="Velocidad de reproducción"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-mono font-bold text-slate-200 transition-all"
          >
            {playbackSpeed}x
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-400" /> <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" /> <span className="hidden sm:inline">Reproducir</span>
              </>
            )}
          </button>

          {/* Restart */}
          <button
            onClick={restartPresentation}
            title="Reiniciar presentación"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Pantalla completa"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <Link
            href="/"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-bold border border-white/15 transition-all text-white ml-2"
          >
            Salir al Portal
          </Link>
        </div>
      </header>

      {/* Sub-Header Live Category Pill */}
      <div className="relative z-40 px-6 pt-3 pb-0 flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Módulo Activo:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${themeStyles.badgeBg}`}>
            {currentSlide.highlightCategory}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>Usa las flechas ◀ ▶ o espacio para controlar</span>
        </div>
      </div>

      {/* MAIN SLIDE CONTENT AREA */}
      <main className="relative z-40 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {currentSlide.type === "curtain" ? (
          /* CORTINA DE TRANSICIÓN CINEMATOGRÁFICA */
          <div className="w-full max-w-5xl animate-fadeIn flex flex-col gap-6 sm:gap-7">
            
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${themeStyles.badgeBg} shadow-lg backdrop-blur-md animate-bounce`}>
                <Sparkles className="h-4 w-4" />
                {currentSlide.badge}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                PRESENTACIÓN EN ALTA DEFINICIÓN
              </span>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {currentSlide.title}
              </h1>
              <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {currentSlide.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 border ${themeStyles.borderAccent} backdrop-blur-md flex flex-col justify-between shadow-xl hover:scale-105 transition-transform`}
                >
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <span className={`text-xl sm:text-3xl font-black mt-1.5 ${themeStyles.accentText}`}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* Features Highlight */}
            {currentSlide.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {currentSlide.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col gap-2 hover:border-white/25 transition-all shadow-lg"
                  >
                    <div className={`p-2.5 rounded-xl bg-white/10 w-fit ${themeStyles.accentText}`}>
                      {renderIcon(f.iconName, "h-5 w-5")}
                    </div>
                    <h4 className="text-sm font-bold text-white">{f.title}</h4>
                    <p className="text-xs text-slate-400 leading-normal">{f.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Link Action */}
            {currentSlide.portalUrl && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={currentSlide.portalUrl}
                  target="_blank"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl ${themeStyles.buttonBg} transition-all hover:scale-105`}
                >
                  Abrir Módulo Completo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-xs text-slate-400 italic">
                  Mostrando demostración interactiva en la siguiente diapositiva...
                </span>
              </div>
            )}
          </div>
        ) : (
          /* SHOWCASE PORTAL EN VIVO / INTERACTIVO */
          <div className="w-full max-w-6xl animate-fadeIn flex flex-col gap-3">
            {/* Bar Above Showcase */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  VISTA PREVIA EN VIVO · {currentSlide.portalName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold">
                <span className="hidden sm:inline">{currentSlide.title}</span>
                {currentSlide.portalUrl && (
                  <Link
                    href={currentSlide.portalUrl}
                    target="_blank"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors"
                  >
                    Abrir Portal <Maximize2 className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Interactive Portal Canvas Container */}
            <div className="relative w-full h-[62vh] min-h-[420px] rounded-3xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl">
              {currentSlide.portalUrl ? (
                <iframe
                  src={currentSlide.portalUrl}
                  className="w-full h-full border-none pointer-events-auto bg-slate-950"
                  title={currentSlide.portalName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <GraduationCap className="h-16 w-16 text-blue-400 animate-pulse mb-4" />
                  <h3 className="text-2xl font-bold text-white">Cargando Módulo...</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Subtitles / Audio Narrative Caption Bar */}
      <div className="relative z-40 border-t border-white/5 bg-slate-950/80 backdrop-blur-md px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 max-w-4xl">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] tracking-wider uppercase shrink-0">
            <Sparkles className="h-3 w-3" /> Narrativa
          </div>
          <p className="text-slate-300 font-medium truncate">
            {currentSlide.narrativeCaption}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
          <span>Alineado 100% a la SEP / NEM 2026</span>
        </div>
      </div>

      {/* FOOTER / SLIDE NAVIGATION STRIP */}
      <footer className="relative z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Previous / Next buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-300 transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Thumbnail Slide Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-1 px-2 scrollbar-none">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
              }}
              title={`${idx + 1}. ${s.portalName}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? `w-8 ${themeStyles.pillBg} shadow-md shadow-blue-400/50`
                  : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        {/* Investor Footer Tagline */}
        <div className="text-right text-[11px] text-slate-400 font-medium shrink-0">
          ISkool Académico © 2026 · Plataforma Integral
        </div>
      </footer>

    </div>
  );
}
