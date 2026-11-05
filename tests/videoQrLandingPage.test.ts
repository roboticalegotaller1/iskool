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
  });
});
