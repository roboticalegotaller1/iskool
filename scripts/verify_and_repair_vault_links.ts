import fs from 'fs';
import path from 'path';

/**
 * Normaliza una cadena para comparación flexible (insensible a mayúsculas, acentos, guiones y espacios).
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Limpieza de nombre base.
 */
function cleanBaseName(filePathOrName: string): string {
  const base = path.basename(filePathOrName);
  return base.replace(/\.md$/, '');
}

interface PhysicalFileEntry {
  absolutePath: string;
  relativePath: string;
  filename: string;
  nameWithoutExt: string;
  normalizedKey: string;
}

/**
 * Escanea recursivamente todos los archivos .md en el directorio de la bóveda.
 */
function scanAllMarkdownFiles(dirPath: string, rootDir: string): PhysicalFileEntry[] {
  let entries: PhysicalFileEntry[] = [];
  if (!fs.existsSync(dirPath)) return entries;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      entries = entries.concat(scanAllMarkdownFiles(fullPath, rootDir));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      const nameWithoutExt = cleanBaseName(item.name);
      entries.push({
        absolutePath: fullPath,
        relativePath: relPath,
        filename: item.name,
        nameWithoutExt,
        normalizedKey: normalizeForComparison(nameWithoutExt)
      });
    }
  }
  return entries;
}

export interface LinkAuditResult {
  totalFilesAudited: number;
  totalLinksFound: number;
  validLinks: number;
  repairedLinks: number;
  brokenLinksRemaining: number;
  brokenLinksList: Array<{ file: string; link: string }>;
  filesModified: string[];
  repairedDetails: Array<{ file: string; originalLink: string; repairedLink: string; reason: string }>;
}

export function auditAndRepairVaultLinks(vaultDir: string, repair: boolean = true): LinkAuditResult {
  const allPhysicalFiles = scanAllMarkdownFiles(vaultDir, vaultDir);

  // Diccionarios de búsqueda rápida
  const exactNameMap = new Map<string, PhysicalFileEntry>();
  const exactRelativeMap = new Map<string, PhysicalFileEntry>();
  const normalizedMap = new Map<string, PhysicalFileEntry>();
  const tokenMap = new Map<string, PhysicalFileEntry[]>();

  for (const entry of allPhysicalFiles) {
    exactNameMap.set(entry.nameWithoutExt, entry);
    exactNameMap.set(entry.filename, entry);
    exactRelativeMap.set(entry.relativePath, entry);
    exactRelativeMap.set(entry.relativePath.replace(/\.md$/, ''), entry);
    
    // Normalizado
    normalizedMap.set(entry.normalizedKey, entry);

    // Mapeo por tokens significativos para resolución aproximada
    const tokens = entry.nameWithoutExt.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length >= 4);
    for (const t of tokens) {
      const existing = tokenMap.get(t) || [];
      existing.push(entry);
      tokenMap.set(t, existing);
    }
  }

  let totalLinksFound = 0;
  let validLinks = 0;
  let repairedLinks = 0;
  const filesModified: string[] = [];
  const repairedDetails: Array<{ file: string; originalLink: string; repairedLink: string; reason: string }> = [];
  const brokenLinksRemainingList: Array<{ file: string; link: string }> = [];

  /**
   * Intenta encontrar el archivo físico correspondiente a un objetivo de enlace.
   */
  function resolveTarget(target: string, sourceEntry?: PhysicalFileEntry): PhysicalFileEntry | null {
    const cleanTarget = target.trim().replace(/^\\+|\/+/, '');
    const cleanNoExt = cleanTarget.replace(/\.md$/, '');
    const targetBase = cleanBaseName(cleanNoExt);

    // 1. Coincidencia exacta por nombre
    if (exactNameMap.has(cleanNoExt)) return exactNameMap.get(cleanNoExt)!;
    if (exactNameMap.has(cleanTarget)) return exactNameMap.get(cleanTarget)!;
    if (exactNameMap.has(targetBase)) return exactNameMap.get(targetBase)!;

    // 2. Coincidencia exacta por ruta relativa al root
    if (exactRelativeMap.has(cleanNoExt)) return exactRelativeMap.get(cleanNoExt)!;
    if (exactRelativeMap.has(cleanTarget)) return exactRelativeMap.get(cleanTarget)!;

    // 3. Coincidencia por ruta relativa al directorio del archivo actual
    if (sourceEntry) {
      const sourceDir = path.dirname(sourceEntry.relativePath).replace(/\\/g, '/');
      const relativeFromSource = path.posix.normalize(`${sourceDir}/${cleanNoExt}`);
      if (exactRelativeMap.has(relativeFromSource)) return exactRelativeMap.get(relativeFromSource)!;
    }

    // 4. Coincidencia normalizada por nombre base (sin acentos, mayúsculas o puntuación)
    const normTargetBase = normalizeForComparison(targetBase);
    if (normalizedMap.has(normTargetBase)) return normalizedMap.get(normTargetBase)!;

    // 5. Coincidencia normalizada por ruta completa
    const normTarget = normalizeForComparison(cleanNoExt);
    if (normalizedMap.has(normTarget)) return normalizedMap.get(normTarget)!;

    // 6. Si tiene timestamp al final (ej: ..._1787693640534), buscar sin timestamp
    const withoutTimestamp = targetBase.replace(/_\d{10,15}$/, '');
    if (withoutTimestamp !== targetBase) {
      if (exactNameMap.has(withoutTimestamp)) return exactNameMap.get(withoutTimestamp)!;
      const normWithoutTs = normalizeForComparison(withoutTimestamp);
      if (normalizedMap.has(normWithoutTs)) return normalizedMap.get(normWithoutTs)!;
    }

    // 7. Búsqueda por similitud de tokens en targetBase
    const targetTokens = targetBase.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length >= 4 && !['planeacion', 'para', 'fase', 'grado', 'secundaria', 'primaria'].includes(t));
    if (targetTokens.length > 0) {
      let bestEntry: PhysicalFileEntry | null = null;
      let maxMatches = 0;

      for (const entry of allPhysicalFiles) {
        let matches = 0;
        const entryLower = entry.nameWithoutExt.toLowerCase();
        for (const tok of targetTokens) {
          if (entryLower.includes(tok)) matches++;
        }
        if (matches > maxMatches && matches >= Math.ceil(targetTokens.length * 0.6)) {
          maxMatches = matches;
          bestEntry = entry;
        }
      }

      if (bestEntry && maxMatches >= 2) {
        return bestEntry;
      }
    }

    return null;
  }

  // Auditar cada archivo markdown
  for (const entry of allPhysicalFiles) {
    let content = fs.readFileSync(entry.absolutePath, 'utf8');
    let wasModified = false;

    // Regex para enlaces estilo wiki: [[Destino]] o [[Destino|Texto]] o [[Destino\|Texto]]
    const wikiLinkRegex = /\[\[([^[\]|]+)(?:\\?\|([^[\]]*))?\]\]/g;
    
    const newContent = content.replace(wikiLinkRegex, (match, rawTarget, rawLabel) => {
      totalLinksFound++;
      const target = rawTarget.trim();
      const label = rawLabel !== undefined ? rawLabel.trim() : null;

      // Verificar si existe físicamente
      const resolved = resolveTarget(target, entry);

      if (resolved) {
        // Si el objetivo ya apunta exactamente a resolved.nameWithoutExt o resolved.filename, es válido
        if (target === resolved.nameWithoutExt || target === resolved.filename || target === resolved.relativePath) {
          validLinks++;
          return match;
        }

        // Si difiere en ruta o extensión o nombre canónico, repararlo
        if (repair) {
          const canonicalTarget = resolved.nameWithoutExt;
          const repaired = label ? `[[${canonicalTarget}|${label}]]` : `[[${canonicalTarget}]]`;
          repairedLinks++;
          wasModified = true;
          repairedDetails.push({
            file: entry.relativePath,
            originalLink: match,
            repairedLink: repaired,
            reason: `Discrepancia resuelta hacia archivo físico: ${resolved.filename}`
          });
          return repaired;
        } else {
          validLinks++;
          return match;
        }
      } else {
        // Enlace roto no resuelto
        brokenLinksRemainingList.push({ file: entry.relativePath, link: match });
        return match;
      }
    });

    if (wasModified && repair) {
      fs.writeFileSync(entry.absolutePath, newContent, 'utf8');
      filesModified.push(entry.relativePath);
    }
  }

  return {
    totalFilesAudited: allPhysicalFiles.length,
    totalLinksFound,
    validLinks,
    repairedLinks,
    brokenLinksRemaining: brokenLinksRemainingList.length,
    brokenLinksList: brokenLinksRemainingList,
    filesModified,
    repairedDetails
  };
}

