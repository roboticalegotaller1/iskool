import os
import glob
import re

files = sorted(glob.glob('personajes_historicos/*.md'))
total_characters = len(files)
print(f"Total markdown files: {total_characters}")

all_moments = []

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
            if 'momentos' in h2 or 'novela gráfica' in h2 or 'comic' in h2:
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
                    'char': char_title,
                    'file': base,
                    'title': line[4:].strip(),
                    'date': '',
                    'place': '',
                    'narrative': '',
                    'img_url': ''
                }
            elif current_moment:
                if line.startswith('**Fecha**:'):
                    current_moment['date'] = line.split(':', 1)[1].strip()
                elif line.startswith('**Lugar**:'):
                    current_moment['place'] = line.split(':', 1)[1].strip()
                elif line.startswith('**Narrativa**:'):
                    current_moment['narrative'] = line.split(':', 1)[1].strip()
                elif '![' in line and '](' in line:
                    match = re.search(r'!\[.*?\]\((.*?)\)', line)
                    if match:
                        current_moment['img_url'] = match.group(1).strip()
                        
    if current_moment:
        char_moments.append(current_moment)
        
    for idx, m in enumerate(char_moments):
        m['idx'] = idx + 1
        img_url = m['img_url']
        exists = False
        if img_url:
            local_path = os.path.join('public', img_url.lstrip('/'))
            exists = os.path.exists(local_path)
            size = os.path.getsize(local_path) if exists else 0
        else:
            local_path = None
            size = 0
        m['exists'] = exists
        m['size'] = size
        all_moments.append(m)

print(f"Total parsed moments across all characters: {len(all_moments)}")
missing = [m for m in all_moments if not m['exists']]
print(f"Total missing moment images: {len(missing)}")

# Group by character
by_char = {}
for m in all_moments:
    by_char.setdefault(m['char'], []).append(m)

for char, items in by_char.items():
    missing_items = [it for it in items if not it['exists']]
    print(f"\n{char} ({items[0]['file']}): {len(items)} moments, {len(missing_items)} MISSING")
    for it in items:
        status = "OK" if it['exists'] else "MISSING"
        print(f"  [{status}] Momento {it['idx']}: {it['title']} -> {it['img_url']}")
