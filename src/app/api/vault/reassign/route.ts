import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Obtiene el directorio raíz canónico de las planeaciones pedagógicas.
 */
function getVaultPlanningsDir(): string {
  const envPath = process.env.CURRICULAR_VAULT_PATH || process.env.VAULT_PATH;
  if (envPath && fs.existsSync(envPath)) {
    const sub = path.join(envPath, 'planeaciones');
    return fs.existsSync(sub) ? sub : envPath;
  }

  const localProjectPlannings = path.join(process.cwd(), 'planeaciones');
  if (fs.existsSync(localProjectPlannings)) {
    return localProjectPlannings;
  }

  const desktopVault = path.join('C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool', 'planeaciones');
  if (fs.existsSync(desktopVault)) {
    return desktopVault;
  }

  return localProjectPlannings;
}

function getAllMarkdownFiles(dirPath: string): string[] {
  let results: string[] = [];
  try {
    if (!fs.existsSync(dirPath)) return results;
    const list = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        results = results.concat(getAllMarkdownFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.warn('Error leyendo directorio en Bóveda Curricular:', err);
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const schoolId = body.schoolId || '';
    const masterTeacherName = body.masterTeacherName || 'Prof. Israel López Ángeles';
    const masterTeacherId = body.masterTeacherId || 'usr-teacher-1';

    const vaultDir = getVaultPlanningsDir();
    const allFiles = getAllMarkdownFiles(vaultDir);

    let updatedCount = 0;

    for (const filePath of allFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Si el archivo menciona el colegio eliminado o no tiene docente asignado
        let updated = content;
        
        // Reasignación y acreditación oficial de autoría docente
        if (content.includes('**Docente:**') && !content.includes(masterTeacherName)) {
          updated = updated.replace(/\*\*Docente:\*\*.*$/m, `**Docente:** ${masterTeacherName}`);
          updatedCount++;
        }

        if (updated !== content) {
          fs.writeFileSync(filePath, updated, 'utf-8');
        }
      } catch (fileErr) {
        console.warn(`Error procesando archivo ${filePath}:`, fileErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Planeaciones de la Bóveda Curricular preservadas y reacreditadas exitosamente al ${masterTeacherName}`,
      filesProcessed: allFiles.length,
      filesReassigned: updatedCount,
      masterTeacher: {
        id: masterTeacherId,
        name: masterTeacherName
      }
    });
  } catch (error: any) {
    console.error('Error en reasignación de Bóveda Curricular:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
