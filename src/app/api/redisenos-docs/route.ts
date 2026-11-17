import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiAuth } from '@/lib/authValidator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DOCS_DIR = path.resolve(process.cwd(), 'docs', 'redisenos');

export function resolveRedesignDocFile(rawId: string): string | null {
  if (!rawId || typeof rawId !== 'string') return null;
  if (!fs.existsSync(/*turbopackIgnore: true*/ DOCS_DIR)) return null;

  const trimmed = path.basename(rawId.trim());
  if (!trimmed || trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    return null;
  }

  const files = fs
    .readdirSync(/*turbopackIgnore: true*/ DOCS_DIR)
    .filter((f) => f.endsWith('.md'));

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
    if (!auth.authenticated && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Autenticación institucional requerida para consultar especificaciones.' },
        { status: 401 }
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

    const content = fs.readFileSync(/*turbopackIgnore: true*/ resolvedPath, 'utf8');
    return NextResponse.json({
      success: true,
      id,
      fileName: path.basename(resolvedPath),
      content,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al leer el documento de especificación.' },
      { status: 500 }
    );
  }
}
