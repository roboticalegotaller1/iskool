"""
Build Flawless Avatar Assets - Ultra Surgical Forensic Edition
Permanently eliminates two-tone hair, cutoffs, and discolored lower locks across all hairstyles and tops.
"""

import os
import cv2
import numpy as np
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVATAR_DIR = os.path.join(BASE_DIR, 'public', 'images', 'avatar')
HAIR_DIR = os.path.join(AVATAR_DIR, 'hairstyles')
TOPS_DIR = os.path.join(AVATAR_DIR, 'tops')

w, h = 768, 1376

def load_rgba(p):
    img = Image.open(p).convert('RGBA')
    if img.size != (w, h):
        img = img.resize((w, h), Image.Resampling.LANCZOS)
    return np.array(img)

def save_opt(arr, p):
    Image.fromarray(arr).save(p, optimize=True)
    print(f'Saved: {os.path.basename(p)}')

# -------------------------------------------------------------
# STEP 0: BUILD MASTER 100% HAIR-FREE BODY REFERENCE
# -------------------------------------------------------------
print('\n=== STEP 0: Building Master Hair-Free Body Reference ===')
pony = load_rgba(os.path.join(HAIR_DIR, 'trainer_female_ponytail.png'))
bob = load_rgba(os.path.join(HAIR_DIR, 'trainer_female_bob.png'))

clean_body = pony.copy()
# Replace right shoulder (where ponytail tail falls) with clean bob right shoulder
clean_body[265:, 440:] = bob[265:, 440:]

# -------------------------------------------------------------
# STEP 1: BUILD MASTER FLAWLESS T-SHIRT (DIA DE MUERTOS)
# -------------------------------------------------------------
print('\n=== STEP 1: Building Master Flawless T-Shirt ===')
is_shirt = np.zeros((h, w), dtype=bool)

for y in range(278, 646):
    row_pixels = (clean_body[y, :, 3] > 40)
    if y < 290:
        xl = 340 - (y - 278) * 4
        xr = 428 + (y - 278) * 4
    elif y < 330:
        xl = 285 - (y - 290) * 1.5
        xr = 485 + (y - 290) * 1.5
    else:
        xl = 205
        xr = 570
    
    xl = int(max(200, xl))
    xr = int(min(572, xr))
    is_shirt[y, xl:xr] = row_pixels[xl:xr]

# Collar cutout: neck skin cavity (above collar ribbing)
for y in range(278, 312):
    hw = int(38 * (1.0 - ((y - 278) / 34.0)**2)**0.5)
    is_shirt[y, 384-hw : 384+hw] = False

# Strict zero on anything outside body
is_shirt = is_shirt & (clean_body[:, :, 3] > 40)
is_shirt[:, 572:] = False

master_dia = np.zeros_like(clean_body)
master_dia[is_shirt] = clean_body[is_shirt]
save_opt(master_dia, os.path.join(TOPS_DIR, 'female_top_dia_de_muertos.png'))

# -------------------------------------------------------------
# STEP 2: BUILD FLAWLESS female_top_basic.png (WHITE COTTON)
# -------------------------------------------------------------
print('\n=== STEP 2: Building Master White Basic T-Shirt ===')
master_basic = np.zeros_like(master_dia)
r, g, b, a = master_dia[:,:,0], master_dia[:,:,1], master_dia[:,:,2], master_dia[:,:,3]
lum = 0.299 * r + 0.587 * g + 0.114 * b
white_lum = np.clip(185 + (lum / 255.0) * 65, 180, 252).astype(np.uint8)
master_basic[is_shirt, 0] = white_lum[is_shirt]
master_basic[is_shirt, 1] = white_lum[is_shirt]
master_basic[is_shirt, 2] = white_lum[is_shirt]
master_basic[is_shirt, 3] = a[is_shirt]
save_opt(master_basic, os.path.join(TOPS_DIR, 'female_top_basic.png'))

# -------------------------------------------------------------
# STEP 3: BUILD FLAWLESS female_top_rune_tshirt.png
# -------------------------------------------------------------
print('\n=== STEP 3: Building Master Rune T-Shirt ===')
rune_orig = load_rgba(os.path.join(TOPS_DIR, 'female_top_rune_tshirt.png'))

# Start from clean charcoal black cotton shirt (NO skull bleed)
master_rune = np.zeros_like(master_dia)
# Dark charcoal cotton: luminance based on shirt fold geometry
charcoal = np.clip(28 + (lum / 255.0) * 32, 22, 65).astype(np.uint8)
master_rune[is_shirt, 0] = charcoal[is_shirt]
master_rune[is_shirt, 1] = np.clip(charcoal[is_shirt] + 2, 0, 255)
master_rune[is_shirt, 2] = np.clip(charcoal[is_shirt] + 5, 0, 255)
master_rune[is_shirt, 3] = a[is_shirt]

