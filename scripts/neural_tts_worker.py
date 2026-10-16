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
import argparse
import asyncio
import edge_tts

# Mapeo exhaustivo de voces certificadas y alias activos en Edge TTS
VOICE_MAPPING = {
    # Voces nativas de México
    'es-mx-dalianeural': 'es-MX-DaliaNeural',
    'es-mx-jorgeneural': 'es-MX-JorgeNeural',
    'es-mx-beatrizneural': 'es-MX-DaliaNeural',
    'es-mx-candelaneural': 'es-US-PalomaNeural',
    'es-mx-carlotaneural': 'es-MX-DaliaNeural',
    'es-mx-renataneural': 'es-CO-SalomeNeural',
    'es-mx-nurianeural': 'es-PE-CamilaNeural',
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
    # Argentina
    'es-ar-elenaneural': 'es-AR-ElenaNeural',
    'es-ar-tomasneural': 'es-AR-TomasNeural',
    # Francés / Inglés
    'fr-fr-viviennemultilingualneural': 'fr-FR-VivienneMultilingualNeural',
    'fr-fr-deniseneural': 'fr-FR-DeniseNeural',
    'fr-fr-henrineural': 'fr-FR-HenriNeural',
    'en-us-jennyneural': 'en-US-JennyNeural',
    'en-us-guyneural': 'en-US-GuyNeural',
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
    # Figuras históricas y modos
    'sor_juana': 'es-MX-DaliaNeural',
    'miguel_hidalgo': 'es-MX-JorgeNeural',
    'josefa_ortiz': 'es-US-PalomaNeural',
    'benito_juarez': 'es-MX-JorgeNeural',
    'epic_chronist': 'es-PE-AlexNeural',
    'wisdom_guide': 'es-MX-DaliaNeural',
    'time_chrononaut': 'es-CO-GonzaloNeural'
}

def clean_and_structure_text(text: str) -> str:
    """
    Estructura el texto con cadencia humana, pausas respiratorias naturales
    y expansión fonética para erradicar totalmente cualquier tono robótico.
    """
    clean = text

    # 1. Quitar etiquetas HTML, XML o SSML residuales
    clean = re.sub(r'<[^>]+>', ' ', clean)

    # 2. Quitar markdown, links e imágenes
    clean = re.sub(r'!\[.*?\]\(.*?\)', '', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean)
    clean = re.sub(r'\[\[(.*?)\]\]', r'\1', clean)
    clean = re.sub(r'[*_#`~>\[\]]', '', clean)

    # 3. Quitar viñetas visuales y emojis
    clean = re.sub(r'[\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF]', '', clean)
    clean = re.sub(r'[•▪►✓⚡⚠️·—–-]\s*', ', ', clean)

    # 4. Simplificar códigos técnicos y expedientes para que no deletree como robot
    # Ejemplo: MAT-IBIME-2026-03D -> Expediente 03D
    clean = re.sub(r'\bMAT-[A-Z0-9]+-(\d{4})-([A-Z0-9]+)\b', r'expediente \2', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\bDEL-[A-Z0-9]+-([A-Z0-9]+)\b', r'asunto delegado \1', clean, flags=re.IGNORECASE)

    # 5. Expandir siglas y acrónimos pedagógicos para pronunciación natural y culta
    clean = re.sub(r'\bSEP\b', 'Secretaría de Educación Pública', clean)
    clean = re.sub(r'\bCEO\b', 'Dirección General', clean)
    clean = re.sub(r'\bSLA\b', 'plazo de atención', clean)
    clean = re.sub(r'\bCTE\b', 'Consejo Técnico Escolar', clean)
    clean = re.sub(r'\bNEM\b', 'Nueva Escuela Mexicana', clean)
    clean = re.sub(r'\bIBIME\b', 'Ibime', clean)  # Para que se pronuncie como palabra y no deletreado
    clean = re.sub(r'\bCCH\b', 'Colegio de Ciencias y Humanidades', clean)
    clean = re.sub(r'\bIA\b', 'Inteligencia Artificial', clean)

    # 6. Horas, tiempos y números
    clean = re.sub(r'\b(\d+)\s*hrs?\b', r'\1 horas', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b(\d+)\s*min\b', r'\1 minutos', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\((\d{1,2}):(\d{2})\s*(?:hrs?|pm|am)?\)', r'a las \1 con \2 minutos', clean, flags=re.IGNORECASE)

    # 7. Convertir listas numeradas como "1. " o "1.-" en oraciones fluidas
    clean = re.sub(r'(?:^|\n)\s*1[.-]\s*', 'Primer asunto, ', clean)
    clean = re.sub(r'(?:^|\n)\s*2[.-]\s*', 'Segundo asunto, ', clean)
    clean = re.sub(r'(?:^|\n)\s*3[.-]\s*', 'Tercer asunto, ', clean)
    clean = re.sub(r'(?:^|\n)\s*4[.-]\s*', 'Cuarto asunto, ', clean)
    clean = re.sub(r'(?:^|\n)\s*(\d+)[.-]\s*', r'Punto \1, ', clean)

    # 8. Símbolos ortográficos a palabras
    clean = re.sub(r'\s*&\s*', ' y ', clean)
    clean = re.sub(r'\s*\+\s*', ' más ', clean)
    clean = re.sub(r'\s*/\s*', ' o ', clean)
    clean = re.sub(r'\s*%\s*', ' por ciento ', clean)

    # 9. Limpiar correos electrónicos crudos (ej: contacto.padres@gmail.com -> familia o remitente)
    clean = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'remitente registrado', clean)

    # 10. Cadencia y pausas oratorias (comas y puntos bien separados)
    # Reemplazar dos puntos por coma y pausa
    clean = re.sub(r':\s*', ', ', clean)
    # Reemplazar saltos de línea repetidos por pausa natural
    clean = re.sub(r'\n+', '. ', clean)
    # Evitar comas dobles o puntos dobles
    clean = re.sub(r'[,;]+', ',', clean)
    clean = re.sub(r'\.+', '.', clean)
    clean = re.sub(r',\s*\.', '.', clean)
    clean = re.sub(r'\.\s*,', '.', clean)

    # Espacios limpios
    clean = re.sub(r'[ \t]+', ' ', clean).strip()

    # Asegurar que termine en punto final para cierre de entonación
    if clean and not clean.endswith(('.', '!', '?')):
        clean += '.'

    return clean

