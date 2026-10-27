// src/app/redisenos_gamificados/el_reino_de_las_huellitas/page.tsx
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
  HelpCircle,
  Layers,
  Heart
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { speakNaturalFemaleSpanish } from '@/lib/redisenosVoiceTTS';

// Perfiles de estudiantes exclusivos de Preescolar (Fase 2 SEP · 3 a 5 Años)
interface PreschoolStudent {
  id: string;
  name: string;
  age: number;
  grade: string;
  avatarIcon: string;
  stars: number;
  progressPercent: number;
  unlockedStickers: string[];
  equippedAccessories: {
    hat?: string;
    scarf?: string;
    wings?: boolean;
    bells?: boolean;
  };
}

const PRESCHOOL_STUDENTS: PreschoolStudent[] = [
  {
    id: 'pre-leo',
    name: 'Leo Morales',
    age: 3,
    grade: 'Preescolar 1 · Huellitas Verdes',
    avatarIcon: '🐲',
    stars: 15,
    progressPercent: 65,
    unlockedStickers: ['bear', 'star', 'tree', 'owl'],
    equippedAccessories: {
      hat: 'gorrito_fiesta',
      scarf: 'bufanda_colores'
    }
  },
  {
    id: 'pre-vale',
    name: 'Valentina Cruz',
    age: 4,
    grade: 'Preescolar 2 · Huellitas Azules',
    avatarIcon: '🦊',
    stars: 18,
    progressPercent: 75,
    unlockedStickers: ['bear', 'star', 'tree'],
    equippedAccessories: {
      hat: 'corona_real',
      wings: true
    }
  },
  {
    id: 'pre-santi',
    name: 'Santiago Gómez',
    age: 5,
    grade: 'Preescolar 3 · Huellitas Doradas',
    avatarIcon: '🐼',
    stars: 25,
    progressPercent: 90,
    unlockedStickers: ['bear', 'star', 'tree', 'owl'],
    equippedAccessories: {
      hat: 'gorro_dinosaurio',
      bells: true
    }
  }
];

// Catálogo de Accesorios para el Vestidor (Imagen 5)
interface AccessoryItem {
  id: string;
  name: string;
  category: 'hat' | 'scarf' | 'wings' | 'bells';
  cost: number;
  label: string;
  iconText: string;
  description: string;
}

const ACCESSORIES_CATALOG: AccessoryItem[] = [
  { id: 'gorrito_fiesta', name: 'Gorrito de Fiesta', category: 'hat', cost: 0, label: 'GRATIS', iconText: '🎉', description: 'Pompom y confeti festivo' },
  { id: 'gorra_detective', name: 'Gorra de Detective', category: 'hat', cost: 2, label: '2 Estrellas', iconText: '🕵️', description: 'Para pequeños investigadores' },
  { id: 'cascabeles', name: 'Cascabeles Musicales', category: 'bells', cost: 2, label: '2 Estrellas', iconText: '🔔', description: 'Suenan con cada pasito' },
  { id: 'bufanda_colores', name: 'Bufanda de Colores', category: 'scarf', cost: 0, label: 'GRATIS', iconText: '🧣', description: 'Tejido suave arcoíris' },
  { id: 'alas_mariposa', name: 'Alas de Mariposa', category: 'wings', cost: 2, label: '2 Estrellas', iconText: '🦋', description: 'Alas mágicas de jardín' },
  { id: 'gorro_osito', name: 'Gorro de Osito', category: 'hat', cost: 2, label: '2 Estrellas', iconText: '🐻', description: 'Orejitas tiernas de peluche' },
  { id: 'corona_real', name: 'Corona Real', category: 'hat', cost: 2, label: '2 Estrellas', iconText: '👑', description: 'Para pequeños reyes del saber' },
  { id: 'gorro_chef', name: 'Gorro de Chef', category: 'hat', cost: 2, label: '2 Estrellas', iconText: '👨‍🍳', description: 'Para cocinar recetas divertidas' },
  { id: 'gorro_dinosaurio', name: 'Gorro de Dinosaurio', category: 'hat', cost: 2, label: '2 Estrellas', iconText: '🦖', description: 'Escamas verdes de explorador' }
];

