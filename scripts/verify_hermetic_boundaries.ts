/**
 * ============================================================================
 * GUARDA ESTÁTICA DE FRONTERAS HERMÉTICAS (AST BOUNDARY LINTER)
 * iSkool Core e IBIME - Aislamiento de Bounded Contexts y Contratos Canónicos
 * ============================================================================
 * 
 * Verificación Integral con TypeScript AST:
 * a) Static imports ('ImportDeclaration')
 * b) Dynamic imports ('CallExpression' con 'import()') auditando namespaces privados
 * c) Re-exports ('ExportDeclaration')
 * d) Rutas relativas que escapen de los bounded contexts (ej. '../../')
 * e) Literales JSX/TSX, TemplateExpression y NoSubstitutionTemplateLiteral (Case-Insensitive)
 * f) Nombres de variables y constantes en VariableDeclaration para marcas prohibidas y cruzadas
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

// Marcas comerciales prohibidas en vistas y código (Regla No Negociable 1)
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
  console.log('🔍 Iniciando Auditoría AST Exhaustiva de Fronteras Herméticas y Bounded Contexts...\n');

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

    // Función auxiliar para resolver el módulo importado mediante alias, rutas relativas y ts.resolveModuleName
    function resolveModulePath(specifier: string, containingFile: string): string {
      // 1. Alias @/* mapeado a src/*
      if (specifier.startsWith('@/')) {
        return path.resolve(ROOT_DIR, 'src', specifier.substring(2)).replace(/\\/g, '/');
      }
      // 2. Ruta absoluta interna src/*
      if (specifier.startsWith('src/')) {
        return path.resolve(ROOT_DIR, specifier).replace(/\\/g, '/');
      }
      // 3. Ruta relativa (ej: ../../store/*)
      if (specifier.startsWith('.')) {
        return path.resolve(path.dirname(containingFile), specifier).replace(/\\/g, '/');
      }

      // 4. Resolución canónica de TypeScript para paths configurados
      try {
        const compilerOptions: ts.CompilerOptions = {
          baseUrl: ROOT_DIR,
          paths: { '@/*': ['src/*'] },
          moduleResolution: ts.ModuleResolutionKind.NodeJs
        };
        const resolved = ts.resolveModuleName(specifier, containingFile, compilerOptions, ts.sys);
        if (resolved?.resolvedModule?.resolvedFileName) {
          return resolved.resolvedModule.resolvedFileName.replace(/\\/g, '/');
        }
      } catch {
        // Fallback silencioso
      }

      return specifier;
    }

    // Validación de especificadores de módulo (static, dynamic, re-export)
    function validateModuleSpecifier(specifier: string, node: ts.Node, isDynamic = false) {
      const resolvedTarget = resolveModulePath(specifier, filePath);
      const relativeTarget = path.relative(ROOT_DIR, resolvedTarget).replace(/\\/g, '/');

      // 1. Aislamiento de IBIME: Prohibición estricta de acoplarse a stores privados de iSkool
      // Detecta importaciones tanto por alias (@/store/*), rutas relativas (../../store/*) o absolutas (src/store/*)
      if (isIbimeContext) {
        const isPrivateStore =
          relativeTarget.startsWith('src/store/') ||
          specifier.startsWith('@/store/') ||
          specifier.startsWith('src/store/') ||
          specifier.includes('store/useSchoolAdminStore') ||
          specifier.includes('store/useTeacherStore') ||
          specifier.includes('store/useStudentStore') ||
          specifier.includes('lib/iskoolCore');

        // Los módulos de IBIME no deben consumir directamente stores privados internos
        if (isPrivateStore) {
          const ruleName = isDynamic ? 'DYNAMIC_IMPORT_HERMETIC_VIOLATION' : 'HERMETIC_BOUNDARY_VIOLATION';
          report(
            node,
            ruleName,
            `Módulos de IBIME no deben acoplarse directamente a stores o namespaces privados (${specifier} -> ${relativeTarget}). Deben consumir contratos canónicos en @/lib/curriculum o @/lib/auth.`
          );
        }

        // 2. Control de Rutas Relativas que escapen del Bounded Context de IBIME
        if (
          relativeTarget.startsWith('src/app/teacher') ||
          relativeTarget.startsWith('src/app/admin') ||
          relativeTarget.startsWith('src/app/student') ||
          relativeTarget.startsWith('src/app/director') ||
          relativeTarget.startsWith('src/lib/iskoolCore')
        ) {
          const ruleName = isDynamic ? 'DYNAMIC_IMPORT_HERMETIC_VIOLATION' : 'RELATIVE_BOUNDED_CONTEXT_ESCAPE';
          report(
            node,
            ruleName,
            `Ruta '${specifier}' escapa del bounded context de IBIME hacia módulos privados de iSkool (${relativeTarget}). Utilice contratos canónicos @/lib/* en su lugar.`
          );
        }
      }
    }

    // Validación de texto contra marcas comerciales y marcas cruzadas (Case-Insensitive)
    function checkBrandInText(text: string, node: ts.Node, contextDescription = 'literal visual') {
      if (!text || text.trim().length <= 2) return;
      const lower = text.toLowerCase();

      for (const brand of PROHIBITED_COMMERCIAL_BRANDS) {
        if (lower.includes(brand)) {
          report(
            node,
            'WHITE_LABEL_BRAND_VIOLATION',
            `Se detectó la marca comercial prohibida '${brand}' en ${contextDescription}: "${text.trim()}". Utilice terminología pedagógica oficial.`
          );
        }
      }

      // Detección de fuga de marca institucional en contexto de IBIME
      if (isIbimeContext && relativePath.includes('/app/ibime/')) {
        if (lower.includes('iskool studio') || lower.includes('iskool ecosistema')) {
          report(
            node,
            'CROSS_TENANT_BRAND_LEAK',
            `Fuga de marca iSkool detectada en vista de IBIME (${contextDescription}): "${text.trim()}". Las vistas de IBIME deben proyectar exclusivamente su identidad institucional.`
          );
        }
      }
    }

    // Recorrido exhaustivo del AST de TypeScript
    function visit(node: ts.Node) {
      // a) Static imports: ImportDeclaration
      if (ts.isImportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          validateModuleSpecifier(node.moduleSpecifier.text, node, false);
        }
      }

      // b) Dynamic imports: CallExpression con import()
      if (ts.isCallExpression(node)) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const firstArg = node.arguments[0];
          if (firstArg && (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg))) {
            validateModuleSpecifier(firstArg.text, node, true);
          }
        }
      }

      // c) Re-exports: ExportDeclaration
      if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          validateModuleSpecifier(node.moduleSpecifier.text, node, false);
        }
      }

      // d) Nombres de variables y constantes en VariableDeclaration
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        const varName = node.name.text;
        const lowerVarName = varName.toLowerCase();

        // 1. Prohibición de marcas comerciales en nombres de variables (Regla 1)
        for (const brand of PROHIBITED_COMMERCIAL_BRANDS) {
          const normalizedBrand = brand.replace(/\s+/g, '');
          if (lowerVarName.includes(normalizedBrand)) {
            report(
              node,
              'WHITE_LABEL_VARIABLE_VIOLATION',
              `Identificador de variable '${varName}' contiene el nombre de marca comercial prohibida '${brand}'. Utilice nomenclatura pedagógica oficial.`
            );
          }
        }

        // 2. Prohibición de marcas de iSkool dentro del contexto aislado de IBIME
        // Excluir interfaces y contratos de federación legítimos para no generar falsos positivos en variables de mapeo tipadas
        if (isIbimeContext && lowerVarName.includes('iskool')) {
          const typeNode = node.type;
          const typeText = typeNode ? typeNode.getText(sourceFile) : '';
          const isFederationContractType = /Federat|Contract|Tenant|Curriculum|Mapping|Adapter|Session|Auth/i.test(typeText);
          const isLegitimateFederationVariable =
            isFederationContractType ||
            /^(iskool(core)?(plan|plans|id|token|metadata|session|response|data|tenant|mapping)?|isiskool|targettenant|originatingtenant)$/i.test(varName) ||
            relativePath.includes('curriculumFederation') ||
            relativePath.includes('multiTenantSession') ||
            relativePath.includes('types.ts');

          if (!isLegitimateFederationVariable) {
            report(
              node,
              'CROSS_TENANT_IDENTIFIER_LEAK',
              `Identificador de variable '${varName}' en contexto aislado de IBIME contiene la marca 'iSkool'. Debe utilizarse nomenclatura neutral o institucional.`
            );
          }
        }
      }

      // e) Literales JSX/TSX
      if (filePath.endsWith('.tsx') && (relativePath.includes('/components/') || relativePath.includes('/app/'))) {
        if (ts.isJsxText(node)) {
          checkBrandInText(node.getText(sourceFile), node, 'texto JSX');
        } else if (ts.isStringLiteral(node) && node.parent) {
          if (
            ts.isJsxAttribute(node.parent) ||
            ts.isJsxExpression(node.parent) ||
            ts.isJsxElement(node.parent)
          ) {
            checkBrandInText(node.text, node, 'atributo/expresión JSX');
          }
        }
      }

      // f) Template Expressions y NoSubstitutionTemplateLiteral
      if (ts.isNoSubstitutionTemplateLiteral(node)) {
        checkBrandInText(node.text, node, 'plantilla literal (template literal)');
      } else if (ts.isTemplateExpression(node)) {
        if (node.head && node.head.text) {
          checkBrandInText(node.head.text, node, 'encabezado de plantilla (template expression head)');
        }
        for (const span of node.templateSpans) {
          if (span.literal && span.literal.text) {
            checkBrandInText(span.literal.text, span, 'segmento de plantilla (template span)');
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
    console.log('✅ AUDITORÍA AST EXHAUSTIVA DE FRONTERAS HERMÉTICAS SUPERADA.');
    console.log('   - Static imports, Dynamic import(), Re-exports auditados.');
    console.log('   - TemplateExpression y NoSubstitutionTemplateLiteral verificados.');
    console.log('   - VariableDeclarations validados contra marcas prohibidas y cruzadas.');
    console.log('   - 0 rutas relativas escapando de bounded contexts.');
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
