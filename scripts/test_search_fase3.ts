async function testFase3Search() {
  const queries = [
    { q: 'sumas', level: 'primaria-baja', subject: 'matematicas' },
    { q: 'conteo', level: 'primaria-baja', subject: 'matematicas' },
    { q: 'tangram', level: 'primaria-baja', subject: 'matematicas' },
    { q: 'cuento', level: 'primaria-baja', subject: 'lenguajes' },
    { q: 'plantas', level: 'primaria-baja', subject: 'ciencias' }
  ];

  console.log('🧪 Probando búsqueda de Fase 3 (Primaria Baja: 1º y 2º de Primaria) en Obsidian:');
  for (const item of queries) {
    const t0 = performance.now();
    const res = await fetch(`http://localhost:3000/api/obsidian?q=${encodeURIComponent(item.q)}&level=${encodeURIComponent(item.level)}&subject=${encodeURIComponent(item.subject)}`, {
      headers: {
        'x-user-id': 'usr-teacher-israel',
        'x-user-role': 'teacher'
      }
    });
    const data = await res.json();
    const elapsed = performance.now() - t0;
    console.log(`\n🔎 Query: "${item.q}" (${item.level}) → ${elapsed.toFixed(2)} ms`);
    console.log(`   ✅ Encontrado: ${data.found}`);
    console.log(`   📄 Archivo: ${data.filename}`);
    console.log(`   📌 Título: ${data.planning?.title}`);
    console.log(`   🎯 PDA: ${data.planning?.pda?.slice(0, 100)}...`);
    console.log(`   ⏱️ Duración: ${data.planning?.duration}`);
  }
}

testFase3Search().catch(console.error);
