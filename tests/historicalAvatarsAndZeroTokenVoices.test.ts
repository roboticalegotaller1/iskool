// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CHARACTER_3D_RIGS } from '@/components/languages/HumanGesticulatingAvatar';
import { ConcreteAvatarGesture } from '@/components/common/NanoBananaLipSyncCanvas';
import {
  getHistoricalMouthConfig,
  HISTORICAL_VOICE_MATRIX,
  NARRATOR_VOICE_PROFILES,
  normalizeLatinHistoricalPhonetics,
} from '@/lib/historicalVoiceEngine';
import { parseHistoricalMarkdown } from '@/lib/historicalVaultEngine';
import { normalizeMexicanSpanishText } from '@/lib/audio/lexicalNormalizer';
import {
  NEURAL_VOICES,
  EDGE_TTS_ACTIVE_LATIN_VOICES,
  resolveCertifiedPlatformVoice,
} from '@/app/api/ai/tts/route';
import { NATURAL_FEMALE_SPANISH_VOICES } from '@/lib/redisenosVoiceTTS';
import { buildDynamicHistoricalFigureData } from '@/data/mexicanIndependenceStudioFlow';

const ALL_11_ACTIVE_MOVEMENTS: ConcreteAvatarGesture[] = [
  'welcome',
  'wave',
  'explain',
  'point',
  'pronounce',
  'inquire',
  'think',
  'exclaim',
  'celebrate',
  'encourage',
  'calm',
];

const ALL_12_MOVEMENTS: ConcreteAvatarGesture[] = [
  ...ALL_11_ACTIVE_MOVEMENTS,
  'listen',
];

