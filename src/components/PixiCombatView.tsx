"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useCoopStore, PartyAction } from '@/store/useCoopStore';
import { useStudentStore } from '@/store/useStudentStore';

export interface DragonEnemyDef {
  key: string;
  name: string;
  textureUrl: string;
  sparkTextureUrl?: string;
  scaleHeight: number;
  isThunderwing?: boolean;
}

export const DRAGON_ENEMIES_MAP: Record<string, DragonEnemyDef> = {
  blood_dragon: {
    key: 'blood_dragon',
    name: 'Dragón Carmesí de Sangre',
    textureUrl: '/images/rpg/enemies/blood_dragon.png',
    scaleHeight: 210
  },
  glacialserpent: {
    key: 'glacialserpent',
    name: 'Serpiente Glacial del Abismo',
    textureUrl: '/images/rpg/enemies/glacialserpent.png',
    scaleHeight: 185
  },
  thunderwing: {
    key: 'thunderwing',
    name: 'Dragón Rayo Thunderwing',
    textureUrl: '/images/rpg/enemies/thunderwing_drake_nosparks.png',
    sparkTextureUrl: '/images/rpg/enemies/thunderwing_drake_sparks.png',
    scaleHeight: 195,
    isThunderwing: true
  },
  crimson: {
    key: 'crimson',
    name: 'Dragón Voraz Carmesí',
    textureUrl: '/images/rpg/enemies/crimson_dragon.png',
    scaleHeight: 190
  },
  emberheart: {
    key: 'emberheart',
    name: 'Dragón Núcleo de Fuego',
    textureUrl: '/images/rpg/enemies/emberheart_dragon.png',
    scaleHeight: 195
  },
  luminous: {
    key: 'luminous',
    name: 'Dragón Luminoso Solar',
    textureUrl: '/images/rpg/enemies/luminous_dragon.png',
    scaleHeight: 185
  },
  moonshadow: {
    key: 'moonshadow',
    name: 'Dragón Sombra de Luna',
    textureUrl: '/images/rpg/enemies/moonshadow_dragon.png',
    scaleHeight: 190
  }
};

export function getDragonEnemyKey(bossName?: string, enemyType?: string): string {
  if (enemyType && DRAGON_ENEMIES_MAP[enemyType]) {
    return enemyType;
  }
  const nameLower = (bossName || '').toLowerCase();
  if (nameLower.includes('examen') || nameLower.includes('boss') || nameLower.includes('gremio') || nameLower.includes('final')) {
    return 'blood_dragon';
  }
  if (nameLower.includes('matematica') || nameLower.includes('fraccion') || nameLower.includes('calculo') || nameLower.includes('rayo')) {
    return 'thunderwing';
  }
  if (nameLower.includes('ciencia') || nameLower.includes('quimica') || nameLower.includes('fisica') || nameLower.includes('hielo')) {
    return 'glacialserpent';
  }
  if (nameLower.includes('historia') || nameLower.includes('social') || nameLower.includes('fuego')) {
    return 'emberheart';
  }
  if (nameLower.includes('lengua') || nameLower.includes('arte') || nameLower.includes('luz')) {
    return 'luminous';
  }
  if (nameLower.includes('codigo') || nameLower.includes('tech') || nameLower.includes('sombra')) {
    return 'moonshadow';
  }
  return 'crimson';
}

