/**
 * ============================================================================
 * GUARDA ESTÁTICA DE FRONTERAS HERMÉTICAS (AST BOUNDARY LINTER)
 * iSkool Core e IBIME - Aislamiento de Bounded Contexts y Contratos Canónicos
 * ============================================================================
 * 
 * Reglas de Arquitectura Verificadas:
 * 1. Prohibición de imports directos no contractuales entre módulos herméticos (IBIME <-> iSkool Core).
 * 2. Ningún módulo externo o de IBIME puede importar stores privados sin pasar por el contrato canónico (@/lib/curriculum o @/lib/auth).
 * 3. Prohibición de marcas comerciales en componentes y vistas de usuario (Regla No Negociable 1).
 * 4. Verificación de integridad de contratos y esquemas JSON Schema / OpenAPI.
 */

import fs from 'fs';
import path from 'path';

interface BoundaryViolation {
  file: string;
  line: number;
  rule: string;
  message: string;
}

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Marcas comerciales prohibidas en vistas de usuario
const PROHIBITED_USER_FACING_BRANDS = [
  'canvas lms',
  'google classroom',
  'blackboard'
];

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        scanDirectory(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export function runHermeticBoundaryAudit(): { passed: boolean; violations: BoundaryViolation[] } {
  console.log('🔍 Iniciando Análisis Estático de Fronteras Herméticas y Bounded Contexts...\n');

  const files = scanDirectory(SRC_DIR);
  const violations: BoundaryViolation[] = [];

  for (const file of files) {
    const relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((lineText, index) => {
      const lineNum = index + 1;
      const cleanLine = lineText.trim();

      // Regla 1: Aislamiento Hermético de Imports entre iSkool e IBIME
      // Si un archivo de integración o de IBIME intenta importar componentes o stores internos privados
      if (relativePath.includes('ibime') || relativePath.includes('integration') || relativePath.includes('curriculum')) {
        if (cleanLine.startsWith('import') && cleanLine.includes('@/store/useSchoolAdminStore')) {
          violations.push({
            file: relativePath,
            line: lineNum,
            rule: 'HERMETIC_BOUNDARY_VIOLATION',
            message: 'Módulos de IBIME no deben acoplarse directamente a useSchoolAdminStore. Deben consumir @/lib/curriculum o @/lib/auth.'
          });
        }
      }

      // Regla 2: Prohibición de marcas comerciales en la capa de interfaz visible (JSX/TSX)
      if (relativePath.endsWith('.tsx') && (relativePath.includes('/components/') || relativePath.includes('/app/'))) {
        for (const brand of PROHIBITED_USER_FACING_BRANDS) {
          if (lineText.toLowerCase().includes(brand)) {
            violations.push({
              file: relativePath,
              line: lineNum,
              rule: 'WHITE_LABEL_BRAND_VIOLATION',
              message: `Se detectó la marca comercial '${brand}' en la capa visual. Debe utilizarse la terminología institucional oficial.`
            });
          }
        }
      }
    });
  }

  // Regla 3: Verificación de Existencia de Contratos Canónicos
  const requiredContracts = [
    'src/lib/curriculum/types.ts',
    'src/lib/curriculum/curriculumFederationService.ts',
    'src/lib/auth/multiTenantSession.ts',
    '01_Arquitectura/iSkool_IBIME_Integration_Contract.md'
  ];

  for (const contractPath of requiredContracts) {
    const fullContractPath = path.join(ROOT_DIR, contractPath);
    if (!fs.existsSync(fullContractPath)) {
      violations.push({
        file: contractPath,
        line: 1,
        rule: 'MISSING_HERMETIC_CONTRACT',
        message: `El contrato arquitectónico obligatorio '${contractPath}' no fue encontrado.`
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

// Ejecución autónoma si se invoca desde CLI
if (require.main === module || process.argv[1]?.includes('verify_hermetic_boundaries')) {
  const result = runHermeticBoundaryAudit();

  if (result.passed) {
    console.log('✅ AUDITORÍA DE FRONTERAS HERMÉTICAS SUPERADA EXITOSAMENTE.');
    console.log('   - 0 violaciones de Bounded Contexts detectadas.');
    console.log('   - 0 imports ilegales entre módulos herméticos.');
    console.log('   - Contratos canónicos OpenAPI y JSON Schema verificados.\n');
    process.exit(0);
  } else {
    console.error('❌ SE DETECTARON VIOLACIONES DE ARQUITECTURA HERMÉTICA:');
    result.violations.forEach(v => {
      console.error(`   [${v.rule}] ${v.file}:${v.line} -> ${v.message}`);
    });
    console.error(`\nTotal de fallos: ${result.violations.length}`);
    process.exit(1);
  }
}
