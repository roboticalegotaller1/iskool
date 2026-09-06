import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Endpoint de Verificación Forzada de Recursos en Tiempo Real
 * Consulta directamente a los servidores de origen (oEmbed de YouTube para videos,
 * y solicitudes HEAD con timeout para portales web) garantizando que ningún enlace caído se muestre.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urls: string[] = Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []);

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    const results: Record<string, {
      isValid: boolean;
      statusCode?: number;
      title?: string;
      author?: string;
      checkedAt: string;
      error?: string;
    }> = {};

    await Promise.all(
      urls.map(async (rawUrl) => {
        const url = rawUrl.trim();
        const now = new Date().toISOString();

        // 1. Caso: Video de YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(oembedUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISkoolVerifier/1.0',
              },
            });
            clearTimeout(timeoutId);

            if (res.status === 200) {
              const data = await res.json();
              results[url] = {
                isValid: true,
                statusCode: 200,
                title: data.title,
                author: data.author_name,
                checkedAt: now,
              };
            } else {
              results[url] = {
                isValid: false,
                statusCode: res.status,
                error: res.status === 404 ? 'Video no encontrado o privado en YouTube' : `HTTP ${res.status}`,
                checkedAt: now,
              };
            }
          } catch (err: any) {
            results[url] = {
              isValid: false,
              error: err.name === 'AbortError' ? 'Tiempo de espera agotado al contactar YouTube' : err.message,
              checkedAt: now,
            };
          }
          return;
        }

        // 2. Caso: Portal Web o Enlace General
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISkoolVerifier/1.0',
            },
          });
          clearTimeout(timeoutId);

          const isValid = res.status < 400;
          results[url] = {
            isValid,
            statusCode: res.status,
            checkedAt: now,
            error: isValid ? undefined : `HTTP ${res.status}`,
          };
        } catch (err: any) {
          // Si HEAD falla por CORS o restricciones del servidor, intentar GET ligero
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const getRes = await fetch(url, {
              method: 'GET',
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISkoolVerifier/1.0',
              },
            });
            clearTimeout(timeoutId);
            const isValid = getRes.status < 400;
            results[url] = {
              isValid,
              statusCode: getRes.status,
              checkedAt: now,
              error: isValid ? undefined : `HTTP ${getRes.status}`,
            };
          } catch (innerErr: any) {
            results[url] = {
              isValid: false,
              error: innerErr.message,
              checkedAt: now,
            };
          }
        }
      })
    );

    return NextResponse.json({
      success: true,
      verifiedCount: Object.keys(results).length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno en la verificación' },
      { status: 500 }
    );
  }
}