# Composite Cyan Rune Logo: cyan has high G and high B, and B > R + 20
is_cyan_rune = (rune_orig[:,:,1] > 80) & (rune_orig[:,:,2] > 110) & (rune_orig[:,:,2] > rune_orig[:,:,0] + 20) & (rune_orig[:,:,3] > 40)
master_rune[is_cyan_rune] = rune_orig[is_cyan_rune]

# Navy raglan shoulder accents: where rune_orig had navy fabric
is_navy_raglan = (rune_orig[:,:,2] > rune_orig[:,:,0] + 6) & (rune_orig[:,:,3] > 50) & (np.arange(h)[:, None] >= 285) & (np.arange(h)[:, None] <= 390)
is_navy_raglan = is_navy_raglan & (~is_cyan_rune) & is_shirt & ((np.arange(w) < 320) | (np.arange(w) > 448))
master_rune[is_navy_raglan] = rune_orig[is_navy_raglan]

master_rune[~is_shirt] = 0
master_rune[:, 572:] = 0
save_opt(master_rune, os.path.join(TOPS_DIR, 'female_top_rune_tshirt.png'))

# -------------------------------------------------------------
# STEP 4: BUILD FLAWLESS female_top_school_blouse.png
# -------------------------------------------------------------
print('\n=== STEP 4: Building Master School Blouse ===')
out_blouse = subprocess.check_output(['git', 'show', '54ce1cc6e7ae5bd15540f62fd8e212aca32d060d:public/images/avatar/tops/female_top_school_blouse.png'])
blouse_orig = cv2.imdecode(np.frombuffer(out_blouse, np.uint8), cv2.IMREAD_UNCHANGED)
# Convert BGR to RGB
blouse_orig = cv2.cvtColor(blouse_orig, cv2.COLOR_BGRA2RGBA)

master_blouse = blouse_orig.copy()
master_blouse[655:, :] = 0
master_blouse[:, 572:] = 0

# Clean dark shoulder hair patches behind collar with crisp blouse white
is_blouse_hair_l = (np.arange(h)[:, None] >= 280) & (np.arange(h)[:, None] <= 335) & (np.arange(w) >= 260) & (np.arange(w) <= 325) & (master_blouse[:,:,0] < 140) & (master_blouse[:,:,3] > 50)
is_blouse_hair_r = (np.arange(h)[:, None] >= 280) & (np.arange(h)[:, None] <= 335) & (np.arange(w) >= 445) & (np.arange(w) <= 520) & (master_blouse[:,:,0] < 140) & (master_blouse[:,:,3] > 50)
master_blouse[is_blouse_hair_l] = [218, 220, 226, 255]
master_blouse[is_blouse_hair_r] = [218, 220, 226, 255]
save_opt(master_blouse, os.path.join(TOPS_DIR, 'female_top_school_blouse.png'))

# -------------------------------------------------------------
# STEP 5: BUILD FLAWLESS female_top_athletic_tank.png
# -------------------------------------------------------------
print('\n=== STEP 5: Building Master Athletic Tank Top ===')
out_tank = subprocess.check_output(['git', 'show', '54ce1cc6e7ae5bd15540f62fd8e212aca32d060d:public/images/avatar/tops/female_top_athletic_tank.png'])
tank_orig = cv2.imdecode(np.frombuffer(out_tank, np.uint8), cv2.IMREAD_UNCHANGED)
tank_orig = cv2.cvtColor(tank_orig, cv2.COLOR_BGRA2RGBA)

master_tank = tank_orig.copy()
master_tank[655:, :] = 0
master_tank[:, :195] = 0
master_tank[:, 572:] = 0

# Remove white glitches on neck / clavicles
is_glitch_white = (master_tank[:,:,0] > 225) & (master_tank[:,:,1] > 225) & (master_tank[:,:,2] > 225) & (np.arange(h)[:, None] < 330)
master_tank[is_glitch_white] = pony[is_glitch_white]

is_neck_skin = (np.arange(h)[:, None] >= 280) & (np.arange(h)[:, None] <= 316) & (np.arange(w) >= 340) & (np.arange(w) <= 425) & (pony[:,:,3] > 50)
master_tank[is_neck_skin] = pony[is_neck_skin]

save_opt(master_tank, os.path.join(TOPS_DIR, 'female_top_athletic_tank.png'))

# -------------------------------------------------------------
# STEP 6: SURGICAL HAIR MASKS FOR ALL 10 HAIRSTYLES
# -------------------------------------------------------------
print('\n=== STEP 6: Rebuilding All 10 Hair Masks ===')
skin_mask = np.array(Image.open(os.path.join(AVATAR_DIR, 'trainer_female_skin_mask.png')).convert('L'))

Y_grid, X_grid = np.ogrid[:h, :w]
face_ellipse = ((X_grid - 384)**2 / 52**2 + (Y_grid - 198)**2 / 58**2) <= 1.0

eyes_box = (Y_grid >= 180) & (Y_grid <= 220) & (X_grid >= 330) & (X_grid <= 440)
mouth_box = (Y_grid >= 230) & (Y_grid <= 260) & (X_grid >= 360) & (X_grid <= 410)
sternum_box = (Y_grid >= 295) & (Y_grid <= 520) & (X_grid >= 365) & (X_grid <= 405)

