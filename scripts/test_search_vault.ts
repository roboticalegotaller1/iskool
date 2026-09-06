async function testSearch() {
  const testQueries = [
    { q: 'narracion sucesos autobiograficos', level: 'Primaria_Fase_5', subject: 'Español' },
    { q: 'sistema digestivo', level: 'Primaria_Fase_4', subject: 'Ciencias_Naturales' },
    { q: 'pitagoras', level: 'Secundaria_Fase_6_NEM2024', subject: 'Matematicas' },
    { q: 'revolucion mexicana', level: 'Secundaria_Fase_6_NEM2024', subject: 'Historia' },
    { q: 'quimica tabla periodica', level: 'Secundaria_Fase_6_NEM2024', subject: 'Quimica' }
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
      console.log(`   Response:`, data);
      if (data.found) {
        console.log(`   Filename: ${data.filename}`);
        console.log(`   Title: ${data.planning.title}`);
        console.log(`   Nivel/Materia: ${data.planning.levelName} - ${data.planning.subjectName}`);
        console.log(`   PDA Preview: ${data.planning.pda.substring(0, 100)}...`);
        console.log(`   Inicio Preview: ${data.planning.inicio.substring(0, 80)}...`);
      }
    } catch (e) {
      console.error(`Error querying ${item.q}:`, e);
    }
  }
}

testSearch();
