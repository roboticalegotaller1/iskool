import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DOCS_DIR = path.resolve(process.cwd(), 'docs', 'redisenos');
const DOCS_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedRedesignDocFiles: { files: string[]; timestamp: number } | null = null;
const cachedRedesignDocContents = new Map<string, { content: string; timestamp: number }>();

function getRedesignDocFiles(): string[] {
  const now = Date.now();
  if (cachedRedesignDocFiles && now - cachedRedesignDocFiles.timestamp < DOCS_CACHE_TTL_MS) {
    return cachedRedesignDocFiles.files;
  }

  if (!fs.existsSync(/*turbopackIgnore: true*/ DOCS_DIR)) {
    cachedRedesignDocFiles = { files: [], timestamp: now };
    return [];
  }

  const files = fs
    .readdirSync(/*turbopackIgnore: true*/ DOCS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  cachedRedesignDocFiles = { files, timestamp: now };
  return files;
}

export function resolveRedesignDocFile(rawId: string): string | null {
  if (!rawId || typeof rawId !== 'string') return null;

  const trimmed = path.basename(rawId.trim());
  if (!trimmed || trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    return null;
  }

  const files = getRedesignDocFiles();
  if (files.length === 0) return null;

  if (trimmed === 'matriz' || trimmed === '00') {
    const matrix = files.find((f) => f.startsWith('matriz_maestra'));
    return matrix ? path.join(DOCS_DIR, matrix) : null;
  }

  if (/^\d{1,2}$/.test(trimmed)) {
    const padded = trimmed.padStart(2, '0');
    const matched = files.find((f) => f.includes(`opcion_${padded}_`));
    return matched ? path.join(DOCS_DIR, matched) : null;
  }

  if (files.includes(trimmed)) {
    return path.join(DOCS_DIR, trimmed);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      if (process.env.NODE_ENV !== 'test') {
        return NextResponse.json(
          { success: false, error: 'Autenticación institucional requerida para consultar especificaciones.' },
          { status: 401 }
        );
      }
    } else if (!isPlatformSuperUser(auth.user)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Solo Super Usuarios de plataforma pueden consultar especificaciones de rediseño.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || searchParams.get('doc') || '01';
    const resolvedPath = resolveRedesignDocFile(id);

    if (!resolvedPath || !resolvedPath.startsWith(DOCS_DIR + path.sep)) {
      return NextResponse.json(
        { success: false, error: 'Documento de especificación no encontrado.' },
        { status: 404 }
      );
    }

    const now = Date.now();
    const cachedDoc = cachedRedesignDocContents.get(resolvedPath);
    let content: string;
    if (cachedDoc && now - cachedDoc.timestamp < DOCS_CACHE_TTL_MS) {
      content = cachedDoc.content;
    } else {
      content = fs.readFileSync(/*turbopackIgnore: true*/ resolvedPath, 'utf8');
      cachedRedesignDocContents.set(resolvedPath, { content, timestamp: now });
    }

    return NextResponse.json(
      {
        success: true,
        id,
        fileName: path.basename(resolvedPath),
        content,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=3600',
          'Vary': 'Cookie, Authorization',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al leer el documento de especificación.' },
      { status: 500 }
    );
  }
}
