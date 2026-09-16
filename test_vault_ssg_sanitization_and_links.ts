import path from 'path';
import { 
  getVaultPlanningsDir,
  parseFrontmatter, 
  sanitizeHtml, 
  transformWikiLinksToHtml, 
  renderSanitizedMarkdown, 
  buildOrGetVaultIndex,
  getAllVaultPlanningSlugs,
  getVaultPlanningBySlug,
  invalidateVaultCache
} from './src/lib/vaultMarkdownEngine';
import { auditAndRepairVaultLinks } from './scripts/verify_and_repair_vault_links';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log(`================================================================`);
  console.log(`🚀 INICIANDO AUDITORÍA: BÓVEDA CURRICULAR (SSG/ISR, XSS, ENLACES)`);
  console.log(`================================================================\n`);

  // --- 1. AUDITORÍA DE PARSEO DE MARKDOWN Y METADATOS PEDAGÓGICOS ---
  console.log(`--- 1. AUDITORÍA DE PARSEO DE MARKDOWN Y FRONTMATTER ---`);
  const sampleMarkdown = `---
tags: [iskool, nem2024, matematicas]
title: "Álgebra y Ecuaciones Lineales"
nivel: "Secundaria"
fase: "Fase 6"
grado: "2º de Secundaria"
asignatura: "Matemáticas"
campo_formativo: "Saberes y Pensamiento Científico"
pda: "Resuelve problemas mediante el planteamiento y resolución de ecuaciones lineales."
docente: "Prof. Israel López Ángeles"
---

# Álgebra y Ecuaciones Lineales

Este es el cuerpo pedagógico del proyecto.
`;

  const { frontmatter, body } = parseFrontmatter(sampleMarkdown);
  assert(frontmatter.title === 'Álgebra y Ecuaciones Lineales', 'Frontmatter extrae título correctamente');
  assert(frontmatter.fase === 'Fase 6', 'Frontmatter extrae Fase curricular');
  assert(frontmatter.grado === '2º de Secundaria', 'Frontmatter extrae Grado escolar');
  assert(frontmatter.asignatura === 'Matemáticas', 'Frontmatter extrae Asignatura');
  assert(frontmatter.campo_formativo === 'Saberes y Pensamiento Científico', 'Frontmatter extrae Campo Formativo');
  assert(frontmatter.docente === 'Prof. Israel López Ángeles', 'Frontmatter extrae Docente titular');
  assert(body.includes('# Álgebra y Ecuaciones Lineales'), 'Cuerpo markdown extraído íntegramente');

  // --- 2. AUDITORÍA DE SANITIZACIÓN CONTRA XSS (DOMPURIFY) ---
  console.log(`\n--- 2. AUDITORÍA DE SANITIZACIÓN CONTRA XSS (DOMPURIFY) ---`);
  
  // Test 2.1: Inyección de script
  const maliciousScript = `<p>Texto seguro</p><script>alert("XSS Inyectado")</script>`;
  const sanitizedScript = sanitizeHtml(maliciousScript);
  assert(!sanitizedScript.includes('<script>'), 'Neutralización de etiqueta <script>');
  assert(!sanitizedScript.includes('alert('), 'Neutralización de código JS malicioso');
  assert(sanitizedScript.includes('<p>Texto seguro</p>'), 'Preservación de contenido HTML legítimo');

  // Test 2.2: Atributos de evento onerror/onload/onclick
  const maliciousImg = `<img src="invalido.jpg" onerror="alert('Ataque XSS')" />`;
  const sanitizedImg = sanitizeHtml(maliciousImg);
  assert(!sanitizedImg.includes('onerror'), 'Eliminación estricta de atributo de evento onerror');

  // Test 2.3: Esquema de enlace javascript:
  const maliciousLink = `<a href="javascript:alert('Ataque')">Haz clic aquí</a>`;
  const sanitizedLink = sanitizeHtml(maliciousLink);
  assert(!sanitizedLink.includes('javascript:'), 'Bloqueo estricto de esquema de enlace javascript:');

  // Test 2.4: Etiqueta <iframe> no permitida
  const maliciousIframe = `<iframe src="https://sitio-malicioso.com"></iframe>`;
  const sanitizedIframe = sanitizeHtml(maliciousIframe);
  assert(!sanitizedIframe.includes('<iframe'), 'Prohibición estricta de <iframe> en contenido estructurado');

  // Test 2.5: Preservación de tablas pedagógicas y formato NEM
  const nemTableMd = `
| Sesión | Inicio | Desarrollo | Cierre |
| :--- | :--- | :--- | :--- |
| 1 | Activación | Taller de balances | Reflexión |
`;
  const sanitizedTable = renderSanitizedMarkdown(nemTableMd);
  assert(sanitizedTable.includes('<table'), 'Renderizado y preservación segura de tablas didácticas');
  assert(sanitizedTable.includes('<th') && sanitizedTable.includes('Sesión'), 'Preservación de encabezados de tabla');
  assert(sanitizedTable.includes('<td') && sanitizedTable.includes('Activación'), 'Preservación de celdas de tabla');

  // Test 2.6: Transformación y sanitización de enlaces tipo Wiki [[...]]
  const wikiText = `Consulta la [[Planeacion_Matematicas_2do|Planeación de 2º Grado]] y la [[00_Indice_Maestro_Secundaria_Fase_6_NEM2024]].`;
  const renderedWiki = renderSanitizedMarkdown(wikiText);
  assert(renderedWiki.includes('/planeaciones/Planeacion_Matematicas_2do'), 'Transformación de wiki-link con etiqueta a enlace canónico de bóveda');
  assert(renderedWiki.includes('Planeación de 2º Grado'), 'Preservación de etiqueta personalizada de enlace wiki');
  assert(renderedWiki.includes('/planeaciones/00_Indice_Maestro_Secundaria_Fase_6_NEM2024'), 'Transformación de wiki-link directo a ruta canónica');

  // --- 3. AUDITORÍA DE RENDIMIENTO Y MOTOR SSG/ISR ---
  console.log(`\n--- 3. AUDITORÍA DE MOTOR SSG / ISR Y CACHÉ EN MEMORIA ---`);
  
  // Limpiar e inicializar caché
  invalidateVaultCache();
  const t0 = performance.now();
  buildOrGetVaultIndex();
  const scanTimeMs = performance.now() - t0;
  console.log(`  ⏱️  Indexación completa inicial: ${scanTimeMs.toFixed(2)}ms`);

  const slugs = getAllVaultPlanningSlugs();
  assert(slugs.length > 50, `Generación de slugs estáticos exitosa (${slugs.length} slugs generados para SSG)`);

  // Búsqueda de índice maestro de secundaria por slug
  const t1 = performance.now();
  const docSecundaria = getVaultPlanningBySlug(['00_Indice_Maestro_Secundaria_Fase_6_NEM2024']);
  const readTimeMs = performance.now() - t1;

  assert(docSecundaria !== null, 'Recuperación exitosa de Índice Maestro de Secundaria');
  assert(docSecundaria!.title.includes('Secundaria'), 'Título de Índice Maestro consistente');
  assert(docSecundaria!.renderedHtml.length > 500, 'HTML pre-renderizado presente en el documento');
  assert(readTimeMs < 10, `Velocidad de recuperación desde caché en memoria (${readTimeMs.toFixed(3)}ms < 10ms)`);

  // Búsqueda de planeación curricular específica
  const docIsKoolCore = getVaultPlanningBySlug(['ISkool_Core_System']);
  assert(docIsKoolCore !== null, 'Recuperación exitosa de documento ISkool_Core_System');
  assert(docIsKoolCore!.renderedHtml.includes('iSkool Core System'), 'Contenido HTML sanitizado de ISkool_Core_System correcto');

  // --- 4. AUDITORÍA DE INTEGRIDAD REFERENCIAL Y ENLACES ---
  console.log(`\n--- 4. AUDITORÍA DE INTEGRIDAD REFERENCIAL (0% ENLACES ROTOS) ---`);
  const vaultPath = getVaultPlanningsDir();
  const auditResult = auditAndRepairVaultLinks(vaultPath, false);

  assert(auditResult.totalFilesAudited >= 700, `Archivos auditados en bóveda curricular (${auditResult.totalFilesAudited} >= 700)`);
  assert(auditResult.totalLinksFound > 3000, `Enlaces totales inspeccionados en la bóveda (${auditResult.totalLinksFound} > 3000)`);
  assert(auditResult.brokenLinksRemaining === 0, `0% de enlaces rotos restantes en la Bóveda Curricular (${auditResult.brokenLinksRemaining} rotos)`);
  
  const successRate = ((auditResult.totalLinksFound - auditResult.brokenLinksRemaining) / auditResult.totalLinksFound) * 100;
  assert(successRate === 100, `Integridad referencial absoluta de la Bóveda Curricular: ${successRate.toFixed(2)}%`);

  // --- RESULTADOS FINALES ---
  console.log(`\n================================================================`);
  console.log(`📊 RESULTADOS FINALES DE AUDITORÍA:`);
  console.log(`   Pruebas Totales: ${passedTests + failedTests}`);
  console.log(`   Aprobadas:       ${passedTests} ✅`);
  console.log(`   Fallidas:        ${failedTests} ❌`);
  console.log(`================================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Error crítico en la suite de pruebas:", err);
  process.exit(1);
});
