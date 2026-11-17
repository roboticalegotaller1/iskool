import { NextRequest, NextResponse } from 'next/server';
import { 
  findHistoricalFigureInVault, 
  saveHistoricalFigureToVault, 
  listAllHistoricalFiguresInVault,
  normalizeHistoricalSlug,
  isSafeHistoricalSlug
} from '@/lib/historicalVaultEngine';
import { HistoricalFigureBlockData } from '@/types/studioBlocks';
import { validateApiAuth } from '@/lib/authValidator';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de consulta a la Bóveda Curricular (Segundo Cerebro)
 * Garantiza 0 tokens si el nodo ya existe en el archivo Markdown.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para consultar la Bóveda Curricular.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const listOnly = searchParams.get('list') === 'true';

    if (listOnly) {
      const figures = listAllHistoricalFiguresInVault().map((f: any) => {
        if (f && typeof f === 'object') {
          const { filePath: _fp, vaultPath: _vp, ...safe } = f;
          return safe;
        }
        return f;
      });
      return NextResponse.json({ 
        success: true, 
        count: figures.length, 
        figures,
        source: 'Bóveda Curricular Institucional'
      });
    }

    const nameOrSlug = searchParams.get('name') || searchParams.get('slug') || '';
    if (!nameOrSlug.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Debe proporcionar un nombre o slug de personaje o sitio histórico' 
      }, { status: 400 });
    }

    const normalizedSlug = normalizeHistoricalSlug(nameOrSlug);
    if (!isSafeHistoricalSlug(normalizedSlug)) {
      return NextResponse.json({
        success: false,
        error: 'Identificador de nodo no válido o caracteres prohibidos.'
      }, { status: 400 });
    }

    const figure = findHistoricalFigureInVault(nameOrSlug);
    if (figure) {
      return NextResponse.json({
        success: true,
        found: true,
        fromVault: true,
        tokenCost: 0,
        figure,
        message: 'Personaje histórico recuperado de la Bóveda Curricular con 0 consumo de tokens.'
      });
    }

    return NextResponse.json({
      success: true,
      found: false,
      slug: normalizedSlug,
      message: 'El nodo aún no existe en la Bóveda Curricular. Se procederá a generar pedagógicamente.'
    });
  } catch (error: any) {
    console.error('Error en API de Bóveda Curricular de Personajes:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}

/**
 * Guarda o actualiza un nodo en la Bóveda Curricular
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado. Se requiere sesión activa para persistir en la Bóveda.'
      }, { status: 401 });
    }
    const postRole = (auth.user.role || '').toLowerCase();
    if (!['teacher', 'director', 'coordinator', 'admin', 'superadmin', 'owner', 'ceo'].includes(postRole)) {
      return NextResponse.json({
        success: false,
        error: 'Solo docentes o personal directivo pueden guardar nodos históricos en la Bóveda.'
      }, { status: 403 });
    }

    const body = await req.json();
    const figure = body.figure as HistoricalFigureBlockData;

    if (!figure || !figure.characterName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Objeto de personaje histórico inválido' 
      }, { status: 400 });
    }

    if (figure.vaultNodeSlug) {
      const normalized = normalizeHistoricalSlug(figure.vaultNodeSlug);
      if (!isSafeHistoricalSlug(normalized)) {
        return NextResponse.json({
          success: false,
          error: 'Slug de nodo no seguro o no permitido.'
        }, { status: 400 });
      }
    }

    if (
      isDemoSandboxContext({
        email: auth.user.email,
        schoolId: auth.user.school_id || body?.schoolId,
        userId: auth.user.id,
        tenantId: auth.user.tenant_id,
      })
    ) {
      const eph = recordEphemeralVaultItem('historical_qa', {
        actorEmail: auth.user.email,
        title: figure.characterName,
        payload: { slug: figure.vaultNodeSlug || figure.characterName },
      });
      return NextResponse.json({
        success: true,
        demoSandbox: true,
        persistedInVault: false,
        ephemeralId: eph.id,
        localPath: `sandbox-ephemeral/historical/${eph.id}.md`,
        desktopPath: null,
        message: 'Modo Cuentas Demo: Personaje histórico activo en sesión temporal sin escritura en Bóveda Curricular.',
      });
    }

    const result = saveHistoricalFigureToVault(figure);
    return NextResponse.json({
      success: result.success,
      localPath: result.localPath,
      desktopPath: result.desktopPath,
      message: 'Nodo persistido con éxito en la Bóveda Curricular y sincronizado con el repositorio.'
    });
  } catch (error: any) {
    console.error('Error al persistir en Bóveda Curricular:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al guardar en bóveda' 
    }, { status: 500 });
  }
}