def resolve_target_voice(voice_input: str) -> str:
    norm = (voice_input or '').strip().lower()
    if norm in VOICE_MAPPING:
        return VOICE_MAPPING[norm]

    # Búsqueda por subcadena
    for key, val in VOICE_MAPPING.items():
        if key in norm or norm in key:
            return val

    # Si parece una voz Neural válida con prefijo es-
    if norm.startswith('es-') and 'neural' in norm:
        return voice_input

    # Predeterminado institucional cálido
    return 'es-MX-DaliaNeural'

async def synthesize(text: str, voice: str, rate: str, pitch: str, output_path: str):
    structured_text = clean_and_structure_text(text)
    if not structured_text or len(structured_text) < 3:
        structured_text = "Resumen de audio al día. No hay asuntos pendientes."

    target_voice = resolve_target_voice(voice)

    # Calibrar velocidad de prosodia
    rate_str = str(rate).strip()
    if not (rate_str.startswith('+') or rate_str.startswith('-')):
        rate_str = f"+{rate_str}"
    if not rate_str.endswith('%'):
        rate_str += '%'
    if rate_str in ('+0%', '-0%', '+0', '-0'):
        rate_str = '+0%'

    # Calibrar tono de prosodia
    pitch_str = str(pitch).strip()
    if not (pitch_str.startswith('+') or pitch_str.startswith('-')):
        pitch_str = f"+{pitch_str}"
    if not pitch_str.endswith('Hz'):
        pitch_str += 'Hz'
    if pitch_str in ('+0Hz', '-0Hz', '+0', '-0'):
        pitch_str = '+0Hz'

    communicate = edge_tts.Communicate(
        text=structured_text,
        voice=target_voice,
        rate=rate_str,
        pitch=pitch_str
    )
    await communicate.save(output_path)

def main():
    parser = argparse.ArgumentParser(description="ISkool Neural Speech Synthesizer")
    parser.add_argument("--json", help="Ruta a archivo JSON con payload o '-' para stdin")
    parser.add_argument("--text", help="Texto a sintetizar")
    parser.add_argument("--voice", default="es-MX-DaliaNeural", help="Identificador de voz")
    parser.add_argument("--rate", default="+0%", help="Ajuste de velocidad")
    parser.add_argument("--pitch", default="+0Hz", help="Ajuste de tono")
    parser.add_argument("--output", help="Ruta del archivo de salida MP3")

    args = parser.parse_args()

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
