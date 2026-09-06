async function testSearchSerie2() {
  const testQueries = [
    { q: 'SERIE2 narracion sucesos autobiograficos', level: 'Primaria_Fase_5', subject: 'Español' },
    { q: 'SERIE2 sistema digestivo', level: 'Primaria_Fase_4', subject: 'Ciencias_Naturales' },
    { q: 'SERIE2 ecuaciones cuadraticas', level: 'Secundaria_Fase_6_NEM2024', subject: 'Matematicas' },
    { q: 'SERIE2 leyes newton fuerza', level: 'Secundaria_Fase_6_NEM2024', subject: 'Fisica' },
    { q: 'SERIE2 cultura de paz conflictos', level: 'Secundaria_Fase_6_NEM2024', subject: 'Formacion_Civica' }
  ];

  for (const item of testQueries) {
    const url = `http://localhost:3000/api/obsidian?q=${encodeURIComponent(item.q)}&level=${encodeURIComponent(item.level)}&subject=${encodeURIComponent(item.subject)}`;
    const start = Date.now();
    try {
      const res = await fetch(url, {
        headers: {
          'x-user-id': 'usr-teacher-israel',
          'x-user-role': 'teacher'
        }
      });
      const data = await res.json();
      const timeMs = Date.now() - start;
      console.log(`\n🔍 Test: "${item.q}" (${timeMs}ms) status=${res.status}`);
      console.log(`   Found: ${data.found}`);
      if (data.found) {
        console.log(`   Filename: ${data.filename}`);
        console.log(`   Title: ${data.planning.title}`);
        console.log(`   Nivel/Materia: ${data.planning.levelName} - ${data.planning.subjectName}`);
        console.log(`   PDA: ${data.planning.pda.substring(0, 100)}...`);
        console.log(`   Inicio: ${data.planning.inicio.substring(0, 80)}...`);
      }
    } catch (e) {
      console.error(`Error querying ${item.q}:`, e);
    }
  }
}

testSearchSerie2();
