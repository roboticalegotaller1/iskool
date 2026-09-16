import { DEFAULT_ARTIFACTS_SEED } from './src/store/seeds';
import { ShopArtifact } from './src/types';

console.log('================================================================');
console.log('🧪 VERIFICACIÓN DEL CATÁLOGO DE ARTEFACTOS DE PRODUCCIÓN');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

// 1. Verificar cantidad de artefactos
assert(DEFAULT_ARTIFACTS_SEED.length >= 14, 'El catálogo contiene al menos 14 artefactos de producción', `Total: ${DEFAULT_ARTIFACTS_SEED.length}`);

// 2. Verificar que todos tienen categorías válidas
const categories = ['rpg_combat', 'academic_challenges', 'progression_economy', 'sanctuary_companions', 'avatar_cosmetics'];
const allCategorized = DEFAULT_ARTIFACTS_SEED.every(a => a.category && categories.includes(a.category));
assert(allCategorized, 'Todos los artefactos tienen una categoría válida asignada');

// 3. Verificar que todos tienen rareza
const rarities = ['common', 'rare', 'epic', 'legendary'];
const allRarities = DEFAULT_ARTIFACTS_SEED.every(a => a.rarity && rarities.includes(a.rarity));
assert(allRarities, 'Todos los artefactos tienen una rareza válida (common, rare, epic, legendary)');

// 4. Verificar balance económico (precios razonables entre 15 y 300 monedas)
const allPricedFairly = DEFAULT_ARTIFACTS_SEED.every(a => a.price >= 15 && a.price <= 300);
assert(allPricedFairly, 'Los precios están balanceados entre 15 y 300 monedas');

// 5. Verificar presencia de artefactos clave de ISkool
const hpPotion = DEFAULT_ARTIFACTS_SEED.find(a => a.id === 'art-hp-potion');
assert(!!hpPotion && hpPotion.mechanic === 'heal_50', 'Poción de Vigor Intelectual (+50 HP) presente');

const runicShield = DEFAULT_ARTIFACTS_SEED.find(a => a.id === 'art-runic-shield');
assert(!!runicShield && runicShield.mechanic === 'shield_50', 'Escudo Rúnico de Concentración (Mitiga 50%) presente');

const aiLens = DEFAULT_ARTIFACTS_SEED.find(a => a.id === 'art-ai-lens');
assert(!!aiLens && aiLens.mechanic === 'ai_hint', 'Monóculo del Asistente Pedagógico IA presente');

const streakFreeze = DEFAULT_ARTIFACTS_SEED.find(a => a.id === 'art-streak-freeze');
assert(!!streakFreeze && streakFreeze.mechanic === 'streak_freeze', 'Amuleto de Fuego Fatuo (Protector de Racha) presente');

const doubleXp = DEFAULT_ARTIFACTS_SEED.find(a => a.id === 'art-double-xp-scroll');
assert(!!doubleXp && doubleXp.mechanic === 'double_xp', 'Pergamino del Doble Saber (2x XP) presente');

const scholarCrown = DEFAULT_ARTIFACTS_SEED.find(a => a.id === 'art-scholar-crown');
assert(!!scholarCrown && scholarCrown.category === 'avatar_cosmetics', 'Corona del Erudito de Oro (Cosmético Avatar) presente');

console.log('\n================================================================');
console.log(`📊 RESULTADOS: ${passed}/${total} pruebas aprobadas (${((passed/total)*100).toFixed(1)}%)`);
console.log('================================================================');
