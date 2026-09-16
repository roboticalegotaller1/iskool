const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SRC_DIR = path.join(__dirname, '..', 'src');

const results = {
  totalFilesScanned: 0,
  deadEndLinks: [],
  unhandledButtons: [],
  iconButtonsMissingAria: [],
  inputsMissingAria: [],
  imagesMissingAlt: [],
  buttonsMissingFocusOrDisabled: []
};

function getAllFiles(dir, exts = ['.tsx', '.jsx']) {
  let files = [];
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

function getJsxAttributes(node) {
  const attrs = {};
  if (!node.attributes || !node.attributes.properties) return attrs;
  for (const prop of node.attributes.properties) {
    if (ts.isJsxAttribute(prop) && prop.name) {
      const attrName = prop.name.text;
      let attrVal = true;
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
  return attrs;
}

function getTagName(node) {
  if (node.tagName) {
    return node.tagName.getText();
  }
  return '';
}

function hasTextChildren(node) {
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

function analyzeFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  results.totalFilesScanned++;
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  function visit(node) {
    // Check JSX Elements
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = getTagName(node);
      const attrs = getJsxAttributes(node);
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      // 1. Check Links for Dead Ends
      if (tagName === 'a' || tagName === 'Link') {
        const href = attrs['href'];
        if (href === '#' || href === '""' || href === "''" || href === 'javascript:void(0)' || href === 'javascript:;') {
          results.deadEndLinks.push({ file: relPath, line, tagName, href });
        }
      }

      // 2. Check Buttons for Dead Ends
      if (tagName === 'button') {
        const hasOnClick = 'onClick' in attrs;
        const type = attrs['type'];
        const isSubmit = type === 'submit' || type === '"submit"';
        const disabled = attrs['disabled'];
        const hasFormAction = 'formAction' in attrs;
        const parent = node.parent;

        if (!hasOnClick && !isSubmit && !hasFormAction && !disabled) {
          // Check if parent or child has interaction
          results.unhandledButtons.push({ file: relPath, line, type: type || 'button' });
        }

        // 3. Check for ARIA on icon-only buttons
        const hasAria = 'aria-label' in attrs || 'title' in attrs || 'aria-labelledby' in attrs;
        const parentElem = ts.isJsxOpeningElement(node) ? node.parent : null;
        const hasText = parentElem ? hasTextChildren(parentElem) : false;

        if (!hasText && !hasAria) {
          results.iconButtonsMissingAria.push({ file: relPath, line });
        }

        // 4. Check for focus & disabled styling
        const className = String(attrs['className'] || '');
        const hasFocus = className.includes('focus:') || className.includes('focus-visible:') || className.includes('focus-within:');
        const hasDisabled = className.includes('disabled:') || disabled;
        if (!hasFocus || !hasDisabled) {
          results.buttonsMissingFocusOrDisabled.push({
            file: relPath,
            line,
            missingFocus: !hasFocus,
            missingDisabled: !hasDisabled
          });
        }
      }

      // 5. Check Form Inputs for Accessibility
      if (['input', 'select', 'textarea'].includes(tagName)) {
        const type = attrs['type'];
        if (type !== 'hidden' && type !== '"hidden"') {
          const hasAria = 'aria-label' in attrs || 'aria-labelledby' in attrs || 'id' in attrs || 'placeholder' in attrs;
          if (!hasAria) {
            results.inputsMissingAria.push({ file: relPath, line, tagName, type });
          }
        }
      }

      // 6. Check Images for alt text
      if (tagName === 'img' || (tagName === 'Image' && code.includes("from 'next/image'"))) {
        const hasAlt = 'alt' in attrs;
        if (!hasAlt) {
          results.imagesMissingAlt.push({ file: relPath, line, tagName });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const files = getAllFiles(SRC_DIR);
console.log(`Auditoría AST iniciada: ${files.length} archivos .tsx/.jsx encontrados en src/`);
files.forEach(analyzeFile);

console.log('\n======================================================');
console.log('📊 REPORTE DE AUDITORÍA AST UX/UI & ACCESIBILIDAD IBIME');
console.log('======================================================');
console.log(`📁 Total archivos escaneados: ${results.totalFilesScanned}`);
console.log(`🔗 Enlaces Dead-End (href="#"): ${results.deadEndLinks.length}`);
console.log(`🔘 Botones sin handler ni submit: ${results.unhandledButtons.length}`);
console.log(`🔲 Botones de ícono sin aria-label: ${results.iconButtonsMissingAria.length}`);
console.log(`⌨️ Inputs sin etiqueta / aria-label: ${results.inputsMissingAria.length}`);
console.log(`🖼️ Imágenes sin atributo alt: ${results.imagesMissingAlt.length}`);
console.log(`🎨 Botones sin estados focus/disabled: ${results.buttonsMissingFocusOrDisabled.length}`);
console.log('======================================================\n');

if (results.deadEndLinks.length > 0) {
  console.log('--- Muestra de Enlaces Dead-End ---');
  results.deadEndLinks.slice(0, 10).forEach(d => console.log(`  ${d.file}:${d.line} -> ${d.href}`));
}

if (results.unhandledButtons.length > 0) {
  console.log('--- Muestra de Botones sin Handler ---');
  results.unhandledButtons.slice(0, 10).forEach(b => console.log(`  ${b.file}:${b.line}`));
}

if (results.iconButtonsMissingAria.length > 0) {
  console.log('--- Muestra de Botones de Ícono sin aria-label ---');
  results.iconButtonsMissingAria.slice(0, 10).forEach(b => console.log(`  ${b.file}:${b.line}`));
}

fs.writeFileSync(
  path.join(__dirname, 'ast_audit_results.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);
console.log('\nResultados detallados guardados en scripts/ast_audit_results.json');
