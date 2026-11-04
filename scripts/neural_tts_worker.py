#!/usr/bin/env python3
"""
ISkool Neural & Generative Studio TTS Worker (v6 Conversational Human Edition)
Motor Acústico Institucional de Ultra-Realismo Conversacional Humano.
Integra Síntesis Vocal Generativa con Diseño de Voz a Medida, Biblioteca Extendida
de Actores Vocales Nativos (es-MX / es-419 / en-GB / en-US / fr-FR), Respiración
Humana Orgánica (<breath> / <short pause>) y Masterización Transparente a -14.0 LUFS.
"""

import sys
import io
import os
import re
import json
import base64
import argparse
import asyncio
import shutil
import subprocess
import warnings
import edge_tts

warnings.filterwarnings("ignore")

try:
    import numpy as np
    import soundfile as sf
    from scipy import signal
    import pyloudnorm as pyln
    HAS_STUDIO_DSP = True
except Exception:
    HAS_STUDIO_DSP = False

try:
    from pedalboard import (
        Pedalboard,
        HighpassFilter,
        PeakFilter,
        HighShelfFilter,
        Compressor,
        Limiter,
    )
    HAS_PEDALBOARD = True
except Exception:
    HAS_PEDALBOARD = False

try:
    import httpx
    HAS_STUDIO_AI = True
except Exception:
    HAS_STUDIO_AI = False


