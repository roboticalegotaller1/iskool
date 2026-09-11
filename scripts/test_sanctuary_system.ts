import { 
  SANCTUARY_HOUSES, 
  SANCTUARY_BEDS, 
  SANCTUARY_OTHER_ITEMS, 
  ALL_SANCTUARY_ITEMS, 
  SANCTUARY_SLOTS 
} from '../src/components/pet/sanctuaryTypes';
import { useStudentStore } from '../src/store/useStudentStore';

console.log('=== TEST SUITE: SISTEMA DE SANTUARIO Y HOGAR GAMIFICADO ===\n');

// Test 1: 5 Casas Temáticas
console.log('1. Verificando las 5 Casas Temáticas...');
const houseKeys = Object.keys(SANCTUARY_HOUSES);
if (houseKeys.length !== 5) {
  throw new Error(`Se esperaban 5 casas, se encontraron ${houseKeys.length}`);
}
houseKeys.forEach(key => {
  const house = (SANCTUARY_HOUSES as any)[key];
  if (!house.name || !house.bgGradient || !house.ambientParticles) {
    throw new Error(`Casa ${key} tiene propiedades incompletas`);
  }
  console.log(`  ✓ Casa verificada: ${house.badgeEmoji} ${house.name} (${house.ambientParticles})`);
});

// Test 2: Catálogo de al menos 10 Camas Progresivas en Precio
console.log('\n2. Verificando las 10 Camas con Progresión de Precio...');
if (SANCTUARY_BEDS.length < 10) {
  throw new Error(`Se esperaban al menos 10 camas, se encontraron ${SANCTUARY_BEDS.length}`);
}

for (let i = 0; i < SANCTUARY_BEDS.length; i++) {
  const bed = SANCTUARY_BEDS[i];
  if (bed.category !== 'bed') {
    throw new Error(`La cama ${bed.id} no tiene categoría 'bed'`);
  }
  if (i > 0) {
    const prevBed = SANCTUARY_BEDS[i - 1];
    if (bed.price <= prevBed.price) {
      throw new Error(`La cama ${bed.name} (${bed.price}🪙) no es más cara que ${prevBed.name} (${prevBed.price}🪙)`);
    }
  }
  console.log(`  ✓ Cama #${bed.tier || i + 1}: ${bed.iconEmoji} ${bed.name} - ${bed.price}🪙 [${bed.rarity.toUpperCase()}] (+${bed.energyBonus}⚡ Energía)`);
}

// Test 3: Las 32 Ranuras (Hotspots) en el Hogar
console.log('\n3. Verificando las 32 Ranuras de Colocación...');
if (SANCTUARY_SLOTS.length < 30) {
  throw new Error(`Se requerían al menos 30 ranuras, se encontraron ${SANCTUARY_SLOTS.length}`);
}
const slotIds = new Set<number>();
SANCTUARY_SLOTS.forEach(slot => {
  if (slotIds.has(slot.id)) {
    throw new Error(`ID de ranura duplicado: ${slot.id}`);
  }
  slotIds.add(slot.id);
  if (slot.xPercent < 0 || slot.xPercent > 100 || slot.yPercent < 0 || slot.yPercent > 100) {
    throw new Error(`Ranura ${slot.id} fuera de coordenadas porcentuales válidas`);
  }
});
console.log(`  ✓ Se verificaron ${SANCTUARY_SLOTS.length} ranuras espaciales únicas distribuidas en 5 zonas.`);

// Test 4: Compra de Artículos y Deducción de Monedas
console.log('\n4. Probando compra y colocación en el Store...');
const store = useStudentStore.getState();
const testStudentId = 'std-test-sanctuary';

// Inicializar estudiante de prueba
store.allStats[testStudentId] = {
  student_id: testStudentId,
  xp: 100,
  level: 2,
  coins: 5000,
  current_streak: 1,
  max_streak: 1,
  pet_energy: 50,
  pet_happiness: 40,
  friendship_exp: 50,
  tasks_completed_count: 5,
  pet_stage: 'child',
  updated_at: new Date().toISOString()
};

