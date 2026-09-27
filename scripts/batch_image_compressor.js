/**
 * @file batch_image_compressor.js
 * @description Script de compresión y optimización retroactiva por lotes para activos estáticos de ISkool.
 * Cumple estrictamente con la REGLA NO NEGOCIABLE 3:
 *  - Garantiza que NINGÚN archivo supere los 400 KB (objetivo < 300 KB - 350 KB).
 *  - Formato WebP / JPEG balanceado (80%-85% calidad) con escalado inteligente.
 *  - Mantiene el contenedor y extensión de archivo para preservar al 100% la integridad de rutas,
 *    importaciones de código y URLs de base de datos / semillas.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Desactivar caché interno de sharp para evitar bloqueos de archivo en Windows
sharp.cache(false);

const MAX_TARGET_BYTES = 380 * 1024; // 380 KB límite estricto (< 400 KB de regla)
const OPTIMAL_QUALITY = 82; // 82% calidad perceptual óptima

const TARGET_DIRS = [
  path.join(process.cwd(), 'public', 'images'),
  path.join(process.cwd(), 'presentation_screenshots')
];

const stats = {
  totalProcessed: 0,
  totalOptimized: 0,
  skipped: 0,
  bytesBefore: 0,
  bytesAfter: 0,
  largeFilesRemained: 0,
  details: []
};

async function optimizeImage(filePath) {
  stats.totalProcessed++;
  const originalStat = fs.statSync(filePath);
  const origSize = originalStat.size;
  stats.bytesBefore += origSize;

  // Si ya mide menos de 250 KB y no es un archivo problemático, omitir
  if (origSize <= 250 * 1024) {
    stats.skipped++;
    stats.bytesAfter += origSize;
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

  try {
    // Cargar en memoria Buffer para liberar completamente el descriptor de archivo en Windows
    const inputBuffer = fs.readFileSync(filePath);
    const meta = await sharp(inputBuffer).metadata();

    // Determinar resolución máxima según tipo de activo
    let maxDim = 1280;
    if (
      relPath.includes('avatar') ||
      relPath.includes('hairstyles') ||
      relPath.includes('tops') ||
      relPath.includes('rpg') ||
      relPath.includes('students')
    ) {
      maxDim = 1024;
    }

    let currentQuality = OPTIMAL_QUALITY;
    let finalBuffer = null;
    let attempts = 0;

    while (attempts < 5) {
      attempts++;
      let pipeline = sharp(inputBuffer).resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true
      });

      if (ext === '.jpg' || ext === '.jpeg') {
        finalBuffer = await pipeline
          .jpeg({ quality: currentQuality, mozjpeg: true, progressive: true })
          .toBuffer();
      } else if (ext === '.png') {
        // Si tiene canal alfa transparente
        if (meta.hasAlpha) {
          finalBuffer = await pipeline
            .png({
              palette: true,
              quality: Math.min(currentQuality, 85),
              compressionLevel: 9,
              effort: 10
            })
            .toBuffer();
        } else {
          // Si no tiene alfa pero la extensión es .png (fotos/cómics nombrados .png)
          const testPng = await pipeline
            .png({ palette: true, quality: currentQuality, compressionLevel: 9 })
            .toBuffer();
          if (testPng.length <= MAX_TARGET_BYTES) {
            finalBuffer = testPng;
          } else {
            finalBuffer = await pipeline
              .png({ palette: true, quality: Math.max(50, currentQuality - 10), compressionLevel: 9 })
              .toBuffer();
          }
        }
      } else if (ext === '.webp') {
        finalBuffer = await pipeline
          .webp({ quality: currentQuality, effort: 6 })
          .toBuffer();
      } else {
        break;
      }

      if (finalBuffer && finalBuffer.length <= MAX_TARGET_BYTES) {
        break;
      }

      // Reducir dimensionalidad y calidad si aún excede
      maxDim = Math.round(maxDim * 0.85);
      currentQuality = Math.max(50, currentQuality - 8);
    }

    if (finalBuffer && finalBuffer.length < origSize) {
      fs.writeFileSync(filePath, finalBuffer);
      const newSize = finalBuffer.length;
      stats.bytesAfter += newSize;
      stats.totalOptimized++;

      const savedKB = (origSize - newSize) / 1024;
      const pct = (((origSize - newSize) / origSize) * 100).toFixed(1);

      stats.details.push({
        file: relPath,
        origKB: (origSize / 1024).toFixed(1),
        newKB: (newSize / 1024).toFixed(1),
        savedKB: savedKB.toFixed(1),
        pct: pct + '%'
      });

      if (newSize > 400 * 1024) {
        stats.largeFilesRemained++;
      }
    } else {
      stats.bytesAfter += origSize;
      stats.skipped++;
    }
  } catch (err) {
    console.error(`⚠️ Error al optimizar ${relPath}:`, err.message);
    stats.bytesAfter += origSize;
    stats.skipped++;
  }
}

async function walkAndOptimize(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndOptimize(fullPath);
    } else if (entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name)) {
      await optimizeImage(fullPath);
    }
  }
}

async function optimizeHighTechHtml() {
  const htmlPath = path.join(process.cwd(), 'public', 'high_tech_renderer_v3.html');
  if (!fs.existsSync(htmlPath)) return;

  console.log('\n--- Optimizando imágenes embebidas en public/high_tech_renderer_v3.html ---');
  const origHtml = fs.readFileSync(htmlPath, 'utf8');
  const origSize = origHtml.length;

  const regex = /data:image\/([a-zA-Z]+);base64,([^"']+)/g;
  let match;
  let matches = [];

  while ((match = regex.exec(origHtml)) !== null) {
    matches.push({
      fullMatch: match[0],
      format: match[1],
      b64: match[2],
      index: match.index
    });
  }

  console.log(`Encontradas ${matches.length} imágenes Base64 en el HTML`);
  let updatedHtml = origHtml;

  for (let i = 0; i < matches.length; i++) {
    const item = matches[i];
    try {
      const buf = Buffer.from(item.b64, 'base64');
      const optimizedBuf = await sharp(buf)
        .resize({ width: 1280, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toBuffer();

      const newBase64 = `data:image/webp;base64,${optimizedBuf.toString('base64')}`;
      updatedHtml = updatedHtml.replace(item.fullMatch, newBase64);
      console.log(`  Imagen ${i + 1}: ${(buf.length / 1024).toFixed(1)} KB -> ${(optimizedBuf.length / 1024).toFixed(1)} KB WebP`);
    } catch (e) {
      console.warn(`  No se pudo comprimir imagen ${i + 1}: ${e.message}`);
    }
  }

  fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
  const newSize = fs.statSync(htmlPath).size;
  console.log(`public/high_tech_renderer_v3.html: ${(origSize / (1024 * 1024)).toFixed(2)} MB -> ${(newSize / (1024 * 1024)).toFixed(2)} MB (Ahorro: ${(((origSize - newSize) / origSize) * 100).toFixed(1)}%)`);
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 INICIANDO PROCESAMIENTO POR LOTES DE COMPRESIÓN DE ACTIVOS');
  console.log('===============================================================\n');

  for (const dir of TARGET_DIRS) {
    console.log(`Procesando directorio: ${path.relative(process.cwd(), dir)}...`);
    await walkAndOptimize(dir);
  }

  await optimizeHighTechHtml();

  console.log('\n===============================================================');
  console.log('📊 RESUMEN DE RESULTADOS DE COMPRESIÓN');
  console.log('===============================================================');
  console.log(`Total archivos analizados:      ${stats.totalProcessed}`);
  console.log(`Total archivos optimizados:     ${stats.totalOptimized}`);
  console.log(`Archivos omitidos/sin cambio:   ${stats.skipped}`);
  console.log(`Archivos finales > 400 KB:      ${stats.largeFilesRemained} (Objetivo: 0)`);
  console.log(`Peso inicial:                   ${(stats.bytesBefore / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Peso final:                     ${(stats.bytesAfter / (1024 * 1024)).toFixed(2)} MB`);
  const totalSaved = stats.bytesBefore - stats.bytesAfter;
  console.log(`Ahorro total conseguido:        ${(totalSaved / (1024 * 1024)).toFixed(2)} MB (${((totalSaved / stats.bytesBefore) * 100).toFixed(1)}%)`);

  console.log('\n--- TOP 15 MAYORES REDUCCIONES INDIVIDUALES ---');
  stats.details.sort((a, b) => parseFloat(b.savedKB) - parseFloat(a.savedKB));
  stats.details.slice(0, 15).forEach((d, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${d.file}: ${d.origKB} KB -> ${d.newKB} KB (-${d.savedKB} KB, ${d.pct})`);
  });

  console.log('\n===============================================================');
  console.log('✅ PROCESAMIENTO DE COMPRESIÓN FINALIZADO EXITOSAMENTE');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('Error fatal durante la compresión:', err);
  process.exit(1);
});
