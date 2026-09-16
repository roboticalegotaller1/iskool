import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiAuth } from '@/lib/authValidator';
import { z } from 'zod';

const ReassignSchema = z.object({
  schoolId: z.string().optional(),
  masterTeacherName: z.string().min(2).max(150).optional().default('Prof. Israel López Ángeles'),
  masterTeacherId: z.string().min(1).max(100).optional().default('usr-teacher-1'),
});

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
    // 1. Verificación estricta de Autenticación Zero-Trust
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    // 2. Control de Autorización: Solo personal directivo o superadmin puede ejecutar reasignación masiva
    const allowedRoles = ['superadmin', 'admin', 'director'];
    if (!allowedRoles.includes(auth.user.role || '')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Acceso denegado: Privilegios insuficientes para reasignar planeaciones en la Bóveda Curricular.' 
      }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = ReassignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: parsed.error.issues[0]?.message || 'Parámetros de reasignación inválidos.' 
      }, { status: 400 });
    }

    const { schoolId, masterTeacherName, masterTeacherId } = parsed.data;

    // Si no es superadmin, restringir al colegio propio
    if (auth.user.role !== 'superadmin' && auth.user.school_id && schoolId && schoolId !== auth.user.school_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Acceso denegado: No puedes reasignar contenidos de otro colegio.' 
      }, { status: 403 });
    }

    const vaultDir = getVaultPlanningsDir();
    const allFiles = getAllMarkdownFiles(vaultDir);

    let updatedCount = 0;

    for (const filePath of allFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
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
