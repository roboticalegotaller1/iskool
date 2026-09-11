import { 
  AVATAR_HAIRSTYLES,
  AVATAR_HAIR_COLORS,
  AVATAR_SKIN_TONES,
  AVATAR_EYES_STYLES,
  AVATAR_RACE_FEATURES,
  AVATAR_CLOTHING_ITEMS
} from '../src/components/avatar/avatarCustomizationTypes';

function runTests() {
  console.log('=== INICIANDO VALIDACIÓN DEL SISTEMA DE AVATARES MODULARES ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Validar al menos 15 opciones por rasgo
  assert(AVATAR_HAIRSTYLES.length >= 15, `Cabellos: ${AVATAR_HAIRSTYLES.length} estilos disponibles (requerido >= 15)`);
  assert(AVATAR_HAIR_COLORS.length >= 15, `Colores de cabello: ${AVATAR_HAIR_COLORS.length} colores disponibles (requerido >= 15)`);
  assert(AVATAR_SKIN_TONES.length >= 15, `Tonos de piel: ${AVATAR_SKIN_TONES.length} tonos inclusivos/fantasía (requerido >= 15)`);
  assert(AVATAR_EYES_STYLES.length >= 15, `Ojos y expresiones: ${AVATAR_EYES_STYLES.length} opciones disponibles (requerido >= 15)`);
  assert(AVATAR_RACE_FEATURES.length >= 15, `Orejas, razas y rasgos míticos: ${AVATAR_RACE_FEATURES.length} opciones disponibles (requerido >= 15)`);

  // 2. Validar categorías de ropa en la tienda
  const categories = ['shoes', 'bottom', 'top', 'outerwear', 'hat', 'accessory'];
  categories.forEach(cat => {
    const count = AVATAR_CLOTHING_ITEMS.filter(item => item.category === cat).length;
    assert(count >= 3, `Categoría de vestuario '${cat}': ${count} prendas/artículos disponibles`);
  });

  // 3. Validar ropa inicial genérica básica con costo 0
  const defaultItems = AVATAR_CLOTHING_ITEMS.filter(item => item.isDefault);
  assert(defaultItems.length >= 3, `Prendas básicas iniciales (precio 0): ${defaultItems.length} prendas`);
  const topBasic = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'top_basic');
  const bottomBasic = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'bottom_basic');
  const shoesBasic = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'shoes_basic');
  assert(!!topBasic && topBasic.price === 0, 'Playera básica inicial cuesta 0 monedas');
  assert(!!bottomBasic && bottomBasic.price === 0, 'Pantalón básico inicial cuesta 0 monedas');
  assert(!!shoesBasic && shoesBasic.price === 0, 'Zapatos básicos iniciales cuestan 0 monedas');

  // 4. Validar objetos de referencia de Bruja / Mago (Varita, Grimorio, Sombrero cónico, Capa)
  const witchHat = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'hat_witch');
  const wandBook = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'acc_wand_and_book');
  const witchCloak = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'outerwear_witch_cloak');
  const witchSkirt = AVATAR_CLOTHING_ITEMS.find(item => item.id === 'bottom_witch_skirt');
  assert(!!witchHat, 'Existe sombrero cónico de bruja con lazo');
  assert(!!wandBook, 'Existe combo de varita mágica con grimorio y rayos arcanos');
  assert(!!witchCloak, 'Existe capa de bruja con lazo');
  assert(!!witchSkirt, 'Existe falda plisada de bruja con medias');

  console.log(`\n=== RESUMEN DE PRUEBAS: ${passed} PASADAS, ${failed} FALLADAS ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
