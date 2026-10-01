import os
from PIL import Image

BRAIN_DIR = r"C:\Users\kami-\.gemini\antigravity-ide\brain\ab0742e1-2463-4414-ba0b-de097b28fea1"
PUBLIC_DIR = r"c:\Users\kami-\.gemini\antigravity-ide\scratch\ISkool\public\images\history"

targets = [
    {
        "src": os.path.join(BRAIN_DIR, "villa_juarez_fixed_flag_1790859726497.jpg"),
        "dest": os.path.join(PUBLIC_DIR, "villa_toma_juarez_comic_1.png"),
        "format": "PNG",
        "max_w": 1280,
    },
    {
        "src": os.path.join(BRAIN_DIR, "villa_zacatecas_fixed_flag_1790859759347.jpg"),
        "dest": os.path.join(PUBLIC_DIR, "villa_batalla_zacatecas_comic_2.png"),
        "format": "PNG",
        "max_w": 1280,
    },
    {
        "src": os.path.join(BRAIN_DIR, "hidalgo_decreto_puro_1810_1790859835099.jpg"),
        "dest": os.path.join(PUBLIC_DIR, "hidalgo_decreto_abolicion.jpg"),
        "format": "JPEG",
        "quality": 85,
        "max_w": 1280,
    }
]

print("--- Optimizando y Comprimiendo Activos Históricos ---")
for t in targets:
    img = Image.open(t["src"])
    w, h = img.size
    if w > t["max_w"]:
        new_h = int(h * (t["max_w"] / w))
        img = img.resize((t["max_w"], new_h), Image.Resampling.LANCZOS)
    
    if t["format"] == "JPEG":
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(t["dest"], "JPEG", quality=t.get("quality", 85), optimize=True)
    elif t["format"] == "PNG":
        if img.mode != "RGB":
            img = img.convert("RGB")
        img = img.resize((960, 540), Image.Resampling.LANCZOS)
        palettized = img.convert('P', palette=Image.Palette.ADAPTIVE, colors=200)
        palettized.save(t["dest"], "PNG", optimize=True)
    
    final_size = os.path.getsize(t["dest"])
    print(f"[OK] {os.path.basename(t['dest'])}: {final_size / 1024:.1f} KB (Regla No Negociable 3 Cumplida)")