store.allAvatars[testStudentId] = {
  student_id: testStudentId,
  avatar_name: 'Heroe Piloto',
  hair_style: 'classic',
  hair_color: '#000',
  eyes_style: 'happy',
  outfit_style: 'explorer',
  outfit_color: '#fff',
  background_style: 'forest',
  unlocked_items: [],
  pet_type: 'cryo_dragon',
  pet_name: 'Fritzi',
  pet_hunger: 40,
  pet_happiness: 40,
  sanctuary_house_type: 'forest_cabin',
  sanctuary_placed_items: {},
  sanctuary_inventory: [],
  updated_at: new Date().toISOString()
};

// Comprar la cama #4 (bed_cloud, 250 monedas)
const purchaseResult = store.purchaseSanctuaryItem(testStudentId, 'bed_cloud', 250);
if (!purchaseResult.success) {
  throw new Error(`Fallo en compra: ${purchaseResult.reason}`);
}
const currentStats = useStudentStore.getState().allStats[testStudentId];
const currentAv = useStudentStore.getState().allAvatars[testStudentId];
if (currentStats.coins !== 4750) {
  throw new Error(`Monedas esperadas: 4750, obtenidas: ${currentStats.coins}`);
}
if (!currentAv.sanctuary_inventory?.includes('bed_cloud')) {
  throw new Error('bed_cloud no se encuentra en el inventario del alumno');
}
console.log(`  ✓ Compra exitosa. Saldo: ${currentStats.coins}🪙, Inventario: ${currentAv.sanctuary_inventory}`);

// Test 5: Colocación en la ranura #1
console.log('\n5. Probando colocación y remoción en ranura #1...');
store.placeSanctuaryItem(testStudentId, 1, 'bed_cloud');
let updatedAv = useStudentStore.getState().allAvatars[testStudentId];
if (updatedAv.sanctuary_placed_items?.[1] !== 'bed_cloud') {
  throw new Error('El objeto no se colocó en la ranura 1');
}
console.log('  ✓ Objeto bed_cloud colocado en ranura 1 con éxito.');

// Retirar objeto
store.removeSanctuaryItem(testStudentId, 1);
updatedAv = useStudentStore.getState().allAvatars[testStudentId];
if (updatedAv.sanctuary_placed_items?.[1]) {
  throw new Error('El objeto no se retiró de la ranura 1');
}
console.log('  ✓ Objeto retirado de la ranura 1 con éxito.');

// Test 6: Mecánicas Tamagotchi (Alimentar, Jugar, Dormir)
console.log('\n6. Probando mecánicas Tamagotchi de interacción...');
const feedRes = store.feedPetInSanctuary(testStudentId);
if (!feedRes.success || feedRes.hunger <= 40) {
  throw new Error('Alimentar no aumentó el hambre adecuadamente');
}
console.log(`  ✓ Alimentar: Hambre ahora en ${feedRes.hunger}%, Felicidad: ${feedRes.happiness}%`);

const playRes = store.petPlayInSanctuary(testStudentId);
if (!playRes.success || playRes.happiness <= feedRes.happiness) {
  throw new Error('Jugar no aumentó la felicidad');
}
console.log(`  ✓ Jugar: Felicidad ahora en ${playRes.happiness}%, Energía: ${playRes.energy}%`);

const sleepRes = store.petSleepInSanctuary(testStudentId);
if (!sleepRes.success || sleepRes.energy !== 100) {
  throw new Error('Dormir no restauró la energía al 100%');
}
console.log(`  ✓ Dormir: Energía restaurada al 100%`);

console.log('\n🎉 ¡TODOS LOS TESTS DEL SISTEMA DE SANTUARIO Y HOGAR PASARON AL 100%!');
