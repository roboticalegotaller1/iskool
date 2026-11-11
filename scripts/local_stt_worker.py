#!/usr/bin/env python3
"""
ISkool Local & Zero-Token Speech-to-Text (STT) Worker (CLI + Persistent Daemon)
Procesa flujos de micrófono en formato PCM Float32 (16kHz), WAV en base64 o contenedores WebM/OGG/WAV/MP4/MP3,
aplica filtrado vocal pasa-banda (80Hz - 7500Hz), normalización automática de ganancia (AGC)
para micrófonos de baja sensibilidad y transcripción fonética en español de México (es-MX) a 0 tokens.
"""

import sys
import io
import os
import re
import json
import base64
import argparse
import shutil
import subprocess
import warnings

warnings.filterwarnings("ignore")

try:
    import numpy as np
    import soundfile as sf
    from scipy import signal
    HAS_DSP = True
except Exception:
    HAS_DSP = False

try:
    import speech_recognition as sr
    HAS_SR = True
except Exception:
    HAS_SR = False


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


def _normalize_and_filter_speech(samples: "np.ndarray", sample_rate: int = 16000) -> tuple["np.ndarray", float]:
    """
    Limpia offset DC, aplica filtro pasa-banda vocal (80 Hz - 7500 Hz) y normaliza
    la ganancia automáticamente (AGC) para que incluso susurros o micrófonos lejanos
    sean transcritos con claridad.
    """
    if len(samples) == 0:
        return samples, 0.0

    data = samples.astype(np.float64)
    data = np.nan_to_num(data, nan=0.0, posinf=0.0, neginf=0.0)
    data = data - np.mean(data)

    raw_rms = float(np.sqrt(np.mean(data ** 2)))
    if raw_rms < 1e-5:
        return data.astype(np.float32), raw_rms

    if HAS_DSP and len(data) > int(sample_rate * 0.1):
        try:
            nyq = sample_rate / 2.0
            low = max(65.0, min(90.0, 80.0)) / nyq
            high = min(0.96, 7500.0 / nyq)
            if low < high:
                sos = signal.butter(2, [low, high], btype="bandpass", output="sos")
                data = signal.sosfiltfilt(sos, data)
        except Exception:
            pass

    peak = float(np.max(np.abs(data)))
    if peak > 1e-4:
        target_peak = 0.88
        gain = min(25.0, target_peak / peak)
        data = np.clip(data * gain, -0.98, 0.98)

    return data.astype(np.float32), raw_rms


def _postprocess_institutional_spanish(text: str) -> str:
    """
    Refina términos institucionales frecuentes en el contexto educativo y directivo de ISkool.
    """
    if not text:
        return ""
    cleaned = text.strip()
    replacements = [
        ("ivime", "IBIME"),
        ("ibime", "IBIME"),
        ("ebitda", "EBITDA"),
        ("cfdi", "CFDI"),
        ("i mail", "iMail"),
        ("imail", "iMail"),
        ("cch", "CCH"),
        ("unam", "UNAM"),
        ("sep", "SEP"),
    ]
    lower_check = cleaned.lower()
    for wrong, right in replacements:
        if wrong in lower_check:
            cleaned = re.sub(rf"\b{re.escape(wrong)}\b", right, cleaned, flags=re.IGNORECASE)
    return cleaned


