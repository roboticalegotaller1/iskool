/**
 * ============================================================================
 * GUARDA ESTÁTICA DE FRONTERAS HERMÉTICAS (AST BOUNDARY LINTER)
 * iSkool Core e IBIME - Aislamiento de Bounded Contexts y Contratos Canónicos
 * ============================================================================
 * 
 * Verificación Integral con TypeScript AST:
 * a) Static imports ('ImportDeclaration')
 * b) Dynamic imports ('CallExpression' con 'import()')
 * c) Re-exports ('ExportDeclaration')
 * d) Rutas relativas que escapen de los bounded contexts (ej. '../../')
 * e) Regla case-insensitive para detectar menciones de marcas cruzadas en literales JSX/TSX
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

interface BoundaryViolation {
  file: string;
  line: number;
  rule: string;
  message: string;
}

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Marcas comerciales prohibidas en vistas de usuario (Regla No Negociable 1)
const PROHIBITED_COMMERCIAL_BRANDS = [
  'canvas lms',
  'google classroom',
  'blackboard',
  'gemini',
  'obsidian',
  'github'
];

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name !== 'node_modules' &&
        entry.name !== '.next' &&
        entry.name !== '.git' &&
        entry.name !== 'coverage'
      ) {
        scanDirectory(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export function runHermeticBoundaryAudit(): { passed: boolean; violations: BoundaryViolation[] } {
  console.log('🔍 Iniciando Auditoría AST de Fronteras Herméticas y Bounded Contexts...\n');

  const files = scanDirectory(SRC_DIR);
  const violations: BoundaryViolation[] = [];

  for (const filePath of files) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const sourceCode = fs.readFileSync(filePath, 'utf8');

    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const isIbimeContext = relativePath.includes('ibime');
    const isIskoolPrivateStore = relativePath.startsWith('src/store/');

    // Función auxiliar para registrar violaciones con número de línea exacto
    function report(node: ts.Node, rule: string, message: string) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({
        file: relativePath,
        line: line + 1,
        rule,
        message
      });
    }

    // Validación de especificadores de módulo (static, dynamic, re-export)
    function validateModuleSpecifier(specifier: string, node: ts.Node) {
      // 1. Aislamiento de IBIME: Prohibición de importar stores privados de iSkool
      if (isIbimeContext) {
        if (
          specifier.includes('store/useSchoolAdminStore') ||
          specifier.includes('store/useTeacherStore') ||
          specifier.includes('store/useStudentStore')
        ) {
          report(
            node,
            'HERMETIC_BOUNDARY_VIOLATION',
            `Módulos de IBIME no deben acoplarse directamente a stores privados (${specifier}). Deben consumir contratos canónicos en @/lib/curriculum o @/lib/auth.`
          );
        }
      }

      // 2. Control de Rutas Relativas que escapen del Bounded Context (ej. ../../)
      if (specifier.startsWith('.')) {
        const targetResolved = path.resolve(path.dirname(filePath), specifier).replace(/\\/g, '/');
        const relativeTarget = path.relative(ROOT_DIR, targetResolved).replace(/\\/g, '/');

        if (isIbimeContext) {
          // Si un módulo de IBIME escapa hacia carpetas de stores privados o app interna de iSkool con ruta relativa
          if (
            relativeTarget.startsWith('src/store') ||
            relativeTarget.startsWith('src/app/teacher') ||
            relativeTarget.startsWith('src/app/admin')
          ) {
            report(
              node,
              'RELATIVE_BOUNDED_CONTEXT_ESCAPE',
              `Ruta relativa '${specifier}' escapa del bounded context de IBIME hacia módulos privados (${relativeTarget}). Utilice contratos canónicos @/lib/* en su lugar.`
            );
          }
        }
      }
    }

    // Recorrido del AST de TypeScript
    function visit(node: ts.Node) {
      // a) Static imports: ImportDeclaration
      if (ts.isImportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          validateModuleSpecifier(node.moduleSpecifier.text, node);
        }
      }

      // b) Dynamic imports: CallExpression con import()
      if (ts.isCallExpression(node)) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const firstArg = node.arguments[0];
          if (firstArg && ts.isStringLiteral(firstArg)) {
            validateModuleSpecifier(firstArg.text, node);
          }
        }
      }

      // c) Re-exports: ExportDeclaration
      if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          validateModuleSpecifier(node.moduleSpecifier.text, node);
        }
      }

      // d) Detección de Marcas Comerciales y Marcas Cruzadas en Literales JSX/TSX (Case-Insensitive)
      if (filePath.endsWith('.tsx') && (relativePath.includes('/components/') || relativePath.includes('/app/'))) {
        let textToCheck: string | null = null;

        if (ts.isJsxText(node)) {
          textToCheck = node.getText(sourceFile).trim();
        } else if (ts.isStringLiteral(node) && node.parent) {
          // Literales directos dentro de atributos JSX o expresiones JSX
          if (
            ts.isJsxAttribute(node.parent) ||
            ts.isJsxExpression(node.parent) ||
            ts.isJsxElement(node.parent)
          ) {
            textToCheck = node.text.trim();
          }
        }

        if (textToCheck && textToCheck.length > 2) {
          const lowerText = textToCheck.toLowerCase();

          // Verificar marcas comerciales externas prohibidas
          for (const brand of PROHIBITED_COMMERCIAL_BRANDS) {
            if (lowerText.includes(brand)) {
              report(
                node,
                'WHITE_LABEL_BRAND_VIOLATION',
                `Se detectó la marca comercial prohibida '${brand}' en literal visual: "${textToCheck}". Utilice terminología pedagógica oficial.`
              );
            }
          }

          // Verificar fuga de marca cruzada en interfaces exclusivas de IBIME
          if (isIbimeContext && relativePath.includes('/app/ibime/')) {
            if (lowerText.includes('iskool studio') || lowerText.includes('iskool ecosistema')) {
              report(
                node,
                'CROSS_TENANT_BRAND_LEAK',
                `Fuga de marca detectada en vista de IBIME: "${textToCheck}". Las vistas de IBIME deben proyectar exclusivamente su identidad institucional.`
              );
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  // Verificación de Existencia de Contratos Canónicos
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

// Ejecución directa si se invoca desde la CLI
if (require.main === module || process.argv[1]?.includes('verify_hermetic_boundaries')) {
  const result = runHermeticBoundaryAudit();

  if (result.passed) {
    console.log('✅ AUDITORÍA AST DE FRONTERAS HERMÉTICAS SUPERADA.');
    console.log('   - Static imports, Dynamic import(), Re-exports analizados.');
    console.log('   - 0 rutas relativas escapando de bounded contexts.');
    console.log('   - 0 marcas comerciales o cruzadas en literales visuales.');
    console.log('   - Contratos canónicos verificados.\n');
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
