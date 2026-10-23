// src/app/redisenos_gamificados/la_isla_de_los_juguetes_magicos/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Volume2, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  ShoppingBag, 
  Play, 
  Heart,
  Music,
  Shapes,
  Hash,
  BookOpen,
  Award
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// 3 Perfiles de Estudiantes Únicos para Preescolar 2 (Fase 2 SEP · 3 a 5 Años)
interface IslandStudent {
  id: string;
  name: string;
  age: number;
  grade: string;
  avatarIcon: string;
  stars: number;
  completedStones: number;
  equippedToys: {
    propeller?: boolean;
    cape?: boolean;
    lightbulbs?: boolean;
    trainWheels?: boolean;
    blockCrown?: boolean;
  };
}

const ISLAND_STUDENTS: IslandStudent[] = [
  {
    id: 'isl-sofi',
    name: 'Sofía Valdés',
    age: 3,
    grade: 'Preescolar 1 · Constructores de Madera',
    avatarIcon: '🐣',
    stars: 12,
    completedStones: 2,
    equippedToys: {
      propeller: true,
      lightbulbs: true
    }
  },
  {
    id: 'isl-mateo',
    name: 'Mateo Ramos',
    age: 4,
    grade: 'Preescolar 2 · Ingenieros de Bloques',
    avatarIcon: '🚂',
    stars: 20,
    completedStones: 3,
    equippedToys: {
      cape: true,
      trainWheels: true
    }
  },
  {
    id: 'isl-camila',
    name: 'Camila Ruiz',
    age: 5,
    grade: 'Preescolar 3 · Guardianes de la Isla',
    avatarIcon: '🤖',
    stars: 28,
    completedStones: 4,
    equippedToys: {
      blockCrown: true,
      cape: true,
      lightbulbs: true
    }
  }
];

// Piedras Mágicas del Sendero (Imagen 1)
const STEPPING_STONES = [
  { id: 'star', name: 'Estrella Mágica', color: 'from-purple-500 to-indigo-600', icon: '⭐', soundNote: '¡Do!' },
  { id: 'moon', name: 'Luna Soñadora', color: 'from-blue-600 to-indigo-800', icon: '🌙', soundNote: '¡Re!' },
  { id: 'flower', name: 'Flor del Jardín', color: 'from-emerald-500 to-teal-600', icon: '🌸', soundNote: '¡Mi!' },
  { id: 'cloud', name: 'Nube Algodón', color: 'from-sky-400 to-cyan-500', icon: '☁️', soundNote: '¡Fa!' },
  { id: 'heart', name: 'Corazón Dulce', color: 'from-rose-500 to-pink-600', icon: '💖', soundNote: '¡Sol!' }
];

