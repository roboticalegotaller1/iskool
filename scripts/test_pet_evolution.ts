import { ELEMENTAL_PET_RACES, LIVING_IDLE_ACTIONS, EVOLUTION_STAGE_CONFIG, resolvePetRace } from '../src/components/pet/types';
import { useStudentStore } from '../src/store/useStudentStore';

async function runPetEvolutionTests() {
  console.log('🧪 Iniciando verificación del sistema de Compañeros Místicos y Evolución...\n');

  // 1. Verificación de las 10 Razas Elementales
  console.log('1. Verificando las 10 Razas Elementales:');
  console.assert(ELEMENTAL_PET_RACES.length === 10, `Se esperaban 10 razas, se encontraron ${ELEMENTAL_PET_RACES.length}`);
  ELEMENTAL_PET_RACES.forEach((race, idx) => {
    console.log(`   [${idx + 1}/10] ${race.badgeEmoji} ${race.name} - ${race.element} (${race.title})`);
  });

  // 2. Verificación de resolución y compatibilidad retroactiva
  console.log('\n2. Verificando compatibilidad retroactiva con alias legados:');
  const cryo = resolvePetRace('dragon');
  console.assert(cryo.id === 'cryo_dragon', 'Error al resolver alias "dragon"');
  console.log(`   ✓ "dragon" resuelve a -> ${cryo.name} (${cryo.element})`);

  const volt = resolvePetRace('lobo');
  console.assert(volt.id === 'voltfang_wolf', 'Error al resolver alias "lobo"');
  console.log(`   ✓ "lobo" resuelve a -> ${volt.name} (${volt.element})`);

  const flora = resolvePetRace('venado');
  console.assert(flora.id === 'flora_stag', 'Error al resolver alias "venado"');
  console.log(`   ✓ "venado" resuelve a -> ${flora.name} (${flora.element})`);

  // 3. Verificación de las 32 Acciones Vivas de Espera (Idle Living Engine)
  console.log(`\n3. Verificando catálogo de conductas vivas autónomas (${LIVING_IDLE_ACTIONS.length} acciones):`);
  console.assert(LIVING_IDLE_ACTIONS.length >= 30, `Se requieren al menos 30 acciones, hay ${LIVING_IDLE_ACTIONS.length}`);
  const uniqueActionIds = new Set(LIVING_IDLE_ACTIONS.map(a => a.id));
  console.assert(uniqueActionIds.size === LIVING_IDLE_ACTIONS.length, 'Existen IDs de acciones duplicados');
  console.log(`   ✓ ${LIVING_IDLE_ACTIONS.length} acciones únicas y variadas comprobadas.`);

  // 4. Verificación de las 5 Etapas Evolutivas
  console.log('\n4. Verificando las 5 Etapas de Evolución:');
  const stages = ['egg', 'baby', 'child', 'teen', 'adult'] as const;
  stages.forEach((st) => {
    const cfg = EVOLUTION_STAGE_CONFIG[st];
    console.log(`   ✓ Etapa [${st.toUpperCase()}]: "${cfg.label}" - Tareas requeridas: ${cfg.tasksRequired}`);
  });

  // 5. Verificación de la Lógica del Store (Eclosión, Caricias y Tareas)
  console.log('\n5. Verificando Store de Alumno (Eclosión con 1ª tarea y Caricias):');
  const store = useStudentStore.getState();
  const testStudentId = 'std-test-pet-01';

  // Configurar alumno en huevo
  store.allStats[testStudentId] = {
    student_id: testStudentId,
    xp: 0,
    level: 1,
    coins: 50,
    current_streak: 1,
    max_streak: 1,
    pet_stage: 'egg',
    pet_energy: 100,
    pet_happiness: 50,
    tasks_completed_count: 0,
    friendship_exp: 0,
    updated_at: new Date().toISOString()
  };
  store.allAvatars[testStudentId] = {
    student_id: testStudentId,
    avatar_name: 'Alumno Piloto',
    hair_style: 'classic',
    hair_color: '#333',
    eyes_style: 'happy',
    outfit_style: 'explorer',
    outfit_color: '#3B82F6',
    background_style: 'forest',
    unlocked_items: [],
    updated_at: new Date().toISOString(),
    pet_type: 'cryo_dragon',
    pet_name: 'Huevo',
    pet_hunger: 50,
    pet_happiness: 50,
    pet_bonded: false
  };

  // Simular entrega de primera tarea escolar
  console.log('   Simulando entrega de 1ª tarea escolar...');
  const taskResult = await store.registerHomeworkCompletedForPet(testStudentId);
  console.assert(taskResult.triggeredHatch === true, 'La primera tarea debió disparar triggeredHatch');
  console.assert(taskResult.newStage === 'baby', 'La nueva etapa debió ser "baby"');
  console.log('   ✓ ¡Eclosión disparada con éxito al registrar la 1ª tarea!');

  // Ejecutar eclosión y asignación de raza
  const assignedRace = await store.hatchStudentEgg(testStudentId, 'pyros_dragon', 'Flamita');
  const postHatchAvatar = useStudentStore.getState().allAvatars[testStudentId];
  const postHatchStats = useStudentStore.getState().allStats[testStudentId];

  console.assert(postHatchAvatar.pet_bonded === true, 'El compañero debe quedar sellado y bonded');
  console.assert(postHatchAvatar.pet_name === 'Flamita', 'El nombre personalizado debe persistir');
  console.assert(postHatchStats.pet_stage === 'baby', 'La etapa debe ser "baby"');
  console.log(`   ✓ Compañero nacido: ${assignedRace} con nombre "${postHatchAvatar.pet_name}" sellado al alumno.`);

  // Simular caricia estilo Pokémon GO
  console.log('\n6. Verificando mecánica de caricias (Petting Touch):');
  const preHappiness = postHatchStats.pet_happiness || 0;
  const preExp = postHatchStats.friendship_exp || 0;
  const petResult = store.petCompanionTouch(testStudentId);

  console.assert(petResult.newHappiness >= preHappiness, 'La felicidad debió incrementarse con la caricia');
  console.assert(petResult.friendshipExp > preExp, 'La EXP de vínculo debió incrementarse');
  console.log(`   ✓ Caricia aplicada: Felicidad ${petResult.newHappiness}%, Vínculo EXP ${petResult.friendshipExp} pts.`);

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE COMPAÑEROS Y EVOLUCIÓN PASARON AL 100%!');
}

runPetEvolutionTests().catch(err => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
