async function benchmarkCachedQueries() {
  const queries = [
    'ecuaciones cuadraticas',
    'x^2',
    'variacion cuadratica',
    'teorema pitagoras',
    'sistema circulatorio'
  ];

  console.log('⚡ Benchmark de consultas en memoria (Caché activo):');
  for (const q of queries) {
    const t0 = performance.now();
    const res = await fetch(`http://localhost:3000/api/obsidian?q=${encodeURIComponent(q)}`, {
      headers: {
        'x-user-id': 'usr-teacher-israel',
        'x-user-role': 'teacher'
      }
    });
    const data = await res.json();
    const elapsed = performance.now() - t0;
    console.log(`   🔎 Query: "${q}" → ${elapsed.toFixed(2)} ms | Encontrado: ${data.found} | Archivo: ${data.filename}`);
  }
}

benchmarkCachedQueries().catch(console.error);
