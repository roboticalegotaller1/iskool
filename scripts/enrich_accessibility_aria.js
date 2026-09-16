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
  'Send': 'Enviar',
  'Sliders': 'Configuración avanzada',
  'GraduationCap': 'Portal académico',
  'Shield': 'Seguridad institucional',
  'Zap': 'Acción rápida',
  'Trophy': 'Logros y recompensas',
  'Coins': 'Monedas escolares',
  'Swords': 'Desafío gamificado',
  'Flame': 'Racha activa',
  'Key': 'Credencial de acceso'
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

let modifiedFilesCount = 0;
let buttonsAriaFixedCount = 0;
let inputsAriaFixedCount = 0;
let buttonsFocusStateFixedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Botones con 'title="..."' pero sin 'aria-label' -> agregar aria-label={title}
  content = content.replace(/<button\b([^>]*?)title=(["'])(.*?)\2([^>]*?)>/g, (match, before, quote, title, after) => {
    if (!before.includes('aria-label') && !after.includes('aria-label')) {
      buttonsAriaFixedCount++;
      return `<button${before}title=${quote}${title}${quote} aria-label=${quote}${title}${quote}${after}>`;
    }
    return match;
  });

  // 2. Botones de íconos solitarios conocidos sin aria-label
  // Patrón: <button ...className="...">\s*<(X|Trash2|Search|Filter|ChevronLeft|ChevronRight|RotateCcw|Maximize2|Eye|Upload|Download|Edit3|MoreVertical)\b[^>]*\/>\s*<\/button>
  for (const [icon, label] of Object.entries(ICON_TO_LABEL)) {
    const regex = new RegExp(`(<button\\b(?![^>]*aria-label)([^>]*?)>\\s*<${icon}\\b[^>]*\\/>\\s*<\\/button>)`, 'g');
    content = content.replace(regex, (match, wholeBtn, innerAttrs) => {
      buttonsAriaFixedCount++;
      return `<button aria-label="${label}"${innerAttrs}><${icon} className="h-4 w-4" /></button>`;
    });
  }

  // 3. Inputs sin aria-label pero con placeholder
  content = content.replace(/<input\b([^>]*?)placeholder=(["'])(.*?)\2([^>]*?)>/g, (match, before, quote, placeholder, after) => {
    if (!before.includes('aria-label') && !after.includes('aria-label') && !before.includes('aria-labelledby') && !after.includes('aria-labelledby')) {
      inputsAriaFixedCount++;
      return `<input${before}placeholder=${quote}${placeholder}${quote} aria-label=${quote}${placeholder}${quote}${after}>`;
    }
    return match;
  });

  // 4. Inputs de tipo búsqueda sin aria-label
  content = content.replace(/<input\b([^>]*?)type=(["'])search\2([^>]*?)>/g, (match, before, quote, after) => {
    if (!before.includes('aria-label') && !after.includes('aria-label')) {
      inputsAriaFixedCount++;
      return `<input${before}type=${quote}search${quote} aria-label="Buscar registros"${after}>`;
    }
    return match;
  });

  // 5. Selects sin aria-label
  content = content.replace(/<select\b([^>]*?)>/g, (match, attrs) => {
    if (!attrs.includes('aria-label') && !attrs.includes('aria-labelledby') && !attrs.includes('id=')) {
      inputsAriaFixedCount++;
      return `<select aria-label="Seleccionar opción"${attrs}>`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFilesCount++;
  }
}

const allFiles = getAllFiles(SRC_DIR);
console.log(`Iniciando enriquecimiento ARIA y accesibilidad sobre ${allFiles.length} archivos...`);
allFiles.forEach(processFile);

console.log('\n--- Resumen de Enriquecimiento ---');
console.log(`✅ Archivos actualizados: ${modifiedFilesCount}`);
console.log(`✅ Botones enriquecidos con aria-label: ${buttonsAriaFixedCount}`);
console.log(`✅ Inputs enriquecidos con aria-label: ${inputsAriaFixedCount}`);