describe('🎭 AVATARES HISTÓRICOS, LANDMARKS 1024PX Y VOCES NEURONALES DE 0 TOKENS', () => {
  it('1. Todos los 9 rigs 3D tienen poses .webp < 300KB, los 108 clips .mp4 > 25KB y landmarks anatómicos válidos', () => {
    const rigKeys = [
      'claire',
      'arthur',
      'shakespeare',
      'ada_lovelace',
      'abraham_lincoln',
      'napoleon',
      'marie_curie',
      'victor_hugo',
      'jeanne_darc',
    ];
    const all108Mp4Paths = new Set<string>();

    for (const key of rigKeys) {
      const rig = CHARACTER_3D_RIGS[key];
      expect(rig, `Rig faltante: ${key}`).toBeDefined();

      // Poses WebP (< 300 KB) incluyendo idle, blink y las 12 poses
      const webpPaths = new Set<string>([rig.idle]);
      for (const mov of ALL_12_MOVEMENTS) {
        expect(rig.poseCompendium[mov], `${key}.poseCompendium.${mov}`).toBeTruthy();
        webpPaths.add(rig.poseCompendium[mov]!);
      }
      expect(rig.poseCompendium.blink, `${key}.poseCompendium.blink`).toBeTruthy();
      webpPaths.add(rig.poseCompendium.blink!);

      for (const rel of webpPaths) {
        expect(rel.endsWith('.webp'), `${rel} debe estar comprimido en WebP`).toBe(true);
        const abs = path.join(process.cwd(), 'public', rel.replace(/^\//, ''));
        expect(fs.existsSync(abs), `Falta WebP: ${rel}`).toBe(true);
        const sizeKb = fs.statSync(abs).size / 1024;
        expect(sizeKb, `WebP excede 300KB: ${rel} (${sizeKb.toFixed(1)}KB)`).toBeLessThan(300);
      }

      // 12 videos MP4 (talkMovie + 11 gestureMovies) > 25 KB
      const mp4Paths = new Set<string>([rig.talkMovie]);
      for (const mov of ALL_11_ACTIVE_MOVEMENTS) {
        const movMp4 = rig.gestureMovies?.[mov];
        expect(movMp4, `${key}.gestureMovies.${mov}`).toBeTruthy();
        mp4Paths.add(movMp4!);
      }
      expect(mp4Paths.size).toBe(12);

      for (const rel of mp4Paths) {
        const abs = path.join(process.cwd(), 'public', rel.replace(/^\//, ''));
        expect(fs.existsSync(abs), `Falta MP4: ${rel}`).toBe(true);
        expect(fs.statSync(abs).size, `MP4 demasiado pequeño: ${rel}`).toBeGreaterThan(25_000);
        all108Mp4Paths.add(rel);
      }

      // Landmarks sub-píxel en espacio 1024x1024
      const cfg = getHistoricalMouthConfig(key);
      expect(cfg.leftEyeX).toBeDefined();
      expect(cfg.rightEyeX).toBeDefined();
      expect(cfg.eyeY).toBeDefined();
      expect(cfg.chinY).toBeDefined();
      expect(cfg.leftEyeX!).toBeLessThan(cfg.cx);
      expect(cfg.cx).toBeLessThan(cfg.rightEyeX!);
      expect(cfg.eyeY!).toBeLessThan(cfg.y1);
      expect(cfg.y1).toBeLessThan(cfg.chinY!);
      expect(cfg.x1).toBeLessThan(cfg.cx);
      expect(cfg.cx).toBeLessThan(cfg.x2);
    }

    expect(all108Mp4Paths.size).toBe(108);
  });

  it('2. Los 22 archivos de Bóveda, Leona Vicario y personaje genérico cumplen retrato, landmarks, películas MP4 y bandera isGeographicSite', () => {
    const vaultDir = path.join(process.cwd(), 'personajes_historicos');
    const mdFiles = fs.readdirSync(vaultDir).filter((f) => f.endsWith('.md')).sort();
    expect(mdFiles.length).toBe(22);

    const genericCfg = getHistoricalMouthConfig('generic_fallback_unregistered_character');
    const movieStems = new Set<string>();
    const humanPortraitIds: string[] = [];

    for (const file of mdFiles) {
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(vaultDir, file), 'utf8');
      const parsed = parseHistoricalMarkdown(raw, slug);

      if (slug === 'santiago_de_queretaro') {
        expect(parsed.isGeographicSite).toBe(true);
        // Enclave geográfico: NO debe existir película facial
        expect(fs.existsSync(path.join(process.cwd(), 'public/images/history/movies/santiago_de_queretaro_calm.mp4'))).toBe(false);
        expect(fs.existsSync(path.join(process.cwd(), 'public/images/history/movies/santiago_de_queretaro_talk.mp4'))).toBe(false);
        continue;
      }

      expect(parsed.isGeographicSite, `${slug} es persona histórica`).toBe(false);
      humanPortraitIds.push(slug);

      // Retrato en public/
      const absPortrait = path.join(process.cwd(), 'public', parsed.avatarImageUrl.replace(/^\//, ''));
      expect(fs.existsSync(absPortrait), `Falta retrato de ${slug}: ${parsed.avatarImageUrl}`).toBe(true);

      // Config facial calibrada específicamente (no fallback genérico silencioso)
      const cfg = getHistoricalMouthConfig(slug);
      expect(cfg.leftEyeX, `${slug} leftEyeX definido`).toBeDefined();
      expect(cfg.rightEyeX, `${slug} rightEyeX definido`).toBeDefined();
      expect(cfg.eyeY, `${slug} eyeY definido`).toBeDefined();
      expect(cfg.chinY, `${slug} chinY definido`).toBeDefined();
      expect(cfg.leftEyeX!, `${slug} leftEyeX < cx`).toBeLessThan(cfg.cx);
      expect(cfg.rightEyeX!, `${slug} rightEyeX > cx`).toBeGreaterThan(cfg.cx);
      expect(cfg.eyeY!, `${slug} eyeY < y1`).toBeLessThan(cfg.y1);
      expect(cfg.y1, `${slug} y1 < chinY`).toBeLessThan(cfg.chinY!);
      expect(
        cfg.cx === genericCfg.cx && cfg.y1 === genericCfg.y1 && cfg.leftEyeX === genericCfg.leftEyeX,
        `${slug} no debe depender del fallback genérico`
      ).toBe(false);

      const baseName = path.basename(parsed.avatarImageUrl);
      const stem = baseName.replace(/_avatar\.(png|webp|jpg|jpeg)$/i, '');
      movieStems.add(stem);
    }

    expect(humanPortraitIds.length).toBe(21);

    // Leona Vicario (< 300KB WebP dedicado + MP4s + calibración)
    const leonaWebpPath = path.join(process.cwd(), 'public/images/history/leona_vicario_avatar.webp');
    expect(fs.existsSync(leonaWebpPath)).toBe(true);
    expect(fs.statSync(leonaWebpPath).size / 1024).toBeLessThan(300);
    const leonaCfg = getHistoricalMouthConfig('leona_vicario');
    expect(leonaCfg.cx).not.toBe(genericCfg.cx);
    expect(leonaCfg.eyeY).toBeDefined();
    expect(leonaCfg.eyeY!).toBeLessThan(leonaCfg.y1);
    movieStems.add('leona_vicario');

    // Personaje genérico fallback
    const genericImgPath = path.join(process.cwd(), 'public/images/history/personaje_generico_avatar.png');
    expect(fs.existsSync(genericImgPath)).toBe(true);
    expect(genericCfg.leftEyeX).toBeDefined();
    expect(genericCfg.rightEyeX).toBeDefined();
    expect(genericCfg.leftEyeX!).toBeLessThan(genericCfg.cx);
    expect(genericCfg.cx).toBeLessThan(genericCfg.rightEyeX!);
    movieStems.add('personaje_generico');

    // 23 retratos humanos x 2 clips = 46 archivos MP4 válidos (> 20 KB)
    expect(movieStems.size).toBe(23);
    const moviesDir = path.join(process.cwd(), 'public/images/history/movies');
    const mp4Files = fs.readdirSync(moviesDir).filter((f) => f.endsWith('.mp4'));
    expect(mp4Files.length).toBe(46);

    for (const stem of movieStems) {
      for (const kind of ['calm', 'talk']) {
        const mp4Path = path.join(moviesDir, `${stem}_${kind}.mp4`);
        expect(fs.existsSync(mp4Path), `Falta película histórica: ${stem}_${kind}.mp4`).toBe(true);
        expect(fs.statSync(mp4Path).size, `Película muy pequeña: ${stem}_${kind}.mp4`).toBeGreaterThan(20_000);
      }
    }

    // Flujo custom de estudio apunta a personaje_generico_avatar.png (no a Hidalgo), y Leona Vicario a su retrato WebP
    const customFallback = buildDynamicHistoricalFigureData('Heroína Desconocida de Prueba', 0, false);
    expect(customFallback.avatarImageUrl).toBe('/images/history/personaje_generico_avatar.png');
    const leonaFlow = buildDynamicHistoricalFigureData('Leona Vicario', 0, false);
    expect(leonaFlow.avatarImageUrl).toBe('/images/history/leona_vicario_avatar.webp');
  });

  it('3. Cero voces castellanas es-ES y cero es-PE-CamilaNeural activas en catálogos, API TTS y worker', () => {
    // 3.1 Catálogos exportados
    for (const v of NEURAL_VOICES) {
      expect(v.id).not.toMatch(/^es-ES-/i);
      expect(v.id).not.toBe('es-PE-CamilaNeural');
    }

    expect(EDGE_TTS_ACTIVE_LATIN_VOICES.has('es-PE-CamilaNeural')).toBe(false);
    for (const vId of EDGE_TTS_ACTIVE_LATIN_VOICES) {
      expect(vId).not.toMatch(/^es-ES-/i);
    }

    for (const options of Object.values(HISTORICAL_VOICE_MATRIX)) {
      for (const opt of options) {
        expect(opt.id).not.toMatch(/^es-ES-/i);
        expect(opt.id).not.toBe('es-PE-CamilaNeural');
      }
    }

    for (const prof of Object.values(NARRATOR_VOICE_PROFILES)) {
      expect(prof.voiceId).not.toMatch(/^es-ES-/i);
      expect(prof.voiceId).not.toBe('es-PE-CamilaNeural');
    }

    for (const v of NATURAL_FEMALE_SPANISH_VOICES) {
      expect(v.id).not.toMatch(/^es-ES-/i);
      expect(v.id).not.toBe('es-PE-CamilaNeural');
    }

    // 3.2 Resolución segura en tiempo de ejecución
    expect(resolveCertifiedPlatformVoice('es-PE-CamilaNeural', 'es', 'female').voice).toBe('es-CR-MariaNeural');
    expect(resolveCertifiedPlatformVoice('es-ES-ElviraNeural', 'es', 'female').voice).toBe('es-MX-DaliaNeural');
    expect(resolveCertifiedPlatformVoice('es-ES-AlvaroNeural', 'es', 'male').voice).toBe('es-MX-JorgeNeural');

    // 3.3 Auditoría de archivos fuente críticos
    const filesToCheck = [
      'src/lib/historicalVoiceEngine.ts',
      'src/app/api/ai/tts/route.ts',
      'src/lib/serverNeuralTts.ts',
      'src/components/admin/SofiaCopilotConsole.tsx',
      'src/lib/redisenosVoiceTTS.ts',
      'scripts/neural_tts_worker.py',
    ];
    for (const rel of filesToCheck) {
      const content = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
      expect(content, `${rel} contiene voz es-ES-`).not.toMatch(/es-ES-[A-Za-z]+Neural/);
      // Sólo se permite la clave de redirección/intercepción en lowercase ('es-pe-camilaneural'), jamás como destino activo
      expect(content, `${rel} aún asigna es-PE-CamilaNeural`).not.toContain('es-PE-CamilaNeural');
    }

    // Frontmatter de Bóveda libre de voces es-ES o CamilaNeural
    const vaultDir = path.join(process.cwd(), 'personajes_historicos');
    for (const f of fs.readdirSync(vaultDir).filter((x) => x.endsWith('.md'))) {
      const md = fs.readFileSync(path.join(vaultDir, f), 'utf8');
      expect(md, `${f} usa voz es-ES`).not.toMatch(/voiceId:\s*["']?es-ES-/i);
      expect(md, `${f} usa CamilaNeural`).not.toContain('es-PE-CamilaNeural');
    }
  });

  it('4. Normalización léxica y fonética preserva "patria" limpia y expande fechas mexicanas correctamente', () => {
    const sample = 'Defendí con honor la soberanía de nuestra Patria y la patria libre el 16 de septiembre de 1810.';
    const normalized = normalizeMexicanSpanishText(sample);
    const phonetic = normalizeLatinHistoricalPhonetics(sample);

    expect(normalized).toContain('Patria');
    expect(normalized).toContain('patria');
    expect(normalized).not.toMatch(/t-ria|pátria/i);
    expect(normalized).toContain('dieciséis de septiembre de mil ochocientos diez');

    expect(phonetic).toContain('Patria');
    expect(phonetic).toContain('patria');
    expect(phonetic).not.toMatch(/t-ria|pátria/i);
  });
});
