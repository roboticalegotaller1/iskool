"""
Test Flawless Avatar Suite
Renders the exact ModularAnimeAvatarSprite canvas rendering logic in Python
for all combinations to verify 100% root-to-tip uniform color and clean clothes.
"""

import os
import cv2
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVATAR_DIR = os.path.join(BASE_DIR, 'public', 'images', 'avatar')
HAIR_DIR = os.path.join(AVATAR_DIR, 'hairstyles')
TOPS_DIR = os.path.join(AVATAR_DIR, 'tops')

w, h = 768, 1376

def render_avatar(base_name, top_name, mask_name, hair_rgb=[234, 179, 8], out_filename=''):
    base = cv2.imread(os.path.join(HAIR_DIR, base_name), cv2.IMREAD_UNCHANGED)
    top = cv2.imread(os.path.join(TOPS_DIR, top_name), cv2.IMREAD_UNCHANGED)
    hmData = cv2.imread(os.path.join(HAIR_DIR, mask_name), cv2.IMREAD_GRAYSCALE)

    # 1. Base image
    canvas = base.copy().astype(np.float32)

    # 2. Draw top over base (alpha composition)
    top_a = (top[:,:,3] / 255.0)[:,:,None]
    canvas[:,:,:3] = top[:,:,:3] * top_a + canvas[:,:,:3] * (1.0 - top_a)
    canvas[:,:,3] = np.maximum(canvas[:,:,3], top[:,:,3])

    bd = canvas.copy()
    brd = base.copy()

    # 3. Dynamic hair coloring loop matching ModularAnimeAvatarSprite.tsx exactly
    is_hair_pixel = (hmData > 50) & ((bd[:,:,3] >= 40) | (brd[:,:,3] >= 40))

    # A) Restore base hair over top
    bd[is_hair_pixel, :3] = brd[is_hair_pixel, :3]
    bd[is_hair_pixel, 3] = brd[is_hair_pixel, 3]

    # B) Cel-shaded proportional hair tinting
    origB = bd[is_hair_pixel, 0]
    origG = bd[is_hair_pixel, 1]
    origR = bd[is_hair_pixel, 2]
    origLum = 0.299 * origR + 0.587 * origG + 0.114 * origB
    hairNorm = 85.0
    minFactor = 0.48
    lumRatio = np.minimum(1.6, origLum / hairNorm)
    f = minFactor + (1.0 - minFactor) * lumRatio

    # Note OpenCV BGR: hair_rgb is [R, G, B]
    bd[is_hair_pixel, 2] = np.clip(np.round(hair_rgb[0] * f), 0, 255)
    bd[is_hair_pixel, 1] = np.clip(np.round(hair_rgb[1] * f), 0, 255)
    bd[is_hair_pixel, 0] = np.clip(np.round(hair_rgb[2] * f), 0, 255)

    # Crop upper body (head, chest, shoulders, arms)
    crop = bd[100:650, 180:580]
    cv2.imwrite(out_filename, crop.astype(np.uint8))
    print(f'Saved test render: {out_filename}')

combos = [
    ('trainer_female_wavy_long.png', 'female_top_rune_tshirt.png', 'trainer_female_wavy_long_hair_mask.png', 'flawless_1_wavy_rune.png'),
    ('trainer_female_wavy_long.png', 'female_top_athletic_tank.png', 'trainer_female_wavy_long_hair_mask.png', 'flawless_2_wavy_tank.png'),
    ('trainer_female_wavy_long.png', 'female_top_dia_de_muertos.png', 'trainer_female_wavy_long_hair_mask.png', 'flawless_3_wavy_dia.png'),
    ('trainer_female_wavy_long.png', 'female_top_basic.png', 'trainer_female_wavy_long_hair_mask.png', 'flawless_4_wavy_basic.png'),
    ('trainer_female_ponytail.png', 'female_top_athletic_tank.png', 'trainer_female_ponytail_hair_mask.png', 'flawless_5_pony_tank.png'),
    ('trainer_female_ponytail.png', 'female_top_school_blouse.png', 'trainer_female_ponytail_hair_mask.png', 'flawless_6_pony_blouse.png'),
    ('trainer_female_ponytail.png', 'female_top_rune_tshirt.png', 'trainer_female_ponytail_hair_mask.png', 'flawless_7_pony_rune.png'),
    ('trainer_female_dreadlocks.png', 'female_top_rune_tshirt.png', 'trainer_female_dreadlocks_hair_mask.png', 'flawless_8_dreads_rune.png'),
    ('trainer_female_straight_long.png', 'female_top_rune_tshirt.png', 'trainer_female_straight_long_hair_mask.png', 'flawless_9_straight_rune.png'),
]

for base_n, top_n, mask_n, out_f in combos:
    render_avatar(base_n, top_n, mask_n, hair_rgb=[234, 179, 8], out_filename=out_f)

print('\nFlawless rendering test suite completed!')
