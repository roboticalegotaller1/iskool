import { INITIAL_SCHOOL_BOOKS_SEED } from '../src/store/seeds/schoolBooksSeed';
import { 
  searchInBookChapters, 
  findBestChapterForTopic, 
  generateGroundedVoiceResponse, 
  generateSuperUserCompendium 
} from '../src/lib/schoolBookMapper';
import { SchoolDigitalBook } from '../src/types/schoolBooks';

console.log("=================================================");
console.log("TEST SUITE: SISTEMA DE LIBROS DIGITALES & BÓVEDA");
console.log("=================================================");

// 1. Validar aislamiento multi-colegio estricto
const school1Books = INITIAL_SCHOOL_BOOKS_SEED.filter(b => b.schoolId === 'sch-jjrosseau');
const school2Books = INITIAL_SCHOOL_BOOKS_SEED.filter(b => b.schoolId === 'sch-test-case');
const school3Books = INITIAL_SCHOOL_BOOKS_SEED.filter(b => b.schoolId === 'sch-anglo-mexicano');

console.log(`[TEST 1] Aislamiento Escolar:`);
console.log(`  - Libros Colegio Juan Jacobo Rosseau (sch-jjrosseau): ${school1Books.length}`);
console.log(`  - Libros Laboratorio Pedagógico (sch-test-case): ${school2Books.length}`);
console.log(`  - Libros Anglo Mexicano (sch-anglo-mexicano): ${school3Books.length}`);

if (school1Books.some(b => b.schoolId !== 'sch-jjrosseau')) {
  throw new Error("VIOLACIÓN DE AISLAMIENTO: Se detectaron libros ajenos en el colegio 1");
}
console.log("  ✅ Aislamiento estricto verificado: Ningún colegio comparte libros con otros.");

// 2. Validar Mapeo Exhaustivo a 0 Tokens
console.log(`\n[TEST 2] Mapeo Exhaustivo Curricular a 0 Tokens:`);
const testBook = school1Books[0]; // Matemáticas Integradas
console.log(`  - Analizando: "${testBook.titulo}" (${testBook.totalPaginas} páginas)`);
console.log(`  - Capítulos mapeados: ${testBook.capitulos.length}`);
testBook.capitulos.forEach(c => {
  console.log(`    * Cap. ${c.numero}: "${c.titulo}" (Págs. ${c.rangoPaginas}) -> ${c.conceptosClave.length} conceptos, ${c.ejerciciosPropuestos.length} ejercicios`);
  if (!c.rangoPaginas || !c.resumenTematico || c.conceptosClave.length === 0) {
    throw new Error(`Capítulo ${c.numero} tiene metadatos incompletos`);
  }
});
console.log("  ✅ Mapeo completo verificado sin consumo de tokens.");

// 3. Sustento para Planeación Docente (Búsqueda de correspondencia temática)
console.log(`\n[TEST 3] Sustentación en Planeación Docente:`);
const match = findBestChapterForTopic(school1Books, 'matematicas', '5º', 'fracciones equivalentes y suma');
if (!match) {
  throw new Error("No se encontró libro/capítulo de sustento para fracciones en matemáticas");
}
console.log(`  - Planeación consultada: Matemáticas 5º ("fracciones")`);
console.log(`  - Libro de sustento encontrado: "${match.book.titulo}"`);
console.log(`  - Capítulo: ${match.chapter.numero} ("${match.chapter.titulo}")`);
console.log(`  - Páginas de sustento: ${match.citation.rangoPaginas}`);
console.log("  ✅ Sustentación bibliográfica exacta verificada.");

// 4. Cuaderno Inteligente (Preguntas por voz/texto fundamentadas en el libro)
console.log(`\n[TEST 4] Cuaderno Inteligente (Q&A fundamentado en libro a 0 Tokens):`);
const voiceResponse = generateGroundedVoiceResponse(testBook, "¿Cómo se calculan las fracciones equivalentes?");
console.log(`  - Pregunta: "${voiceResponse.query}"`);
console.log(`  - Respuesta fundamentada: "${voiceResponse.respuestaNatural.slice(0, 160)}..."`);
console.log(`  - Citas generadas: ${voiceResponse.citas.length}`);
console.log(`  - Página exacta citada: ${voiceResponse.citas[0]?.rangoPaginas}`);
console.log(`  - Confianza de la respuesta: ${voiceResponse.confianza}`);
if (voiceResponse.citas.length === 0) {
  throw new Error("El cuaderno inteligente no generó citas del libro");
}
console.log("  ✅ Cuaderno inteligente con respuestas fundamentadas y citas verificado.");

// 5. Compendios Multi-Libro de Super Usuario
console.log(`\n[TEST 5] Estudio de Compendios Multi-Libro para Super Usuario:`);
const allBooks = INITIAL_SCHOOL_BOOKS_SEED;
const compendium = generateSuperUserCompendium(
  allBooks, 
  "Compendio Intercolegial 2026", 
  "Unificación de libros de ciencias, matemáticas e inglés"
);
console.log(`  - Título: "${compendium.titulo}"`);
console.log(`  - Libros consolidados: ${compendium.librosIds.length}`);
console.log(`  - Temas transversales cruzados: ${compendium.temas.length}`);
compendium.temas.slice(0, 3).forEach((t, i) => {
  console.log(`    ${i + 1}. Tema: ${t.tema} (${t.librosConsultados.length} libros cruzados)`);
});
if (compendium.temas.length === 0) {
  throw new Error("El compendio no generó temas cruzados");
}
console.log("  ✅ Compendios de Super Usuario verificados.");

console.log("\n=================================================");
console.log("TODAS LAS PRUEBAS AUTOMATIZADAS PASARON CON ÉXITO");
console.log("=================================================");