export default function ElReinoDeLasHuellitasPage() {
  const [students, setStudents] = useState<PreschoolStudent[]>(PRESCHOOL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(PRESCHOOL_STUDENTS[0].id);

  // Modales
  const [activeModal, setActiveModal] = useState<'none' | 'challenge_colors' | 'challenge_apples' | 'challenge_sounds' | 'shop' | 'historical_stories' | 'teacher_studio'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedHistoricalHero, setSelectedHistoricalHero] = useState<'sor_juana' | 'benito_juarez'>('sor_juana');
  const [customEducatorPrompt, setCustomEducatorPrompt] = useState<string>('Reconocer figuras geométricas y colores primarios en el jardín sensorial');
  const [educatorVaultSaved, setEducatorVaultSaved] = useState<boolean>(false);

  // Estados del Desafío Tablet "Colores Mágicos" (Imagen 4)
  const [selectedOption, setSelectedOption] = useState<'apple' | 'banana' | 'dice' | null>(null);
  const [tabletFeedback, setTabletFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Estados del Minijuego "Contamos Manzanas"
  const [appleCountOption, setAppleCountOption] = useState<number | null>(null);
  const [appleFeedback, setAppleFeedback] = useState<boolean | null>(null);

  // Especie activa en el Vestidor: Zorro (por defecto, según requerimiento) u Oso
  const [companionSpecies, setCompanionSpecies] = useState<'zorro' | 'oso'>('zorro');

  // Estados del Minijuego "Sonidos Divertidos"
  const [soundOption, setSoundOption] = useState<string | null>(null);
  const [soundFeedback, setSoundFeedback] = useState<boolean | null>(null);

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Renderizado dinámico del compañero (ZORRO u OSO) con los ítems reales generados con nano banana
  const getCompanionImage = () => {
    const hat = activeStudent.equippedAccessories.hat;
    const scarf = activeStudent.equippedAccessories.scarf;
    const wings = activeStudent.equippedAccessories.wings;
    const bells = activeStudent.equippedAccessories.bells;

    if (companionSpecies === 'zorro') {
      if (hat === 'gorra_detective' || (hat === 'gorra_detective' && scarf) || scarf === 'bufanda_colores') {
        return '/redisenos_assets/huellitas/zorro_detective_bufanda.jpg';
      }
      if (hat === 'gorrito_fiesta') {
        return '/redisenos_assets/huellitas/zorro_gorrito_fiesta.jpg';
      }
      if (hat === 'corona_real') {
        return '/redisenos_assets/huellitas/zorro_corona_real.jpg';
      }
      if (hat === 'gorro_chef') {
        return '/redisenos_assets/huellitas/zorro_gorro_chef.jpg';
      }
      if (hat === 'gorro_dinosaurio') {
        return '/redisenos_assets/huellitas/zorro_gorro_dinosaurio.jpg';
      }
      if (hat === 'gorro_osito') {
        return '/redisenos_assets/huellitas/zorro_gorro_osito.jpg';
      }
      if (wings) {
        return '/redisenos_assets/huellitas/zorro_alas_mariposa.jpg';
      }
      if (bells) {
        return '/redisenos_assets/huellitas/zorro_cascabeles.jpg';
      }
      return '/redisenos_assets/huellitas/zorro_base_pedestal.jpg';
    }

    // Modalidad Oso Amigo
    if (hat === 'gorra_detective' || (hat === 'gorra_detective' && scarf) || scarf === 'bufanda_colores') {
      return '/redisenos_assets/huellitas/oso_detective_bufanda.jpg';
    }
    if (hat === 'gorrito_fiesta') {
      return '/redisenos_assets/huellitas/oso_gorrito_fiesta.jpg';
    }
    if (hat === 'corona_real') {
      return '/redisenos_assets/huellitas/oso_corona_real.jpg';
    }
    if (hat === 'gorro_chef') {
      return '/redisenos_assets/huellitas/oso_gorro_chef.jpg';
    }
    if (hat === 'gorro_dinosaurio') {
      return '/redisenos_assets/huellitas/oso_gorro_dinosaurio.jpg';
    }
    if (hat === 'gorro_osito') {
      return '/redisenos_assets/huellitas/oso_gorro_osito.jpg';
    }
    if (wings) {
      return '/redisenos_assets/huellitas/oso_alas_mariposa.jpg';
    }
    if (bells) {
      return '/redisenos_assets/huellitas/oso_cascabeles.jpg';
    }
    return '/redisenos_assets/huellitas/oso_base_pedestal.jpg';
  };

  // Síntesis de voz femenina neuronal humana en español
  const speakText = (text: string) => {
    speakNaturalFemaleSpanish(text, { rate: 0.95, pitch: 1.06 });
  };

  // Saludo inicial del dragón (Imagen 3)
  const handleDragonClick = () => {
    gamificationAudio.playLevelUpSound();
    speakText("¡Hola, vamos a jugar! Soy Draki, tu amigo guardián del Reino de las Huellitas.");
    showToast("¡Draki te saluda con alegría! ✨");
  };

  // Manejo de Respuesta en la Tablet (Imagen 4: ¿Cuál es la fruta roja?)
  const handleTabletAnswer = (choice: 'apple' | 'banana' | 'dice') => {
    gamificationAudio.playClickSound();
    setSelectedOption(choice);

    if (choice === 'apple') {
      gamificationAudio.playLevelUpSound();
      setConfettiActive(true);
      setTabletFeedback({
        isCorrect: true,
        text: '¡Bravo! La manzana es roja, dulce y muy saludable. ¡Ganaste 3 Estrellitas!'
      });
      speakText("¡Excelente! La manzana es una fruta roja y deliciosa. ¡Ganaste tres estrellitas!");

      // Premiar al estudiante
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          stars: s.stars + 3,
          progressPercent: Math.min(100, s.progressPercent + 5)
        };
      }));

      setTimeout(() => setConfettiActive(false), 3000);
    } else {
      gamificationAudio.playErrorSound();
      const hint = choice === 'banana'
        ? '¡Casi! El plátano es de color amarillo brillante. ¡Prueba tocar la manzana roja!'
        : '¡Buen intento! El dado es un juguete azul para contar. ¡Busca la fruta roja!';
      setTabletFeedback({
        isCorrect: false,
        text: hint
      });
      speakText(hint);
    }
  };

  // Reiniciar desafío tablet
  const handleResetTablet = () => {
    gamificationAudio.playClickSound();
    setSelectedOption(null);
    setTabletFeedback(null);
    setConfettiActive(false);
    speakText("¿Cuál es la fruta roja? Toca la fruta de color rojo.");
  };

  // Manejo del Vestidor / Tienda (Imagen 5)
  const handleEquipAccessory = (item: AccessoryItem) => {
    gamificationAudio.playClickSound();

    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;

      // Si ya está equipado, alternar / desequipar
      if (item.category === 'hat' && s.equippedAccessories.hat === item.id) {
        speakText(`Te quitaste ${item.name}.`);
        return { ...s, equippedAccessories: { ...s.equippedAccessories, hat: undefined } };
      }
      if (item.category === 'scarf' && s.equippedAccessories.scarf === item.id) {
        speakText(`Te quitaste ${item.name}.`);
        return { ...s, equippedAccessories: { ...s.equippedAccessories, scarf: undefined } };
      }
      if (item.category === 'wings' && s.equippedAccessories.wings) {
        speakText(`Guardaste las alas de mariposa.`);
        return { ...s, equippedAccessories: { ...s.equippedAccessories, wings: false } };
      }
      if (item.category === 'bells' && s.equippedAccessories.bells) {
        speakText(`Guardaste los cascabeles musicales.`);
        return { ...s, equippedAccessories: { ...s.equippedAccessories, bells: false } };
      }

      // Si requiere estrellas y no tiene suficientes
      if (item.cost > s.stars) {
        gamificationAudio.playErrorSound();
        showToast('¡Necesitas más estrellitas para este accesorio!');
        speakText('¡Necesitas más estrellitas de sabiduría! Resuelve más juegos para conseguirlas.');
        return s;
      }

      gamificationAudio.playCoinSound();
      speakText(`¡Equipaste ${item.name}! ¡Pandi se ve genial!`);
      return {
        ...s,
        stars: item.cost > 0 ? s.stars - item.cost : s.stars,
        equippedAccessories: {
          ...s.equippedAccessories,
          ...(item.category === 'hat' && { hat: item.id }),
          ...(item.category === 'scarf' && { scarf: item.id }),
          ...(item.category === 'wings' && { wings: true }),
          ...(item.category === 'bells' && { bells: true })
        }
      };
    }));

    showToast(`¡Equipaste "${item.name}" con éxito!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-emerald-100 font-sans text-slate-800 flex flex-col select-none relative overflow-x-hidden">
      
      {/* 1. TOP HEADER INSTITUCIONAL PREESCOLAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Botón Volver y Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Suite</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-emerald-800 tracking-tight leading-tight flex items-center gap-1.5">
                  El Reino de las Huellitas
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold hidden sm:inline">
                    Fase 2 SEP · 3 a 5 Años
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                  Colegio Montessori del Valle · Educación Sensorial Temprana
                </p>
              </div>
            </div>
          </div>

          {/* Conmutador de Alumnos Preescolares Reales */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden md:inline">Alumno:</span>
            <div className="flex items-center bg-amber-100 p-1 rounded-2xl border border-amber-300">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedStudentId(s.id);
                    speakText(`¡Hola ${s.name.split(' ')[0]}! Tienes ${s.stars} estrellitas.`);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    selectedStudentId === s.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{s.avatarIcon}</span>
                  <span>{s.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-80 hidden lg:inline">({s.age}a)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cartera de Estrellitas y Tienda */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-sm shadow-md border-2 border-white animate-pulse">
              <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
              <span>{activeStudent.stars} Estrellitas</span>
            </div>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('shop');
                speakText("¡Bienvenido al vestidor! Aquí puedes crear y vestir a tu compañero favorito.");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-500/30 transition-transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>¡Crea tu Compañero!</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('historical_stories');
                speakText("¡Escucha a los héroes sabios contarte su historia en primera persona!");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <span>📖 Cuentos Históricos (1ª Persona)</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('teacher_studio');
                speakText("Estudio de la educadora conectado a la Bóveda Curricular Preescolar.");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <span>👩‍🏫 Bóveda Educadora</span>
            </button>
          </div>

        </div>

        {/* Notificación Toast */}
        {toastMessage && (
          <div className="max-w-md mx-auto mt-2 bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold text-center shadow-lg animate-in fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </header>

      {/* 2. ESCENARIO CENTRAL DEL HUB (IMAGEN 3: REINO DE LAS HUELLITAS) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        
        {/* LIENZO DE CUENTO INFANTIL ENMARCADO CON MÁXIMA FIDELIDAD (IMAGEN 3) */}
        <div className="relative w-full aspect-[16/9] max-h-[82vh] rounded-[36px] overflow-hidden shadow-2xl border-8 border-amber-300/90 bg-slate-900 group">
          
          {/* Ilustración de Fondo Original (Imagen 3) */}
          <img 
            src="/redisenos_assets/huellitas/reino_huellitas_main_scene.jpg" 
            alt="El Reino de las Huellitas - Hub Principal"
            className="w-full h-full object-cover"
          />

          {/* HOTSPOTS INTERACTIVOS Y ACCIONES DIRECTAS SOBRE EL MUNDO VIVO */}

          {/* 1. Hotspot: Draki el Dragón Verde y su Bocadillo */}
          <div 
            onClick={handleDragonClick}
            className="absolute top-[22%] left-[2%] w-[36%] h-[74%] cursor-pointer z-10 group/dragon"
            title="¡Toca a Draki para hablar y escuchar su saludo!"
          >
            {/* Resplandor suave al hacer hover */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/dragon:opacity-100 transition-opacity bg-emerald-400/20 backdrop-blur-[1px] border-2 border-emerald-400/50 flex items-center justify-center pointer-events-none">
              <span className="bg-emerald-800 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                <Volume2 className="w-3.5 h-3.5" />
                ¡Tócame para hablar!
              </span>
            </div>
          </div>

          {/* 2. Hotspot: Bocadillo "¡Hola, vamos a jugar!" */}
          <button
            onClick={handleDragonClick}
            className="absolute top-[22%] left-[22%] w-[16%] h-[14%] z-20 cursor-pointer rounded-2xl hover:scale-105 active:scale-95 transition-transform"
            title="¡Escuchar saludo de Draki!"
          />

          {/* 3. Hotspot: Mi Arcoíris de Logros (Icono de Altavoz y Barra) */}
          <div 
            onClick={() => {
              gamificationAudio.playClickSound();
              speakText(`Mi arcoíris de logros está al ${activeStudent.progressPercent} por ciento. ¡Llevas 7 de 10 estrellas para llegar al castillo mágico!`);
              showToast("¡Arcoíris al 65% · 7 de 10 Estrellas!");
            }}
            className="absolute top-[9%] left-[27%] w-[38%] h-[20%] cursor-pointer z-10 rounded-3xl group/rainbow"
            title="Toca para escuchar tu progreso en el arcoíris"
          >
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/rainbow:opacity-100 transition-opacity bg-purple-400/20 border-2 border-purple-400/50 pointer-events-none flex items-center justify-center">
              <span className="bg-purple-800 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                ⭐ {activeStudent.progressPercent}% · 7/10 Estrellas
              </span>
            </div>
          </div>

          {/* 4. Hotspot: Colección de Huellitas (Stickers) */}
          <div className="absolute top-[5%] right-[3%] w-[21%] h-[32%] z-10 flex flex-col justify-end p-2">
            <div className="grid grid-cols-2 gap-2 h-[75%]">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  speakText("¡Estampa de Osezno amigo desbloqueada!");
                  showToast("¡Estampa de Osezno!");
                }}
                className="rounded-xl hover:ring-2 hover:ring-amber-400 transition-all active:scale-90"
                title="Osezno"
              />
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  speakText("¡Estampa de Estrellita sonriente desbloqueada!");
                  showToast("¡Estampa de Estrellita!");
                }}
                className="rounded-xl hover:ring-2 hover:ring-amber-400 transition-all active:scale-90"
                title="Estrellita"
              />
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  speakText("¡Estampa de Arbolito del bosque desbloqueada!");
                  showToast("¡Estampa de Arbolito!");
                }}
                className="rounded-xl hover:ring-2 hover:ring-amber-400 transition-all active:scale-90"
                title="Arbolito"
              />
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  speakText("¡Estampa de Búho sabio desbloqueada!");
                  showToast("¡Estampa de Búho!");
                }}
                className="rounded-xl hover:ring-2 hover:ring-amber-400 transition-all active:scale-90"
                title="Búho Sabio"
              />
            </div>
          </div>

          {/* 5. TARJETA 1: "CONTAMOS MANZANAS" (OSEZNO) */}
          <div className="absolute top-[40%] left-[29%] w-[21%] h-[50%] z-20 flex flex-col justify-end p-2 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Botón Altavoz */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  gamificationAudio.playClickSound();
                  speakText("Contamos manzanas con el osezno. ¡Vamos a aprender a contar números!");
                }}
                className="w-8 sm:w-11 h-8 sm:h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90"
                title="Escuchar"
              >
                <Volume2 className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>

              {/* Botón "¡A Jugar!" */}
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('challenge_apples');
                  speakText("¿Cuántas manzanas rojas hay en la canasta del osezno?");
                }}
                className="flex-1 py-1.5 sm:py-2.5 rounded-full bg-sky-400 hover:bg-sky-300 text-white font-black text-[10px] sm:text-xs shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
              >
                <Play className="w-3 sm:w-4 h-3 sm:h-4 fill-white" />
                <span>¡A Jugar!</span>
              </button>
            </div>
          </div>

          {/* 6. TARJETA 2: "SONIDOS DIVERTIDOS" (ELEFANTITO) */}
          <div className="absolute top-[40%] left-[51%] w-[21%] h-[50%] z-20 flex flex-col justify-end p-2 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Botón Altavoz */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  gamificationAudio.playClickSound();
                  speakText("Sonidos divertidos con el elefantito y sus notas musicales.");
                }}
                className="w-8 sm:w-11 h-8 sm:h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90"
                title="Escuchar"
              >
                <Volume2 className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>

              {/* Botón "¡A Jugar!" */}
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('challenge_sounds');
                  speakText("¿Qué vocal suena en el nombre del Elefante? ¡La letra E!");
                }}
                className="flex-1 py-1.5 sm:py-2.5 rounded-full bg-sky-400 hover:bg-sky-300 text-white font-black text-[10px] sm:text-xs shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
              >
                <Play className="w-3 sm:w-4 h-3 sm:h-4 fill-white" />
                <span>¡A Jugar!</span>
              </button>
            </div>
          </div>

          {/* 7. TARJETA 3: "COLORES MÁGICOS" (CONEJITO · ABRE LA TABLET DE LA IMAGEN 4) */}
          <div className="absolute top-[40%] left-[73%] w-[21%] h-[50%] z-20 flex flex-col justify-end p-2 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Botón Altavoz */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  gamificationAudio.playClickSound();
                  speakText("Desafío de colores mágicos con el conejito. ¡Toca la pantalla y descubre frutas!");
                }}
                className="w-8 sm:w-11 h-8 sm:h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90"
                title="Escuchar"
              >
                <Volume2 className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>

              {/* Botón "¡A Jugar!" */}
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('challenge_colors');
                  speakText("¿Cuál es la fruta roja? Toca la fruta de color rojo.");
                }}
                className="flex-1 py-1.5 sm:py-2.5 rounded-full bg-sky-400 hover:bg-sky-300 text-white font-black text-[10px] sm:text-xs shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 animate-pulse"
              >
                <Play className="w-3 sm:w-4 h-3 sm:h-4 fill-white" />
                <span>¡A Jugar!</span>
              </button>
            </div>
          </div>

        </div>

        {/* BARRA INFORMATIVA INFERIOR MONTESSORI */}
        <div className="mt-3 bg-white/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-amber-300 flex items-center justify-between text-xs text-slate-600 shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-800">ISkool Preescolar</span>
            <span>·</span>
            <span>Colegio Montessori del Valle</span>
            <span>·</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              Pedagogía del Error Amable
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-amber-900">
              Compañero: {activeStudent.name.split(' ')[0]} ({activeStudent.avatarIcon})
            </span>
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('shop');
                speakText("¡Vamos al vestidor de Pandi!");
              }}
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Abrir Tienda</span>
            </button>
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL DESAFÍO TABLET HÁPTICO (IMAGEN 4: "¿CUÁL ES LA FRUTA ROJA?") */}
      {/* ========================================================================= */}
      {activeModal === 'challenge_colors' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-400 bg-slate-950 flex flex-col justify-between max-h-[95vh]">
            
            {/* Header Flotante de la Tablet */}
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-amber-300 text-xs font-black text-slate-800 flex items-center gap-2">
                <span>⭐ {activeStudent.stars} Estrellas</span>
                <span className="text-slate-300">|</span>
                <span>Fase 2 SEP · Sensorial</span>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="pointer-events-auto p-2.5 rounded-full bg-white text-slate-700 hover:text-slate-950 shadow-lg hover:bg-slate-100 transition-transform active:scale-95"
                title="Cerrar Desafío"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIENZO DE LA TABLET INFANTIL CON LA ILUSTRACIÓN EXACTA (IMAGEN 4) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden group">
              
              <img 
                src="/redisenos_assets/huellitas/reino_huellitas_tablet_challenge.jpg" 
                alt="Desafío Tablet - ¿Cuál es la fruta roja?"
                className="w-full h-full object-cover"
              />

              {/* Confeti de Celebración si Acertó */}
              {confettiActive && (
                <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                  <div className="text-5xl sm:text-7xl animate-bounce">🎉 ⭐ 🍎 ⭐ 🎊</div>
                </div>
              )}

              {/* Hotspot de Voz: Bocadillo "¿Cuál es la fruta roja?" */}
              <div 
                onClick={() => speakText("¿Cuál es la fruta roja? Toca la fruta de color rojo.")}
                className="absolute top-[14%] left-[28%] w-[44%] h-[15%] z-20 cursor-pointer rounded-full"
                title="Toca para escuchar la pregunta"
              />

              {/* 3 BOTONES HÁPTICOS TÁCTILES POSICIONADOS EXACTAMENTE SOBRE LA IMAGEN 4 */}

              {/* BOTÓN 1: 🍎 MANZANA (CORRECTO - IZQUIERDA) */}
              <button
                onClick={() => handleTabletAnswer('apple')}
                className={`absolute bottom-[14%] left-[27%] w-[15%] h-[23%] rounded-3xl z-20 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  selectedOption === 'apple'
                    ? 'ring-4 ring-emerald-400 bg-emerald-400/20 scale-105'
                    : 'hover:scale-105 active:scale-95 hover:ring-2 hover:ring-white/80'
                }`}
                title="Tocar Manzana Roja"
              >
                {selectedOption === 'apple' && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-xl animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
              </button>

              {/* BOTÓN 2: 🍌 PLÁTANO (ERROR FORMATIVO - CENTRO) */}
              <button
                onClick={() => handleTabletAnswer('banana')}
                className={`absolute bottom-[14%] left-[43.5%] w-[15%] h-[23%] rounded-3xl z-20 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  selectedOption === 'banana'
                    ? 'ring-4 ring-amber-400 bg-amber-400/20 animate-wiggle'
                    : 'hover:scale-105 active:scale-95 hover:ring-2 hover:ring-white/80'
                }`}
                title="Tocar Plátano Amarillo"
              />

              {/* BOTÓN 3: 🎲 DADO (ERROR FORMATIVO - DERECHA) */}
              <button
                onClick={() => handleTabletAnswer('dice')}
                className={`absolute bottom-[14%] left-[60%] w-[15%] h-[23%] rounded-3xl z-20 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  selectedOption === 'dice'
                    ? 'ring-4 ring-amber-400 bg-amber-400/20 animate-wiggle'
                    : 'hover:scale-105 active:scale-95 hover:ring-2 hover:ring-white/80'
                }`}
                title="Tocar Dado Azul"
              />

              {/* Banner de Retroalimentación Flotante en la Pantalla */}
              {tabletFeedback && (
                <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-30 w-[80%] max-w-lg">
                  <div className={`p-3 rounded-2xl text-xs sm:text-sm font-black text-center shadow-2xl flex items-center justify-center gap-2 animate-in fade-in ${
                    tabletFeedback.isCorrect 
                      ? 'bg-emerald-500 text-white border-2 border-white' 
                      : 'bg-amber-400 text-amber-950 border-2 border-white'
                  }`}>
                    <span className="text-xl">{tabletFeedback.isCorrect ? '🌟' : '💡'}</span>
                    <span>{tabletFeedback.text}</span>
                  </div>
                </div>
              )}

            </div>

            {/* BOTONERA INFERIOR */}
            <div className="p-3 bg-amber-100 border-t-2 border-amber-300 flex items-center justify-between">
              <button
                onClick={handleResetTablet}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-xs shadow-md transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Intentar de Nuevo</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-6 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-transform active:scale-95"
              >
                Terminar Desafío y Volver
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VESTIDOR Y TIENDA (IMAGEN 5: "¡CREA TU COMPAÑERO!") */}
      {/* ========================================================================= */}
      {activeModal === 'shop' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-700 bg-amber-950 flex flex-col justify-between max-h-[95vh]">
            
            {/* Header Flotante del Vestidor */}
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveModal('none');
                  }}
                  className="p-2 rounded-2xl bg-amber-800/90 text-white shadow-lg hover:bg-amber-700 transition-transform active:scale-95"
                  title="Volver al Santuario"
                >
                  ◀
                </button>
                <span className="bg-amber-900/80 backdrop-blur-md text-amber-200 px-3 py-1 rounded-xl text-xs font-bold border border-amber-700">
                  Vestidor Montessori
                </span>
              </div>

              {/* Selector de Compañero Activo: Zorro o Oso */}
              <div className="pointer-events-auto flex items-center bg-amber-950/85 backdrop-blur-md p-1 rounded-2xl border border-amber-700 shadow-xl">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setCompanionSpecies('zorro');
                    speakText("¡Zorrito Amigo en el pedestal!");
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    companionSpecies === 'zorro'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-amber-200 hover:text-white'
                  }`}
                >
                  🦊 Zorrito Amigo
                </button>
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setCompanionSpecies('oso');
                    speakText("¡Osezno Amigo en el pedestal!");
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    companionSpecies === 'oso'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-amber-200 hover:text-white'
                  }`}
                >
                  🐻 Osezno Amigo
                </button>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-lg border border-white">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>{activeStudent.stars} Estrellas</span>
                </div>

                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveModal('none');
                  }}
                  className="p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-lg transition-transform active:scale-95"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LIENZO DEL VESTIDOR CON LA ILUSTRACIÓN EXACTA (IMAGEN 5) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              
              <img 
                src="/redisenos_assets/huellitas/reino_huellitas_companion_customizer.jpg" 
                alt="¡Crea tu Compañero! - Vestidor Montessori"
                className="w-full h-full object-cover"
              />

              {/* COMPAÑERO PERSONALIZADO REAL GENERADO CON NANO BANANA (IMAGEN 4 & 5) */}
              <div className="absolute top-[23%] left-[36%] w-[28%] h-[58%] z-20 pointer-events-none flex flex-col items-center justify-center p-1">
                <div className="w-full h-full rounded-[28px] overflow-hidden shadow-2xl border-4 border-amber-300/90 bg-amber-50 relative group">
                  <img 
                    src={getCompanionImage()} 
                    alt={companionSpecies === 'zorro' ? "Zorrito Compañero Personalizado" : "Osezno Compañero Personalizado"} 
                    className="w-full h-full object-cover transition-all duration-300 animate-in fade-in"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-xl py-0.5 text-center text-white text-[10px] font-black">
                    {companionSpecies === 'zorro' ? '🦊 Zorrito Amigo · ¡Equipado!' : '🐻 Osezno Amigo · ¡Equipado!'}
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* HOTSPOTS INTERACTIVOS DE LOS ESTANTES DE MADERA */}
              {/* ========================================================= */}

              {/* 1. Estante Izquierdo: Gorrito de Fiesta (Gratis) */}
              <button
                onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[0])}
                className={`absolute top-[26%] left-[7.5%] w-[10.5%] h-[28%] rounded-2xl z-20 cursor-pointer transition-all duration-200 ${
                  activeStudent.equippedAccessories.hat === 'gorrito_fiesta'
                    ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                    : 'hover:ring-2 hover:ring-amber-400'
                }`}
                title="Equipar Gorrito de Fiesta (Gratis)"
              />

              {/* 2. Estante Izquierdo: Gorra de Detective (2 Estrellas) */}
              <button
                onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[1])}
                className={`absolute top-[26%] left-[19%] w-[11%] h-[28%] rounded-2xl z-20 cursor-pointer transition-all duration-200 ${
                  activeStudent.equippedAccessories.hat === 'gorra_detective'
                    ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                    : 'hover:ring-2 hover:ring-amber-400'
                }`}
                title="Equipar Gorra de Detective (2 Estrellas)"
              />

              {/* 3. Estante Izquierdo: Cascabeles Musicales (2 Estrellas) */}
              <button
                onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[2])}
                className={`absolute top-[63%] left-[7.5%] w-[22.5%] h-[20%] rounded-2xl z-20 cursor-pointer transition-all duration-200 ${
                  activeStudent.equippedAccessories.bells
                    ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                    : 'hover:ring-2 hover:ring-amber-400'
                }`}
                title="Equipar Cascabeles Musicales (2 Estrellas)"
              />

              {/* 4. Estante Derecho: Bufanda de Colores (Gratis) */}
              <button
                onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[3])}
                className={`absolute top-[26%] left-[69.5%] w-[11%] h-[28%] rounded-2xl z-20 cursor-pointer transition-all duration-200 ${
                  activeStudent.equippedAccessories.scarf === 'bufanda_colores'
                    ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                    : 'hover:ring-2 hover:ring-amber-400'
                }`}
                title="Equipar Bufanda de Colores (Gratis)"
              />

              {/* 5. Estante Derecho: Alas de Mariposa (2 Estrellas) */}
              <button
                onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[4])}
                className={`absolute top-[26%] left-[81.5%] w-[11%] h-[28%] rounded-2xl z-20 cursor-pointer transition-all duration-200 ${
                  activeStudent.equippedAccessories.wings
                    ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                    : 'hover:ring-2 hover:ring-amber-400'
                }`}
                title="Equipar Alas de Mariposa (2 Estrellas)"
              />

              {/* 6. Selector de Sombreros Inferior (Gorro Osito, Corona, Chef, Dino) */}
              <div className="absolute top-[63%] left-[69.5%] w-[23%] h-[20%] z-20 grid grid-cols-4 gap-1">
                {/* Gorro de Osito */}
                <button
                  onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[5])}
                  className={`rounded-xl transition-all ${
                    activeStudent.equippedAccessories.hat === 'gorro_osito'
                      ? 'ring-2 ring-emerald-400 bg-emerald-400/20'
                      : 'hover:bg-white/20'
                  }`}
                  title="Gorro de Osito"
                />
                {/* Corona Real */}
                <button
                  onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[6])}
                  className={`rounded-xl transition-all ${
                    activeStudent.equippedAccessories.hat === 'corona_real'
                      ? 'ring-2 ring-emerald-400 bg-emerald-400/20'
                      : 'hover:bg-white/20'
                  }`}
                  title="Corona Real"
                />
                {/* Gorro de Chef */}
                <button
                  onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[7])}
                  className={`rounded-xl transition-all ${
                    activeStudent.equippedAccessories.hat === 'gorro_chef'
                      ? 'ring-2 ring-emerald-400 bg-emerald-400/20'
                      : 'hover:bg-white/20'
                  }`}
                  title="Gorro de Chef"
                />
                {/* Gorro de Dinosaurio */}
                <button
                  onClick={() => handleEquipAccessory(ACCESSORIES_CATALOG[8])}
                  className={`rounded-xl transition-all ${
                    activeStudent.equippedAccessories.hat === 'gorro_dinosaurio'
                      ? 'ring-2 ring-emerald-400 bg-emerald-400/20'
                      : 'hover:bg-white/20'
                  }`}
                  title="Gorro de Dinosaurio"
                />
              </div>

              {/* 7. Botones de Acción de Madera en la Parte Inferior */}
              
              {/* Botón: Atrás */}
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="absolute bottom-[2%] left-[3%] w-[13%] h-[9%] rounded-2xl z-20 cursor-pointer hover:ring-2 hover:ring-white transition-all active:scale-95"
                title="Volver"
              />

              {/* Botón: Guardar */}
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  const compName = companionSpecies === 'zorro' ? 'Zorrito' : 'Osezno';
                  showToast(`¡Atuendo de ${compName} guardado!`);
                  speakText(`¡Atuendo de ${compName} guardado con éxito!`);
                }}
                className="absolute bottom-[2%] left-[44%] w-[19%] h-[9%] rounded-2xl z-20 cursor-pointer hover:ring-2 hover:ring-white transition-all active:scale-95"
                title={`Guardar Atuendo de ${companionSpecies === 'zorro' ? 'Zorrito' : 'Osezno'}`}
              />

              {/* Botón: ¡JUGAR! */}
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  const compName = companionSpecies === 'zorro' ? 'Zorrito' : 'Osezno';
                  speakText(`¡A jugar con ${compName} en el Reino de las Huellitas!`);
                }}
                className="absolute bottom-[2%] right-[3%] w-[14%] h-[9%] rounded-2xl z-20 cursor-pointer hover:ring-2 hover:ring-white transition-all active:scale-95"
                title={`¡Jugar con ${companionSpecies === 'zorro' ? 'Zorrito' : 'Osezno'}!`}
              />

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MINIJUEGO "CONTAMOS MANZANAS" (OSEZNO) */}
      {/* ========================================================================= */}
      {activeModal === 'challenge_apples' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white p-6 rounded-3xl shadow-2xl border-4 border-amber-300 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Matemáticas Preescolar · Conteo Sensorial
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-800">
              ¿Cuántas manzanas rojas hay en la canasta?
            </h3>
            
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-amber-200">
              <img 
                src="/redisenos_assets/huellitas/oso_5_manzanas.jpg" 
                alt="Osezno con 5 Manzanas"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-slate-600 font-semibold">
              Cuenta las manzanas y toca el número correcto:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 5].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setAppleCountOption(num);
                    if (num === 5) {
                      gamificationAudio.playLevelUpSound();
                      setAppleFeedback(true);
                      speakText("¡Excelente! Hay 5 manzanas rojas deliciosas en la canasta del osezno. ¡Contaste muy bien!");
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                    } else {
                      gamificationAudio.playErrorSound();
                      setAppleFeedback(false);
                      speakText(`¡Casi! Hay 5 manzanas rojas en la canasta. ¡Cuenta conmigo: una, dos, tres, cuatro y cinco!`);
                    }
                  }}
                  className={`py-3 rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-md ${
                    appleCountOption === num
                      ? num === 5
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                        : 'bg-amber-400 text-amber-950 ring-4 ring-amber-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                  }`}
                >
                  {num} {num === 1 ? 'Manzana' : 'Manzanas'}
                </button>
              ))}
            </div>

            {appleFeedback !== null && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                appleFeedback ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {appleFeedback ? '🎉 ¡Correcto! Hay 5 manzanas rojas. +2 Estrellitas' : '💡 ¡Casi! Vuelve a contar: hay 5 manzanitas.'}
              </div>
            )}

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md"
            >
              Volver al Reino
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MINIJUEGO "SONIDOS DIVERTIDOS" (ELEFANTITO) */}
      {/* ========================================================================= */}
      {activeModal === 'challenge_sounds' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white p-6 rounded-3xl shadow-2xl border-4 border-sky-300 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-200">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Lenguaje y Música · Conciencia Fonológica
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-800">
              ¿Qué vocal suena al inicio de <span className="text-sky-600 underline">Elefante</span>?
            </h3>
            
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-sky-200">
              <img 
                src="/redisenos_assets/huellitas/elefantito_musica.jpg" 
                alt="Elefantito con Notas Musicales"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['A', 'E', 'O'].map(letter => (
                <button
                  key={letter}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSoundOption(letter);
                    if (letter === 'E') {
                      gamificationAudio.playLevelUpSound();
                      setSoundFeedback(true);
                      speakText("¡Muy bien! Elefante empieza con la vocal E. ¡Eres muy inteligente!");
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                    } else {
                      gamificationAudio.playErrorSound();
                      setSoundFeedback(false);
                      speakText(`¡Casi! Escucha el sonido: Eeee-lefante. ¡Empieza con la letra E!`);
                    }
                  }}
                  className={`py-3 rounded-2xl font-black text-2xl transition-transform active:scale-95 shadow-md ${
                    soundOption === letter
                      ? letter === 'E'
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                        : 'bg-amber-400 text-amber-950 ring-4 ring-amber-300'
                      : 'bg-sky-100 hover:bg-sky-200 text-sky-900'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {soundFeedback !== null && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                soundFeedback ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {soundFeedback ? '🎉 ¡Correcto! Elefante comienza con E. +2 Estrellitas' : '💡 Escucha con atención: E-le-fan-te.'}
              </div>
            )}

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs shadow-md"
            >
              Volver al Reino
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL DE CUENTOS HISTÓRICOS EN 1ª PERSONA (SOR JUANA Y BENITO JUÁREZ) */}
      {/* ========================================================================= */}
      {activeModal === 'historical_stories' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-amber-50 p-6 rounded-3xl shadow-2xl border-4 border-amber-400 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                📖 Héroes Sabios de Cuento · Canon en 1ª Persona Estricta
              </span>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-full bg-amber-200 text-amber-950 hover:bg-amber-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setSelectedHistoricalHero('sor_juana');
                  speakText("Nací en San Miguel Nepantla en 1648. Cuando tenía tres años acompañé a mi hermana a la escuela de Las Amigas y aprendí a leer jugando con las letras.");
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  selectedHistoricalHero === 'sor_juana'
                    ? 'bg-rose-100 border-rose-500 shadow-md'
                    : 'bg-white border-amber-200 hover:bg-amber-100'
                }`}
              >
                <div className="text-2xl mb-1">🪶📜</div>
                <div className="text-sm font-black text-slate-900">Juana Inés de Asbaje</div>
                <div className="text-[11px] text-rose-700 font-bold">Niña Poeta de Nepantla (1648)</div>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setSelectedHistoricalHero('benito_juarez');
                  speakText("Nací el 21 de marzo de 1806 en San Pablo Guelatao, Oaxaca. De niño cuidé ovejas en la montaña y tocaba mi flauta de carrizo junto a la laguna encantada.");
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  selectedHistoricalHero === 'benito_juarez'
                    ? 'bg-emerald-100 border-emerald-500 shadow-md'
                    : 'bg-white border-amber-200 hover:bg-amber-100'
                }`}
              >
                <div className="text-2xl mb-1">🐑🪈</div>
                <div className="text-sm font-black text-slate-900">Benito Juárez García</div>
                <div className="text-[11px] text-emerald-700 font-bold">Pastorcito de Guelatao (1806)</div>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-inner space-y-3">
              {selectedHistoricalHero === 'sor_juana' ? (
                <>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                    &ldquo;Nací en San Miguel Nepantla en 1648. Cuando tenía tres años, igual que tú, seguí a mi hermana mayor a su clase y descubrí que las letras guardan canciones y estrellas. Dejé de comer queso porque pensaba que me quitaba la memoria para aprender más rápido.&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        gamificationAudio.playLevelUpSound();
                        speakText("Nací en San Miguel Nepantla en 1648. Cuando tenía tres años seguí a mi hermana mayor a su clase y descubrí que las letras guardan canciones y estrellas. ¡Ganaste dos estrellitas por escuchar mi historia!");
                        setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                        showToast("¡Escuchaste a Juana Inés en 1ª persona! +2 Estrellitas 🌟");
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Escuchar Voz Natural (+2 Estrellitas)</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                    &ldquo;Nací el 21 de marzo de 1806 en San Pablo Guelatao, Oaxaca. Cuando era pequeño hablaba zapoteco, cuidaba las ovejas de mi tío Bernardino y aprendí que cuidar a nuestros amigos y respetar a todos nos hace grandes guardianes.&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        gamificationAudio.playLevelUpSound();
                        speakText("Nací el 21 de marzo de 1806 en San Pablo Guelatao, Oaxaca. Cuando era pequeño hablaba zapoteco, cuidaba las ovejas de mi tío Bernardino y aprendí que respetar a todos nos hace grandes guardianes. ¡Ganaste dos estrellitas!");
                        setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, stars: s.stars + 2 } : s));
                        showToast("¡Escuchaste a Benito Juárez en 1ª persona! +2 Estrellitas 🌟");
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Escuchar Voz Natural (+2 Estrellitas)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL DE ESTUDIO DE LA EDUCADORA (BÓVEDA CURRICULAR PREESCOLAR) */}
      {/* ========================================================================= */}
      {activeModal === 'teacher_studio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white p-6 rounded-3xl shadow-2xl border-4 border-emerald-400 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-100">
              <div>
                <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                  👩‍🏫 Bóveda Curricular Preescolar · Fase 2 SEP (NEM 2024)
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Estudio de Actividades Sensoriales de la Educadora
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-semibold">
                <strong>Ruta Vault-First:</strong> <code>planeaciones/preescolar/fase2_saberes_sensoriales.md</code> · Sincronizado con el Motor de IA Pedagógica sin texto complejo para niños de 3 a 5 años.
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  PDA / Aprendizaje Sensorial para {activeStudent.name}:
                </label>
                <input
                  type="text"
                  value={customEducatorPrompt}
                  onChange={(e) => setCustomEducatorPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-emerald-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    gamificationAudio.playLevelUpSound();
                    setEducatorVaultSaved(true);
                    speakText(`Misión sensorial sincronizada en la Bóveda Curricular para ${activeStudent.name.split(' ')[0]}.`);
                    showToast("¡Planeación Preescolar sincronizada en Bóveda Curricular!");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md"
                >
                  💾 Sincronizar en Bóveda Curricular
                </button>
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveModal('challenge_colors');
                    speakText("Iniciando reto sensorial de colores mágicos asignado por la educadora.");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-md"
                >
                  🚀 Lanzar Actividad en Tablet
                </button>
              </div>

              {educatorVaultSaved && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
                  ✅ Nodo guardado en <code>planeaciones/preescolar/huellitas_pda.md</code> y audio neuronal activado para {activeStudent.name}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
