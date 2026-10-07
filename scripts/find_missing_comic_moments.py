import os
import glob
import re

files = sorted(glob.glob('personajes_historicos/*.md'))
chars_with_missing_comic = {}

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
        
    missing_for_char = []
    for idx, m in enumerate(char_moments):
        m['idx'] = idx + 1
        img_url = m['img_url']
        local_path = os.path.join('public', img_url.lstrip('/')) if img_url else ''
        exists = os.path.exists(local_path) if local_path else False
        if not exists:
            missing_for_char.append(m)
            
    if missing_for_char:
        chars_with_missing_comic[char_title] = (base, missing_for_char)

print(f"Total characters with missing comic moments: {len(chars_with_missing_comic)}")
for char, (base, missing_items) in chars_with_missing_comic.items():
    print(f"\n=== {char} ({base}) -> {len(missing_items)} missing ===")
    for m in missing_items:
        print(f"  Momento {m['idx']}: {m['title']} ({m['date']}) -> {m['img_url']}")
        print(f"    Narrativa: {m['narrative'][:120]}...")
