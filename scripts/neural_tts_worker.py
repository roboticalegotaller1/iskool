#!/usr/bin/env python3
"""
ISkool Neural TTS Worker
Sintetizador de Voz Neural de Alta Fidelidad sin costo de tokens.
Genera audio humano natural mediante edge_tts con calibración oratoria y prosodia pedagógica.
"""

import sys
import os
import re
import json
import base64
import argparse
import asyncio
import edge_tts

# Mapeo exhaustivo de voces certificadas y alias activos en Edge TTS
VOICE_MAPPING = {
    # Voces nativas de México y Latinoamérica (Español)
    'es-mx-dalianeural': 'es-MX-DaliaNeural',
    'es-mx-jorgeneural': 'es-MX-JorgeNeural',
    'es-mx-beatrizneural': 'es-MX-DaliaNeural',
    'es-mx-candelaneural': 'es-US-PalomaNeural',
    'es-mx-carlotaneural': 'es-MX-DaliaNeural',
    'es-mx-renataneural': 'es-CO-SalomeNeural',
    'es-mx-nurianeural': 'es-PE-CamilaNeural',
    'es-mx-marinaNeural': 'es-PE-CamilaNeural',
    'es-mx-marinaneural': 'es-PE-CamilaNeural',
    'es-mx-larissaneural': 'es-PE-CamilaNeural',
    'es-mx-pelayoneural': 'es-PE-AlexNeural',
    'es-mx-gerardoneural': 'es-MX-JorgeNeural',
    'es-mx-libertoneural': 'es-CO-GonzaloNeural',
    'es-mx-cecilioneural': 'es-PE-AlexNeural',
    'es-mx-yagoneural': 'es-CO-GonzaloNeural',
    'es-mx-candidoneural': 'es-MX-JorgeNeural',
    'es-mx-lucianoneural': 'es-MX-JorgeNeural',
    # Colombia
    'es-co-salomeneural': 'es-CO-SalomeNeural',
    'es-co-gonzaloneural': 'es-CO-GonzaloNeural',
    # Perú
    'es-pe-alexneural': 'es-PE-AlexNeural',
    'es-pe-camilaneural': 'es-PE-CamilaNeural',
    # EE.UU. Latino
    'es-us-palomaneural': 'es-US-PalomaNeural',
    'es-us-alonsoneural': 'es-US-AlonsoNeural',
    # Argentina / Chile / Venezuela / Costa Rica
    'es-ar-elenaneural': 'es-AR-ElenaNeural',
    'es-ar-tomasneural': 'es-AR-TomasNeural',
    'es-cl-catalinaneural': 'es-CL-CatalinaNeural',
    'es-cl-lorenzoneural': 'es-CL-LorenzoNeural',
    'es-ve-paolaneural': 'es-VE-PaolaNeural',
    'es-ve-sebastianneural': 'es-VE-SebastianNeural',
    'es-cr-marianeural': 'es-CO-SalomeNeural',
    'es-cr-juanneural': 'es-CO-GonzaloNeural',
    # Francés Nativo (Francia y Canadá)
    'fr-fr-viviennemultilingualneural': 'fr-FR-VivienneMultilingualNeural',
    'fr-fr-remymultilingualneural': 'fr-FR-RemyMultilingualNeural',
    'fr-fr-deniseneural': 'fr-FR-DeniseNeural',
    'fr-fr-henrineural': 'fr-FR-HenriNeural',
    'fr-fr-eloiseneural': 'fr-FR-EloiseNeural',
    'fr-ca-sylvieneural': 'fr-CA-SylvieNeural',
    'fr-ca-jeanneural': 'fr-CA-JeanNeural',
    'fr-ca-antoineneural': 'fr-CA-AntoineNeural',
    'fr-ca-thierryneural': 'fr-CA-ThierryNeural',
    # Inglés Nativo (EE.UU. y Reino Unido · Voces Copilot / Conversational Ultra-Humanas)
    'en-us-avamultilingualneural': 'en-US-AvaMultilingualNeural',
    'en-us-avaneural': 'en-US-AvaNeural',
    'en-us-andrewmultilingualneural': 'en-US-AndrewMultilingualNeural',
    'en-us-andrewneural': 'en-US-AndrewNeural',
    'en-us-emmamultilingualneural': 'en-US-EmmaMultilingualNeural',
    'en-us-emmaneural': 'en-US-EmmaNeural',
    'en-us-brianmultilingualneural': 'en-US-BrianMultilingualNeural',
    'en-us-brianneural': 'en-US-BrianNeural',
    'en-us-jennyneural': 'en-US-JennyNeural',
    'en-us-guyneural': 'en-US-GuyNeural',
    'en-us-arianeural': 'en-US-AriaNeural',
    'en-gb-sonianeural': 'en-GB-SoniaNeural',
    'en-gb-ryanneural': 'en-GB-RyanNeural',
    'en-gb-libbyneural': 'en-GB-LibbyNeural',
    'en-gb-thomasneural': 'en-GB-ThomasNeural',
    # Alias simples
    'dalia': 'es-MX-DaliaNeural',
    'jorge': 'es-MX-JorgeNeural',
    'salome': 'es-CO-SalomeNeural',
    'gonzalo': 'es-CO-GonzaloNeural',
    'alex': 'es-PE-AlexNeural',
    'camila': 'es-PE-CamilaNeural',
    'paloma': 'es-US-PalomaNeural',
    'alonso': 'es-US-AlonsoNeural',
    'elena': 'es-AR-ElenaNeural',
    'tomas': 'es-AR-TomasNeural',
    'sofia': 'es-MX-DaliaNeural',
    # Figuras históricas y modos
    'sor_juana': 'es-MX-DaliaNeural',
    'miguel_hidalgo': 'es-MX-JorgeNeural',
    'josefa_ortiz': 'es-US-PalomaNeural',
    'benito_juarez': 'es-MX-JorgeNeural',
    'epic_chronist': 'es-PE-AlexNeural',
    'wisdom_guide': 'es-MX-DaliaNeural',
    'time_chrononaut': 'es-CO-GonzaloNeural'
}