export default function LaIslaDeLosJuguetesMagicosPage() {
  const [students, setStudents] = useState<IslandStudent[]>(ISLAND_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(ISLAND_STUDENTS[0].id);

  // Modales interactivos
  const [activeModal, setActiveModal] = useState<
    'none' | 'train_bridge' | 'sound_explorer' | 'colors_shapes' | 'abc_friends' | 'toy_workshop'
  >('none');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Estado del Reto del Puente del Tren
  const [trainAnswer, setTrainAnswer] = useState<number | 'triangle' | null>(null);
  const [trainFeedback, setTrainFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [trainCrossed, setTrainCrossed] = useState<boolean>(false);

  // Estado del Reto de Sonidos
  const [soundAnswer, setSoundAnswer] = useState<string | null>(null);
  const [soundFeedback, setSoundFeedback] = useState<boolean | null>(null);

  // Estado del Reto de Formas
  const [shapeAnswer, setShapeAnswer] = useState<string | null>(null);
  const [shapeFeedback, setShapeFeedback] = useState<boolean | null>(null);

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Síntesis de voz infantil en español
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      utter.rate = 0.88;
      utter.pitch = 1.25;
      window.speechSynthesis.speak(utter);
    } catch {
      // Manejo seguro si el navegador restringe la síntesis
    }
  };

  // Renderizado dinámico del Robot de Madera con los ítems puestos (generados con Nano Banana)
  const getToyRobotImage = () => {
    const { cape, trainWheels, propeller, lightbulbs } = activeStudent.equippedToys;

    if (cape && trainWheels) {
      return '/redisenos_assets/isla_juguetes/robot_capa_y_ruedas.jpg';
    }
    if (trainWheels) {
      return '/redisenos_assets/isla_juguetes/robot_ruedas_tren.jpg';
    }
    if (cape) {
      return '/redisenos_assets/isla_juguetes/robot_capa_superheroe.jpg';
    }
    if (propeller) {
      return '/redisenos_assets/isla_juguetes/robot_helices_voladoras.jpg';
    }
    if (lightbulbs) {
      return '/redisenos_assets/isla_juguetes/robot_bombillas_magicas.jpg';
    }
    return '/redisenos_assets/isla_juguetes/robot_base_taller.jpg';
  };

  // Interacción al tocar al Huevito Amigo en su nido (Imagen 1)
  const handleEggClick = () => {
    gamificationAudio.playLevelUpSound();
    speakText("¡Pío pío! ¡Hola! Soy Huevito, tu amigo de la Isla de los Juguetes. Toca las tarjetas para construir conmigo.");
    showToast("¡Huevito Amigo te manda un abrazo de plumas! ✨");
  };

  // Interacción al tocar una Piedra Mágica del Sendero
  const handleStoneClick = (stone: typeof STEPPING_STONES[0], index: number) => {
    gamificationAudio.playClickSound();
    speakText(`¡Piedra de la ${stone.name}! Nota musical ${stone.soundNote}`);
    showToast(`Paso ${index + 1}: ${stone.name} (${stone.soundNote})`);

    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        completedStones: Math.max(s.completedStones, index + 1)
      };
    }));
  };

  // Respuesta en el Reto del Puente del Trenecito
  const handleTrainAnswer = (choice: number | 'triangle') => {
    gamificationAudio.playClickSound();
    setTrainAnswer(choice);

    if (choice === 3) {
      gamificationAudio.playLevelUpSound();
      setConfettiActive(true);
      setTrainCrossed(true);
      setTrainFeedback({
        isCorrect: true,
        text: '¡Bravo! El bloque número 3 completa el puente. ¡El trenecito ya puede cruzar al castillo!'
      });
      speakText("¡Excelente! Uno, dos... y tres. El trenecito cruza feliz hacia el castillo. ¡Ganaste 3 Estrellitas!");

      // Recompensa al alumno
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          stars: s.stars + 3
        };
      }));

      setTimeout(() => setConfettiActive(false), 3500);
    } else {
      gamificationAudio.playErrorSound();
      const hint = choice === 5
        ? '¡Casi! El 5 es un número más grande. Cuenta despacito: 1, 2... ¡falta el bloque con el 3!'
        : '¡Buen intento! El triángulo es una forma geométrica divertida, pero necesitamos contar: 1, 2... ¡3!';
      setTrainFeedback({
        isCorrect: false,
        text: hint
      });
      speakText(hint);
    }
  };

  // Reiniciar reto del tren
  const handleResetTrain = () => {
    gamificationAudio.playClickSound();
    setTrainAnswer(null);
    setTrainFeedback(null);
    setTrainCrossed(false);
    speakText("¿Qué bloque necesita el trenecito para cruzar? 1, 2... ¡y luego viene el...!");
  };

  return (
    <div className="min-h-screen bg-sky-900 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* 1. BARRA SUPERIOR INSTITUCIONAL (PREESCOLAR FASE 2) */}
      <header className="sticky top-0 z-40 bg-sky-950/90 backdrop-blur-xl border-b border-sky-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          
          {/* Logo y Regreso */}
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              className="p-2 rounded-2xl bg-sky-800/80 hover:bg-sky-700 text-white transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a Modelos</span>
            </Link>

            <div className="border-l border-sky-700 pl-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                02 Preescolar · Fase 2 SEP (3 a 5 Años)
              </span>
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                La Isla de los Juguetes Mágicos
              </h1>
            </div>
          </div>

          {/* Selector de Perfiles de Alumno y Estrellas */}
          <div className="flex items-center gap-3">
            
            {/* 3 Perfiles de Estudiantes Independientes */}
            <div className="flex items-center bg-sky-900/90 p-1 rounded-2xl border border-sky-700">
              {students.map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedStudentId(st.id);
                    speakText(`Hola ${st.name}, ¡vamos a jugar en la Isla de los Juguetes!`);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    st.id === activeStudent.id
                      ? 'bg-amber-400 text-amber-950 shadow-md'
                      : 'text-sky-200 hover:text-white'
                  }`}
                  title={`${st.name} (${st.grade})`}
                >
                  <span>{st.avatarIcon}</span>
                  <span className="hidden md:inline">{st.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Contador de Estrellas de Sabiduría */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-md border-2 border-white">
              <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
              <span>{activeStudent.stars} Estrellas</span>
            </div>

            {/* Taller de Juguetes */}
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('toy_workshop');
                speakText("¡Bienvenido al Taller del Juguete Mágico! Diseña a tu robot guardián.");
              }}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Taller</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. LIENZO CENTRAL: LA ISLA FLOTANTE DE PLASTILINA (IMAGEN 1) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center justify-center">
        
        {/* Contenedor del Lienzo con Relación de Aspecto Fidedigna */}
        <div className="relative w-full aspect-[16/9] max-h-[82vh] rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-300/80 bg-sky-200">
          
          {/* Ilustración Maestra de la Isla Flotante (Imagen 1) */}
          <img 
            src="/redisenos_assets/isla_juguetes/hub_isla_juguetes.jpg" 
            alt="La Isla de los Juguetes Mágicos - Preescolar iSkool" 
            className="w-full h-full object-cover"
          />

          {/* ========================================================================= */}
          {/* BOTONES INTERACTIVOS REALES SUPERPUESTOS CON FIDELIDAD ABSOLUTA */}
          {/* ========================================================================= */}

          {/* 1. Botón de Audio Superior Derecho (Voz en Español) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              speakText("¡Bienvenido a la Isla de los Juguetes Mágicos! Toca una tarjeta para divertirte o ayuda al trenecito a cruzar el puente.");
            }}
            className="absolute top-[3%] right-[8%] w-[6.5%] h-[11.5%] rounded-full z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 transition-all active:scale-95"
            title="Escuchar Instrucción por Voz"
          />

          {/* 2. Avatar Circular del Niño Superior Derecho (Cambio de Alumno) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              const nextIndex = (students.findIndex(s => s.id === activeStudent.id) + 1) % students.length;
              setSelectedStudentId(students[nextIndex].id);
              speakText(`Cambiando a perfil de ${students[nextIndex].name}`);
            }}
            className="absolute top-[3%] right-[2%] w-[6.5%] h-[11.5%] rounded-full z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 transition-all active:scale-95"
            title="Cambiar Perfil de Alumno"
          />

          {/* 3. Botón de Regreso Inferior Izquierdo (Botón de Madera Verde con Flecha) */}
          <Link
            href="/redisenos_gamificados"
            onClick={() => gamificationAudio.playClickSound()}
            className="absolute bottom-[4%] left-[2%] w-[7.5%] h-[13%] rounded-full z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 transition-all active:scale-95"
            title="Volver a los 10 Modelos de Rediseño"
          />

          {/* 4. Huevito Azul en su Nido (Mascota Viva en la Rama Izquierda) */}
          <button
            onClick={handleEggClick}
            className="absolute top-[35%] left-[5.5%] w-[21%] h-[40%] rounded-full z-20 cursor-pointer hover:scale-105 transition-transform active:scale-95 group flex items-center justify-center"
            title="¡Toca a Huevito Amigo!"
          >
            <div className="w-full h-full rounded-full ring-0 group-hover:ring-4 group-hover:ring-amber-300/80 transition-all flex items-end justify-center pb-2">
              <span className="opacity-0 group-hover:opacity-100 bg-amber-950/80 text-amber-200 text-[11px] font-black px-2 py-0.5 rounded-full transition-opacity shadow-lg">
                ¡Hola, soy Huevito! ✨
              </span>
            </div>
          </button>

          {/* ========================================================================= */}
          {/* LAS 4 TARJETAS DIDÁCTICAS (CENTRO DE LA ISLA) */}
          {/* ========================================================================= */}

          {/* Tarjeta 1: Sound Explorer (Explorador de Sonidos) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('sound_explorer');
              speakText("¡Explorador de Sonidos! Vamos a descubrir qué instrumento musical suena.");
            }}
            className="absolute top-[37%] left-[28.5%] w-[11.5%] h-[27%] rounded-2xl z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 hover:-translate-y-1 transition-all active:scale-95 group"
            title="Explorador de Sonidos"
          >
            <div className="w-full h-full flex flex-col justify-end items-center pb-2">
              <span className="opacity-0 group-hover:opacity-100 bg-sky-950/90 text-sky-200 text-[9px] font-black px-1.5 py-0.5 rounded-lg transition-opacity">
                Sonidos 🎵
              </span>
            </div>
          </button>

          {/* Tarjeta 2: Color & Shapes (Colores y Formas) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('colors_shapes');
              speakText("¡Colores y Formas! Descubre los bloques mágicos de plastilina.");
            }}
            className="absolute top-[36%] left-[40.5%] w-[10.5%] h-[26%] rounded-2xl z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 hover:-translate-y-1 transition-all active:scale-95 group"
            title="Colores y Formas"
          >
            <div className="w-full h-full flex flex-col justify-end items-center pb-2">
              <span className="opacity-0 group-hover:opacity-100 bg-amber-950/90 text-amber-200 text-[9px] font-black px-1.5 py-0.5 rounded-lg transition-opacity">
                Formas 🔺
              </span>
            </div>
          </button>

          {/* Tarjeta 3: Counting Fun (Conteo Divertido · Reto del Trenecito) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('train_bridge');
              speakText("¡Conteo Divertido! Ayuda al trenecito a cruzar el puente de bloques.");
            }}
            className="absolute top-[36%] left-[51.5%] w-[11%] h-[26%] rounded-2xl z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 hover:-translate-y-1 transition-all active:scale-95 group"
            title="Conteo Divertido (El Puente del Trenecito)"
          >
            <div className="w-full h-full flex flex-col justify-end items-center pb-2">
              <span className="opacity-0 group-hover:opacity-100 bg-emerald-950/90 text-emerald-200 text-[9px] font-black px-1.5 py-0.5 rounded-lg transition-opacity">
                Conteo 🔢
              </span>
            </div>
          </button>

          {/* Tarjeta 4: ABC Friends (Amigos del ABC) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('abc_friends');
              speakText("¡Amigos del ABC! Jugamos con las primeras letras y el osito.");
            }}
            className="absolute top-[39%] left-[63%] w-[12%] h-[27%] rounded-2xl z-20 cursor-pointer hover:ring-4 hover:ring-amber-300 hover:-translate-y-1 transition-all active:scale-95 group"
            title="Amigos del ABC"
          >
            <div className="w-full h-full flex flex-col justify-end items-center pb-2">
              <span className="opacity-0 group-hover:opacity-100 bg-rose-950/90 text-rose-200 text-[9px] font-black px-1.5 py-0.5 rounded-lg transition-opacity">
                Letras 🔤
              </span>
            </div>
          </button>

          {/* ========================================================================= */}
          {/* CAMINO DE PIEDRAS MÁGICAS (STEPPING STONES INFERIORES) */}
          {/* ========================================================================= */}

          {/* 1. Estrella Morada */}
          <button
            onClick={() => handleStoneClick(STEPPING_STONES[0], 0)}
            className="absolute top-[67%] left-[37%] w-[6%] h-[10%] rounded-full z-20 cursor-pointer hover:scale-110 transition-transform active:scale-90"
            title="Paso 1: Estrella Mágica"
          />

          {/* 2. Luna Azul */}
          <button
            onClick={() => handleStoneClick(STEPPING_STONES[1], 1)}
            className="absolute top-[72%] left-[47%] w-[6%] h-[10%] rounded-full z-20 cursor-pointer hover:scale-110 transition-transform active:scale-90"
            title="Paso 2: Luna Azul"
          />

          {/* 3. Flor Verde */}
          <button
            onClick={() => handleStoneClick(STEPPING_STONES[2], 2)}
            className="absolute top-[70%] left-[58%] w-[6%] h-[10%] rounded-full z-20 cursor-pointer hover:scale-110 transition-transform active:scale-90"
            title="Paso 3: Flor Verde"
          />

          {/* 4. Nube Celeste */}
          <button
            onClick={() => handleStoneClick(STEPPING_STONES[3], 3)}
            className="absolute top-[75%] left-[68%] w-[6%] h-[10%] rounded-full z-20 cursor-pointer hover:scale-110 transition-transform active:scale-90"
            title="Paso 4: Nube Celeste"
          />

          {/* 5. Corazón Rosa */}
          <button
            onClick={() => handleStoneClick(STEPPING_STONES[4], 4)}
            className="absolute top-[67%] left-[76.5%] w-[6.5%] h-[10.5%] rounded-full z-20 cursor-pointer hover:scale-110 transition-transform active:scale-90"
            title="Paso 5: Corazón Rosa"
          />

          {/* Toast Notificación Infantil */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-400 text-amber-950 font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-white text-xs sm:text-sm animate-in fade-in slide-in-from-top-3">
              {toastMessage}
            </div>
          )}

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL DEL RETO DEL TRENECITO (EL PUENTE DE BLOQUES · CONTEO DIVERTIDO) */}
      {/* ========================================================================= */}
      {activeModal === 'train_bridge' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-sky-50 via-white to-amber-50 rounded-[32px] overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col">
            
            {/* Header del Reto */}
            <div className="px-6 py-3 bg-sky-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs">
                  🚂 Fase 2 SEP
                </span>
                <h3 className="font-black text-sm sm:text-base">
                  El Puente de Bloques del Trenecito · Conteo Secuencial
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    speakText("El trenecito necesita cruzar el puente. ¿Qué número falta después del 2? 1... 2... ¡y luego viene el...!");
                  }}
                  className="p-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-amber-300"
                  title="Escuchar Pregunta"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-full text-sky-200 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Lienzo del Reto: Escena Real del Trenecito generada con Nano Banana */}
            <div className="relative w-full aspect-[16/9] max-h-[50vh] overflow-hidden bg-emerald-100">
              <img 
                src="/redisenos_assets/isla_juguetes/trenecito_puente_reto.jpg" 
                alt="Reto del Trenecito y Puente de Bloques" 
                className="w-full h-full object-cover"
              />

              {/* Animación del Trenecito Cruzando al Acertar */}
              {trainCrossed && (
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in">
                  <div className="bg-white/95 border-4 border-amber-400 p-4 rounded-3xl text-center shadow-2xl space-y-1">
                    <span className="text-3xl">🎉 🚂 ✨</span>
                    <h4 className="text-lg font-black text-slate-800">¡El Trenecito Cruzó el Puente!</h4>
                    <p className="text-xs text-slate-600 font-bold">
                      ¡Completaste la serie 1, 2, 3! +3 Estrellitas de Sabiduría
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de Pregunta y Opciones Táctiles */}
            <div className="p-4 sm:p-6 text-center space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Desafío Didáctico
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-800">
                  ¿Qué bloque necesita el trenecito para cruzar? <span className="text-sky-600 underline">1... 2... [ ? ]</span>
                </h4>
              </div>

              {/* Botones de Bloques Táctiles */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
                
                {/* Opción 1: Bloque con 3 puntos (CORRECTA) */}
                <button
                  onClick={() => handleTrainAnswer(3)}
                  className={`p-4 rounded-2xl font-black text-base sm:text-lg transition-transform active:scale-95 shadow-md flex flex-col items-center gap-1 border-3 ${
                    trainAnswer === 3
                      ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  }`}
                >
                  <span className="text-2xl">🧱 3</span>
                  <span className="text-xs font-bold">Bloque de 3</span>
                </button>

                {/* Opción 2: Bloque con 5 puntos */}
                <button
                  onClick={() => handleTrainAnswer(5)}
                  className={`p-4 rounded-2xl font-black text-base sm:text-lg transition-transform active:scale-95 shadow-md flex flex-col items-center gap-1 border-3 ${
                    trainAnswer === 5
                      ? 'bg-rose-500 text-white border-rose-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  }`}
                >
                  <span className="text-2xl">🧱 5</span>
                  <span className="text-xs font-bold">Bloque de 5</span>
                </button>

                {/* Opción 3: Bloque Triángulo */}
                <button
                  onClick={() => handleTrainAnswer('triangle')}
                  className={`p-4 rounded-2xl font-black text-base sm:text-lg transition-transform active:scale-95 shadow-md flex flex-col items-center gap-1 border-3 ${
                    trainAnswer === 'triangle'
                      ? 'bg-rose-500 text-white border-rose-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  }`}
                >
                  <span className="text-2xl">🔺</span>
                  <span className="text-xs font-bold">Triángulo</span>
                </button>

              </div>

              {/* Mensaje de Retroalimentación Amable */}
              {trainFeedback && (
                <div className={`p-3 rounded-2xl text-xs sm:text-sm font-black ${
                  trainFeedback.isCorrect ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {trainFeedback.text}
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetTrain}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Intentar Otra Vez
                </button>
                <button
                  onClick={() => setActiveModal('none')}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-md"
                >
                  Volver a la Isla
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL DEL EXPLORADOR DE SONIDOS */}
      {/* ========================================================================= */}
      {activeModal === 'sound_explorer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border-4 border-sky-300 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-200">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Educación Musical · Timbres e Instrumentos
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-800">
              ¿Qué instrumento tiene cuerdas y suena en el árbol mágico?
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'guitar', name: 'Guitarra', icon: '🎸', correct: true },
                { id: 'drum', name: 'Tambor', icon: '🥁', correct: false },
                { id: 'bell', name: 'Campana', icon: '🔔', correct: false }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSoundAnswer(opt.id);
                    if (opt.correct) {
                      gamificationAudio.playLevelUpSound();
                      setSoundFeedback(true);
                      speakText("¡Excelente! La guitarra tiene cuerdas mágicas que producen música alegre.");
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                    } else {
                      gamificationAudio.playErrorSound();
                      setSoundFeedback(false);
                      speakText("¡Casi! Escucha el tintineo de las cuerdas: ¡es la guitarra!");
                    }
                  }}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-1 font-bold text-xs transition-all shadow-md ${
                    soundAnswer === opt.id
                      ? opt.correct
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                        : 'bg-amber-400 text-amber-950 ring-4 ring-amber-300'
                      : 'bg-sky-100 hover:bg-sky-200 text-sky-950'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>

            {soundFeedback !== null && (
              <div className={`p-2.5 rounded-xl text-xs font-bold ${
                soundFeedback ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {soundFeedback ? '🎉 ¡Correcto! La guitarra alegra el árbol cantable. +2 Estrellitas' : '💡 Prueba tocar la guitarra de cuerdas.'}
              </div>
            )}

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md"
            >
              Volver a la Isla
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE COLORES Y FORMAS */}
      {/* ========================================================================= */}
      {activeModal === 'colors_shapes' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border-4 border-amber-300 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Geometría y Percepción Sensorial
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-800">
              ¿Cuál de estos juguetes es un <span className="text-sky-600 underline">cubo azul</span>?
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cube_blue', name: 'Cubo Azul', icon: '🟦', correct: true },
                { id: 'sphere_red', name: 'Pelota Roja', icon: '🔴', correct: false },
                { id: 'cone_yellow', name: 'Cono Amarillo', icon: '🟡', correct: false }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setShapeAnswer(opt.id);
                    if (opt.correct) {
                      gamificationAudio.playLevelUpSound();
                      setShapeFeedback(true);
                      speakText("¡Muy bien! El cubo azul tiene lados cuadrados ideales para construir torres.");
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                    } else {
                      gamificationAudio.playErrorSound();
                      setShapeFeedback(false);
                      speakText("¡Casi! Busca el juguete con forma cuadrada y color azul.");
                    }
                  }}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-1 font-bold text-xs transition-all shadow-md ${
                    shapeAnswer === opt.id
                      ? opt.correct
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                        : 'bg-amber-400 text-amber-950 ring-4 ring-amber-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>

            {shapeFeedback !== null && (
              <div className={`p-2.5 rounded-xl text-xs font-bold ${
                shapeFeedback ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {shapeFeedback ? '🎉 ¡Fantástico! El cubo azul encaja en el castillo. +2 Estrellitas' : '💡 Busca el bloque cuadrado azul.'}
              </div>
            )}

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md"
            >
              Volver a la Isla
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE AMIGOS DEL ABC */}
      {/* ========================================================================= */}
      {activeModal === 'abc_friends' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border-4 border-rose-300 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Lenguaje y Comunicación Inicial
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-800">
              ¿Con qué letra empieza la palabra <span className="text-rose-600 underline">Avión</span>?
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {['A', 'B', 'C'].map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    if (letter === 'A') {
                      gamificationAudio.playLevelUpSound();
                      speakText("¡Excelente! Avión empieza con la letra A de Amigos.");
                      showToast("¡La A de Avión! +2 Estrellitas");
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                      setTimeout(() => setActiveModal('none'), 1500);
                    } else {
                      gamificationAudio.playErrorSound();
                      speakText(`¡Casi! Escucha el sonido inicial: Aaaaa-vión. ¡Toca la letra A!`);
                    }
                  }}
                  className="p-4 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-950 font-black text-2xl shadow-md transition-transform active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-md"
            >
              Volver a la Isla
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL DEL TALLER DEL JUGUETE MÁGICO (CUSTOMIZER) */}
      {/* ========================================================================= */}
      {activeModal === 'toy_workshop' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-amber-50 to-white rounded-[32px] overflow-hidden shadow-2xl border-4 border-amber-400 flex flex-col">
            
            {/* Header del Taller */}
            <div className="px-6 py-3 bg-amber-900 text-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs">
                  🛠️ Taller
                </span>
                <h3 className="font-black text-sm sm:text-base text-white">
                  Taller del Juguete Mágico · Diseña tu Compañero
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>{activeStudent.stars} Estrellas</span>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-full text-amber-200 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Escena Real del Taller con Robot Dinámico (Nano Banana) */}
            <div className="relative w-full aspect-[16/9] max-h-[50vh] overflow-hidden bg-amber-100">
              <img 
                src="/redisenos_assets/isla_juguetes/taller_juguete_guardian.jpg" 
                alt="Taller del Juguete Mágico" 
                className="w-full h-full object-cover"
              />

              {/* ROBOT COMPAÑERO REAL CON LOS ÍTEMS PUESTOS (GENERADOS CON NANO BANANA) */}
              <div className="absolute top-[12%] left-[33%] w-[34%] h-[76%] z-20 pointer-events-none flex flex-col items-center justify-center p-1">
                <div className="w-full h-full rounded-[28px] overflow-hidden shadow-2xl border-4 border-amber-400 bg-amber-950/20 relative group">
                  <img 
                    src={getToyRobotImage()} 
                    alt="Robot Compañero de Madera con Ítems Equipados" 
                    className="w-full h-full object-cover transition-all duration-300 animate-in fade-in"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md rounded-xl py-1 text-center text-white text-[11px] font-black border border-white/20 shadow-lg">
                    {activeStudent.equippedToys.cape && activeStudent.equippedToys.trainWheels
                      ? '🦸 Capa + 🚂 Ruedas Equipadas'
                      : activeStudent.equippedToys.trainWheels
                      ? '🚂 Ruedas de Tren Equipadas'
                      : activeStudent.equippedToys.cape
                      ? '🦸 Capa de Superhéroe Equipada'
                      : activeStudent.equippedToys.propeller
                      ? '🌀 Hélices Voladoras Equipadas'
                      : activeStudent.equippedToys.lightbulbs
                      ? '💡 Bombillas Mágicas Encendidas'
                      : '🪵 Robot Base de Madera'}
                  </div>
                </div>
              </div>

              {/* Indicador de Accesorios Equipados */}
              <div className="absolute bottom-2 left-3 right-3 bg-amber-950/90 backdrop-blur-md p-2 rounded-2xl border border-amber-600 flex items-center justify-between text-xs text-white z-30 shadow-lg">
                <span className="font-bold flex items-center gap-1">
                  <span>Accesorios del Robot:</span>
                  <span className="text-amber-300">
                    {activeStudent.equippedToys.trainWheels ? 'Ruedas de Tren • ' : ''}
                    {activeStudent.equippedToys.cape ? 'Capa Roja • ' : ''}
                    {activeStudent.equippedToys.propeller ? 'Hélice Voladora • ' : ''}
                    {activeStudent.equippedToys.lightbulbs ? 'Bombillas Mágicas • ' : ''}
                    {!activeStudent.equippedToys.trainWheels && !activeStudent.equippedToys.cape && !activeStudent.equippedToys.propeller && !activeStudent.equippedToys.lightbulbs ? 'Sin accesorios • ' : ''}
                    ¡Listo para jugar!
                  </span>
                </span>
                <span className="text-amber-400 font-black">Activo</span>
              </div>
            </div>

            {/* Catálogo de Piezas */}
            <div className="p-4 sm:p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-800 text-center uppercase tracking-wider">
                Piezas y Accesorios de Madera y Plastilina
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'propeller', name: 'Hélices Voladoras', cost: 0, label: 'GRATIS', icon: '🌀' },
                  { key: 'cape', name: 'Capa de Superhéroe', cost: 2, label: '2 Estrellas', icon: '🦸' },
                  { key: 'lightbulbs', name: 'Bombillas Mágicas', cost: 0, label: 'GRATIS', icon: '💡' },
                  { key: 'trainWheels', name: 'Ruedas de Tren', cost: 2, label: '2 Estrellas', icon: '🚂' }
                ].map((item) => {
                  const isEquipped = activeStudent.equippedToys[item.key as keyof typeof activeStudent.equippedToys];
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        const nextEquipped = !isEquipped;
                        setStudents(prev => prev.map(s => {
                          if (s.id !== activeStudent.id) return s;
                          return {
                            ...s,
                            equippedToys: {
                              ...s.equippedToys,
                              [item.key]: nextEquipped
                            }
                          };
                        }));

                        let feedback = '';
                        if (item.key === 'trainWheels') {
                          feedback = nextEquipped ? '¡Ruedas de Tren colocadas en los pies!' : 'Ruedas retiradas';
                        } else if (item.key === 'cape') {
                          feedback = nextEquipped ? '¡Capa de Superhéroe puesta en la espalda!' : 'Capa guardada';
                        } else if (item.key === 'propeller') {
                          feedback = nextEquipped ? '¡Hélices voladoras colocadas en la cabeza!' : 'Hélices guardadas';
                        } else if (item.key === 'lightbulbs') {
                          feedback = nextEquipped ? '¡Bombillas mágicas encendidas en las antenas!' : 'Bombillas apagadas';
                        }

                        showToast(feedback);
                        speakText(feedback);
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all shadow-md active:scale-95 ${
                        isEquipped
                          ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-300'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-bold text-xs">{item.name}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/70 text-slate-800">
                        {isEquipped ? 'Equipado' : item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Botón Guardar y Salir */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    gamificationAudio.playLevelUpSound();
                    showToast("¡Robot Guardián guardado con éxito!");
                    speakText("¡Tu robot de juguete luce increíble! ¡A jugar!");
                    setActiveModal('none');
                  }}
                  className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-sm shadow-xl transition-transform hover:scale-105 active:scale-95"
                >
                  Guardar y ¡A JUGAR! ⭐
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