// Ejecución directa mediante script
if (require.main === module || process.argv[1]?.includes('verify_and_repair_vault_links')) {
  const vaultPath = path.join(process.cwd(), 'planeaciones');
  console.log(`================================================================`);
  console.log(`🔍 ESCANEANDO Y REPARANDO ENLACES EN BÓVEDA CURRICULAR`);
  console.log(`   Directorio: ${vaultPath}`);
  console.log(`================================================================`);

  const result = auditAndRepairVaultLinks(vaultPath, true);

  console.log(`\n📊 RESULTADOS DE LA AUDITORÍA REFERENCIAL:`);
  console.log(`   Archivos auditados:       ${result.totalFilesAudited}`);
  console.log(`   Total de enlaces:         ${result.totalLinksFound}`);
  console.log(`   Enlaces válidos directos: ${result.validLinks}`);
  console.log(`   Enlaces reparados:        ${result.repairedLinks}`);
  console.log(`   Enlaces rotos restantes:  ${result.brokenLinksRemaining}`);
  console.log(`   Archivos modificados:     ${result.filesModified.length}`);

  if (result.brokenLinksRemaining > 0) {
    console.log(`\n⚠️  ENLACES ROTOS DETECTADOS (${result.brokenLinksRemaining}):`);
    result.brokenLinksList.forEach((b: any, i: number) => {
      console.log(`   ${i + 1}. [${b.file}] -> ${b.link}`);
    });
  }

  const successRate = result.totalLinksFound > 0 
    ? (((result.totalLinksFound - result.brokenLinksRemaining) / result.totalLinksFound) * 100).toFixed(2)
    : '100.00';
  console.log(`\n🎯 INTEGRIDAD REFERENCIAL DE LA BÓVEDA: ${successRate}%`);
  console.log(`================================================================\n`);
}
