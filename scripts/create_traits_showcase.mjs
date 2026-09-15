import sharp from 'sharp';
import path from 'path';

const artifactsDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';

async function createShowcase() {
  const items = [
    { file: 'final_female_cat_ears.png', label: 'Femenino - Orejas de Gato' },
    { file: 'final_female_elf_long.png', label: 'Femenino - Elfo Boreal' },
    { file: 'final_female_crystal_crown.png', label: 'Femenino - Corona Rúnica' },
    { file: 'final_male_wolf_ears.png', label: 'Masculino - Lobo Tormentas' },
    { file: 'final_male_demon_horns.png', label: 'Masculino - Cuernos Gárgola' },
    { file: 'final_male_angel_halo.png', label: 'Masculino - Aureola Sagrada' },
    { file: 'final_neutral_bunny_ears.png', label: 'Neutro - Orejitas Conejo' },
    { file: 'final_neutral_merfolk_fins.png', label: 'Neutro - Aletas Sirena' },
    { file: 'final_neutral_cosmic_antennae.png', label: 'Neutro - Antenas Cósmicas' }
  ];

  // Crop each image around the head area (left: 227, top: 160, width: 480, height: 480)
  const croppedBuffers = [];
  for (const it of items) {
    const p = path.join(artifactsDir, it.file);
    const cropped = await sharp(p)
      .extract({ left: 227, top: 160, width: 480, height: 480 })
      .resize(320, 320)
      .toBuffer();
    croppedBuffers.push(cropped);
  }

  // 3x3 Grid: 3 columns x 3 rows = 960 x 960
  const compositeList = [];
  for (let i = 0; i < croppedBuffers.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    compositeList.push({
      input: croppedBuffers[i],
      left: col * 320,
      top: row * 320
    });
  }

  await sharp({
    create: {
      width: 960,
      height: 960,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  })
    .composite(compositeList)
    .png()
    .toFile(path.join(artifactsDir, 'rasgos_cel_shaded_showcase.png'));

  console.log('Showcase generated: rasgos_cel_shaded_showcase.png');
}

createShowcase().catch(console.error);
