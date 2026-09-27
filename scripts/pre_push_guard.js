/**
 * @file pre_push_guard.js
 * @description Guarda automatizada para pre-commit y pre-push en ISkool.
 * Bloquea cualquier operación si detecta:
 *   a) Un archivo individual que supere 1.0 MB (o imagen > 400 KB violando Regla No Negociable 3).
 *   b) Un payload acumulado de subida que se acerque al umbral crítico de AWS (150 MB - 200 MB).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_INDIVIDUAL_FILE_BYTES = 1.0 * 1024 * 1024; // 1 MB límite estricto
const MAX_IMAGE_BYTES = 400 * 1024; // 400 KB para imágenes (Regla No Negociable 3)
const MAX_CUMULATIVE_PAYLOAD_BYTES = 150 * 1024 * 1024; // 150 MB umbral de alerta AWS

console.log('🛡️  ISkool DevOps - Ejecutando Guarda de Validación Pre-Commit / Pre-Push...');

let hasErrors = false;

// Obtener solo archivos agregados o modificados (ignorando los eliminados 'D')
function getCandidateFiles() {
  const files = new Set();
  
  // Archivos en el índice (staged)
  try {
    const stagedStatus = execSync('git diff --cached --name-status', { encoding: 'utf8' })
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    
    stagedStatus.forEach(line => {
      const parts = line.split(/\s+/);
      const status = parts[0];
      const filePath = parts[parts.length - 1];
      if (status !== 'D' && filePath) {
        files.add(filePath);
      }
    });
  } catch (e) {}

  // Commits pendientes respecto a origin/main (en pre-push)
  try {
    const unpushedStatus = execSync('git diff origin/main..HEAD --name-status', { encoding: 'utf8' })
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    
    unpushedStatus.forEach(line => {
      const parts = line.split(/\s+/);
      const status = parts[0];
      const filePath = parts[parts.length - 1];
      if (status !== 'D' && filePath) {
        files.add(filePath);
      }
    });
  } catch (e) {}

  // Si no hay nada staged ni commits pendientes, revisar archivos modificados en working tree
  if (files.size === 0) {
    try {
      const porcelain = execSync('git status --porcelain', { encoding: 'utf8' })
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      
      porcelain.forEach(line => {
        const status = line.slice(0, 2).trim();
        const filePath = line.slice(2).trim();
        if (status !== 'D' && !status.includes('D') && filePath) {
          files.add(filePath);
        }
      });
    } catch (e) {}
  }

  return Array.from(files);
}

const candidateFiles = getCandidateFiles();
console.log(`📋 Analizando ${candidateFiles.length} archivo(s) a comprometer en Git...`);

let totalPayloadBytes = 0;
const violations = [];

candidateFiles.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return;

  try {
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) return;

    totalPayloadBytes += stat.size;
    const ext = path.extname(relPath).toLowerCase();
    const isImage = /\.(png|jpe?g|webp|gif)$/i.test(ext);

    // a) Chequeo de tamaño individual > 1 MB
    if (stat.size > MAX_INDIVIDUAL_FILE_BYTES) {
      violations.push({
        file: relPath,
        sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
        sizeKB: (stat.size / 1024).toFixed(1),
        reason: `Excede el límite absoluto individual de 1 MB (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`
      });
      hasErrors = true;
    } 
    // Chequeo de Regla No Negociable 3 en imágenes (> 400 KB)
    else if (isImage && stat.size > MAX_IMAGE_BYTES) {
      violations.push({
        file: relPath,
        sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
        sizeKB: (stat.size / 1024).toFixed(1),
        reason: `Imagen que rompe la Regla No Negociable 3 (> 400 KB: ${(stat.size / 1024).toFixed(1)} KB)`
      });
      hasErrors = true;
    }
  } catch (e) {}
});

// b) Chequeo de payload acumulado (> 150 MB)
const totalPayloadMB = (totalPayloadBytes / (1024 * 1024)).toFixed(2);
console.log(`📦 Volumen total del lote a enviar: ${totalPayloadMB} MB (Límite AWS: 150 MB - 200 MB)`);

if (totalPayloadBytes > MAX_CUMULATIVE_PAYLOAD_BYTES) {
  console.error(`\n❌ ERROR CRÍTICO: El volumen acumulado (${totalPayloadMB} MB) excede el umbral seguro de 150 MB para AWS Amplify.`);
  hasErrors = true;
}

if (violations.length > 0) {
  console.error('\n❌ ERROR: Se detectaron archivos que violan las políticas de peso y despliegue:');
  violations.forEach((v, i) => {
    console.error(`   ${i + 1}. [${v.sizeKB} KB] ${v.file} -> ${v.reason}`);
  });
  console.error('\n💡 Solución:');
  console.error('   1. Ejecuta "npm run compress:assets" para optimizar imágenes automáticamente.');
  console.error('   2. Asegúrate de que archivos generados pesados o PDFs estén en .gitignore.');
}

if (hasErrors) {
  console.error('\n🚫 OPERACIÓN BLOQUEADA POR GUARDA DE CALIDAD Y DESPLIEGUE.');
  process.exit(1);
}

console.log('✅ Guarda superada exitosamente. Cumplimiento pleno de políticas de despliegue y Regla No Negociable 3.\n');
process.exit(0);
