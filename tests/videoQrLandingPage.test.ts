import { describe, it, expect } from 'vitest';
import { QrVideoConfigService, extractYouTubeId } from '@/lib/services/qrVideoConfigService';
import { GET } from '@/app/api/video-config/route';
import fs from 'fs';
import path from 'path';

describe('🎬 SALA EJECUTIVA DE VIDEO (/video) — https://youtu.be/WgeQVmHDNJ4 & QR WHATSAPP', () => {
  it('debe tener configurado por defecto el video oficial https://youtu.be/WgeQVmHDNJ4 (ID: WgeQVmHDNJ4)', () => {
    const config = QrVideoConfigService.getConfig();
    expect(config.youtubeId).toBe('WgeQVmHDNJ4');
    expect(extractYouTubeId(config.youtubeUrl)).toBe('WgeQVmHDNJ4');
    expect(config.autoplay).toBe(true);
  });

  it('el endpoint /api/video-config debe retornar el video WgeQVmHDNJ4 y la URL permanente https://iskool.mx/video', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.permanentQrUrl).toBe('https://iskool.mx/video');
    expect(data.config.youtubeId).toBe('WgeQVmHDNJ4');
  });

  it('debe contar con los activos optimizados del QR de WhatsApp (< 300KB) y escenario Nano Banana 2.1', () => {
    const qrWebp = path.join(process.cwd(), 'public', 'brand', 'iskool-qr-whatsapp-oficial.webp');
    const qrJpg = path.join(process.cwd(), 'public', 'brand', 'iskool-qr-whatsapp-oficial.jpg');
    const stageWebp = path.join(process.cwd(), 'public', 'brand', 'iskool-video-cinema-backdrop.webp');

    expect(fs.existsSync(qrWebp)).toBe(true);
    expect(fs.existsSync(qrJpg)).toBe(true);
    expect(fs.existsSync(stageWebp)).toBe(true);

    expect(fs.statSync(qrWebp).size).toBeLessThan(300 * 1024);
    expect(fs.statSync(qrJpg).size).toBeLessThan(300 * 1024);
    expect(fs.statSync(stageWebp).size).toBeLessThan(300 * 1024);
  });

  it('la página src/app/video/page.tsx debe incluir el video WgeQVmHDNJ4, audio activo (mute=0), QR oficial, contacto@iskool.mx y calidad hd1080', () => {
    const pageSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'video', 'page.tsx'),
      'utf8'
    );
    expect(pageSrc).toContain('WgeQVmHDNJ4');
    expect(pageSrc).toContain('contacto@iskool.mx');
    expect(pageSrc).toContain('/brand/iskool-qr-whatsapp-oficial.webp');
    expect(pageSrc).toContain('autoplay=1&mute=0');
    expect(pageSrc).toContain('vq=hd1080');
    expect(pageSrc).toContain('cc_load_policy=0');
    expect(pageSrc).toContain('/api/video-stream');
    expect(pageSrc).toContain('h-[100svh]');
    expect(pageSrc).toContain('Ver contacto ↓');
    expect(pageSrc).toContain('Toca para ver la presentación con sonido');
    expect(pageSrc).not.toContain('Sonido HD activo');
    expect(pageSrc).toContain('whitespace-nowrap');
    expect(pageSrc).toContain('break-all');
  });

  it('debe garantizar el stream nativo directo en 1080p (1920x1080) sin caída a 144p', () => {
    const manifestPath = path.join(process.cwd(), 'src', 'data', 'video-1080p', 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.videoId).toBe('WgeQVmHDNJ4');
    expect(manifest.width).toBe(1920);
    expect(manifest.height).toBe(1080);
    expect(manifest.chunks.length).toBeGreaterThan(20);
    for (const chunk of manifest.chunks) {
      const partPath = path.join(process.cwd(), 'src', 'data', 'video-1080p', chunk.name);
      expect(fs.existsSync(partPath)).toBe(true);
      expect(fs.statSync(partPath).size).toBeLessThan(1024 * 1024);
    }
  });

  it('debe garantizar fuentes WOFF2 auto-hospedadas y cero importaciones de next/font/google para evitar fallos en Turbopack build', () => {
    const expectedFonts = [
      'plus-jakarta-sans-latin.woff2',
      'jetbrains-mono-latin.woff2',
      'poppins-600-latin.woff2',
      'poppins-700-latin.woff2',
      'instrument-sans-latin.woff2',
    ];
    for (const fontFile of expectedFonts) {
      const fontPath = path.join(process.cwd(), 'public', 'fonts', fontFile);
      expect(fs.existsSync(fontPath)).toBe(true);
      expect(fs.statSync(fontPath).size).toBeGreaterThan(1000);
    }

    const layoutSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8');
    const wordmarkSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'brand', 'wordmarkFont.ts'), 'utf8');
    const landingFontsSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'landing', 'fonts.ts'), 'utf8');

    expect(layoutSrc).not.toContain('next/font/google');
    expect(wordmarkSrc).not.toContain('next/font/google');
    expect(landingFontsSrc).not.toContain('next/font/google');
  });
});
