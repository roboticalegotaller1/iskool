/**
 * SUITE DE AUDITORÍA: UX/UI INTERACTIVO, ZERO DEAD-ENDS Y ACCESIBILIDAD WCAG 2.1 AA (IBIME)
 *
 * Valida:
 * 1. Mapeo Cero-Errores: 0 enlaces muertos (href="#") y 100% botones interactivos conectados.
 * 2. Disponibilidad del modal global "Próximamente" (ComingSoonModal y useComingSoon).
 * 3. Estados visuales y Skeleton Loaders localizados sin bloqueos de pantalla.
 * 4. Cumplimiento WAI-ARIA en botones de ícono, campos de texto e imágenes (alt).
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName} - ${detail}`);
    failed++;
  }
}

const SRC_DIR = path.join(__dirname, 'src');

function getAllFiles(dir: string, exts: string[] = ['.tsx', '.jsx']): string[] {
  let files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasTextChildren(node: any): boolean {
  if (!node) return false;
  if (ts.isJsxText(node) && node.text.trim().length > 0) return true;
  if (ts.isJsxExpression(node) && node.expression) {
    const text = node.expression.getText();
    if (!text.includes('Icon') && !text.includes('svg') && !text.includes('lucide')) {
      return true;
    }
  }
  if (node.children) {
    for (const child of node.children) {
      if (hasTextChildren(child)) return true;
    }
  }
  return false;
}

function runUxAccessibilityAudit() {
  console.log('===================================================================');
  console.log('👁️ AUDITORÍA UX/UI, ZERO DEAD-ENDS Y ACCESIBILIDAD WCAG 2.1 AA');
  console.log('===================================================================\n');

  // --- 1. Verificación de Componentes de Arquitectura UX ---
  console.log('--- 1. Arquitectura de Componentes UX y Estados de Carga ---');
  const comingSoonPath = path.join(SRC_DIR, 'components', 'ui', 'ComingSoonModal.tsx');
  assert(fs.existsSync(comingSoonPath), 'Existe el componente ComingSoonModal');
  const comingSoonContent = fs.readFileSync(comingSoonPath, 'utf8');
  assert(comingSoonContent.includes('role="dialog"'), 'ComingSoonModal define role="dialog"');
  assert(comingSoonContent.includes('aria-modal="true"'), 'ComingSoonModal define aria-modal="true"');
  assert(comingSoonContent.includes('useComingSoon'), 'Exporta el hook useComingSoon');
  assert(comingSoonContent.includes('ComingSoonProvider'), 'Exporta el ComingSoonProvider');

  const layoutPath = path.join(SRC_DIR, 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  assert(layoutContent.includes('ComingSoonProvider'), 'RootLayout envuelve la jerarquía en ComingSoonProvider');

  const skeletonPath = path.join(SRC_DIR, 'components', 'ui', 'SkeletonLoader.tsx');
  assert(fs.existsSync(skeletonPath), 'Existe la biblioteca de SkeletonLoader');
  const skeletonContent = fs.readFileSync(skeletonPath, 'utf8');
  assert(skeletonContent.includes('CardSkeleton'), 'Define CardSkeleton para tarjetas');
  assert(skeletonContent.includes('TableSkeleton'), 'Define TableSkeleton para tablas de datos');
  assert(skeletonContent.includes('ButtonSkeleton'), 'Define ButtonSkeleton para acciones pendientes');
  assert(skeletonContent.includes('HeroBannerSkeleton'), 'Define HeroBannerSkeleton para cabeceras');

  // --- 2. Verificación de Estándares CSS / Tailwind (WCAG 2.1 AA) ---
  console.log('\n--- 2. Estándares Globales de Foco y Accesibilidad en CSS ---');
  const globalsCssPath = path.join(SRC_DIR, 'app', 'globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
  assert(globalsCss.includes('focus-visible'), 'globals.css incluye directivas de focus-visible universales');
  assert(globalsCss.includes('button:disabled'), 'globals.css define estilos semánticos para elementos :disabled');
  assert(globalsCss.includes('prefers-reduced-motion'), 'globals.css implementa soporte para prefers-reduced-motion');

  // --- 3. Análisis AST Cero-Errores (Zero Dead-Ends & WAI-ARIA) ---
  console.log('\n--- 3. Análisis AST de Código Fuente (100% Interactividad & ARIA) ---');
  const allFiles = getAllFiles(SRC_DIR);

  let deadEndLinks = 0;
  let unhandledButtons = 0;
  let iconButtonsWithoutAria = 0;
  let inputsWithoutAria = 0;
  let imagesWithoutAlt = 0;

  for (const filePath of allFiles) {
    const code = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    function visit(node: any) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = node.tagName ? node.tagName.getText() : '';
        const attrs: Record<string, any> = {};

        if (node.attributes && node.attributes.properties) {
          for (const prop of node.attributes.properties) {
            if (ts.isJsxAttribute(prop) && prop.name) {
              const attrName = (prop.name as any).text || prop.name.getText();
              let attrVal: any = true;
              if (prop.initializer) {
                if (ts.isStringLiteral(prop.initializer)) {
                  attrVal = prop.initializer.text;
                } else if (ts.isJsxExpression(prop.initializer)) {
                  attrVal = prop.initializer.expression ? prop.initializer.expression.getText() : true;
                }
              }
              attrs[attrName] = attrVal;
            }
          }
        }

        // Check Links
        if (tagName === 'a' || tagName === 'Link') {
          const href = attrs['href'];
          if (href === '#' || href === '""' || href === "''" || href === 'javascript:void(0)') {
            deadEndLinks++;
          }
        }

        // Check Buttons
        if (tagName === 'button') {
          const hasOnClick = 'onClick' in attrs;
          const type = attrs['type'];
          const isSubmit = type === 'submit' || type === '"submit"';
          const disabled = attrs['disabled'];
          const hasFormAction = 'formAction' in attrs;

          if (!hasOnClick && !isSubmit && !hasFormAction && !disabled) {
            unhandledButtons++;
          }

          // ARIA en botones de ícono
          const hasAria = 'aria-label' in attrs || 'title' in attrs || 'aria-labelledby' in attrs;
          const parentElem = ts.isJsxOpeningElement(node) ? node.parent : null;
          const hasText = parentElem ? hasTextChildren(parentElem) : false;

          if (!hasText && !hasAria) {
            iconButtonsWithoutAria++;
          }
        }

        // Check Inputs
        if (['input', 'select', 'textarea'].includes(tagName)) {
          const type = attrs['type'];
          if (type !== 'hidden' && type !== '"hidden"') {
            const hasAria = 'aria-label' in attrs || 'aria-labelledby' in attrs || 'id' in attrs || 'placeholder' in attrs;
            if (!hasAria) {
              inputsWithoutAria++;
            }
          }
        }

        // Check Images
        if (tagName === 'img' || (tagName === 'Image' && code.includes("from 'next/image'"))) {
          const hasAlt = 'alt' in attrs;
          if (!hasAlt) {
            imagesWithoutAlt++;
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  assert(deadEndLinks === 0, `0 Enlaces Dead-End (href="#") en ${allFiles.length} archivos (Detectados: ${deadEndLinks})`);
  assert(unhandledButtons === 0, `100% de botones interactivos con handler, submit o acción (Sin handler: ${unhandledButtons})`);
  assert(iconButtonsWithoutAria === 0, `100% de botones de ícono con aria-label o title (Faltantes: ${iconButtonsWithoutAria})`);
  assert(inputsWithoutAria === 0, `100% de controles de entrada con etiquetado accesible (Faltantes: ${inputsWithoutAria})`);
  assert(imagesWithoutAlt === 0, `100% de imágenes con atributo descriptivo alt (Faltantes: ${imagesWithoutAlt})`);

  console.log('\n===================================================================');
  console.log(`🎯 RESULTADO AUDITORÍA UX & ACCESIBILIDAD: ${passed}/${passed + failed} pruebas superadas.`);
  console.log('===================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runUxAccessibilityAudit();
