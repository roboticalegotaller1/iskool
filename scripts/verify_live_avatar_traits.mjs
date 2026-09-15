import puppeteer from 'puppeteer';
import path from 'path';

const artifactsDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';

async function verifyLiveAvatarTraits() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Logging in student session...');
  await page.goto('http://localhost:3000/login');
  await page.evaluate(() => {
    const student = {
      id: 'std-pa',
      first_name: 'Lucas',
      last_name: 'Skywalker',
      role: 'student',
      email: 'lucas@iskool.edu.mx',
      school_id: 'sch-test-case',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('iskool_session_user', JSON.stringify(student));
  });

  console.log('Navigating to avatar customizer...');
  await page.goto('http://localhost:3000/student/avatar', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Remove equipped hat so head features are fully visible
  console.log('Selecting HATS category to remove hat...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hatsCatBtn = buttons.find(b => b.textContent && b.textContent.includes('HATS'));
    if (hatsCatBtn) hatsCatBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const noHatBtn = buttons.find(b => b.textContent && (b.textContent.includes('Sin') || b.textContent.includes('Desarmado') || b.textContent.includes('Ninguno')));
    if (noHatBtn) {
      noHatBtn.click();
    } else {
      // Click first wardrobe item in grid
      const gridItems = document.querySelectorAll('.grid button');
      if (gridItems.length > 0) gridItems[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // 2. Return to APPEARANCE
  console.log('Returning to APPEARANCE category...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const appBtn = buttons.find(b => b.textContent && b.textContent.includes('APPEARANCE'));
    if (appBtn) appBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Helper to click subtabs (Piel, Pelo, Color, Ojos, Rasgos, Cuerpo)
  async function clickSubTab(tabName) {
    await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes(name));
      if (btn) btn.click();
    }, tabName);
    await new Promise(r => setTimeout(r, 500));
  }

  // Helper to set zoom mode
  async function setZoom(mode) {
    await page.evaluate((targetMode) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const zoomBtn = buttons.find(b => b.textContent && (b.textContent.includes('Enfocar Rostro') || b.textContent.includes('Cuerpo Entero')));
      if (zoomBtn) {
        const isFull = zoomBtn.textContent.includes('Enfocar Rostro');
        if ((targetMode === 'face' && isFull) || (targetMode === 'full' && !isFull)) {
          zoomBtn.click();
        }
      }
    }, mode);
    await new Promise(r => setTimeout(r, 600));
  }

  // Helper to select gender
  async function selectGender(genderName) {
    await clickSubTab('Cuerpo');
    await page.evaluate((gName) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes(gName));
      if (btn) btn.click();
    }, genderName);
    await new Promise(r => setTimeout(r, 600));
  }

  // Helper to select race trait
  async function selectRaceTrait(traitName) {
    await clickSubTab('Rasgos');
    await page.evaluate((tName) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes(tName));
      if (btn) {
        btn.scrollIntoView({ behavior: 'instant', block: 'center' });
        btn.click();
      }
    }, traitName);
    await new Promise(r => setTimeout(r, 800));
  }

  // Helper to capture avatar container
  async function captureAvatar(filename) {
    // Find avatar container div
    const avatarEl = await page.$('.neon-hero-contour') || await page.$('canvas');
    if (avatarEl) {
      await avatarEl.screenshot({ path: path.join(artifactsDir, filename) });
    } else {
      await page.screenshot({ path: path.join(artifactsDir, filename) });
    }
    console.log(`Captured: ${filename}`);
  }

  // Focus Face first
  await setZoom('face');

  // Test suite covering all 3 genders and key fantasy traits
  const testCases = [
    // FEMENINO
    { gender: 'Femenino', trait: 'Orejas de Gato', zoom: 'face', file: 'final_female_cat_ears.png' },
    { gender: 'Femenino', trait: 'Elfo Boreal (Largas)', zoom: 'face', file: 'final_female_elf_long.png' },
    { gender: 'Femenino', trait: 'Elfo Ágil (Cortas)', zoom: 'face', file: 'final_female_elf_short.png' },
    { gender: 'Femenino', trait: 'Cuernos de Dragón', zoom: 'face', file: 'final_female_dragon_horns.png' },
    { gender: 'Femenino', trait: 'Corona Rúnica', zoom: 'face', file: 'final_female_crystal_crown.png' },
    { gender: 'Femenino', trait: 'Tatuajes Rúnicos', zoom: 'face', file: 'final_female_rune_tattoo.png' },
    { gender: 'Femenino', trait: 'Alas Minis de Hada', zoom: 'full', file: 'final_female_fairy_wings.png' },

    // MASCULINO
    { gender: 'Masculino', trait: 'Lobo de las Tormentas', zoom: 'face', file: 'final_male_wolf_ears.png' },
    { gender: 'Masculino', trait: 'Cuernitos de Gárgola', zoom: 'face', file: 'final_male_demon_horns.png' },
    { gender: 'Masculino', trait: 'Astas de Ciervo', zoom: 'face', file: 'final_male_stag_antlers.png' },
    { gender: 'Masculino', trait: 'Elfo Boreal (Largas)', zoom: 'face', file: 'final_male_elf_long.png' },
    { gender: 'Masculino', trait: 'Aureola Sagrada', zoom: 'face', file: 'final_male_angel_halo.png' },

    // NEUTRO
    { gender: 'Neutro', trait: 'Orejitas de Conejo', zoom: 'face', file: 'final_neutral_bunny_ears.png' },
    { gender: 'Neutro', trait: 'Aletas Acuáticas', zoom: 'face', file: 'final_neutral_merfolk_fins.png' },
    { gender: 'Neutro', trait: 'Antenas Cósmicas', zoom: 'face', file: 'final_neutral_cosmic_antennae.png' },
    { gender: 'Neutro', trait: 'Orejas de Gato', zoom: 'face', file: 'final_neutral_cat_ears.png' }
  ];

  for (const tc of testCases) {
    console.log(`Testing ${tc.gender} - ${tc.trait} (Zoom: ${tc.zoom})...`);
    await setZoom(tc.zoom);
    await selectGender(tc.gender);
    await selectRaceTrait(tc.trait);
    await captureAvatar(tc.file);
  }

  await browser.close();
  console.log('All live tests completed successfully!');
}

verifyLiveAvatarTraits().catch(console.error);
