import os
import glob
import re
import json

files = sorted(glob.glob('personajes_historicos/*.md'))

print(f"--- 1. AUDITING MARKDOWN FILES ({len(files)} files) ---")
total_moments = 0
duplicates_found = 0
missing_images = 0
oversized_images = 0

for f in files:
    base = os.path.basename(f)
    with open(f, encoding='utf-8') as fp:
        lines = [line.rstrip('\r\n') for line in fp]
        
    char_title = base
    for line in lines:
        if line.startswith('title:'):
            char_title = line.split(':', 1)[1].strip().strip('"\'')
            break
            
    in_moments = False
    current_moment = None
    char_moments = []
    
    for line in lines:
        if line.startswith('## '):
            h2 = line[3:].strip().lower()
            if 'momentos' in h2 or 'novela' in h2 or 'comic' in h2:
                in_moments = True
                continue
            else:
                if in_moments:
                    in_moments = False
                    if current_moment:
                        char_moments.append(current_moment)
                        current_moment = None
                    break
        
        if in_moments:
            if line.startswith('### '):
                if current_moment:
                    char_moments.append(current_moment)
                current_moment = {
                    'title': line[4:].strip(),
                    'img_url': ''
                }
            elif current_moment:
                if '![' in line and '](' in line:
                    match = re.search(r'!\[.*?\]\((.*?)\)', line)
                    if match:
                        current_moment['img_url'] = match.group(1).strip()
                        
    if current_moment:
        char_moments.append(current_moment)
        
    img_urls = [m['img_url'] for m in char_moments if m['img_url']]
    
    if len(img_urls) != len(set(img_urls)):
        print(f"DUPLICATE DETECTED in {char_title} ({base}): {img_urls}")
        duplicates_found += 1
    
    if len(char_moments) != 4:
        print(f"WARNING: {char_title} has {len(char_moments)} moments (expected 4)")
        
    for m in char_moments:
        total_moments += 1
        img = m['img_url']
        if not img:
            print(f"MISSING IMG TAG in {char_title} -> {m['title']}")
            missing_images += 1
        else:
            lp = os.path.join('public', img.lstrip('/'))
            if not os.path.exists(lp):
                print(f"FILE NOT ON DISK: {lp} for {char_title}")
                missing_images += 1
            else:
                sz = os.path.getsize(lp) / 1024
                if sz > 400:
                    print(f"OVERSIZED (>400KB): {lp} ({sz:.1f} KB)")
                    oversized_images += 1

print(f"Audited {total_moments} moments across {len(files)} characters.")
print(f"Duplicates: {duplicates_found} | Missing: {missing_images} | Oversized: {oversized_images}")

# Now let's check what feeds http://localhost:3000/teacher/studio
print("\n--- 2. AUDITING FRONTEND STUDIO DATA SOURCES ---")
studio_sources = [
    'src/data/civic_historical_figures.json',
    'src/data/characters.json',
    'public/data/civic_historical_figures.json'
]
for src in studio_sources:
    if os.path.exists(src):
        print(f"Found source: {src}")
        with open(src, encoding='utf-8') as sf:
            data = json.load(sf)
            print(f"Loaded {len(data) if isinstance(data, list) else len(data.keys())} items from {src}")
