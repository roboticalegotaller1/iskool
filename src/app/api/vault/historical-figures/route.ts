import { NextRequest, NextResponse } from 'next/server';
import { 
  findHistoricalFigureInVault, 
  saveHistoricalFigureToVault, 
  listAllHistoricalFiguresInVault,
  normalizeHistoricalSlug 
} from '@/lib/historicalVaultEngine';
import { HistoricalFigureBlockData } from '@/types/studioBlocks';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de consulta a la Bóveda Curricular (Segundo Cerebro)
 * Garantiza 0 tokens si el nodo ya existe en el archivo Markdown.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listOnly = searchParams.get('list') === 'true';

    if (listOnly) {
      const figures = listAllHistoricalFiguresInVault();
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
      slug: normalizeHistoricalSlug(nameOrSlug),
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
    const body = await req.json();
    const figure = body.figure as HistoricalFigureBlockData;

    if (!figure || !figure.characterName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Objeto de personaje histórico inválido' 
      }, { status: 400 });
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
