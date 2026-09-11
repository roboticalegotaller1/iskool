"use client";

import React from 'react';
import { ModularAnimeAvatarSprite } from './avatar/ModularAnimeAvatarSprite';

export interface AnimeAvatarSpriteProps {
  gender?: 'male' | 'female' | 'neutral';
  rpgClass?: string; // guerrero, mago, ninja, curador, domador, cazador, reptil
  headType?: string; // standard, elf, cat, horns, mask
  skinTone?: string; // hex color or preset name
  hairColor?: string; // hex color or preset name
  hairStyle?: string; // spiky, long, ponytail, twintails, bob, dreadlocks, bald, short, hat, mohawk, witch_curls
  raceFeature?: string;
  equippedShoes?: string;
  equippedBottom?: string;
  equippedTop?: string;
  equippedOuterwear?: string;
  equippedHat?: string;
  equippedAccessory?: string;
  animationState?: 'idle' | 'cast' | 'cheer' | 'walk';
  equippedArtifacts?: string[];
  className?: string;
}

export const AnimeAvatarSprite: React.FC<AnimeAvatarSpriteProps> = ({
  gender = 'female',
  rpgClass = 'mago',
  headType = 'standard',
  skinTone = 'light',
  hairColor = 'pink',
  hairStyle = 'witch_curls',
  raceFeature,
  equippedShoes,
  equippedBottom,
  equippedTop,
  equippedOuterwear,
  equippedHat,
  equippedAccessory,
  animationState = 'idle',
  equippedArtifacts = [],
  className = "w-full h-full"
}) => {
  // Mapear headType legacy a raceFeature
  const resolvedRace = raceFeature || (
    headType === 'elf' ? 'elf_long' :
    headType === 'cat' ? 'cat_ears' :
    headType === 'horns' ? 'dragon_horns' : 'human'
  );

  // Mapear rpgClass a atuendo temático si no se especifica prenda explícita
  const resolvedOuterwear = equippedOuterwear || (
    rpgClass === 'mago' ? 'outerwear_witch_cloak' :
    rpgClass === 'curador' ? 'outerwear_hoodie' :
    rpgClass === 'guerrero' ? 'outerwear_bomber_jacket' : 'outerwear_none'
  );

  const resolvedHat = equippedHat || (
    rpgClass === 'mago' ? 'hat_witch' :
    rpgClass === 'guerrero' ? 'hat_guild_crown' : 'hat_none'
  );

  const resolvedAccessory = equippedAccessory || (
    rpgClass === 'mago' ? 'acc_wand_and_book' :
    rpgClass === 'curador' ? 'acc_scholar_glasses' : 'acc_magic_wand'
  );

  const resolvedTop = equippedTop || (
    rpgClass === 'mago' ? 'top_school_blouse' :
    rpgClass === 'guerrero' ? 'top_rune_tshirt' : 'top_basic'
  );

  const resolvedBottom = equippedBottom || (
    gender === 'female' ? 'bottom_witch_skirt' : 'bottom_blue_jeans'
  );

  const resolvedShoes = equippedShoes || (
    rpgClass === 'mago' ? 'shoes_witch_boots' : 'shoes_sneakers'
  );

  return (
    <ModularAnimeAvatarSprite
      gender={gender}
      skinTone={skinTone}
      hairStyle={hairStyle}
      hairColor={hairColor}
      raceFeature={resolvedRace}
      equippedShoes={resolvedShoes}
      equippedBottom={resolvedBottom}
      equippedTop={resolvedTop}
      equippedOuterwear={resolvedOuterwear}
      equippedHat={resolvedHat}
      equippedAccessory={resolvedAccessory}
      animationState={animationState}
      className={className}
    />
  );
};
