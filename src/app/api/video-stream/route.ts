import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface ChunkEntry {
  name: string;
  offset: number;
  size: number;
}

interface VideoManifest {
  videoId: string;
  width: number;
  height: number;
  totalSize: number;
  chunkSize: number;
  chunks: ChunkEntry[];
}

function getMaster1080pBuffer(): Buffer | null {
  const g = globalThis as unknown as { __iskoolMasterVideo1080pBuffer?: Buffer };
  if (g.__iskoolMasterVideo1080pBuffer) {
    return g.__iskoolMasterVideo1080pBuffer;
  }

  try {
    const dir = path.join(process.cwd(), 'src', 'data', 'video-1080p');
    const manifestPath = path.join(dir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return null;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as VideoManifest;
    const buffers: Buffer[] = [];
    for (const chunk of manifest.chunks) {
      const chunkPath = path.join(dir, chunk.name);
      buffers.push(fs.readFileSync(chunkPath));
    }
    const fullBuffer = Buffer.concat(buffers, manifest.totalSize);
    g.__iskoolMasterVideo1080pBuffer = fullBuffer;
    return fullBuffer;
  } catch (err) {
    console.error('Error al cargar el stream maestro 1080p:', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const buffer = getMaster1080pBuffer();
  if (!buffer) {
    return NextResponse.json(
      { error: 'Stream maestro 1080p no disponible.' },
      { status: 404 }
    );
  }

  const totalSize = buffer.length;
  const rangeHeader = req.headers.get('range');

  if (rangeHeader) {
    const match = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(match[0], 10);
    // Servir bloques de hasta 4 MB por petición Range para arranque instantáneo en 1080p
    const requestedEnd = match[1] ? parseInt(match[1], 10) : Math.min(start + 4 * 1024 * 1024 - 1, totalSize - 1);
    const end = Math.min(requestedEnd, totalSize - 1);

    if (isNaN(start) || start >= totalSize || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`
        }
      });
    }

    const chunkSize = end - start + 1;
    const slice = buffer.subarray(start, end + 1);

    return new NextResponse(new Uint8Array(slice), {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(totalSize),
      'Content-Type': 'video/mp4',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

