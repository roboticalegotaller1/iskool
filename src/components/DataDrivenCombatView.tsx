"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useStudentStore } from '@/store/useStudentStore';
import { DRAGON_ENEMIES_MAP, getDragonEnemyKey } from './PixiCombatView';


export interface RpgEnemyData {
  enemy_id: string;
  name: string;
  hp_max: number;
  hp_remaining: number;
  skin_id: string;
}

export interface RpgAttacker {
  student_id: string;
  name: string;
  role: 'Cyber_Marine' | 'Scout_Space' | 'Sage_Cyber' | string;
  xp_contribution?: number;
  avatar_url?: string;
  skin_texture_id?: string;
  rpg_action?: 'RIFLE_BURST' | 'BLASTER_SHOT' | 'LASER_BEAM' | string;
  damage?: number;
}

export interface RpgCombatPayload {
  mission_id: string;
  homework_id: string;
  enemy_data: RpgEnemyData;
  attackers: RpgAttacker[];
  server_calculated_total_damage: number;
}

interface DataDrivenCombatViewProps {
  payload: RpgCombatPayload;
  localStudentId: string;
  combatState: 'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat';
  volume: number;
  playSound: (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => void;
  onAttackFinish?: () => void;
}

export default function DataDrivenCombatView({
  payload,
  localStudentId,
  combatState,
  volume,
  playSound,
  onAttackFinish
}: DataDrivenCombatViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Referencias a huesos para animaciones programáticas
  const boneBodyRefs = useRef<Map<string, PIXI.Container>>(new Map());
  const boneArmRefs = useRef<Map<string, PIXI.Container>>(new Map());
  const boneHeadRefs = useRef<Map<string, PIXI.Container>>(new Map());
  const boneWeaponRefs = useRef<Map<string, PIXI.Container>>(new Map());

  // Referencias globales de contenedores
  const bossRef = useRef<PIXI.Container | null>(null);
  const bossRedRef = useRef<PIXI.Sprite | null>(null);
  const bossCyanRef = useRef<PIXI.Sprite | null>(null);
  const rootStageRef = useRef<PIXI.Container | null>(null);
  const lasersRef = useRef<PIXI.Graphics | null>(null);
  const shockwaveRef = useRef<PIXI.Graphics | null>(null);

  // Parallax y Cámara
  const targetParallax = useRef({ x: 0, y: 0 });
  const shakeTimer = useRef(0);

  // Referencias reactivas para el Ticker
  const combatStateRef = useRef(combatState);
  useEffect(() => {
    combatStateRef.current = combatState;
  }, [combatState]);

  const payloadRef = useRef(payload);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);


  const particles = useRef<Array<{
    text: PIXI.Text;
    vx: number;
    vy: number;
    life: number;
  }>>([]);

  const fitToHeight = (sprite: PIXI.Sprite, targetHeight: number) => {
    if (sprite.texture) {
      const ratio = targetHeight / sprite.texture.height;
      sprite.scale.set(ratio);
    }
  };

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
        shieldText.position.set(180, 200);
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