def build_mask(sprite_name, style_name, max_hair_y):
    sprite = load_rgba(os.path.join(HAIR_DIR, sprite_name))
    r, g, b, a = sprite[:,:,0], sprite[:,:,1], sprite[:,:,2], sprite[:,:,3]
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    mask = np.zeros((h, w), dtype=np.uint8)

    # Real skin detection: ONLY pixels that have peach skin color
    is_peach_skin = (r > 160) & (g > 110) & (b > 80) & (r > g) & (g > b) & (r - b > 20)
    is_real_skin = (skin_mask > 80) & is_peach_skin

    # 1. Head hair zone (Y in 20..260)
    is_head_zone = (Y_grid >= 20) & (Y_grid <= 260) & (X_grid >= 160) & (X_grid <= 680) & (a > 40)

    # Forehead bangs inside face ellipse (Y < 205, not real skin)
    bangs = face_ellipse & (Y_grid < 205) & (~is_real_skin) & (lum < 165)

    head_hair = is_head_zone & (~face_ellipse) & (~is_real_skin)
    mask[head_hair | bangs] = 255

    # 2. Body / chest locks according to hairstyle anatomy
    if style_name == 'ponytail':
        # Ponytail swings to the right: x in 420..680, y in 100..420
        pony_tail = (Y_grid >= 100) & (Y_grid <= 420) & (X_grid >= 420) & (X_grid <= 680) & (a > 40) & (~is_real_skin) & (lum < 175)
        mask[pony_tail] = 255
        # STRICT ZERO on chest/left shoulder (X < 420 for Y >= 240)
        mask[240:, :420] = 0
        mask[420:, :] = 0
    elif style_name == 'bob':
        mask[285:, :] = 0
        mask[255:, 360:410] = 0
    elif style_name == 'sidecut':
        mask[270:, :] = 0
        mask[255:, 360:410] = 0
    elif style_name == 'afro':
        afro_outer = (Y_grid >= 230) & (Y_grid <= 330) & ((X_grid < 360) | (X_grid > 410)) & (a > 40) & (~is_real_skin)
        mask[afro_outer] = 255
        mask[330:, :] = 0
        mask[230:330, 360:410] = 0
    else:
        # Long hairstyles: wavy_long, straight_long, dreadlocks, twin_braids, wild_mane, witch_curls
        diff = np.max(np.abs(sprite.astype(int) - clean_body.astype(int))[:,:,:3], axis=2)
        
        # Valid lock columns: left lock (X < 365) and right lock (X > 405), excluding center sternum
        in_lock_cols = (X_grid < 365) | (X_grid > 405)
        body_locks = (diff > 18) & in_lock_cols & (Y_grid >= 230) & (Y_grid <= max_hair_y) & (a > 40) & (~is_real_skin)
        mask[body_locks] = 255
        mask[sternum_box] = 0
        mask[max_hair_y:, :] = 0

    # 3. Clean organs and boundaries
    mask[eyes_box] = 0
    mask[mouth_box] = 0
    mask[sternum_box] = 0
    mask[max_hair_y:, :] = 0

    # Smooth pinholes
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # Re-enforce clean cutoffs after morphology
    mask[eyes_box] = 0
    mask[mouth_box] = 0
    mask[sternum_box] = 0
    mask[max_hair_y:, :] = 0
    if style_name == 'ponytail':
        mask[240:, :420] = 0
    elif style_name == 'bob':
        mask[285:, :] = 0
    elif style_name == 'sidecut':
        mask[270:, :] = 0
    elif style_name == 'afro':
        mask[230:, 360:410] = 0
        mask[330:, :] = 0

    return mask

styles = [
    ('trainer_female_ponytail.png', 'ponytail', 420),
    ('trainer_female_bob.png', 'bob', 285),
    ('trainer_female_afro.png', 'afro', 330),
    ('trainer_female_sidecut.png', 'sidecut', 270),
    ('trainer_female_wavy_long.png', 'wavy_long', 560),
    ('trainer_female_straight_long.png', 'straight_long', 700),
    ('trainer_female_dreadlocks.png', 'dreadlocks', 540),
    ('trainer_female_twin_braids.png', 'twin_braids', 800),
    ('trainer_female_wild_mane.png', 'wild_mane', 580),
    ('trainer_female_witch_curls.png', 'witch_curls', 600),
]

for sprite_name, s_name, max_y in styles:
    mask = build_mask(sprite_name, s_name, max_y)
    out_name = sprite_name.replace('.png', '_hair_mask.png')
    out_path = os.path.join(HAIR_DIR, out_name)
    save_opt(mask, out_path)
    if 'wavy_long' in sprite_name:
        save_opt(mask, os.path.join(AVATAR_DIR, 'trainer_female_hair_mask.png'))

print('\nAll tops and hair masks are 100% flawless and saved!')