def process_audio_to_wav_bytes(pcm_f32_path: str | None, input_path: str | None, sample_rate: int = 16000) -> tuple[bytes, float, float]:
    """
    Convierte la entrada (PCM Float32 crudo o contenedor de audio) a WAV PCM 16-bit 16kHz mono en memoria.
    Retorna (wav_bytes, rms, duration_sec).
    """
    if pcm_f32_path and os.path.exists(pcm_f32_path):
        raw_bytes = open(pcm_f32_path, "rb").read()
        if len(raw_bytes) < 4:
            raise ValueError("Archivo PCM vacío")
        usable_len = (len(raw_bytes) // 4) * 4
        samples = np.frombuffer(raw_bytes[:usable_len], dtype=np.float32)
        duration_sec = float(len(samples)) / float(sample_rate)
        norm_samples, raw_rms = _normalize_and_filter_speech(samples, sample_rate)
        wav_io = io.BytesIO()
        sf.write(wav_io, norm_samples, sample_rate, format="WAV", subtype="PCM_16")
        return wav_io.getvalue(), raw_rms, duration_sec

    if input_path and os.path.exists(input_path):
        try:
            data, sr_read = sf.read(input_path, dtype="float32")
            if data.ndim > 1:
                data = np.mean(data, axis=1)
            if sr_read != sample_rate and HAS_DSP and len(data) > 0:
                target_len = int(round(len(data) * float(sample_rate) / float(sr_read)))
                if target_len > 0:
                    data = signal.resample(data, target_len).astype(np.float32)
            duration_sec = float(len(data)) / float(sample_rate)
            norm_samples, raw_rms = _normalize_and_filter_speech(data, sample_rate)
            wav_io = io.BytesIO()
            sf.write(wav_io, norm_samples, sample_rate, format="WAV", subtype="PCM_16")
            return wav_io.getvalue(), raw_rms, duration_sec
        except Exception:
            pass

        if not FFMPEG_BINARY:
            raise RuntimeError("FFmpeg no encontrado para decodificar contenedor de audio")

        proc = subprocess.run(
            [
                FFMPEG_BINARY,
                "-hide_banner",
                "-loglevel",
                "error",
                "-i",
                input_path,
                "-ar",
                str(sample_rate),
                "-ac",
                "1",
                "-f",
                "wav",
                "pipe:1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=10,
            check=False,
        )
        if proc.returncode != 0 or not proc.stdout:
            err_msg = proc.stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"FFmpeg no pudo decodificar el audio: {err_msg}")

        data, sr_read = sf.read(io.BytesIO(proc.stdout), dtype="float32")
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        duration_sec = float(len(data)) / float(sr_read or sample_rate)
        norm_samples, raw_rms = _normalize_and_filter_speech(data, sr_read or sample_rate)
        wav_io = io.BytesIO()
        sf.write(wav_io, norm_samples, sr_read or sample_rate, format="WAV", subtype="PCM_16")
        return wav_io.getvalue(), raw_rms, duration_sec

    raise ValueError("No se proporcionó archivo de entrada válido")


_RECOGNIZER = sr.Recognizer() if HAS_SR else None
if _RECOGNIZER is not None:
    _RECOGNIZER.energy_threshold = 150
    _RECOGNIZER.dynamic_energy_threshold = True


def transcribe_wav_bytes(wav_bytes: bytes, lang: str = "es-MX") -> str:
    if not HAS_SR or _RECOGNIZER is None:
        raise RuntimeError("Módulo speech_recognition no disponible")

    with sr.AudioFile(io.BytesIO(wav_bytes)) as source:
        audio_data = _RECOGNIZER.record(source)

    target_lang = "es-MX" if (not lang or lang == "es") else lang
    try:
        raw_text = _RECOGNIZER.recognize_google(audio_data, language=target_lang)
        if raw_text and str(raw_text).strip():
            return _postprocess_institutional_spanish(str(raw_text).strip())
    except sr.UnknownValueError:
        return ""
    except Exception as exc:
        raise RuntimeError(f"Error en servicio de reconocimiento: {exc}")

    return ""


def run_daemon():
    """
    Modo demonio persistente (0ms de arranque en frío):
    Recibe líneas JSON con {"id": "...", "wavB64": "...", "lang": "es-MX"}
    y responde {"id": "...", "ok": True, "transcript": "..."} por stdout.
    """
    try:
        if hasattr(sys.stdin, "reconfigure"):
            sys.stdin.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        req_id = ""
        try:
            payload = json.loads(line)
            req_id = payload.get("id", "")
            lang = payload.get("lang", "es-MX")
            wav_b64 = payload.get("wavB64", "")
            if wav_b64:
                wav_bytes = base64.b64decode(wav_b64)
                transcript = transcribe_wav_bytes(wav_bytes, lang=lang)
                sys.stdout.write(json.dumps({
                    "id": req_id,
                    "ok": bool(transcript),
                    "transcript": transcript
                }, ensure_ascii=False) + "\n")
                sys.stdout.flush()
            else:
                pcm_path = payload.get("pcmPath")
                input_path = payload.get("inputPath")
                sr_hz = int(payload.get("sr", 16000))
                wav_bytes, rms, duration_sec = process_audio_to_wav_bytes(pcm_path, input_path, sample_rate=sr_hz)
                transcript = transcribe_wav_bytes(wav_bytes, lang=lang)
                sys.stdout.write(json.dumps({
                    "id": req_id,
                    "ok": bool(transcript),
                    "transcript": transcript,
                    "rms": round(rms, 6),
                    "durationSec": round(duration_sec, 2)
                }, ensure_ascii=False) + "\n")
                sys.stdout.flush()
        except Exception as exc:
            sys.stdout.write(json.dumps({
                "id": req_id,
                "ok": False,
                "transcript": "",
                "error": str(exc)
            }, ensure_ascii=False) + "\n")
            sys.stdout.flush()


def main():
    parser = argparse.ArgumentParser(description="ISkool Local STT Worker")
    parser.add_argument("--daemon", action="store_true", help="Ejecutar como demonio persistente en memoria")
    parser.add_argument("--pcm-f32", dest="pcm_f32", help="Ruta a archivo PCM Float32 crudo")
    parser.add_argument("--input", dest="input_file", help="Ruta a archivo de audio WebM/WAV/OGG/MP4")
    parser.add_argument("--sr", type=int, default=16000, help="Frecuencia de muestreo (Hz)")
    parser.add_argument("--lang", default="es-MX", help="Código de idioma BCP-47")
    args = parser.parse_args()

    if args.daemon:
        run_daemon()
        sys.exit(0)

    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    try:
        wav_bytes, rms, duration_sec = process_audio_to_wav_bytes(
            args.pcm_f32, args.input_file, sample_rate=args.sr
        )
        if duration_sec < 0.12 or rms < 1e-5:
            print(json.dumps({
                "ok": False,
                "transcript": "",
                "rms": round(rms, 6),
                "durationSec": round(duration_sec, 2),
                "error": "Audio en silencio o demasiado corto"
            }, ensure_ascii=False))
            sys.exit(0)

        transcript = transcribe_wav_bytes(wav_bytes, lang=args.lang)
        if transcript:
            print(json.dumps({
                "ok": True,
                "transcript": transcript,
                "rms": round(rms, 6),
                "durationSec": round(duration_sec, 2)
            }, ensure_ascii=False))
        else:
            print(json.dumps({
                "ok": False,
                "transcript": "",
                "rms": round(rms, 6),
                "durationSec": round(duration_sec, 2),
                "error": "No se detectaron palabras claras en la grabación"
            }, ensure_ascii=False))
        sys.exit(0)
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "transcript": "",
            "error": str(exc)
        }, ensure_ascii=False))
        sys.exit(0)


if __name__ == "__main__":
    main()