  useEffect(() => {
    let active = true;
    let cleanupMouse: (() => void) | null = null;

    const attackerSkinUrls = payload.attackers.map(
      a => `/images/rpg/${(a.skin_texture_id || 'skin_marine').replace('skin_', '')}_sprite.png`
    );
    const assetsToLoad = [
      '/images/rpg/combat_bg.png',
      '/images/rpg/boss_sprite.png',
      '/images/rpg/ui/Dragonhpbar.png',
      '/images/rpg/ui/DragonHpBar2.png',
      '/images/rpg/ui/DragonHpBar3.png',
      ...attackerSkinUrls,
      ...Object.values(DRAGON_ENEMIES_MAP).map(def => def.textureUrl),
      ...Object.values(DRAGON_ENEMIES_MAP).filter(def => def.sparkTextureUrl).map(def => def.sparkTextureUrl!)
    ];

    async function initPixi() {
      if (!containerRef.current) return;

      let bgTex: PIXI.Texture, bossTex: PIXI.Texture;
      let hpFrameTex: PIXI.Texture, hpFillTex: PIXI.Texture, hpFillAltTex: PIXI.Texture;
      let activeDragonDef = DRAGON_ENEMIES_MAP.blood_dragon;
      let mainDragonTex: PIXI.Texture;
      let sparksDragonTex: PIXI.Texture | null = null;
      const attackerTextures: Map<string, PIXI.Texture> = new Map();

      try {
        await PIXI.Assets.load(assetsToLoad);

        bgTex = PIXI.Assets.get('/images/rpg/combat_bg.png');
        bossTex = PIXI.Assets.get('/images/rpg/boss_sprite.png');
        
        hpFrameTex = PIXI.Assets.get('/images/rpg/ui/Dragonhpbar.png');
        hpFillTex = PIXI.Assets.get('/images/rpg/ui/DragonHpBar2.png');
        hpFillAltTex = PIXI.Assets.get('/images/rpg/ui/DragonHpBar3.png');

        const selectedDragonKey = getDragonEnemyKey(payload.enemy_data.name, payload.enemy_data.skin_id);
        activeDragonDef = DRAGON_ENEMIES_MAP[selectedDragonKey] || DRAGON_ENEMIES_MAP.blood_dragon;
        mainDragonTex = PIXI.Assets.get(activeDragonDef.textureUrl) || bossTex;
        sparksDragonTex = activeDragonDef.sparkTextureUrl ? (PIXI.Assets.get(activeDragonDef.sparkTextureUrl) || null) : null;

        for (const attacker of payload.attackers) {
          const skinUrl = `/images/rpg/${(attacker.skin_texture_id || 'skin_marine').replace('skin_', '')}_sprite.png`;
          const tex = PIXI.Assets.get(skinUrl) || bossTex;
          attackerTextures.set(attacker.student_id, tex);
        }
      } catch (e) {
        console.error("Error al cargar dinámicamente los assets de la misión:", e);
        return;
      }

      if (!active) {
        try {
          PIXI.Assets.unload(assetsToLoad);
        } catch {}
        return;
      }

      // 2. Inicializar PixiJS Application
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
      
      // Ajustar responsive
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.objectFit = 'contain';
      containerRef.current.appendChild(app.canvas);

      // --- CONFIGURACIÓN DE CAPAS ---
      const rootStage = new PIXI.Container();
      app.stage.addChild(rootStage);
      rootStageRef.current = rootStage;

      const bgContainer = new PIXI.Container();
      rootStage.addChild(bgContainer);

      const mainContainer = new PIXI.Container();
      rootStage.addChild(mainContainer);

      // Fondo
      const bgSprite = new PIXI.Sprite(bgTex);
      bgSprite.anchor.set(0.5);
      bgSprite.position.set(400, 160);
      bgSprite.width = 860;
      bgSprite.height = 350;
      bgContainer.addChild(bgSprite);

      // --- PERSPECTIVA DE CÁMARA LOCAL (Reordenamiento de Slots) ---
      // Slot 0 (Primer plano prioritario): Alumno Local
      // Slot 1 (Plano Medio)
      // Slot 2 (Fondo)
      const slots = [
        { x: 360, y: 260, zIndex: 3, height: 110 }, // Foreground
        { x: 310, y: 200, zIndex: 2, height: 110 }, // Middleground
        { x: 410, y: 160, zIndex: 1, height: 115 }  // Background
      ];

      // Reordenar atacantes colocando al Alumno Local en el primer slot (Foreground)
      const localAttacker = payload.attackers.find(a => a.student_id === localStudentId);
      const otherAttackers = payload.attackers.filter(a => a.student_id !== localStudentId);
      const orderedAttackers = localAttacker ? [localAttacker, ...otherAttackers] : payload.attackers;

      // --- RIGGING ÓSEO DE OPERADORES ---
      orderedAttackers.forEach((attacker, idx) => {
        const slot = slots[idx];
        const tex = attackerTextures.get(attacker.student_id);
        if (!tex) return;

        const charContainer = new PIXI.Container();
        charContainer.position.set(slot.x, slot.y);
        charContainer.zIndex = slot.zIndex;
        mainContainer.addChild(charContainer);

        // Sombra
        const sombra = new PIXI.Graphics();
        sombra.fill({ color: 0x000, alpha: 0.45 });
        sombra.ellipse(0, 36, 26, 8);
        charContainer.addChild(sombra);

        // --- JERARQUÍA ÓSEA (Bones) ---
        const boneRoot = new PIXI.Container();
        charContainer.addChild(boneRoot);

        // Hueso Torso / Cuerpo
        const boneBody = new PIXI.Container();
        boneRoot.addChild(boneBody);
        boneBodyRefs.current.set(attacker.student_id, boneBody);

        const bodySprite = new PIXI.Sprite(tex);
        bodySprite.anchor.set(0.5, 0.5);
        fitToHeight(bodySprite, slot.height);
        boneBody.addChild(bodySprite);

        // Determinar colores y luces del rol para efectos de neón
        let roleColor = 0x00F0FF; // Cyan por defecto (Cyber Marine)
        if (attacker.role === 'Sage_Cyber') roleColor = 0xFF00FF; // Magenta
        if (attacker.role === 'Scout_Space') roleColor = 0xFF9900; // Orange

        // Hueso Cabeza (con visor glowing neón dinámico)
        const boneHead = new PIXI.Container();
        boneHead.position.set(0, -slot.height * 0.18);
        boneBody.addChild(boneHead);
        boneHeadRefs.current.set(attacker.student_id, boneHead);

        const visorOverlay = new PIXI.Graphics();
        visorOverlay.fill({ color: roleColor, alpha: 0.4 });
        visorOverlay.drawCircle(0, 0, slot.height * 0.08);
        boneHead.addChild(visorOverlay);

        // Hueso Brazo Derecho (apuntando al jefe)
        const boneArmRight = new PIXI.Container();
        boneArmRight.position.set(slot.height * 0.15, -slot.height * 0.1);
        boneBody.addChild(boneArmRight);
        boneArmRefs.current.set(attacker.student_id, boneArmRight);

        // Hueso Arma / Cañón (Focal point del láser)
        const boneWeapon = new PIXI.Container();
        boneWeapon.position.set(slot.height * 0.2, 0); // Punta del arma
        boneArmRight.addChild(boneWeapon);
        boneWeaponRefs.current.set(attacker.student_id, boneWeapon);

        // --- DRAGON HP BAR (OPERATOR UI) ---
        const charHpContainer = new PIXI.Container();
        charHpContainer.position.set(0, -slot.height * 0.60);
        charContainer.addChild(charHpContainer);

        const hpFrameSprite = new PIXI.Sprite(hpFrameTex);
        hpFrameSprite.anchor.set(0.5, 0.5);
        const hpBarWidth = 90;
        const scale = hpBarWidth / hpFrameTex.width;
        hpFrameSprite.scale.set(scale);

        const hpFillSprite = new PIXI.Sprite(hpFillAltTex);
        hpFillSprite.anchor.set(0.5, 0.5);
        hpFillSprite.scale.set(scale);

        const barW = hpFrameSprite.width;
        const barH = hpFrameSprite.height;
        const leftX = -barW / 2;
        const topY = -barH / 2;

        const hpMask = new PIXI.Graphics();
        hpMask.rect(leftX, topY, barW, barH);
        hpMask.fill({ color: 0xffffff });

        charHpContainer.addChild(hpFillSprite);
        charHpContainer.addChild(hpMask);
        hpFillSprite.mask = hpMask;
        charHpContainer.addChild(hpFrameSprite);

        // Etiqueta del alumno
        const isLocal = attacker.student_id === localStudentId;
        const nameTag = new PIXI.Text({
          text: isLocal ? `TÚ (${attacker.name})` : attacker.name,
          style: {
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 'bold',
            fill: isLocal ? 0x22D3EE : 0x94A3B8,
            align: 'center'
          }
        });
        nameTag.anchor.set(0.5);
        nameTag.position.set(0, 52);
        charContainer.addChild(nameTag);

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
        petContainer.position.set(180, 240);
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

      // Ordenar capas en base a Z-Index isométrico
      mainContainer.sortChildren();

      // --- CREACIÓN DEL JEFE DRAGÓN ---
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

      const fitDragonSprite = (sprite: PIXI.Sprite, targetHeight: number) => {
        sprite.anchor.set(0.5, 1.0);
        if (sprite.texture && sprite.texture.height > 0) {
          const ratio = targetHeight / sprite.texture.height;
          sprite.scale.set(ratio);
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

      // --- BOSS DRAGON HP BAR ---
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
        text: `${payload.enemy_data.hp_remaining} / ${payload.enemy_data.hp_max}`,
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


      // --- LASERS Y SHOCKWAVE ---
      const lasers = new PIXI.Graphics();
      lasers.blendMode = 'add';
      mainContainer.addChild(lasers);
      lasersRef.current = lasers;

      const shockwave = new PIXI.Graphics();
      shockwave.blendMode = 'add';
      mainContainer.addChild(shockwave);
      shockwaveRef.current = shockwave;

      // Parallax Mouse
      const handleMouseMove = (e: MouseEvent) => {
        const rect = app.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        targetParallax.current.x = (mouseX - 400) * 0.05;
        targetParallax.current.y = (mouseY - 160) * 0.05;
      };
      window.addEventListener('mousemove', handleMouseMove);
      cleanupMouse = () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };

      // --- TICKER LOOP (60 FPS) ---
      app.ticker.add((ticker) => {
        const time = ticker.lastTime;

        // 0. Dynamic Dragon HP Bar Clipping Mask Updates
        if (bossHpMask && bossHpText) {
          const eHp = Math.max(0, payloadRef.current.enemy_data.hp_remaining);
          const eMaxHp = Math.max(1, payloadRef.current.enemy_data.hp_max);
          const eRatio = Math.max(0, Math.min(1, eHp / eMaxHp));

          bossHpMask.clear();
          bossHpMask.rect(bLeftX, bTopY, bBarW * eRatio, bBarH);
          bossHpMask.fill({ color: 0xffffff });
          bossHpText.text = `${eHp} / ${eMaxHp}`;
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

        // 1. Lógica de Cámara Virtual Local
        let targetCamX = 0;
        let targetCamY = 0;

        if (combatStateRef.current === 'attacking') {
          // Centrar cámara cinematográfica en la interacción Alumno Local - Boss
          targetCamX = (400 - (slots[0].x + 680) / 2) * 0.35;
          targetCamY = (160 - (slots[0].y + 245) / 2) * 0.35;
        } else {
          targetCamX = targetParallax.current.x;
          targetCamY = targetParallax.current.y;
        }

        rootStage.x += (targetCamX - rootStage.x) * 0.1;
        rootStage.y += (targetCamY - rootStage.y) * 0.1;

        // 2. Parallax de fondo
        bgContainer.x = -rootStage.x * 0.3;
        bgContainer.y = -rootStage.y * 0.3;

        // 3. Animaciones Óseas (Skeletal Bone Bobbing)
        orderedAttackers.forEach((attacker, idx) => {
          const boneBody = boneBodyRefs.current.get(attacker.student_id);
          const boneHead = boneHeadRefs.current.get(attacker.student_id);
          const boneArm = boneArmRefs.current.get(attacker.student_id);

          if (boneBody && boneHead && boneArm) {
            // Respiración base
            const osc = Math.sin(time * 0.003 + idx) * 0.02;
            boneBody.scale.y = 1 + osc;
            boneHead.y = (-slots[idx].height * 0.18) + Math.sin(time * 0.002 + idx) * 1.2;

            // Retroceso / Posicionamiento durante ataque
            let targetX = 0;
            if (combatStateRef.current === 'attacking') {
              targetX = -12; // Mover torso hacia atrás al disparar (recoil)
              boneArm.rotation = -0.15 + Math.sin(time * 0.1) * 0.08;
            } else {
              targetX = 0;
              boneArm.rotation = Math.sin(time * 0.003 + idx) * 0.03;
            }
            boneBody.x += (targetX - boneBody.x) * 0.15;
          }
        });

        // Oscilación del jefe
        const targetBossY = 245;

        if (boss) {
          if (combatStateRef.current !== 'boss_hurt') {
            boss.y = targetBossY + Math.sin(time * 0.002) * 5.5;
            bossEscudo.rotation += 0.004;
          } else {
            boss.x = 680 + (Math.random() - 0.5) * 8;
            boss.y = targetBossY + (Math.random() - 0.5) * 8;
          }
        }

        // 4. Screen Shake e Impacto de Aberración Cromática
        if (shakeTimer.current > 0) {
          shakeTimer.current -= ticker.deltaTime * 16.666;
          
          const dx = (Math.random() - 0.5) * 12;
          const dy = (Math.random() - 0.5) * 10;
          rootStage.position.set(rootStage.position.x + dx, rootStage.position.y + dy);

          if (bossRed && bossCyan) {
            const isGlitching = Math.random() > 0.35;
            bossRed.visible = isGlitching;
            bossCyan.visible = !isGlitching;
            bossRed.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 9);
            bossCyan.position.set((Math.random() - 0.5) * -15, (Math.random() - 0.5) * -9);
          }
        } else {
          if (bossRed && bossCyan) {
            bossRed.visible = false;
            bossCyan.visible = false;
          }
        }

        // 5. Partículas Binarias
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

        // 6. Dibujar Láseres y Muzzle Flashes
        lasers.clear();

        if (petContainer) {
          petContainer.y = 240 + Math.sin(time * 0.004) * 3;
        }

        if (petTriggerEffectRef.current) {
          lasers.stroke({ width: 3 + Math.sin(time * 0.1) * 1, color: 0xA855F7, alpha: 0.65 });
          // Draw a circle shield around main operators in the container
          const operatorContainers = mainContainer.children.filter(
            (c: any) => c !== petContainer && c !== lasers && c !== shockwave && c !== boss
          );
          operatorContainers.forEach((charContainer: any) => {
            lasers.drawCircle(charContainer.x, charContainer.y + 10, 32);
          });

          if (petContainer) {
            lasers.fill({ color: 0xA855F7, alpha: 0.1 });
            lasers.drawCircle(petContainer.x, petContainer.y, 25);
          }
        }
        if (combatStateRef.current === 'attacking') {
          const bossY = boss ? boss.y : 175;
          const laserTargetX = 680;
          const laserTargetY = bossY - 8;

          orderedAttackers.forEach((attacker) => {
            const boneWeapon = boneWeaponRefs.current.get(attacker.student_id);
            if (!boneWeapon) return;

            // Obtener coordenadas globales del cañón usando la jerarquía ósea
            const weaponGlobal = boneWeapon.toGlobal(new PIXI.Point(0, 0));
            // Ajustar del espacio de root a mainContainer
            const localMuzzleX = mainContainer.toLocal(weaponGlobal).x;
            const localMuzzleY = mainContainer.toLocal(weaponGlobal).y;

            let laserColor = 0x00F0FF;
            if (attacker.role === 'Sage_Cyber') laserColor = 0xFF9900; // Oro
            if (attacker.role === 'Scout_Space') laserColor = 0x00F0FF;

            // Glow aditivo neón
            lasers.stroke({ width: 15 + Math.sin(time * 0.05) * 4, color: laserColor, alpha: 0.28 });
            lasers.moveTo(localMuzzleX, localMuzzleY); lasers.lineTo(laserTargetX, laserTargetY);
            lasers.stroke({ width: 6.5, color: laserColor, alpha: 0.75 });
            lasers.moveTo(localMuzzleX, localMuzzleY); lasers.lineTo(laserTargetX, laserTargetY);
            lasers.stroke({ width: 2, color: 0xFFFFFF, alpha: 1 });
            lasers.moveTo(localMuzzleX, localMuzzleY); lasers.lineTo(laserTargetX, laserTargetY);

            // Muzzle flash
            lasers.fill({ color: laserColor, alpha: 0.35 });
            lasers.drawCircle(localMuzzleX, localMuzzleY, 16);
            lasers.fill({ color: 0xFFFFFF, alpha: 0.9 });
            lasers.drawCircle(localMuzzleX, localMuzzleY, 8);
            
            lasers.stroke({ width: 2.2, color: 0xFFFFFF });
            for (let k = 0; k < 8; k++) {
              const angle = (k * Math.PI) / 4;
              lasers.moveTo(localMuzzleX, localMuzzleY);
              lasers.lineTo(localMuzzleX + Math.cos(angle) * 20, localMuzzleY + Math.sin(angle) * 20);
            }
          });
        }

        // Flares laterales
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

        // 7. Shockwave e Impacto Spiky
        shockwave.clear();
        if (combatStateRef.current === 'boss_hurt') {
          const bossY = boss ? boss.y : 175;
          const laserTargetX = 680;
          const laserTargetY = bossY - 8;
          
          const radius = 24 + (time % 1200) * 0.16;
          const opacity = Math.max(0, 1 - (radius / 85));

          shockwave.stroke({ width: 4.5, color: 0xFFFFFF, alpha: opacity });
          shockwave.drawCircle(laserTargetX, laserTargetY, radius);
          
          shockwave.stroke({ width: 2.8, color: 0xFFFFFF, alpha: opacity });
          for (let m = 0; m < 12; m++) {
            const angle = (m * Math.PI) / 6;
            const length = radius * (m % 2 === 0 ? 1.65 : 0.95);
            shockwave.moveTo(laserTargetX, laserTargetY);
            shockwave.lineTo(laserTargetX + Math.cos(angle) * length, laserTargetY + Math.sin(angle) * length);
          }

          const smokeRadius = 15 + (time % 38) * 0.85;
          const smokeAlpha = Math.max(0, 0.55 - (smokeRadius / 55));
          shockwave.fill({ color: 0x222222, alpha: smokeAlpha * 0.45 });
          shockwave.drawCircle(laserTargetX - 25, laserTargetY + 62, smokeRadius);
          shockwave.drawCircle(laserTargetX + 25, laserTargetY + 62, smokeRadius * 1.15);
        }
      });
    }

    initPixi();

    return () => {
      active = false;
      if (cleanupMouse) cleanupMouse();
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
  }, [payload, localStudentId]);

  // Disparar efectos en transiciones
  useEffect(() => {
    if (combatState === 'boss_hurt') {
      shakeTimer.current = 350;

      if (appRef.current && bossRef.current) {
        const glyphs = ['0', '1', '4', 'Z', '8', '3-', 'XP', '404', 'SYS_ERR'];
        const numParticles = 25 + Math.floor(Math.random() * 10);
        
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
          text.position.set(680 + (Math.random() - 0.5) * 35, bossRef.current.y + (Math.random() - 0.5) * 50);
          
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6.5;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed - 1.8;

          appRef.current.stage.addChild(text);
          particles.current.push({ text, vx, vy, life: 1.0 });
        }
      }
    }
  }, [combatState]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative" style={{ touchAction: 'none' }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-cyan-400 font-mono text-xs tracking-[4px] gap-3 z-30">
          <div className="w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <span>CARGANDO MOTOR DATA-DRIVEN...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}
