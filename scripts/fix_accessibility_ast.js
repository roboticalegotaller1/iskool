const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SRC_DIR = path.join(__dirname, '..', 'src');

const ICON_TO_LABEL = {
  'X': 'Cerrar',
  'XCircle': 'Cerrar o descartar',
  'Maximize2': 'Pantalla completa',
  'Minimize2': 'Salir de pantalla completa',
  'RotateCcw': 'Reiniciar o reintentar',
  'RefreshCw': 'Recargar datos',
  'Refresh': 'Actualizar contenido',
  'ChevronLeft': 'Página anterior',
  'ChevronRight': 'Página siguiente',
  'ArrowLeft': 'Regresar',
  'ArrowRight': 'Avanzar',
  'ChevronDown': 'Desplegar opciones',
  'ChevronUp': 'Plegar opciones',
  'Play': 'Iniciar reproducción',
  'Pause': 'Pausar',
  'Trash': 'Eliminar registro',
  'Trash2': 'Eliminar',
  'Edit': 'Editar registro',
  'Edit2': 'Editar',
  'Edit3': 'Modificar datos',
  'Plus': 'Agregar nuevo registro',
  'Search': 'Buscar registros',
  'Filter': 'Filtrar listado',
  'Download': 'Descargar archivo',
  'Upload': 'Subir archivo o comprobante',
  'Eye': 'Visualizar detalles',
  'EyeOff': 'Ocultar detalles',
  'MoreVertical': 'Más opciones de acción',
  'MoreHorizontal': 'Menú contextual de opciones',
  'Copy': 'Copiar al portapapeles',
  'Volume2': 'Activar sonido',
  'VolumeX': 'Silenciar audio',
  'Settings': 'Ajustes del sistema',
  'Share2': 'Compartir',
  'Check': 'Confirmar selección',
  'CheckCircle2': 'Confirmar',
  'Sparkles': 'Asistente pedagógico institucional',
  'Lock': 'Elemento bloqueado',
  'Unlock': 'Desbloquear acceso',
  'HelpCircle': 'Ayuda institucional',
  'FileText': 'Consultar documento',
  'Calendar': 'Calendario escolar',
  'Send': 'Enviar mensaje o formulario',
  'Sliders': 'Configuración avanzada',
  'GraduationCap': 'Portal académico',
  'Shield': 'Seguridad institucional',
  'Zap': 'Acción rápida',
  'Trophy': 'Logros y recompensas',
  'Coins': 'Monedas escolares',
  'Swords': 'Desafío gamificado',
  'Flame': 'Racha activa',
  'Key': 'Credencial de acceso',
  'GripVertical': 'Arrastrar para reordenar',
  'LogOut': 'Cerrar sesión',
  'User': 'Perfil de usuario',
  'Users': 'Comunidad de usuarios',
  'ExternalLink': 'Abrir enlace externo',
  'BookOpen': 'Consultar contenido educativo',
  'Info': 'Información adicional',
  'AlertTriangle': 'Alerta o advertencia',
  'Heart': 'Favorito o reacción',
  'MessageSquare': 'Abrir chat o comentarios'
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

function findChildIconName(node) {
  if (!node || !node.children) return null;
  for (const child of node.children) {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      const tag = child.tagName ? child.tagName.getText() : '';
      if (ICON_TO_LABEL[tag]) return tag;
      const nested = findChildIconName(child);
      if (nested) return nested;
    }
  }
  return null;
}

function fixFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const insertions = [];

  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName ? node.tagName.getText() : '';
      const attrs = node.attributes?.properties || [];
      const attrNames = new Set();
      let placeholderVal = null;
      let typeVal = null;
      let nameVal = null;

      for (const p of attrs) {
        if (ts.isJsxAttribute(p) && p.name) {
          const aName = p.name.text;
          attrNames.add(aName);
          if (aName === 'placeholder' && p.initializer && ts.isStringLiteral(p.initializer)) {
            placeholderVal = p.initializer.text;
          }
          if (aName === 'type' && p.initializer && ts.isStringLiteral(p.initializer)) {
            typeVal = p.initializer.text;
          }
          if (aName === 'name' && p.initializer && ts.isStringLiteral(p.initializer)) {
            nameVal = p.initializer.text;
          }
        }
      }

      // 1. Botones sin ARIA
      if (tagName === 'button') {
        const hasAria = attrNames.has('aria-label') || attrNames.has('title') || attrNames.has('aria-labelledby');
        const parentElem = ts.isJsxOpeningElement(node) ? node.parent : null;
        const hasText = parentElem ? hasTextChildren(parentElem) : false;

        if (!hasText && !hasAria) {
          const iconName = parentElem ? findChildIconName(parentElem) : null;
          const label = (iconName && ICON_TO_LABEL[iconName]) || 'Acción institucional';
          // Insertar aria-label justo después de <button
          const insertPos = node.tagName.end;
          insertions.push({ pos: insertPos, text: ` aria-label="${label}"` });
        }
      }

      // 2. Inputs sin ARIA
      if (['input', 'select', 'textarea'].includes(tagName)) {
        if (typeVal !== 'hidden') {
          const hasAria = attrNames.has('aria-label') || attrNames.has('aria-labelledby');
          if (!hasAria) {
            let label = placeholderVal;
            if (!label) {
              if (typeVal === 'checkbox') label = 'Seleccionar opción';
              else if (typeVal === 'search') label = 'Buscar en los registros';
              else if (typeVal === 'date') label = 'Seleccionar fecha';
              else if (typeVal === 'file') label = 'Subir archivo o comprobante';
              else if (typeVal === 'number') label = 'Cantidad numérica';
              else if (nameVal) label = `Campo ${nameVal}`;
              else if (tagName === 'select') label = 'Seleccionar opción de lista';
              else label = 'Campo de texto de formulario';
            }
            const insertPos = node.tagName.end;
            insertions.push({ pos: insertPos, text: ` aria-label="${label.replace(/"/g, "'")}"` });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (insertions.length > 0) {
    // Ordenar de mayor a menor posición para no alterar índices al insertar
    insertions.sort((a, b) => b.pos - a.pos);
    let newCode = code;
    for (const ins of insertions) {
      newCode = newCode.slice(0, ins.pos) + ins.text + newCode.slice(ins.pos);
    }
    fs.writeFileSync(filePath, newCode, 'utf8');
    return insertions.length;
  }

  return 0;
}

const files = getAllFiles(SRC_DIR);
let totalInserted = 0;
let filesModified = 0;

for (const f of files) {
  const count = fixFile(f);
  if (count > 0) {
    totalInserted += count;
    filesModified++;
  }
}

console.log(`\n🎉 Finalizado: ${totalInserted} atributos aria-label insertados con precisión AST en ${filesModified} archivos.`);