def detect_language_from_voice(voice_name: str) -> str:
    v = (voice_name or '').lower()
    if v.startswith('fr-'):
        return 'fr'
    if v.startswith('en-'):
        return 'en'
    return 'es'

def clean_and_structure_text(text: str, lang: str = 'es') -> str:
    """
    Estructura el texto con cadencia humana, pausas respiratorias naturales
    y expansión fonética sensible al idioma (Español, Inglés o Francés)
    para erradicar totalmente cualquier tono robótico.
    """
    clean = text or ''

    # 1. Quitar etiquetas HTML, XML o SSML residuales
    clean = re.sub(r'<[^>]+>', ' ', clean)

    # 2. Quitar markdown, links e imágenes
    clean = re.sub(r'!\[.*?\]\(.*?\)', '', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean)
    clean = re.sub(r'\[\[(.*?)\]\]', r'\1', clean)
    clean = re.sub(r'[*_#`~>\[\]]', '', clean)

    # 3. Quitar viñetas visuales y emojis (SIN romper guiones internos de palabras compuestas)
    clean = re.sub(r'[\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF✦⚡🏆📊🔍💡🚨✅]', ' ', clean)
    clean = re.sub(r'\s*[•▪►✓⚠️·—–]\s*', ', ', clean)
    clean = re.sub(r'(?:^|\s)-\s+', ', ', clean)

    # 3.b Eliminar comas de miles dentro de cifras numéricas (ej. 3,740 -> 3740, 24,800 -> 24800)
    # para que el motor neuronal lea la cifra de corrido sin micro-pausas en la coma
    clean = re.sub(r'(?<=\d),(?=\d{3}\b)', '', clean)

    if lang == 'es':
        # 4. Simplificar códigos técnicos y matrículas entre paréntesis para no deletrear como robot
        clean = re.sub(r'\(\s*(?:IBI?|MAT|DEL|STD|USR)-[A-Z0-9-]+\s*\)', '', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bMAT-[A-Z0-9]+-(\d{4})-([A-Z0-9]+)\b', r'expediente \2', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bDEL-[A-Z0-9]+-([A-Z0-9]+)\b', r'asunto delegado \1', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bIBI?-\d{4}-[A-Z0-9-]+\b', '', clean, flags=re.IGNORECASE)

        # 5. Monedas, unidades con barra y cantidades en español mexicano natural ($24,800.00 MXN -> 24800 pesos)
        clean = re.sub(r'\$\s*([0-9]+)\.00\s*(?:MXN|pesos)?\b', r'\1 pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\$\s*([0-9]+(?:\.\d{1,2})?)\s*MXN\b', r'\1 pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\$\s*([0-9]+)\b', r'\1 pesos', clean)
        clean = re.sub(r'\bMXN\s*/\s*mes\b', 'pesos al mes', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bpesos\s*/\s*mes\b', 'pesos al mes', clean, flags=re.IGNORECASE)
        clean = re.sub(r'/mes\b', ' al mes', clean, flags=re.IGNORECASE)
        clean = re.sub(r'/a[ñn]o\b', ' al año', clean, flags=re.IGNORECASE)
        clean = re.sub(r'/d[ií]a\b', ' al día', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bMXN\b', 'pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b(\d+)\.(\d+)\b', r'\1 punto \2', clean)

        # 6. Grados ordinales y abreviaturas frecuentes
        clean = re.sub(r'\b1[º°]\b', 'primero', clean)
        clean = re.sub(r'\b2[º°]\b', 'segundo', clean)
        clean = re.sub(r'\b3[º°]\b', 'tercero', clean)
        clean = re.sub(r'\b4[º°]\b', 'cuarto', clean)
        clean = re.sub(r'\b5[º°]\b', 'quinto', clean)
        clean = re.sub(r'\b6[º°]\b', 'sexto', clean)
        clean = re.sub(r'\b1[ª]\b', 'primera', clean)
        clean = re.sub(r'\bProf\.\s*', 'Profesor ', clean)
        clean = re.sub(r'\bProfa\.\s*', 'Profesora ', clean)
        clean = re.sub(r'\bDra\.\s*', 'Doctora ', clean)
        clean = re.sub(r'\bDr\.\s*', 'Doctor ', clean)
        clean = re.sub(r'\bMtro\.\s*', 'Maestro ', clean)
        clean = re.sub(r'\bMtra\.\s*', 'Maestra ', clean)
        clean = re.sub(r'\bLic\.\s*', 'Licenciada ', clean)
        clean = re.sub(r'\bIng\.\s*', 'Ingeniero ', clean)
        clean = re.sub(r'\bC\.P\.\s*', 'Contador Público ', clean)

        # 7. Expandir siglas y acrónimos pedagógicos para pronunciación natural y fluida
        clean = re.sub(r'\bSEP\s+NEM\b', 'Nueva Escuela Mexicana', clean)
        clean = re.sub(r'\bSEP\b', 'Secretaría de Educación Pública', clean)
        clean = re.sub(r'\bCEO\b', 'Dirección General', clean)
        clean = re.sub(r'\bSLA\b', 'plazo de atención', clean)
        clean = re.sub(r'\bCTE\b', 'Consejo Técnico Escolar', clean)
        clean = re.sub(r'\bNEM\b', 'Nueva Escuela Mexicana', clean)
        clean = re.sub(r'\bIBIME\b', 'Ibime', clean)
        clean = re.sub(r'\bCCH[-\s]+UNAM\b', 'C C H de la UNAM', clean)
        clean = re.sub(r'\bCCH\b', 'C C H', clean)
        clean = re.sub(r'\bEBITDA\b', 'Ebitda', clean)
        clean = re.sub(r'\bSAT\b', 'SAT', clean)
        clean = re.sub(r'\bCFDI\s*4\.0\b', 'C F D I cuatro punto cero', clean)
        clean = re.sub(r'\bIEDU\b', 'complemento educativo', clean)
        clean = re.sub(r'\bIA\b', 'Inteligencia Artificial', clean)

        # 8. Horas, tiempos y números
        clean = re.sub(r'\b(\d+)\s*hrs?\b', r'\1 horas', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b(\d+)\s*min\b', r'\1 minutos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\((\d{1,2}):(\d{2})\s*(?:hrs?|pm|am)?\)', r'a las \1 con \2 minutos', clean, flags=re.IGNORECASE)

        # 9. Convertir listas numeradas como "1. " o "1.-" en oraciones fluidas
        clean = re.sub(r'(?:^|\n)\s*1[.-]\s*', 'Primero, ', clean)
        clean = re.sub(r'(?:^|\n)\s*2[.-]\s*', 'Segundo, ', clean)
        clean = re.sub(r'(?:^|\n)\s*3[.-]\s*', 'Tercero, ', clean)
        clean = re.sub(r'(?:^|\n)\s*4[.-]\s*', 'Cuarto, ', clean)

        # 10. Símbolos ortográficos a palabras en español
        clean = re.sub(r'\s*&\s*', ' y ', clean)
        clean = re.sub(r'\s*\+\s*', ' más ', clean)
        clean = re.sub(r'\s*%\s*', ' por ciento ', clean)

        # 11. Limpiar correos electrónicos crudos
        clean = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'buzón institucional', clean)

    elif lang == 'fr':
        clean = re.sub(r'\s*%\s*', ' pour cent ', clean)
        clean = re.sub(r'\s*&\s*', ' et ', clean)

    elif lang == 'en':
        clean = re.sub(r'\s*%\s*', ' percent ', clean)
        clean = re.sub(r'\s*&\s*', ' and ', clean)

    # 12. Cadencia y fluidez oratoria (unificar paréntesis explicativos y barras espaciadas sin micro-cortes)
    clean = re.sub(r'\s+/\s+', ', ', clean)
    clean = re.sub(r'\s*\(([^()]{1,60})\)\s*', r', \1, ', clean)
    clean = re.sub(r':\s*', ', ', clean)
    clean = re.sub(r'\n+', '. ', clean)
    clean = re.sub(r'\s*[,;]+\s*', ', ', clean)
    clean = re.sub(r'(?:,\s*){2,}', ', ', clean)
    clean = re.sub(r'\.{2,}', '.', clean)
    clean = re.sub(r',\s*\.', '.', clean)
    clean = re.sub(r'\.\s*,', '.', clean)

    # Espacios limpios
    clean = re.sub(r'[ \t]+', ' ', clean).strip()
    clean = re.sub(r'^,\s*', '', clean)

    # Asegurar que termine en punto final para cierre natural de entonación
    if clean and not clean.endswith(('.', '!', '?')):
        clean += '.'

    return clean

def resolve_target_voice(voice_input: str) -> str:
    raw = (voice_input or '').strip()
    norm = raw.lower()
    if norm in VOICE_MAPPING:
        return VOICE_MAPPING[norm]

    # Si es un identificador neural válido de Edge TTS (es-*, en-*, fr-*, de-*, it-*, pt-*)
    if re.match(r'^[a-z]{2}-[a-z]{2}-[a-z0-9]+neural$', norm):
        return raw

    # Búsqueda por subcadena en el diccionario
    for key, val in VOICE_MAPPING.items():
        if key in norm or norm in key:
            return val

    # Predeterminado institucional cálido y dulce
    return 'es-MX-DaliaNeural'

def clamp_human_prosody(rate_raw: str, pitch_raw: str) -> tuple[str, str]:
    """
    Garantiza que los parámetros de velocidad (rate) y tono (pitch) se mantengan
    dentro de la ventana formántica humana natural (evitando el efecto vocoder/robótico).
    - Rate permitido: -8% a +6%
    - Pitch permitido: -4Hz a +4Hz
    """
    rate_val = 0
    rate_match = re.search(r'([+-]?\d+)', str(rate_raw or '+0%'))
    if rate_match:
        rate_val = max(-8, min(6, int(rate_match.group(1))))
    rate_str = f"+{rate_val}%" if rate_val >= 0 else f"{rate_val}%"

    pitch_val = 0
    pitch_match = re.search(r'([+-]?\d+)', str(pitch_raw or '+0Hz'))
    if pitch_match:
        pitch_val = max(-4, min(4, int(pitch_match.group(1))))
    pitch_str = f"+{pitch_val}Hz" if pitch_val >= 0 else f"{pitch_val}Hz"

    return rate_str, pitch_str

async def synthesize_bytes(text: str, voice: str, rate: str, pitch: str) -> bytes:
    target_voice = resolve_target_voice(voice)
    lang = detect_language_from_voice(target_voice)
    structured_text = clean_and_structure_text(text, lang)
    if not structured_text or len(structured_text) < 2:
        structured_text = "Listo." if lang == 'es' else ("Ready." if lang == 'en' else "Prêt.")

    rate_str, pitch_str = clamp_human_prosody(rate, pitch)

    communicate = edge_tts.Communicate(
        text=structured_text,
        voice=target_voice,
        rate=rate_str,
        pitch=pitch_str
    )
    buf = bytearray()
    async for chunk in communicate.stream():
        if chunk.get("type") == "audio" and chunk.get("data"):
            buf.extend(chunk["data"])
    return bytes(buf)

async def synthesize(text: str, voice: str, rate: str, pitch: str, output_path: str):
    audio_bytes = await synthesize_bytes(text, voice, rate, pitch)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)

async def run_daemon():
    """
    Modo demonio persistente de latencia ultrabaja (Zero-Spawn Overhead).
    Mantiene el bucle asyncio y los módulos TLS/aiohttp precargados en memoria,
    recibiendo peticiones JSON por línea en stdin y respondiendo MP3 en base64 por stdout.
    """
    try:
        if hasattr(sys.stdin, "reconfigure"):
            sys.stdin.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, sys.stdin.readline)
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        req_id = ""
        try:
            payload = json.loads(line)
            req_id = payload.get("id", "")
            text = payload.get("text", "")
            voice = payload.get("voice", "es-MX-DaliaNeural")
            rate = payload.get("rate", "+0%")
            pitch = payload.get("pitch", "+0Hz")
            audio_bytes = await synthesize_bytes(text, voice, rate, pitch)
            if len(audio_bytes) == 0:
                raise RuntimeError("Audio generado con 0 bytes")
            b64_audio = base64.b64encode(audio_bytes).decode("ascii")
            sys.stdout.write(json.dumps({"id": req_id, "ok": True, "b64": b64_audio}) + "\n")
            sys.stdout.flush()
        except Exception as exc:
            sys.stdout.write(json.dumps({"id": req_id, "ok": False, "error": str(exc)}) + "\n")
            sys.stdout.flush()

def main():
    parser = argparse.ArgumentParser(description="ISkool Neural Speech Synthesizer")
    parser.add_argument("--daemon", action="store_true", help="Ejecutar como worker persistente en memoria vía stdin/stdout")
    parser.add_argument("--json", help="Ruta a archivo JSON con payload o '-' para stdin")
    parser.add_argument("--text", help="Texto a sintetizar")
    parser.add_argument("--voice", default="es-MX-DaliaNeural", help="Identificador de voz")
    parser.add_argument("--rate", default="+0%", help="Ajuste de velocidad")
    parser.add_argument("--pitch", default="+0Hz", help="Ajuste de tono")
    parser.add_argument("--output", help="Ruta del archivo de salida MP3")

    args = parser.parse_args()

    if args.daemon:
        try:
            asyncio.run(run_daemon())
        except KeyboardInterrupt:
            pass
        sys.exit(0)

    text = args.text
    voice = args.voice
    rate = args.rate
    pitch = args.pitch
    output_path = args.output

    if args.json:
        if args.json == '-':
            data = json.load(sys.stdin)
        else:
            with open(args.json, 'r', encoding='utf-8') as f:
                data = json.load(f)
        text = data.get('text', text)
        voice = data.get('voice', voice)
        rate = data.get('rate', rate)
        pitch = data.get('pitch', pitch)
        output_path = data.get('output', output_path)

    if not text or not output_path:
        print("Error: Se requiere text y output", file=sys.stderr)
        sys.exit(1)

    try:
        asyncio.run(synthesize(text, voice, rate, pitch, output_path))
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            sys.exit(0)
        else:
            print("Error: El archivo generado está vacío", file=sys.stderr)
            sys.exit(1)
    except Exception as exc:
        print(f"Error en síntesis neural: {exc}", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    main()