interface PixiCombatViewProps {
  combatState: 'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat';
  volume: number;
  guildBoss: {
    hp_actual: number;
    hp_max: number;
    name: string;
    xp_reward: number;
    enemy_type?: string;
  };
  partyHp: number;
  elenaSub: {
    status: string;
    student_name: string;
  } | undefined;
  playSound: (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => void;
  onAttackFinish: () => void;
  enemyType?: string;
}

const getStudentAvatarUrl = (name: string): string => {
  const firstName = name.split(' ')[0].toLowerCase();
  const validAvatars = ['elena', 'lucas', 'mateo', 'santi'];
  if (validAvatars.includes(firstName)) {
    return `/images/students/${firstName}.png`;
  }
  return '/images/students/default.png';
};

export default function PixiCombatView({
  combatState,
  volume,
  guildBoss,
  partyHp,
  elenaSub,
  playSound,
  onAttackFinish,
  enemyType
}: PixiCombatViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [loading, setLoading] = useState(true);


  // References
  const bossRef = useRef<PIXI.Container | null>(null);
  const bossRedRef = useRef<PIXI.Sprite | null>(null);
  const bossCyanRef = useRef<PIXI.Sprite | null>(null);
  const rootStageRef = useRef<PIXI.Container | null>(null);
  const lasersRef = useRef<PIXI.Graphics | null>(null);
  const shockwaveRef = useRef<PIXI.Graphics | null>(null);

  // Parallax target positions
  const mousePos = useRef({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });

  // Reference for avoiding stale closures in the ticker loop
  const combatStateRef = useRef(combatState);
  useEffect(() => {
    combatStateRef.current = combatState;
  }, [combatState]);

  const guildBossRef = useRef(guildBoss);
  useEffect(() => {
    guildBossRef.current = guildBoss;
  }, [guildBoss]);

  const partyHpRef = useRef(partyHp);
  useEffect(() => {
    partyHpRef.current = partyHp;
  }, [partyHp]);


  // Code/binary floating particles list
  const particles = useRef<Array<{
    text: PIXI.Text;
    vx: number;
    vy: number;
    life: number;
  }>>([]);

  // Turn and pet shield effect tracking
  const turnCountCanvas = useRef(0);
  const lastCombatState = useRef(combatState);
  const petTriggerEffectRef = useRef(false);
  const [petTriggerEffect, setPetTriggerEffect] = useState(false);

  useEffect(() => {
    petTriggerEffectRef.current = petTriggerEffect;
  }, [petTriggerEffect]);

  useEffect(() => {
    const activeStudentId = useStudentStore.getState().activeStudentId;
    const normalizedId = useStudentStore.getState().allStats[activeStudentId] ? activeStudentId : (activeStudentId === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44' ? 'std-prep' : (activeStudentId === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a42' ? 'std-sec' : (activeStudentId === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a01' ? 'std-pa' : activeStudentId)));
    const studentStats = useStudentStore.getState().allStats[normalizedId];
    const petHappiness = studentStats?.pet_happiness ?? 50;

    if (combatState === 'attacking' && lastCombatState.current !== 'attacking') {
      turnCountCanvas.current += 1;
      if (turnCountCanvas.current % 3 === 0 && petHappiness > 80 && appRef.current) {
        setPetTriggerEffect(true);
        setTimeout(() => setPetTriggerEffect(false), 2000);
        
        // Spawn floating text over pet
        const shieldText = new PIXI.Text({
          text: "🛡️ BARRERA MASCOTA (-15% Daño Boss)",
          style: {
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: 'bold',
            fill: 0xC084FC,
            align: 'center'
          }
        });
        shieldText.anchor.set(0.5);
        shieldText.position.set(160, 200);
        appRef.current.stage.addChild(shieldText);
        
        let sY = shieldText.y;
        let sAlpha = 1.0;
        const animateShieldText = () => {
          sY -= 0.5;
          sAlpha -= 0.015;
          shieldText.y = sY;
          shieldText.alpha = sAlpha;
          if (sAlpha <= 0) {
            if (appRef.current) appRef.current.stage.removeChild(shieldText);
            shieldText.destroy();
          } else {
            requestAnimationFrame(animateShieldText);
          }
        };
        animateShieldText();
      }
    }
    lastCombatState.current = combatState;
  }, [combatState]);

  // Screen shake timer
  const shakeTimer = useRef(0);

  // Helper to scale sprites maintaining ratio
  const fitToHeight = (sprite: PIXI.Sprite, targetHeight: number) => {
    if (sprite.texture) {
      const ratio = targetHeight / sprite.texture.height;
      sprite.scale.set(ratio);
    }
  };

  useEffect(() => {
    let active = true;
    let cleanupMouse: (() => void) | null = null;
    let cleanupCoop: (() => void) | null = null;

    const assetsToLoad = [
      '/images/rpg/combat_bg.png',
      '/images/rpg/boss_sprite.png',
      '/images/rpg/ui/Dragonhpbar.png',
      '/images/rpg/ui/DragonHpBar2.png',
      '/images/rpg/ui/DragonHpBar3.png',
      '/images/students/default.png',
      '/images/students/elena.png',
      '/images/students/lucas.png',
      '/images/students/mateo.png',
      '/images/students/santi.png',
      '/images/rpg/santi_sprite.png',
      '/images/rpg/lucas_sprite.png',
      '/images/rpg/elena_sprite.png',
      '/images/caracteres/bruja/bruxa.png',
      ...Object.values(DRAGON_ENEMIES_MAP).map(def => def.textureUrl),
      ...Object.values(DRAGON_ENEMIES_MAP).filter(def => def.sparkTextureUrl).map(def => def.sparkTextureUrl!)
    ];

    async function initPixi() {
      if (!containerRef.current) return;

      // 1. Preload all textures asynchronously before instantiating PIXI.Sprite
      let bgTex: PIXI.Texture, bossTex: PIXI.Texture;
      let hpFrameTex: PIXI.Texture, hpFillTex: PIXI.Texture, hpFillAltTex: PIXI.Texture;
      let activeDragonDef: DragonEnemyDef = DRAGON_ENEMIES_MAP.blood_dragon;
      let mainDragonTex: PIXI.Texture;
      let sparksDragonTex: PIXI.Texture | null = null;
      const avatarTextures = new Map<string, PIXI.Texture>();

      try {
        await PIXI.Assets.load(assetsToLoad);

        bgTex = PIXI.Assets.get('/images/rpg/combat_bg.png');
        bossTex = PIXI.Assets.get('/images/rpg/boss_sprite.png');
        
        // High fidelity Dragon HP Bar UI Assets
        hpFrameTex = PIXI.Assets.get('/images/rpg/ui/Dragonhpbar.png');
        hpFillTex = PIXI.Assets.get('/images/rpg/ui/DragonHpBar2.png');
        hpFillAltTex = PIXI.Assets.get('/images/rpg/ui/DragonHpBar3.png');

        const selectedDragonKey = getDragonEnemyKey(guildBoss.name, enemyType || guildBoss.enemy_type);
        activeDragonDef = DRAGON_ENEMIES_MAP[selectedDragonKey] || DRAGON_ENEMIES_MAP.blood_dragon;
        
        mainDragonTex = PIXI.Assets.get(activeDragonDef.textureUrl) || bossTex;
        sparksDragonTex = activeDragonDef.sparkTextureUrl ? (PIXI.Assets.get(activeDragonDef.sparkTextureUrl) || null) : null;

        // Dynamic student avatars
        avatarTextures.set('default', PIXI.Assets.get('/images/students/default.png'));
        avatarTextures.set('elena', PIXI.Assets.get('/images/students/elena.png'));
        avatarTextures.set('lucas', PIXI.Assets.get('/images/students/lucas.png'));
        avatarTextures.set('mateo', PIXI.Assets.get('/images/students/mateo.png'));
        avatarTextures.set('santi', PIXI.Assets.get('/images/students/santi.png'));

        // RPG sprites y Bruxa Helena
        avatarTextures.set('santi_sprite', PIXI.Assets.get('/images/rpg/santi_sprite.png'));
        avatarTextures.set('lucas_sprite', PIXI.Assets.get('/images/rpg/lucas_sprite.png'));
        
        const rawBruxaTex = PIXI.Assets.get('/images/caracteres/bruja/bruxa.png');
        if (rawBruxaTex) {
          try {
            const frame = new PIXI.Rectangle(100, 0, 100, 100);
            const croppedBruxaTex = new PIXI.Texture({
              source: rawBruxaTex.source,
              frame: frame
            });
            avatarTextures.set('elena', croppedBruxaTex);
            avatarTextures.set('elena_sprite', croppedBruxaTex);
            avatarTextures.set('helena', croppedBruxaTex);
            avatarTextures.set('bruxa', croppedBruxaTex);
          } catch (err) {
            avatarTextures.set('elena', rawBruxaTex);
            avatarTextures.set('elena_sprite', rawBruxaTex);
            avatarTextures.set('helena', rawBruxaTex);
          }
        } else {
          avatarTextures.set('elena_sprite', PIXI.Assets.get('/images/rpg/elena_sprite.png'));
        }
      } catch (e) {
        console.error("Error preloading combat assets:", e);
        return;
      }

      if (!active) {
        try {
          PIXI.Assets.unload(assetsToLoad);
        } catch {}
        return;
      }

      // 2. Initialize PixiJS Application
      const app = new PIXI.Application();
      await app.init({
        width: 800,
        height: 320,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1
      });

      if (!active) {
        try {
          app.destroy(true, { children: true, texture: true, textureSource: true });
          PIXI.Assets.unload(assetsToLoad);
        } catch {}
        return;
      }

      appRef.current = app;
      setLoading(false);
        
        // Responsive canvas styles
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.objectFit = 'contain';
        containerRef.current.appendChild(app.canvas);

        // --- LAYER CONFIGURATION ---
        const rootStage = new PIXI.Container();
        app.stage.addChild(rootStage);
        rootStageRef.current = rootStage;

        // Background layer
        const bgContainer = new PIXI.Container();
        rootStage.addChild(bgContainer);

        // Main action layer
        const mainContainer = new PIXI.Container();
        rootStage.addChild(mainContainer);

        // --- ADD BACKGROUND ---
        const bgSprite = new PIXI.Sprite(bgTex);
        bgSprite.anchor.set(0.5);
        bgSprite.position.set(400, 160);
        bgSprite.width = 860;
        bgSprite.height = 350;
        bgContainer.addChild(bgSprite);

        // --- SLOTS AND COOP FORMATIONS ---
        const slots = [
          { x: 310, y: 200, height: 110 }, // Slot 0
          { x: 360, y: 260, height: 110 }, // Slot 1
          { x: 410, y: 160, height: 115 }, // Slot 2
          { x: 260, y: 150, height: 110 }, // Slot 3
          { x: 210, y: 210, height: 110 }  // Slot 4
        ];

        // Resolve character list based on Coop Party state
        const coopMembers = useCoopStore.getState().members;
        const charactersData: Array<{ id: string; name: string; isCoop: boolean; texKey: string }> = [];

        if (coopMembers && coopMembers.length > 0) {
          coopMembers.forEach((m) => {
            const firstName = m.name.split(' ')[0].toLowerCase();
            const texKey = ['elena', 'lucas', 'mateo', 'santi'].includes(firstName) ? firstName : 'default';
            charactersData.push({
              id: m.student_id,
              name: m.name.split(' ')[0],
              isCoop: true,
              texKey
            });
          });
        } else {
          // Fallback a héroes JRPG offline (Santi, Lucas, Helena con sprite Bruxa)
          charactersData.push({ id: 'santi', name: 'Santi', isCoop: false, texKey: 'santi_sprite' });
          charactersData.push({ id: 'lucas', name: 'Lucas', isCoop: false, texKey: 'lucas_sprite' });
          charactersData.push({ id: 'elena', name: 'Helena', isCoop: false, texKey: 'elena_sprite' });
        }

        // --- RENDER CHARACTERS ---
        interface RenderedCharacter {
          id: string;
          container: PIXI.Container;
          sprite: PIXI.Sprite;
          baseX: number;
          baseY: number;
          height: number;
          muzzleOffsetX: number;
          muzzleOffsetY: number;
          color: number;
          laserWidth: number;
          updateHpBar?: (ratio: number) => void;
        }
        const renderedChars: RenderedCharacter[] = [];

        charactersData.forEach((char, idx) => {
          const slot = slots[idx % slots.length];
          const container = new PIXI.Container();
          container.position.set(slot.x, slot.y);
          mainContainer.addChild(container);

          // Shadow
          const sombra = new PIXI.Graphics();
          sombra.fill({ color: 0x000, alpha: 0.45 });
          sombra.ellipse(0, 36, 26, 8);
          container.addChild(sombra);

          // Sprite
          const tex = avatarTextures.get(char.texKey) || avatarTextures.get('default')!;
          const sprite = new PIXI.Sprite(tex);
          sprite.anchor.set(0.5, 0.5);
          fitToHeight(sprite, slot.height);
          container.addChild(sprite);

          // --- DRAGON HP BAR (STUDENT UI) ---
          const studentHpContainer = new PIXI.Container();
          studentHpContainer.position.set(0, -slot.height * 0.60);
          container.addChild(studentHpContainer);

          const hpFrameSprite = new PIXI.Sprite(hpFrameTex);
          hpFrameSprite.anchor.set(0.5, 0.5);
          const hpBarWidth = 90;
          const scale = hpBarWidth / hpFrameTex.width;
          hpFrameSprite.scale.set(scale);

          const hpFillSprite = new PIXI.Sprite(hpFillAltTex);
          hpFillSprite.anchor.set(0.5, 0.5);
          hpFillSprite.scale.set(scale);

          const fullBarWidth = hpFrameSprite.width;
          const fullBarHeight = hpFrameSprite.height;
          const leftX = -fullBarWidth / 2;
          const topY = -fullBarHeight / 2;

          const hpMask = new PIXI.Graphics();
          hpMask.rect(leftX, topY, fullBarWidth, fullBarHeight);
          hpMask.fill({ color: 0xffffff });

          // Hierarchy: 1. Marco (bottom), 2. Relleno (top), 3. Mask
          studentHpContainer.addChild(hpFrameSprite);
          studentHpContainer.addChild(hpFillSprite);
          studentHpContainer.addChild(hpMask);
          hpFillSprite.mask = hpMask;

          const updateStudentHp = (ratio: number) => {
            const clamped = Math.max(0, Math.min(1, ratio));
            hpMask.clear();
            hpMask.rect(leftX, topY, fullBarWidth * clamped, fullBarHeight);
            hpMask.fill({ color: 0xffffff });
          };

          // Tag text
          const tag = new PIXI.Text({
            text: char.name,
            style: {
              fontFamily: 'monospace',
              fontSize: 9,
              fontWeight: 'bold',
              fill: char.isCoop ? 0x94A3B8 : (idx === 2 ? 0xE9D5FF : 0x94A3B8),
              align: 'center'
            }
          });
          tag.anchor.set(0.5);
          tag.position.set(0, 52);
          container.addChild(tag);

          renderedChars.push({
            id: char.id,
            container,
            sprite,
            baseX: slot.x,
            baseY: slot.y,
            height: slot.height,
            muzzleOffsetX: idx === 0 ? 36 : idx === 1 ? 28 : 32,
            muzzleOffsetY: idx === 0 ? -12 : idx === 1 ? -18 : -24,
            color: idx === 2 ? 0xFF9900 : 0x00F0FF,
            laserWidth: idx === 0 ? 14 : idx === 1 ? 12 : 16,
            updateHpBar: updateStudentHp
          });
        });

        // --- INJECT RPG PET IF HAPPINESS > 80 ---
        const activeStudentId = useStudentStore.getState().activeStudentId;
        const normalizedId = useStudentStore.getState().allStats[activeStudentId] ? activeStudentId : (activeStudentId === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44' ? 'std-prep' : (activeStudentId === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a42' ? 'std-sec' : (activeStudentId === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a01' ? 'std-pa' : activeStudentId)));
        const studentStats = useStudentStore.getState().allStats[normalizedId];
        const studentAvatar = useStudentStore.getState().allAvatars[normalizedId];
        
        const petHappiness = studentStats?.pet_happiness ?? 50;
        const petType = studentAvatar?.pet_type || 'dragon';
        const petStage = studentStats?.pet_stage || 'egg';

        let petContainer: PIXI.Container | null = null;
        if (petHappiness > 80) {
          petContainer = new PIXI.Container();
          petContainer.position.set(160, 240);
          mainContainer.addChild(petContainer);

          // Pet shadow
          const petShadow = new PIXI.Graphics();
          petShadow.fill({ color: 0x000, alpha: 0.35 });
          petShadow.ellipse(0, 18, 16, 5);
          petContainer.addChild(petShadow);

          // Emoji visualizer based on stage/type
          let petEmoji = '🥚';
          if (petStage === 'egg') petEmoji = '🥚';
          else if (petStage === 'baby') petEmoji = '🐣';
          else {
            if (petType === 'dragon') petEmoji = petStage === 'mystic' ? '⚡🐉' : '🐉';
            else if (petType === 'lobo') petEmoji = petStage === 'mystic' ? '🔥🐺' : '🐺';
            else if (petType === 'venado') petEmoji = petStage === 'mystic' ? '❄️🦌' : '🦌';
            else if (petType === 'gusano') petEmoji = petStage === 'mystic' ? '🌟🐛' : '🐛';
            else if (petType === 'gatito') petEmoji = petStage === 'mystic' ? '🌌🐱' : '🐱';
          }

          const petSprite = new PIXI.Text({
            text: petEmoji,
            style: {
              fontSize: 26,
              align: 'center'
            }
          });
          petSprite.anchor.set(0.5);
          petContainer.addChild(petSprite);

          // Name tag
          const petName = new PIXI.Text({
            text: studentAvatar?.pet_name || 'Compañero',
            style: {
              fontFamily: 'monospace',
              fontSize: 8,
              fontWeight: 'bold',
              fill: 0xC084FC
            }
          });
          petName.anchor.set(0.5);
          petName.position.set(0, 26);
          petContainer.addChild(petName);
        }

        // --- CREATION OF DRAGON BOSS / ENEMY ---
        const dragonHeight = activeDragonDef.scaleHeight || 195;
        const boss = new PIXI.Container();
        boss.position.set(680, 245); // Floor level at Y=245
        mainContainer.addChild(boss);
        bossRef.current = boss;

        const bossSombra = new PIXI.Graphics();
        bossSombra.fill({ color: 0x000, alpha: 0.55 });
        bossSombra.ellipse(0, 5, 55, 14);
        boss.addChild(bossSombra);

        const dragonCenterY = -dragonHeight * 0.5;
        const bossEscudo = new PIXI.Graphics();
        bossEscudo.stroke({ width: 1.5, color: 0xFF00FF, alpha: 0.4 });
        bossEscudo.moveTo(0, dragonCenterY - 70);
        bossEscudo.lineTo(65, dragonCenterY - 30);
        bossEscudo.lineTo(65, dragonCenterY + 40);
        bossEscudo.lineTo(0, dragonCenterY + 75);
        bossEscudo.lineTo(-65, dragonCenterY + 40);
        bossEscudo.lineTo(-65, dragonCenterY - 30);
        bossEscudo.closePath();
        boss.addChild(bossEscudo);

        const bossMatrix = new PIXI.Container();
        boss.addChild(bossMatrix);

        // Dragon anchor set to (0.5, 1.0) so feet rest on ground (Y=245) and scale adjusted to high-res image height
        const fitDragonSprite = (sprite: PIXI.Sprite, targetHeight: number) => {
          sprite.anchor.set(0.5, 1.0);
          if (sprite.texture && sprite.texture.height > 0) {
            const ratio = targetHeight / sprite.texture.height;
            sprite.scale.set(ratio);
          } else {
            sprite.scale.set(0.25);
          }
        };

        const bossRed = new PIXI.Sprite(mainDragonTex);
        fitDragonSprite(bossRed, dragonHeight);
        bossRed.tint = 0xFF0000;
        bossRed.alpha = 0.65;
        bossRed.visible = false;
        bossMatrix.addChild(bossRed);
        bossRedRef.current = bossRed;

        const bossCyan = new PIXI.Sprite(mainDragonTex);
        fitDragonSprite(bossCyan, dragonHeight);
        bossCyan.tint = 0x00FFFF;
        bossCyan.alpha = 0.65;
        bossCyan.visible = false;
        bossMatrix.addChild(bossCyan);
        bossCyanRef.current = bossCyan;

        const bossMain = new PIXI.Container();
        bossMatrix.addChild(bossMain);

        const bossMainSprite = new PIXI.Sprite(mainDragonTex);
        fitDragonSprite(bossMainSprite, dragonHeight);
        bossMain.addChild(bossMainSprite);

        // --- BOSS DRAGON HP BAR UI ---
        const bossHpBarContainer = new PIXI.Container();
        bossHpBarContainer.position.set(0, -dragonHeight - 15);
        boss.addChild(bossHpBarContainer);

        const bossHpFrameSprite = new PIXI.Sprite(hpFrameTex);
        bossHpFrameSprite.anchor.set(0.5, 0.5);
        const bossHpScale = 145 / hpFrameTex.width;
        bossHpFrameSprite.scale.set(bossHpScale);

        const bossHpFillSprite = new PIXI.Sprite(hpFillTex);
        bossHpFillSprite.anchor.set(0.5, 0.5);
        bossHpFillSprite.scale.set(bossHpScale);

        const bBarW = bossHpFrameSprite.width;
        const bBarH = bossHpFrameSprite.height;
        const bLeftX = -bBarW / 2;
        const bTopY = -bBarH / 2;

        const bossHpMask = new PIXI.Graphics();
        bossHpMask.rect(bLeftX, bTopY, bBarW, bBarH);
        bossHpMask.fill({ color: 0xffffff });

        // Hierarchy: 1. Marco (bottom), 2. Relleno (top), 3. Mask aligned with fill
        bossHpBarContainer.addChild(bossHpFrameSprite);
        bossHpBarContainer.addChild(bossHpFillSprite);
        bossHpBarContainer.addChild(bossHpMask);
        bossHpFillSprite.mask = bossHpMask;

        const bossHpText = new PIXI.Text({
          text: `${guildBoss.hp_actual} / ${guildBoss.hp_max}`,
          style: {
            fontFamily: 'monospace',
            fontSize: 8,
            fontWeight: 'bold',
            fill: 0xFFFFFF,
            align: 'center',
            stroke: { color: 0x000000, width: 2 }
          }
        });

        bossHpText.anchor.set(0.5);
        bossHpText.position.set(0, 15);
        bossHpBarContainer.addChild(bossHpText);


      // --- LASERS AND ATTACKS ---
      const lasers = new PIXI.Graphics();
      lasers.blendMode = 'add';
      mainContainer.addChild(lasers);
      lasersRef.current = lasers;

      const shockwave = new PIXI.Graphics();
      shockwave.blendMode = 'add';
      mainContainer.addChild(shockwave);
      shockwaveRef.current = shockwave;

      // Parallax Mouse Handler
      const handleMouseMove = (e: MouseEvent) => {
        const rect = app.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        targetParallax.current.x = (mouseX - 400) * 0.05;
        targetParallax.current.y = (mouseY - 160) * 0.05;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Local State for visual cues (avoids React re-renders)
      let localCombatState = 'idle';
      const setLocalCombatState = (state: string) => {
        localCombatState = state;
        if (state === 'boss_hurt') {
          shakeTimer.current = 300;
          
          if (app && boss) {
            const glyphs = ['0', '1', '4', 'Z', '8', '3-', 'XP', '404', 'SYS_ERR'];
            const numParticles = 15 + Math.floor(Math.random() * 10);
            for (let i = 0; i < numParticles; i++) {
              const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
              const text = new PIXI.Text({
                text: glyph,
                style: {
                  fontFamily: 'monospace',
                  fontSize: 10 + Math.floor(Math.random() * 8),
                  fontWeight: 'bold',
                  fill: Math.random() > 0.5 ? 0x00F0FF : 0xFF00FF
                }
              });
              text.anchor.set(0.5);
              text.position.set(680 + (Math.random() - 0.5) * 35, boss.y + (Math.random() - 0.5) * 50);
              const angle = Math.random() * Math.PI * 2;
              const speed = 2.5 + Math.random() * 6.5;
              const vx = Math.cos(angle) * speed;
              const vy = Math.sin(angle) * speed - 1.8;
              app.stage.addChild(text);
              particles.current.push({ text, vx, vy, life: 1.0 });
            }
          }
        }
      };

      // --- PROJECTILE SPAWNER FOR CO-OP ACTIONS ---
      const spawnProjectile = (fromX: number, fromY: number, damage: number, studentName: string) => {
        if (volume > 0) {
          playSound('charge');
        }

        const projectile = new PIXI.Graphics();
        projectile.blendMode = 'add';
        projectile.fill({ color: 0xFF00FF, alpha: 0.85 });
        projectile.drawCircle(0, 0, 10);
        projectile.position.set(fromX, fromY);
        mainContainer.addChild(projectile);

        const targetX = 680;
        const targetY = boss ? boss.y - 5 : 170;

        const startTime = Date.now();
        const duration = 600; // ms

        const animateProj = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Arched curve path
          const currentX = fromX + (targetX - fromX) * progress;
          const currentY = fromY + (targetY - fromY) * progress - Math.sin(progress * Math.PI) * 50;

          projectile.position.set(currentX, currentY);

          // Sparkle trail
          const trail = new PIXI.Graphics();
          trail.fill({ color: 0xFF99FF, alpha: 0.4 });
          trail.drawCircle(0, 0, 5);
          trail.position.set(currentX, currentY);
          mainContainer.addChild(trail);
          
          let trailAlpha = 0.4;
          const fadeTrail = () => {
            trailAlpha -= 0.05;
            trail.alpha = trailAlpha;
            if (trailAlpha <= 0) {
              mainContainer.removeChild(trail);
              trail.destroy();
            } else {
              requestAnimationFrame(fadeTrail);
            }
          };
          fadeTrail();

          if (progress < 1) {
            requestAnimationFrame(animateProj);
          } else {
            // Impact!
            mainContainer.removeChild(projectile);
            projectile.destroy();
            
            // Screen shake flash
            setLocalCombatState('boss_hurt');
            setTimeout(() => {
              localCombatState = 'idle';
            }, 500);
            
            // Floating damage indicators
            const damageText = new PIXI.Text({
              text: `-${damage} HP\n(${studentName})`,
              style: {
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 'bold',
                fill: 0xFF3333,
                align: 'center'
              }
            });
            damageText.anchor.set(0.5);
            damageText.position.set(targetX, targetY - 45);
            mainContainer.addChild(damageText);

            let dY = damageText.y;
            let dAlpha = 1.2;
            const animateText = () => {
              dY -= 0.8;
              dAlpha -= 0.025;
              damageText.y = dY;
              damageText.alpha = dAlpha;
              if (dAlpha <= 0) {
                mainContainer.removeChild(damageText);
                damageText.destroy();
              } else {
                requestAnimationFrame(animateText);
              }
            };
            animateText();

            // Hit sound
            if (volume > 0) {
              playSound('hit');
            }
          }
        };

        animateProj();
      };

      // --- ZUSTAND STORE SUBSCRIPTION ---
      const lastActionIdRef = { current: null as string | null };
      const unsubscribeCoop = useCoopStore.subscribe((state) => {
        const lastAction = state.lastAction;
        if (lastAction && lastAction.id !== lastActionIdRef.current) {
          lastActionIdRef.current = lastAction.id;
          
          const localStudentId = useStudentStore.getState().activeStudentId;
          // Trigger projectile only for actions from OTHER students
          if (lastAction.student_id !== localStudentId) {
            const members = useCoopStore.getState().members;
            const memberIdx = members.findIndex(m => m.student_id === lastAction.student_id);
            const slotIdx = memberIdx !== -1 ? memberIdx % slots.length : 1;
            const slot = slots[slotIdx];
            
            spawnProjectile(slot.x, slot.y - 10, lastAction.damage_dealt, lastAction.student_name || 'Compañero');
          }
        }
      });

      // --- TICKER LOOP (60 FPS) ---
      app.ticker.add((ticker) => {
        const time = ticker.lastTime;

        // 0. Dynamic Dragon HP Bar Clipping Mask Updates
        const partyHpRatio = Math.max(0, Math.min(1, partyHpRef.current / 100));
        renderedChars.forEach((char) => {
          if (char.updateHpBar) {
            char.updateHpBar(partyHpRatio);
          }
        });

        if (bossHpMask && bossHpText) {
          const currentBossHp = Math.max(0, guildBossRef.current.hp_actual);
          const currentBossMaxHp = Math.max(1, guildBossRef.current.hp_max);
          const bossRatio = Math.max(0, Math.min(1, currentBossHp / currentBossMaxHp));

          bossHpMask.clear();
          bossHpMask.rect(bLeftX, bTopY, bBarW * bossRatio, bBarH);
          bossHpMask.fill({ color: 0xffffff });
          bossHpText.text = `${currentBossHp} / ${currentBossMaxHp}`;
        }


        // Thunderwing electrical sparks Idle animation
        if (activeDragonDef.isThunderwing && sparksDragonTex && bossMainSprite) {
          const frameIndex = Math.floor(time / 200) % 2;
          const currentTex = frameIndex === 0 ? mainDragonTex : sparksDragonTex;
          if (bossMainSprite.texture !== currentTex) {
            bossMainSprite.texture = currentTex;
            if (bossRed) bossRed.texture = currentTex;
            if (bossCyan) bossCyan.texture = currentTex;
          }
        }

        // 1. Parallax background
        bgContainer.x += (targetParallax.current.x - bgContainer.x) * 0.1;
        bgContainer.y += (targetParallax.current.y - bgContainer.y) * 0.1;

        // 2. Bobbing / Breathing and combat recoil (Magic Wand Raising)
        renderedChars.forEach((char, idx) => {
          let targetX = char.baseX;
          let targetRotation = 0;
          let targetY = 0;
          
          if (combatStateRef.current === 'attacking' || localCombatState === 'attacking') {
            targetX = char.baseX - 12;
            targetRotation = -0.32; // point wand up/forward
            targetY = -16;          // raise wand arm/body up
          }
          
          char.container.x += (targetX - char.container.x) * 0.15;
          char.sprite.rotation += (targetRotation - char.sprite.rotation) * 0.15;
          char.sprite.y += (targetY - char.sprite.y) * 0.15;
          char.sprite.scale.y = (char.height / char.sprite.texture.height) * (1 + Math.sin(time * 0.003 + idx) * 0.022);
        });

        // Levitating and Fading Boss (Humo Violeta en Derrota)
        const targetBossX = 680;
        const targetBossY = 245;
        
        if (boss) {

          if (combatStateRef.current === 'victory') {
            // Shrink and fade into violet mist
            boss.alpha += (0 - boss.alpha) * 0.05;
            boss.scale.x += (0 - boss.scale.x) * 0.05;
            boss.scale.y += (0 - boss.scale.y) * 0.05;
            bossEscudo.alpha += (0 - bossEscudo.alpha) * 0.05;
            
            // Spawn violet smoke particles
            if (Math.random() > 0.45 && boss.alpha > 0.05) {
              const text = new PIXI.Text({
                text: Math.random() > 0.5 ? '🔮' : '✨',
                style: { fontSize: 12 + Math.floor(Math.random() * 12) }
              });
              text.anchor.set(0.5);
              text.position.set(boss.x + (Math.random() - 0.5) * 50, boss.y + (Math.random() - 0.5) * 60);
              text.tint = 0xA78BFA; // Violet smoke tint
              app.stage.addChild(text);
              particles.current.push({
                text,
                vx: (Math.random() - 0.5) * 3,
                vy: -1.5 - Math.random() * 2,
                life: 1.0
              });
            }
          } else if (combatStateRef.current !== 'boss_hurt' && localCombatState !== 'boss_hurt') {
            boss.y = targetBossY + Math.sin(time * 0.002) * 5.5;
            boss.x += (targetBossX - boss.x) * 0.15;
            bossEscudo.rotation += 0.004;
          } else {
            boss.x = targetBossX + (Math.random() - 0.5) * 7;
            boss.y = targetBossY + (Math.random() - 0.5) * 7;
          }
        }

        // 3. Screen Shake Control
        if (shakeTimer.current > 0) {
          shakeTimer.current -= ticker.deltaTime * 16.666;
          const dx = (Math.random() - 0.5) * 11;
          const dy = (Math.random() - 0.5) * 9;
          rootStage.position.set(dx, dy);

          if (bossRed && bossCyan) {
            const isGlitching = Math.random() > 0.35;
            bossRed.visible = isGlitching;
            bossCyan.visible = !isGlitching;
            bossRed.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8);
            bossCyan.position.set((Math.random() - 0.5) * -14, (Math.random() - 0.5) * -8);
          }
        } else {
          rootStage.position.set(0, 0);
          if (bossRed && bossCyan) {
            bossRed.visible = false;
            bossCyan.visible = false;
          }
        }

        // 4. Update binary floating particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.text.x += p.vx;
          p.text.y += p.vy;
          p.text.alpha -= 0.022;
          p.text.scale.set(p.text.scale.x * 0.98);
          
          if (p.text.alpha <= 0) {
            mainContainer.removeChild(p.text);
            p.text.destroy();
            particles.current.splice(i, 1);
          }
        }

        // Helper to draw muzzle flashes
        const drawMuzzleFlash = (g: PIXI.Graphics, x: number, y: number, radius: number, color: number) => {
          g.fill({ color, alpha: 0.35 });
          g.drawCircle(x, y, radius * 1.55);
          g.fill({ color: 0xFFFFFF, alpha: 0.9 });
          g.drawCircle(x, y, radius * 0.65);
          
          g.stroke({ width: 2.2, color: 0xFFFFFF });
          for (let k = 0; k < 8; k++) {
            const angle = (k * Math.PI) / 4;
            const length = radius * (k % 2 === 0 ? 1.9 : 1.25);
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          }
        };

        // 5. Render magical beams (attacks)
        lasers.clear();

        if (petContainer) {
          petContainer.y = 240 + Math.sin(time * 0.004) * 3;
        }

        if (petTriggerEffectRef.current) {
          lasers.stroke({ width: 3 + Math.sin(time * 0.1) * 1, color: 0xA855F7, alpha: 0.65 });
          renderedChars.forEach((char) => {
            lasers.drawCircle(char.container.x, char.container.y + 10, 32);
          });
          if (petContainer) {
            lasers.fill({ color: 0xA855F7, alpha: 0.1 });
            lasers.drawCircle(petContainer.x, petContainer.y, 25);
          }
        }
        if (combatStateRef.current === 'attacking') {
          const bossY = boss ? boss.y : 175;
          const targetX = 680;
          const targetY = bossY - 5;

          renderedChars.forEach((char, charIdx) => {
            const muzzleX = char.container.x + char.muzzleOffsetX;
            const muzzleY = char.container.y + char.muzzleOffsetY;

            // Magic Colors: Cyan, Esmeralda, Carmesí
            const magicColors = [0x00F0FF, 0x10B981, 0xEF4444];
            const color = magicColors[charIdx % magicColors.length];

            // 1. Outer glowing wavy beam
            lasers.stroke({ width: 3.5 + Math.sin(time * 0.08) * 1.5, color: color, alpha: 0.75 });
            lasers.moveTo(muzzleX, muzzleY);
            const steps = 12;
            for (let s = 1; s <= steps; s++) {
              const t = s / steps;
              const px = muzzleX + (targetX - muzzleX) * t;
              const py = muzzleY + (targetY - muzzleY) * t + Math.sin(t * Math.PI * 3 + time * 0.12 + charIdx) * 6;
              lasers.lineTo(px, py);
            }

            // 2. White core beam
            lasers.stroke({ width: 1.5, color: 0xFFFFFF, alpha: 0.95 });
            lasers.moveTo(muzzleX, muzzleY);
            for (let s = 1; s <= steps; s++) {
              const t = s / steps;
              const px = muzzleX + (targetX - muzzleX) * t;
              const py = muzzleY + (targetY - muzzleY) * t + Math.sin(t * Math.PI * 3 + time * 0.12 + charIdx) * 2;
              lasers.lineTo(px, py);
            }

            drawMuzzleFlash(lasers, muzzleX, muzzleY, 15 + Math.sin(time * 0.1) * 4, color);
          });

          // Energy magic rings on impact
          lasers.stroke({ width: 1.8, color: 0xFFD700, alpha: 0.75 }); // Golden impact rings
          lasers.drawCircle(targetX, targetY, 12 + (time % 24) * 0.75);
        }

        // Side glow flares
        const leftFlareX = 5;
        const rightFlareX = 795;
        const flareY = 160;
        const flareScale = 1 + Math.sin(time * 0.005) * 0.15;
        
        lasers.fill({ color: 0xEF4444, alpha: 0.18 * flareScale });
        lasers.drawCircle(leftFlareX, flareY, 52);
        lasers.drawCircle(rightFlareX, flareY, 52);
        lasers.fill({ color: 0xEF4444, alpha: 0.45 * flareScale });
        lasers.drawCircle(leftFlareX, flareY, 22);
        lasers.drawCircle(rightFlareX, flareY, 22);
        
        lasers.stroke({ width: 2.2, color: 0xFF8888, alpha: 0.65 * flareScale });
        for (let j = 0; j < 8; j++) {
          const angle = (j * Math.PI) / 4;
          lasers.moveTo(leftFlareX, flareY);
          lasers.lineTo(leftFlareX + Math.cos(angle) * 36 * flareScale, flareY + Math.sin(angle) * 36 * flareScale);
          lasers.moveTo(rightFlareX, flareY);
          lasers.lineTo(rightFlareX + Math.cos(angle) * 36 * flareScale, flareY + Math.sin(angle) * 36 * flareScale);
        }

        // 6. Impact Shockwave
        shockwave.clear();
        if (combatStateRef.current === 'boss_hurt' || localCombatState === 'boss_hurt') {
          const bossY = boss ? boss.y : 175;
          const targetX = 680;
          const targetY = bossY - 5;
          
          const radius = 24 + (time % 1200) * 0.16;
          const opacity = Math.max(0, 1 - (radius / 85));
          
          shockwave.stroke({ width: 4.5, color: 0xFFFFFF, alpha: opacity });
          shockwave.drawCircle(targetX, targetY, radius);
          
          shockwave.stroke({ width: 2, color: 0x00F0FF, alpha: opacity * 0.65 });
          shockwave.drawCircle(targetX, targetY, radius * 0.75);

          shockwave.stroke({ width: 2.8, color: 0xFFFFFF, alpha: opacity });
          for (let m = 0; m < 12; m++) {
            const angle = (m * Math.PI) / 6;
            const length = radius * (m % 2 === 0 ? 1.65 : 0.95);
            shockwave.moveTo(targetX, targetY);
            shockwave.lineTo(targetX + Math.cos(angle) * length, targetY + Math.sin(angle) * length);
          }

          const smokeRadius = 15 + (time % 38) * 0.85;
          const smokeAlpha = Math.max(0, 0.55 - (smokeRadius / 55));
          shockwave.fill({ color: 0x222222, alpha: smokeAlpha * 0.45 });
          shockwave.drawCircle(targetX - 25, targetY + 62, smokeRadius);
          shockwave.drawCircle(targetX + 25, targetY + 62, smokeRadius * 1.15);
        }
      });

      if (!active) {
        window.removeEventListener('mousemove', handleMouseMove);
        unsubscribeCoop();
        return;
      }

      cleanupMouse = () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
      cleanupCoop = unsubscribeCoop;
    }

    initPixi();

    return () => {
      active = false;
      if (cleanupMouse) cleanupMouse();
      if (cleanupCoop) cleanupCoop();
      if (appRef.current) {
        try {
          appRef.current.ticker?.stop();
          appRef.current.stage?.removeChildren();
          appRef.current.destroy(true, { children: true, texture: true, textureSource: true });
        } catch (err) {
          console.warn("Error destruyendo instancia de Pixi:", err);
        }
        appRef.current = null;
      }
      try {
        PIXI.Assets.unload(assetsToLoad);
      } catch (err) {
        console.warn("Error descargando texturas de Pixi:", err);
      }
    };
  }, []);

  // Visual cues on combatState transitions
  useEffect(() => {
    if (combatState === 'boss_hurt') {
      shakeTimer.current = 350;

      if (appRef.current && bossRef.current) {
        const glyphs = ['0', '1', '4', 'Z', '8', '3-', 'XP', '404', 'SYS_ERR'];
        const numParticles = 28 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < numParticles; i++) {
          const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
          const size = 10 + Math.floor(Math.random() * 8);
          
          const text = new PIXI.Text({
            text: glyph,
            style: {
              fontFamily: 'monospace',
              fontSize: size,
              fontWeight: 'bold',
              fill: Math.random() > 0.5 ? 0x00F0FF : 0xFF00FF
            }
          });
          
          text.anchor.set(0.5);
          text.position.set(680 + (Math.random() - 0.5) * 35, bossRef.current.y + (Math.random() - 0.5) * 50);
          
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6.5;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed - 1.8;

          appRef.current.stage.addChild(text);
          particles.current.push({ text, vx, vy, life: 1.0 });
        }
      }
    } else if (combatState === 'victory' && appRef.current) {
      // Majestic victory float text: ¡HECHIZO COMPLETADO! +[X] Puntos para tu Casa
      const text = new PIXI.Text({
        text: `¡HECHIZO COMPLETADO!\n+${guildBoss.xp_reward} Puntos para tu Casa`,
        style: {
          fontFamily: 'serif',
          fontSize: 20,
          fontWeight: '900',
          fill: 0xFBBF24, // Gold
          align: 'center',
          stroke: { color: 0x4C1D95, width: 4 }, // Dark purple stroke
          dropShadow: {
            color: 0x000000,
            blur: 5,
            angle: Math.PI / 6,
            distance: 3
          }
        }
      });
      text.anchor.set(0.5);
      text.position.set(400, 150);
      text.scale.set(0.2);
      text.alpha = 0;
      appRef.current.stage.addChild(text);
      
      let tScale = 0.2;
      let tAlpha = 0;
      const animateVictoryText = () => {
        if (!appRef.current) return;
        tScale += (1.0 - tScale) * 0.08;
        tAlpha += (1.0 - tAlpha) * 0.08;
        text.scale.set(tScale + Math.sin(Date.now() * 0.005) * 0.025);
        text.alpha = tAlpha;
        
        if (combatStateRef.current === 'victory') {
          requestAnimationFrame(animateVictoryText);
        } else {
          appRef.current.stage.removeChild(text);
          text.destroy();
        }
      };
      animateVictoryText();
    }
  }, [combatState]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-hidden relative" 
      style={{ touchAction: 'none' }}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-cyan-400 font-mono text-xs tracking-[4px] gap-3 z-30">
          <div className="w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <span>INICIALIZANDO ESCENARIO WEBGL...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}
