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

interface CachedManifestState {
  dir: string;
  manifest: VideoManifest;
  mtimeMs: number;
}

const STREAM_READ_SLICE_BYTES = 256 * 1024;

function getMaster1080pManifest(): { dir: string; manifest: VideoManifest } | null {
  const g = globalThis as unknown as {
    __iskoolMasterVideo1080pManifest?: CachedManifestState;
  };

  try {
    const dir = path.join(process.cwd(), 'src', 'data', 'video-1080p');
    const manifestPath = path.join(dir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return null;

    const mtimeMs = fs.statSync(manifestPath).mtimeMs;
    const cached = g.__iskoolMasterVideo1080pManifest;
    if (cached && cached.mtimeMs === mtimeMs && cached.dir === dir) {
      return { dir: cached.dir, manifest: cached.manifest };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as VideoManifest;
    if (!manifest || !Array.isArray(manifest.chunks) || typeof manifest.totalSize !== 'number') {
      return null;
    }

    g.__iskoolMasterVideo1080pManifest = { dir, manifest, mtimeMs };
    return { dir, manifest };
  } catch (err) {
    console.error('Error al cargar metadatos del stream maestro 1080p:', err);
    return null;
  }
}

interface OverlappingChunkSlice {
  filePath: string;
  localOffset: number;
  length: number;
}

function resolveOverlappingSlices(
  dir: string,
  chunks: ChunkEntry[],
  start: number,
  end: number
): OverlappingChunkSlice[] {
  const resolvedBase = path.resolve(dir);
  const slices: OverlappingChunkSlice[] = [];

  for (const chunk of chunks) {
    const chunkStart = chunk.offset;
    const chunkEnd = chunk.offset + chunk.size - 1;
    if (chunkEnd < start || chunkStart > end) continue;

    const safeName = path.basename(chunk.name);
    const filePath = path.resolve(resolvedBase, safeName);
    if (!filePath.startsWith(resolvedBase + path.sep)) continue;

    const localOffset = Math.max(0, start - chunkStart);
    const localEnd = Math.min(chunk.size - 1, end - chunkStart);
    const length = localEnd - localOffset + 1;
    if (length > 0) {
      slices.push({ filePath, localOffset, length });
    }
  }

  return slices;
}

function createChunkRangeStream(
  slices: OverlappingChunkSlice[]
): ReadableStream<Uint8Array> {
  let sliceIdx = 0;
  let currentFh: fs.promises.FileHandle | null = null;
  let currentOffset = 0;
  let remainingInSlice = 0;
  let cancelled = false;

  const closeCurrentHandle = async () => {
    if (currentFh) {
      const fh = currentFh;
      currentFh = null;
      await fh.close().catch(() => {});
    }
  };

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (!cancelled) {
          if (!currentFh) {
            if (sliceIdx >= slices.length) {
              controller.close();
              return;
            }
            const nextSlice = slices[sliceIdx++];
            currentFh = await fs.promises.open(/*turbopackIgnore: true*/ nextSlice.filePath, 'r');
            currentOffset = nextSlice.localOffset;
            remainingInSlice = nextSlice.length;
          }

          if (remainingInSlice <= 0) {
            await closeCurrentHandle();
            continue;
          }

          const toRead = Math.min(STREAM_READ_SLICE_BYTES, remainingInSlice);
          const buf = Buffer.allocUnsafe(toRead);
          const { bytesRead } = await currentFh.read(buf, 0, toRead, currentOffset);

          if (bytesRead <= 0) {
            await closeCurrentHandle();
            continue;
          }

          currentOffset += bytesRead;
          remainingInSlice -= bytesRead;

          if (remainingInSlice <= 0) {
            await closeCurrentHandle();
          }

          if (!cancelled) {
            controller.enqueue(new Uint8Array(buf.buffer, buf.byteOffset, bytesRead));
          }
          return;
        }
      } catch (err) {
        await closeCurrentHandle();
        controller.error(err);
      }
    },
    async cancel() {
      cancelled = true;
      await closeCurrentHandle();
    }
  });
}

export async function GET(req: NextRequest) {
  const loaded = getMaster1080pManifest();
  if (!loaded || loaded.manifest.totalSize <= 0) {
    return NextResponse.json(
      { error: 'Stream maestro 1080p no disponible.' },
      { status: 404 }
    );
  }

  const { dir, manifest } = loaded;
  const totalSize = manifest.totalSize;
  const rangeHeader = req.headers.get('range');

  if (rangeHeader) {
    const match = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(match[0], 10);
    // Servir bloques de hasta 4 MB por petición Range para arranque instantáneo en 1080p
    const requestedEnd = match[1]
      ? parseInt(match[1], 10)
      : Math.min(start + 4 * 1024 * 1024 - 1, totalSize - 1);
    const end = Math.min(requestedEnd, totalSize - 1);

    if (isNaN(start) || start < 0 || start >= totalSize || isNaN(end) || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`
        }
      });
    }

    const chunkSize = end - start + 1;
    const slices = resolveOverlappingSlices(dir, manifest.chunks, start, end);
    const stream = createChunkRangeStream(slices);

    return new NextResponse(stream, {
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

  const fullSlices = resolveOverlappingSlices(dir, manifest.chunks, 0, totalSize - 1);
  const fullStream = createChunkRangeStream(fullSlices);

  return new NextResponse(fullStream, {
    status: 200,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(totalSize),
      'Content-Type': 'video/mp4',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