def _resolve_ffmpeg() -> str | None:
    found = shutil.which("ffmpeg")
    if found:
        return found
    candidates = [
        r"C:\Users\kami-\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe",
        r"C:\Users\kami-\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


FFMPEG_BINARY = _resolve_ffmpeg()
_STUDIO_HTTP_CLIENT = None
_STUDIO_API_KEY = None
_STUDIO_AI_CIRCUIT_OPEN = False
_MODEL_COOLDOWN_UNTIL: dict[str, float] = {}


def _get_cooldown_file_path() -> str:
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache_dir = os.path.join(root_dir, ".cache", "tts_audio")
    os.makedirs(cache_dir, exist_ok=True)
    return os.path.join(cache_dir, "_model_cooldowns.json")


def _load_persisted_cooldowns():
    global _MODEL_COOLDOWN_UNTIL
    try:
        p = _get_cooldown_file_path()
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    for k, v in data.items():
                        _MODEL_COOLDOWN_UNTIL[str(k)] = float(v)
    except Exception:
        pass


def _save_persisted_cooldowns():
    try:
        p = _get_cooldown_file_path()
        with open(p, "w", encoding="utf-8") as f:
            json.dump(_MODEL_COOLDOWN_UNTIL, f)
    except Exception:
        pass


def _get_studio_client():
    """
    Inicializa y mantiene en memoria el cliente HTTP de baja latencia del Motor Acústico
    Generativo Institucional (sin bloqueos por Retry-After en errores 429).
    Activo por defecto siempre que exista MOTOR_IA_API_KEY o AI_API_KEY en el entorno o .env.local.
    """
    global _STUDIO_HTTP_CLIENT, _STUDIO_API_KEY, _STUDIO_AI_CIRCUIT_OPEN
    if _STUDIO_AI_CIRCUIT_OPEN:
        return None
    if os.environ.get("ENABLE_CLOUD_STUDIO_TTS") == "0":
        return None
    if _STUDIO_HTTP_CLIENT is not None and _STUDIO_API_KEY:
        return (_STUDIO_HTTP_CLIENT, _STUDIO_API_KEY)
    if not HAS_STUDIO_AI:
        return None

    api_key = (
        os.environ.get("MOTOR_IA_API_KEY")
        or os.environ.get("AI_API_KEY")
        or ""
    ).strip()

    if not api_key:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        for env_name in (".env.local", ".env"):
            env_path = os.path.join(root_dir, env_name)
            if os.path.exists(env_path):
                try:
                    with open(env_path, encoding="utf-8", errors="ignore") as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith("#") and "=" in line:
                                k, v = line.split("=", 1)
                                k = k.strip()
                                v = v.strip().strip('"').strip("'")
                                if k in ("MOTOR_IA_API_KEY", "AI_API_KEY") and v:
                                    api_key = v
                                    break
                except Exception:
                    pass
            if api_key:
                break

    if not api_key:
        return None

    try:
        _load_persisted_cooldowns()
        _STUDIO_API_KEY = api_key
        _STUDIO_HTTP_CLIENT = httpx.Client(timeout=14.0)
        return (_STUDIO_HTTP_CLIENT, _STUDIO_API_KEY)
    except Exception:
        _STUDIO_AI_CIRCUIT_OPEN = True
        return None


def _extract_audio_bytes_from_interaction_json(data: dict) -> bytes | None:
    if not isinstance(data, dict):
        return None
    out_audio = data.get("output_audio") or data.get("outputAudio")
    if isinstance(out_audio, dict) and out_audio.get("data"):
        return base64.b64decode(out_audio["data"])
    steps = data.get("steps")
    if isinstance(steps, list):
        for step in reversed(steps):
            if isinstance(step, dict) and step.get("type") == "model_output":
                content = step.get("content")
                if isinstance(content, list):
                    for item in reversed(content):
                        if isinstance(item, dict) and item.get("type") == "audio" and item.get("data"):
                            return base64.b64decode(item["data"])
    return None


# =============================================================================
# CATÁLOGO DE VOCES CONVERSACIONALES HUMANAS (DISEÑO DE VOZ + BIBLIOTECA NATIVA)
# =============================================================================
# 1. Perfiles de Voz Diseñados a Medida para iSkool (Almacenados en Proyecto):
#    - voice_n1k681ufsc1y : Narradora Comercial & Sofía Dirección General (Femenina MX)
#    - voice_oqncq3e569jl : Mentora Conversacional Dalia & Guía del Saber (Femenina MX)
#    - voice_q79aaaxpz15o : Heroína e Intelectual Histórica Mexicana (Femenina MX)
#    - voice_vat8814ynez3 : Caudillo Revolucionario Mexicano (Masculina MX)
#    - voice_20glo3j2lyii : Estadista, Prócer y Patriarca Mexicano (Masculina MX)
#    - voice_ffnov7sw7hon : Narrador Ejecutivo & Cronista Épico (Masculina MX)
#
# 2. Actores Vocales Humanos Regionales (es-419 México / en-GB / en-US / fr-FR):
#    - es-419-advisor-7   : Ejecutiva Mexicana (NPR Podcast, cálida y profesional)
#    - es-419-advisor-4   : Matrona / Líder Mexicana de 40 años (firme y cercana)
#    - es-419-podcaster-2 : Locutora Joven Mexicana de 25 años (fresca y expresiva)
#    - es-419-commercial-6: Voz Literaria / Poética Mexicana (aterciopelada y reflexiva)
#    - es-419-tutor-3     : Profesora Decana Mexicana de 56 años (sabia y maternal)
#    - es-419-assistant-1 : Joven Mexicana de 25 años (cercana y juvenil)
#    - es-419-concierge-2 : Patriarca Mexicano de 61 años (sabio, sereno y paternal)
#    - es-419-concierge-7 : Estadista Mexicano de 59 años (sobrio, jurídico y claro)
#    - es-419-concierge-8 : Caudillo / Mentor Mexicano de 42 años (conversacional y franco)
#    - es-419-tutor-2     : Barítono Mexicano de 46 años (profundo, cálido y resonante)
#    - es-419-podcaster-1 : Intelectual / Crononauta Mexicano de 37 años (elocuente)
#    - es-419-podcaster-3 : Caudillo Joven / Narrador Mexicano de 37 años (seguro y ágil)
#    - es-419-assistant-9 : Cadete / Joven Mexicano de 28 años (vivaz y nítido)
# =============================================================================

VOICE_MAPPING = {
    # Voces nativas de México y Latinoamérica (Español)
    'es-mx-dalianeural': 'es-MX-DaliaNeural',
    'es-mx-jorgeneural': 'es-MX-JorgeNeural',
    'es-mx-beatrizneural': 'es-MX-DaliaNeural',
    'es-mx-candelaneural': 'es-US-PalomaNeural',
    'es-mx-carlotaneural': 'es-MX-DaliaNeural',
    'es-mx-renataneural': 'es-CO-SalomeNeural',
    'es-mx-nurianeural': 'es-PE-CamilaNeural',
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
    'es-cr-marianeural': 'es-CR-MariaNeural',
    'es-cr-juanneural': 'es-CR-JuanNeural',
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
    # Inglés Nativo (EE.UU. y Reino Unido)
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
    'sofia': 'es-US-PalomaNeural',
    # Figuras históricas y modos
    'sor_juana': 'es-CO-SalomeNeural',
    'miguel_hidalgo': 'es-MX-JorgeNeural',
    'josefa_ortiz': 'es-MX-DaliaNeural',
    'benito_juarez': 'es-MX-JorgeNeural',
    'epic_chronist': 'es-PE-AlexNeural',
    'wisdom_guide': 'es-MX-DaliaNeural',
    'time_chrononaut': 'es-CO-GonzaloNeural',
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
    Estructura el texto con fluidez conversacional humana, eliminando artefactos
    sintéticos, expandiendo cifras/siglas y preservando la puntuación natural.
    """
    clean = text or ''

    # 1. Quitar etiquetas HTML, XML o SSML residuales
    clean = re.sub(r'<[^>]+>', ' ', clean)

    # 2. Quitar markdown, links e imágenes
    clean = re.sub(r'!\[.*?\]\(.*?\)', '', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean)
    clean = re.sub(r'\[\[(.*?)\]\]', r'\1', clean)
    clean = re.sub(r'[*_#`~>\[\]]', '', clean)

    # 3. Quitar viñetas visuales y emojis
    clean = re.sub(r'[\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF✦⚡🏆📊🔍💡🚨✅]', ' ', clean)
    clean = re.sub(r'\s*[•▪►✓⚠️·]\s*', ', ', clean)
    clean = re.sub(r'\s*[—–]+\s*', ', ', clean)
    clean = re.sub(r'(?:^|\s)-\s+', ', ', clean)

    # 3.b Eliminar comas de miles dentro de cifras numéricas (ej. 3,740 -> 3740)
    clean = re.sub(r'(?<=\d),(?=\d{3}\b)', '', clean)

    if lang == 'es':
        # Limpiar caracteres en otros alfabetos (como Devanagari residual)
        clean = re.sub(r'[\u0900-\u097F]+', 'Dirección Ejecutiva', clean)

        # 4. Simplificar códigos técnicos, hashes cifrados y matrículas
        clean = re.sub(r'\(\s*(?:IBI?|MAT|DEL|STD|USR)-[A-Z0-9-]+\s*\)', '', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bMAT-[A-Z0-9]+-(\d{4})-([A-Z0-9]+)\b', r'expediente \2', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bDEL-[A-Z0-9]+-([A-Z0-9]+)\b', r'asunto delegado \1', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bIBI?-\d{4}-[A-Z0-9-]+\b', '', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{12,}\b', '', clean)

        # 5. Monedas, unidades y cantidades en español mexicano natural
        clean = re.sub(r'\$\s*([0-9]+)\.00\s*(?:MXN|pesos)?\b', r'\1 pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b([0-9]+)\s+pesos\.00\b', r'\1 pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bpunto\s+cero\s+cero\b', '', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\$\s*([0-9]+(?:\.\d{1,2})?)\s*MXN\b', r'\1 pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\$\s*([0-9]+)\b', r'\1 pesos', clean)
        clean = re.sub(r'\bMXN\s*/\s*mes\b', 'pesos al mes', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bpesos\s*/\s*mes\b', 'pesos al mes', clean, flags=re.IGNORECASE)
        clean = re.sub(r'/mes\b', ' al mes', clean, flags=re.IGNORECASE)
        clean = re.sub(r'/a[ñn]o\b', ' al año', clean, flags=re.IGNORECASE)
        clean = re.sub(r'/d[ií]a\b', ' al día', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bMXN\b', 'pesos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b(\d+)\.00\b', r'\1', clean)
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

        # 7. Expandir siglas y acrónimos pedagógicos para pronunciación natural y fluida (IPA ˈɪskuːl -> Ískul)
        clean = re.sub(r'\b(?:ái-Skool|Aiskul|ISkool|iSkool)\b', 'Ískul', clean, flags=re.IGNORECASE)
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

        # 8. Horas, tiempos, siglos en números romanos y unidades
        clean = re.sub(r'\bsiglo\s+XXI\b', 'siglo veintiuno', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bsiglo\s+XX\b', 'siglo veinte', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bsiglo\s+XIX\b', 'siglo diecinueve', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bsiglo\s+XVIII\b', 'siglo dieciocho', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bsiglo\s+XVII\b', 'siglo diecisiete', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bsiglo\s+XVI\b', 'siglo dieciséis', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bsiglo\s+XV\b', 'siglo quince', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bkm²\b', 'kilómetros cuadrados', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\bm²\b', 'metros cuadrados', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b(\d+)\s*hrs?\b', r'\1 horas', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\b(\d+)\s*min\b', r'\1 minutos', clean, flags=re.IGNORECASE)
        clean = re.sub(r'\((\d{1,2}):(\d{2})\s*(?:hrs?|pm|am)?\)', r'a las \1 con \2 minutos', clean, flags=re.IGNORECASE)

        # 9. Convertir listas numeradas en conectores conversacionales fluidos
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
        clean = re.sub(r'\bbuz[oó]n\s+buz[oó]n\s+institucional\b', 'buzón institucional', clean, flags=re.IGNORECASE)

    elif lang == 'fr':
        clean = re.sub(r'\s*%\s*', ' pour cent ', clean)
        clean = re.sub(r'\s*&\s*', ' et ', clean)

    elif lang == 'en':
        clean = re.sub(r'\s*%\s*', ' percent ', clean)
        clean = re.sub(r'\s*&\s*', ' and ', clean)

    # 12. Puntuación conversacional orgánica (convertir paréntesis en comas suaves en vez de guiones duros)
    clean = re.sub(r'\s+/\s+', ', ', clean)
    clean = re.sub(r'\s*\(([^()]{1,65})\)\s*', r', \1, ', clean)
    clean = re.sub(r'\n+', '. ', clean)
    clean = re.sub(r'\.{3,}', '...', clean)
    clean = re.sub(r'(?<!\.)\.{2}(?!\.)', '.', clean)
    clean = re.sub(r'\s*;\s*', ', ', clean)
    clean = re.sub(r'\s*:\s*', ': ', clean)
    clean = re.sub(r'(?:,\s*){2,}', ', ', clean)
    clean = re.sub(r',\s*([.;:!?])', r'\1', clean)
    clean = re.sub(r'([.;:!?])\s*,', r'\1', clean)

    # Espacios limpios
    clean = re.sub(r'[ \t]+', ' ', clean).strip()
    clean = re.sub(r'^(?:[,;:]|—)\s*', '', clean)

    if clean and not clean.endswith(('.', '!', '?', '…')):
        clean += '.'

    return clean


def resolve_target_voice(voice_input: str) -> str:
    raw = (voice_input or '').strip()
    norm = raw.lower()
    if norm in VOICE_MAPPING:
        return VOICE_MAPPING[norm]

    if re.match(r'^[a-z]{2}-[a-z]{2}-[a-z0-9]+neural$', norm):
        return raw

    for key, val in VOICE_MAPPING.items():
        if key in norm or norm in key:
            return val

    return 'es-MX-DaliaNeural'


def clamp_human_prosody(rate_raw: str, pitch_raw: str) -> tuple[str, str]:
    rate_val = 0
    rate_match = re.search(r'([+-]?\d+)', str(rate_raw or '+0%'))
    if rate_match:
        rate_val = max(-6, min(5, int(rate_match.group(1))))
    rate_str = f"+{rate_val}%" if rate_val >= 0 else f"{rate_val}%"

    pitch_val = 0
    pitch_match = re.search(r'([+-]?\d+)', str(pitch_raw or '+0Hz'))
    if pitch_match:
        pitch_val = max(-3, min(3, int(pitch_match.group(1))))
    pitch_str = f"+{pitch_val}Hz" if pitch_val >= 0 else f"{pitch_val}Hz"

    return rate_str, pitch_str


def _is_male_voice_or_character(voice_name: str, character_name: str = "", role: str = "") -> bool:
    c_lower = f"{character_name} {role}".lower()
    if any(f in c_lower for f in (
        "josefa", "sor juana", "juana inés", "juana ines", "leona", "carmen",
        "adelita", "frida", "malinche", "malintzin", "corregidora", "maestra",
        "tutora", "dalia", "salome", "camila", "paloma", "sofia", "sofía",
        "claire", "sophie", "ada", "curie", "jeanne", "wisdom_guide"
    )):
        return False
    if any(m in c_lower for m in (
        "villa", "zapata", "hidalgo", "morelos", "juárez", "juarez", "madero",
        "carranza", "allende", "guerrero", "cárdenas", "cardenas", "general",
        "caudillo", "cura", "presidente", "cuauhtemoc", "cuauhtémoc", "shakespeare",
        "lincoln", "napoleon", "napoléon", "victor hugo", "arthur", "henri",
        "epic_chronist", "time_chrononaut"
    )):
        return True
    v_lower = (voice_name or "").lower()
    return any(k in v_lower for k in (
        "jorge", "gonzalo", "alex", "alonso", "tomas", "lorenzo", "sebastian",
        "juan", "henri", "remy", "jean", "antoine", "guy", "ryan", "andrew",
        "brian", "thomas"
    ))


def _resolve_studio_voice_id(
    voice_name: str,
    character_name: str = "",
    role: str = "",
    lang: str = "es",
    is_male: bool = False,
) -> str:
    """
    Asigna el identificador exacto de Voz Humana de Estudio (Diseño de Voz a Medida
    o Biblioteca Extendida de Actores Nativos) según idioma, personaje y perfil.
    Garantiza que cada personaje histórico, narrador y tutor tenga su propio timbre humano.
    """
    v_lower = (voice_name or "").lower()
    c_lower = f"{character_name} {role} {voice_name}".lower()

    # 1. Inglés (Reino Unido vs Estados Unidos)
    if lang == "en":
        if "gb" in v_lower or any(k in c_lower for k in ("shakespeare", "ada", "lovelace", "arthur", "claire", "sonia", "ryan", "libby", "thomas")):
            return "en-gb-advisor-2" if is_male else "en-gb-advisor-1"
        if is_male:
            if "lincoln" in c_lower or "andrew" in v_lower:
                return "gacrux"
            return "puck"
        return "aoede"

    # 2. Francés (Francia / Canadá)
    if lang == "fr":
        if is_male:
            return "fr-fr-advisor-2"
        return "fr-fr-advisor-3"

    # 3. Español de México / Latinoamérica (Actores Humanos Nativos Pre-Compilados es-419 + Perfiles de Diseño de Voz)
    if v_lower.startswith("voice_") or v_lower.startswith("es-419-"):
        return voice_name

    # 3.A Figuras Históricas Masculinas y Arquetipos Masculinos
    if is_male:
        # Don Miguel Hidalgo y Costilla / Patriarcas Venerables (60+ años)
        if any(k in c_lower for k in ("hidalgo", "costilla", "padre de la patria", "anciano", "abuelo", "elder_male")):
            if "gonzalo" in v_lower:
                return "es-419-concierge-7"
            if "alonso" in v_lower:
                return "es-419-tutor-2"
            return "es-419-concierge-2"  # Patriarca Mexicano de 61 años, sabio y paternal

        # General Francisco Villa / Emiliano Zapata / Caudillos de Acción
        if any(k in c_lower for k in ("villa", "doroteo", "arango", "centauro", "zapata", "emiliano", "obregon", "obregón", "guerrero", "caudillo")):
            if "alex" in v_lower:
                return "es-419-podcaster-3"
            if "zapata" in c_lower or "guerrero" in c_lower:
                return "es-419-tutor-2"  # Barítono mexicano profundo y templado
            return "es-419-concierge-8"  # Caudillo Mexicano de 42 años, conversacional, franco y cálido

        # Presidente Benito Juárez / José María Morelos / Venustiano Carranza / Lázaro Cárdenas
        if any(k in c_lower for k in ("juarez", "juárez", "benemerito", "morelos", "siervo", "carranza", "cardenas", "cárdenas", "calles", "victoria")):
            if "morelos" in c_lower or "cardenas" in c_lower or "cárdenas" in c_lower:
                return "es-419-tutor-2"  # Barítono mexicano resonante y firme
            if "alonso" in v_lower:
                return "es-419-tutor-4"
            return "es-419-concierge-7"  # Estadista Mexicano de 59 años, sobrio y jurídico

        # Francisco I. Madero / Ricardo Flores Magón / Belisario Domínguez / Crononauta
        if any(k in c_lower for k in ("madero", "magon", "magón", "belisario", "quintana roo", "angeles", "ángeles", "posada", "time_chrononaut", "crononauta")):
            return "es-419-podcaster-1"  # Intelectual Mexicano de 37 años, culto y cálido

        # Cuauhtémoc / Ignacio Allende / Cronista Épico
        if any(k in c_lower for k in ("cuauhtemoc", "cuauhtémoc", "tlatoani", "allende", "aquiles", "epic_chronist", "cronista")):
            return "es-419-podcaster-3"  # Caudillo Joven / Narrador Mexicano firme y seguro

        # Cadetes Heroicos / Niños Héroes / Jóvenes (Alex / Alonso)
        if any(k in c_lower for k in ("cadete", "nino", "niño", "escutia", "melgar", "suarez", "marquez", "montes de oca", "barrera", "child_male", "teen_male")):
            return "es-419-assistant-9"  # Joven Mexicano de 28 años, vivaz y nítido

        # Selección por voz explícita en la matriz (Jorge vs Gonzalo vs Alex vs Alonso)
        if "gonzalo" in v_lower:
            return "es-419-podcaster-1"
        if "alex" in v_lower:
            return "es-419-podcaster-3"
        if "alonso" in v_lower:
            return "es-419-concierge-8"
        return "es-419-tutor-2"

    # 3.B Figuras Históricas Femeninas, Dirección Ejecutiva (Sofía CEO) y Mentora Pedagógica
    # Sofía CEO / Resumen Ejecutivo / Video Comercial de Ventas / Paloma Ejecutiva
    if any(k in c_lower for k in ("ceo", "ejecutiv", "triage", "finanzas", "director", "sofía", "sofia", "comercial", "ventas", "paloma")):
        return "es-419-advisor-7"  # Ejecutiva Mexicana de 32 años (NPR Broadcast, cálida y humana)

    # Heroínas e Intelectuales: Doña Josefa Ortiz, Sor Juana Inés, Leona Vicario, Carmen Serdán
    if any(k in c_lower for k in ("josefa", "corregidora", "sor juana", "juana ines", "juana inés", "asbaje", "leona", "vicario", "carmen serdan", "serdán", "frida", "malintzin", "gertrudis")):
        if "sor juana" in c_lower or "asbaje" in c_lower or "salome" in v_lower:
            return "es-419-commercial-6"  # Voz femenina mexicana poética, aterciopelada y literaria
        return "es-419-advisor-4"         # Matrona Mexicana de 40 años, digna, firme y cercana

    # Matriarcas Venerables / Decanas
    if any(k in c_lower for k in ("elder_female", "abuela", "matriarca", "venerable", "maria")):
        return "es-419-tutor-3"          # Profesora Mexicana de 56 años, cálida y sabia

    # Niñas / Adolescentes / Camila
    if any(k in c_lower for k in ("child_female", "teen_female", "camila")):
        return "es-419-assistant-1"      # Joven Mexicana de 25 años, fresca y dulce

    # Selección por voz femenina explícita (Salomé vs Camila vs Paloma vs Dalia)
    if "salome" in v_lower:
        return "es-419-commercial-6"
    if "camila" in v_lower:
        return "es-419-assistant-1"
    if "paloma" in v_lower:
        return "es-419-advisor-7"

    # Predeterminado: Mentora Conversacional Mexicana (25 años, cálida, cercana y expresiva)
    return "es-419-podcaster-2"


def _build_acting_style_prompt(is_male: bool, character_name: str = "", role: str = "", lang: str = "es") -> str:
    """
    Construye una instrucción de actuación concisa para `speech_metadata.style`
    siguiendo las mejores prácticas del Motor Acústico Generativo (sin alterar
    la identidad permanente de la voz y priorizando fluidez conversacional humana).
    """
    if lang == "en":
        return "warm, natural, fluid human conversation, engaging and expressive cadence"
    if lang == "fr":
        return "warm, natural, fluid human conversation, expressive and articulate French cadence"

    c_lower = f"{character_name} {role}".lower()

    if any(k in c_lower for k in ("villa", "zapata", "obregón", "obregon", "guerrero", "allende", "caudillo", "revolucion")):
        return "authentic, warm, passionate first-person storytelling, fluid conversational human rhythm"

    if any(k in c_lower for k in ("hidalgo", "morelos", "juárez", "juarez", "madero", "carranza", "cárdenas", "cardenas", "vasconcelos")):
        return "wise, warm, composed first-person historical conversation, natural and deeply human cadence"

    if any(k in c_lower for k in ("josefa", "sor juana", "juana inés", "leona", "carmen", "adelita", "frida", "corregidora")):
        return "expressive, warm, articulate first-person conversation, luminous and natural human cadence"

    if any(k in c_lower for k in ("ceo", "ejecutiv", "triage", "finanzas", "director", "sofía", "sofia", "copilot", "comercial", "ventas", "narrator")):
        return "warm, charismatic, confident executive conversation, natural human rhythm with a welcoming vocal smile"

    return "warm, friendly, natural human conversation, empathetic and fluid conversational pace"


def _inject_human_conversational_tags(text: str) -> str:
    """
    Inserta etiquetas vocales puntuales (<short pause> y <breath>) en transiciones
    naturales entre oraciones para que el hablante respire como un ser humano real
    durante una conversación fluida.
    """
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]
    if len(sentences) <= 1:
        return text.strip()

    out = []
    for idx, s in enumerate(sentences):
        out.append(s)
        if idx < len(sentences) - 1:
            # Alternar pausa breve conversacional y respiración orgánica suave
            if idx == 0:
                out.append("<short pause>")
            elif idx == 1 and len(s.split()) >= 8:
                out.append("<breath>")
    return " ".join(out)


def _resolve_base_model_voice_id(
    voice_name: str,
    character_name: str = "",
    role: str = "",
    lang: str = "es",
    is_male: bool = False,
) -> str:
    """
    Asigna una de las 30 voces base humanas expresivas para modelos secundarios
    (gemini-3.1-flash-tts-preview / gemini-2.5-flash-preview-tts) cuando los
    modelos primarios 3.8 alcanzan límite de cuota.
    """
    c_lower = f"{character_name} {role} {voice_name}".lower()
    if is_male:
        if any(k in c_lower for k in ("hidalgo", "anciano", "abuelo", "elder_male")):
            return "charon"
        if any(k in c_lower for k in ("villa", "zapata", "obregon", "obregón", "guerrero", "caudillo")):
            return "orus"
        if any(k in c_lower for k in ("juarez", "juárez", "morelos", "carranza", "cardenas", "cárdenas")):
            return "gacrux"
        if any(k in c_lower for k in ("madero", "magon", "magón", "belisario", "time_chrononaut", "gonzalo")):
            return "schedar"
        if any(k in c_lower for k in ("cuauhtemoc", "cuauhtémoc", "allende", "epic_chronist", "alex")):
            return "fenrir"
        if any(k in c_lower for k in ("cadete", "nino", "niño", "child_male", "teen_male")):
            return "puck"
        return "gacrux"

    if any(k in c_lower for k in ("ceo", "ejecutiv", "triage", "finanzas", "director", "sofía", "sofia", "comercial", "ventas", "paloma")):
        return "aoede"
    if any(k in c_lower for k in ("sor juana", "asbaje", "salome")):
        return "callirrhoe"
    if any(k in c_lower for k in ("josefa", "corregidora", "leona", "carmen", "frida")):
        return "kore"
    if any(k in c_lower for k in ("elder_female", "abuela", "matriarca")):
        return "vindemiatrix"
    if any(k in c_lower for k in ("child_female", "teen_female", "camila")):
        return "leda"
    return "autonoe"


def _synthesize_studio_generative_wav(
    text: str,
    voice_name: str,
    character_name: str = "",
    role: str = "",
    lang: str = "es",
) -> bytes | None:
    """
    Sintetiza audio WAV PCM a 24kHz empleando el Motor Acústico Generativo Institucional
    con rotación inteligente de modelos (gemini-3.8-flash-lite-tts -> gemini-3.8-flash-tts
    -> gemini-3.1-flash-tts-preview -> gemini-2.5-flash-preview-tts), perfiles de Diseño
    de Voz y Biblioteca Extendida de Actores Humanos Nativos.
    """
    import time as _time

    client_bundle = _get_studio_client()
    if client_bundle is None:
        return None
    http_client, api_key = client_bundle
    _load_persisted_cooldowns()

    is_male = _is_male_voice_or_character(voice_name, character_name, role)
    studio_voice_id = _resolve_studio_voice_id(voice_name, character_name, role, lang=lang, is_male=is_male)
    base_voice_id = _resolve_base_model_voice_id(voice_name, character_name, role, lang=lang, is_male=is_male)
    acting_style = _build_acting_style_prompt(is_male, character_name, role, lang=lang)

    # Restaurar 'pátria' -> 'patria' ya que la fonética nativa del motor generativo es exacta
    clean_gen_text = re.sub(r'\bpátria(s?)\b', r'patria\1', text, flags=re.IGNORECASE)
    clean_gen_text = re.sub(r'\bPátria(s?)\b', r'Patria\1', clean_gen_text)
    conversational_text = _inject_human_conversational_tags(clean_gen_text)

    prefer_full_flash = os.environ.get("PREFER_STUDIO_FLASH_TTS") == "1"
    primary_models = (
        ("gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts")
        if prefer_full_flash
        else ("gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts")
    )

    fallback_voice = "voice_ffnov7sw7hon" if is_male else "voice_n1k681ufsc1y"
    voice_candidates = [studio_voice_id]
    if fallback_voice != studio_voice_id:
        voice_candidates.append(fallback_voice)

    endpoint_url = f"https://generativelanguage.googleapis.com/v1beta/interactions?key={api_key}"
    now = _time.time()

    # 1. Modelos Primarios 3.8 (soportan es-419-*, voice_* y annotations.speech_metadata.style)
    for model_id in primary_models:
        if _MODEL_COOLDOWN_UNTIL.get(model_id, 0.0) > now:
            continue
        for candidate_voice in voice_candidates:
            try:
                resp = http_client.post(
                    endpoint_url,
                    json={
                        "model": model_id,
                        "input": [{
                            "type": "user_input",
                            "content": [{
                                "type": "text",
                                "text": conversational_text,
                                "annotations": [{
                                    "type": "speech_metadata",
                                    "style": acting_style,
                                }],
                            }],
                        }],
                        "response_format": {"type": "audio"},
                        "generation_config": {
                            "speech_config": [
                                {"voice": candidate_voice},
                            ]
                        },
                    },
                )
                if resp.status_code == 200:
                    wav_bytes = _extract_audio_bytes_from_interaction_json(resp.json())
                    if wav_bytes and len(wav_bytes) > 512:
                        return wav_bytes
                elif resp.status_code == 429:
                    _MODEL_COOLDOWN_UNTIL[model_id] = _time.time() + 900.0
                    _save_persisted_cooldowns()
                    break
            except Exception:
                continue

    # 2. Modelos Secundarios Generativos (gemini-3.1-flash-tts-preview / gemini-2.5-flash-preview-tts)
    for secondary_model in ("gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"):
        if _MODEL_COOLDOWN_UNTIL.get(secondary_model, 0.0) > now:
            continue
        try:
            resp = http_client.post(
                endpoint_url,
                json={
                    "model": secondary_model,
                    "input": [{
                        "type": "user_input",
                        "content": [{
                            "type": "text",
                            "text": clean_gen_text,
                        }],
                    }],
                    "response_format": {"type": "audio"},
                    "generation_config": {
                        "speech_config": [
                            {"voice": base_voice_id},
                        ]
                    },
                },
            )
            if resp.status_code == 200:
                wav_bytes = _extract_audio_bytes_from_interaction_json(resp.json())
                if wav_bytes and len(wav_bytes) > 512:
                    return wav_bytes
            elif resp.status_code == 429:
                _MODEL_COOLDOWN_UNTIL[secondary_model] = _time.time() + 900.0
                _save_persisted_cooldowns()
        except Exception:
            continue

    return None


def master_audio_bytes_with_ffmpeg(
    raw_audio: bytes,
    voice_name: str,
    input_fmt: str = "mp3",
    is_male_override: bool | None = None,
    character_name: str = "",
    role: str = "",
) -> bytes:
    """
    Aplica masterización acústica transparente de estudio en memoria:
    - Preserva al 100% las respiraciones humanas naturales (<breath>) y transiciones formánticas
      (sin sustracción espectral destructiva ni puertas de ruido agresivas).
    - Ecualización sutil de micrófono de condensador Neumann U87 (calidez de pecho + aire sedoso).
    - Nivelación óptica suave (1.45:1) y normalización broadcast ITU-R BS.1770-4 a -14.0 LUFS.
    - Codificación MP3 CBR 192 kbps a 24kHz.
    """
    if not FFMPEG_BINARY or not raw_audio:
        return raw_audio

    is_male = is_male_override if is_male_override is not None else _is_male_voice_or_character(voice_name, character_name, role)
    warmth_freq = 122.0 if is_male else 138.0
    warmth_gain = 1.15 if is_male else 0.95
    presence_freq = 3450.0 if is_male else 3600.0
    presence_gain = 1.10

    intermediate_wav = None
    if HAS_STUDIO_DSP:
        try:
            if input_fmt == "wav":
                pcm_bytes = raw_audio
            else:
                dec = subprocess.run(
                    [FFMPEG_BINARY, "-hide_banner", "-loglevel", "error", "-f", input_fmt, "-i", "pipe:0", "-f", "wav", "-ar", "24000", "-ac", "1", "pipe:1"],
                    input=raw_audio,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    timeout=8,
                    check=True,
                )
                pcm_bytes = dec.stdout

            data, sr = sf.read(io.BytesIO(pcm_bytes), dtype="float64")
            if data.ndim > 1:
                data = np.mean(data, axis=1)

            if len(data) > int(sr * 0.12):
                # Etapa 1: Eliminación de offset DC y filtro paso-alto subsónico suave (70 Hz)
                data = data - np.mean(data)
                sos_hp = signal.butter(2, 70.0 / (sr / 2.0), btype="highpass", output="sos")
                data = signal.sosfiltfilt(sos_hp, data)

                # Etapa 2: Cadena C++ Pedalboard transparente (sin NoiseGate ni noisereduce para proteger las respiraciones humanas)
                if HAS_PEDALBOARD:
                    try:
                        board = Pedalboard([
                            HighpassFilter(cutoff_frequency_hz=70.0),
                            PeakFilter(cutoff_frequency_hz=float(warmth_freq), gain_db=float(warmth_gain), q=1.0),
                            PeakFilter(cutoff_frequency_hz=330.0, gain_db=-0.75, q=1.5),
                            PeakFilter(cutoff_frequency_hz=float(presence_freq), gain_db=float(presence_gain), q=1.1),
                            PeakFilter(cutoff_frequency_hz=6800.0, gain_db=-1.1, q=2.2),
                            HighShelfFilter(cutoff_frequency_hz=11000.0, gain_db=1.0, q=0.707),
                            Compressor(threshold_db=-18.0, ratio=1.45, attack_ms=30.0, release_ms=180.0),
                            Limiter(threshold_db=-1.0, release_ms=60.0),
                        ])
                        data = board(data.astype(np.float32), sr).astype(np.float64)
                    except Exception:
                        pass

                # Etapa 3: Normalización broadcast EBU R128 / ITU-R BS.1770-4 (-14.0 LUFS)
                try:
                    meter = pyln.Meter(sr)
                    loudness = meter.integrated_loudness(data)
                    if not np.isinf(loudness) and not np.isnan(loudness):
                        data = pyln.normalize.loudness(data, loudness, -14.0)
                except Exception:
                    pass

                # Etapa 4: Limitador suave True-Peak a -1.0 dBTP (0.891)
                ceiling = 0.891
                abs_data = np.abs(data)
                over = abs_data > (ceiling * 0.92)
                if np.any(over):
                    t_base = ceiling * 0.92
                    span = ceiling - t_base
                    data = np.where(
                        over,
                        np.sign(data) * (t_base + span * np.tanh((abs_data - t_base) / span)),
                        data,
                    )

                wav_buf = io.BytesIO()
                sf.write(wav_buf, data.astype(np.float32), sr, format="WAV", subtype="PCM_16")
                intermediate_wav = wav_buf.getvalue()
        except Exception:
            intermediate_wav = None

    if intermediate_wav:
        try:
            proc = subprocess.run(
                [
                    FFMPEG_BINARY,
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-f",
                    "wav",
                    "-i",
                    "pipe:0",
                    "-c:a",
                    "libmp3lame",
                    "-b:a",
                    "192k",
                    "-q:a",
                    "0",
                    "-ar",
                    "24000",
                    "-f",
                    "mp3",
                    "pipe:1",
                ],
                input=intermediate_wav,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                timeout=8,
                check=True,
            )
            if proc.stdout and len(proc.stdout) > 256:
                return proc.stdout
        except Exception:
            pass

    af_chain = (
        f"highpass=f=70,"
        f"equalizer=f={warmth_freq}:t=q:w=1.0:g={warmth_gain},"
        f"equalizer=f=330:t=q:w=1.5:g=-0.8,"
        f"equalizer=f=3550:t=q:w=1.1:g=1.1,"
        f"treble=g=1.0:f=11000,"
        f"acompressor=threshold=-18dB:ratio=1.5:attack=30:release=180:makeup=1.1,"
        f"alimiter=limit=0.89:attack=5:release=50"
    )

    try:
        proc = subprocess.run(
            [
                FFMPEG_BINARY,
                "-hide_banner",
                "-loglevel",
                "error",
                "-f",
                "input_fmt" if False else input_fmt,
                "-i",
                "pipe:0",
                "-af",
                af_chain,
                "-c:a",
                "libmp3lame",
                "-b:a",
                "192k",
                "-ar",
                "24000",
                "-f",
                "mp3",
                "pipe:1",
            ],
            input=raw_audio,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=8,
            check=True,
        )
        if proc.stdout and len(proc.stdout) > 256:
            return proc.stdout
    except Exception:
        pass

    return raw_audio


async def _stream_edge_continuous(text_input: str, voice_id: str, rate_str: str, pitch_str: str) -> bytes:
    communicate = edge_tts.Communicate(
        text=text_input,
        voice=voice_id,
        rate=rate_str,
        pitch=pitch_str,
    )
    buf = bytearray()
    async for chunk in communicate.stream():
        if chunk.get("type") == "audio" and chunk.get("data"):
            buf.extend(chunk["data"])
    return bytes(buf)


async def synthesize_bytes(text: str, voice: str, rate: str, pitch: str, character_name: str = "", role: str = "") -> bytes:
    target_voice = resolve_target_voice(voice)
    lang = detect_language_from_voice(target_voice)
    structured_text = clean_and_structure_text(text, lang)
    if not structured_text or len(structured_text) < 2:
        structured_text = "Listo." if lang == 'es' else ("Ready." if lang == 'en' else "Prêt.")

    is_male = _is_male_voice_or_character(target_voice, character_name, role)

    # 1. Prioridad Principal (ES / EN / FR): Motor Acústico Generativo Institucional (Calidad Humana Conversacional)
    if lang in ('es', 'en', 'fr') and HAS_STUDIO_AI and not _STUDIO_AI_CIRCUIT_OPEN:
        loop = asyncio.get_event_loop()
        wav_bytes = await loop.run_in_executor(
            None,
            _synthesize_studio_generative_wav,
            structured_text,
            target_voice,
            character_name,
            role,
            lang,
        )
        if wav_bytes and len(wav_bytes) > 512:
            return master_audio_bytes_with_ffmpeg(
                wav_bytes,
                target_voice,
                input_fmt="wav",
                is_male_override=is_male,
                character_name=character_name,
                role=role,
            )

    # 2. Respaldo Neural Continuo de Pase Único (preservando la voz específica seleccionada sin cortes MP3)
    edge_text = re.sub(r'\bpatria\b', 'pátria', structured_text, flags=re.IGNORECASE)
    edge_text = re.sub(r'\bpatrias\b', 'pátrias', edge_text, flags=re.IGNORECASE)

    # Respetar la voz específica seleccionada (Dalia, Jorge, Salomé, Gonzalo, Alex, Camila, Paloma, Alonso, etc.)
    actual_edge_voice = target_voice
    if lang == 'es' and is_male and any(f in actual_edge_voice.lower() for f in ('dalia', 'salome', 'camila', 'paloma', 'elena', 'maria', 'catalina', 'paola')):
        actual_edge_voice = 'es-MX-JorgeNeural'
    elif lang == 'es' and not is_male and any(m in actual_edge_voice.lower() for m in ('jorge', 'gonzalo', 'alex', 'alonso', 'tomas', 'lorenzo', 'sebastian', 'juan')):
        actual_edge_voice = 'es-MX-DaliaNeural'

    r_str, p_str = clamp_human_prosody(rate, pitch)
    raw_bytes = await _stream_edge_continuous(edge_text, actual_edge_voice, r_str, p_str)

    return master_audio_bytes_with_ffmpeg(
        raw_bytes,
        actual_edge_voice,
        input_fmt="mp3",
        is_male_override=is_male,
        character_name=character_name,
        role=role,
    )


async def synthesize(text: str, voice: str, rate: str, pitch: str, output_path: str, character_name: str = "", role: str = ""):
    audio_bytes = await synthesize_bytes(text, voice, rate, pitch, character_name, role)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)


async def run_daemon():
    """
    Modo demonio persistente de latencia ultrabaja (Zero-Spawn Overhead).
    Mantiene el bucle asyncio y los módulos de síntesis y DSP precargados en memoria,
    recibiendo peticiones JSON por línea en stdin y respondiendo MP3 en base64 por stdout.
    """
    try:
        if hasattr(sys.stdin, "reconfigure"):
            sys.stdin.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    # Pre-inicializar cliente de estudio al arrancar el demonio
    _get_studio_client()

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
            character_name = payload.get("characterName", "")
            role = payload.get("role", "")
            audio_bytes = await synthesize_bytes(text, voice, rate, pitch, character_name, role)
            if len(audio_bytes) == 0:
                raise RuntimeError("Audio generado con 0 bytes")
            b64_audio = base64.b64encode(audio_bytes).decode("ascii")
            sys.stdout.write(json.dumps({"id": req_id, "ok": True, "b64": b64_audio}) + "\n")
            sys.stdout.flush()
        except Exception as exc:
            sys.stdout.write(json.dumps({"id": req_id, "ok": False, "error": str(exc)}) + "\n")
            sys.stdout.flush()


def main():
    parser = argparse.ArgumentParser(description="ISkool Neural & Generative Speech Synthesizer")
    parser.add_argument("--daemon", action="store_true", help="Ejecutar como worker persistente en memoria vía stdin/stdout")
    parser.add_argument("--json", help="Ruta a archivo JSON con payload o '-' para stdin")
    parser.add_argument("--text", help="Texto a sintetizar")
    parser.add_argument("--voice", default="es-MX-DaliaNeural", help="Identificador de voz")
    parser.add_argument("--rate", default="+0%", help="Ajuste de velocidad")
    parser.add_argument("--pitch", default="+0Hz", help="Ajuste de tono")
    parser.add_argument("--character", default="", help="Nombre del personaje o avatar")
    parser.add_argument("--role", default="", help="Rol o título del hablante")
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
    character_name = args.character
    role = args.role
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
        character_name = data.get('characterName', character_name)
        role = data.get('role', role)
        output_path = data.get('output', output_path)

    if not text or not output_path:
        print("Error: Se requiere text y output", file=sys.stderr)
        sys.exit(1)

    try:
        asyncio.run(synthesize(text, voice, rate, pitch, output_path, character_name, role))
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
