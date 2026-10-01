import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/ai/historical-figure/route';
import { NextRequest } from 'next/server';

describe('🏛️ PERSONAJES HISTÓRICOS Y MOTOR DE IA EN TIEMPO REAL', { timeout: 45000 }, () => {

  it('debe responder a una pregunta en primera persona estricta sin meta-discursos', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/historical-figure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat_persona',
        characterName: 'Francisco Villa',
        question: '¿Dónde naciste?'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.answer).toBeDefined();
    expect(typeof data.answer).toBe('string');
    expect(data.answer.length).toBeGreaterThan(20);

    // Canon inviolable: primera persona ("Nací...")
    expect(data.answer).toMatch(/nací/i);
    // No hablar de sí mismo en 3ª persona ni meta-discursos
    expect(data.answer).not.toMatch(/^Como Francisco Villa/i);
    expect(data.answer).not.toMatch(/^En calidad de/i);
    expect(data.answer).not.toMatch(/^Francisco Villa nació/i);
  });

  it('debe responder a Doña Josefa Ortiz de Domínguez con datos verídicos y voz de matrona republicana', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/historical-figure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat_persona',
        characterName: 'Josefa Ortiz de Domínguez',
        question: '¿Por qué decidiste alertar a los insurgentes?'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.answer).toBeDefined();
    // Primera persona y términos insurgentes
    expect(data.answer).toMatch(/(patria|libertad|insurgentes|pueblo)/i);
  });

  it('debe persistir en la Bóveda Curricular y retornar cached: true en preguntas recurrentes', async () => {
    const uniqueQuestion = `¿Qué sentías al defender a los campesinos en ${Date.now()}?`;
    
    // Primera invocación (genera o consulta)
    const req1 = new NextRequest('http://localhost:3000/api/ai/historical-figure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat_persona',
        characterName: 'Francisco Villa',
        question: uniqueQuestion
      })
    });
    const res1 = await POST(req1);
    const data1 = await res1.json();
    expect(data1.success).toBe(true);

    // Segunda invocación (debe provenir del caché de la Bóveda con 0 tokens)
    const req2 = new NextRequest('http://localhost:3000/api/ai/historical-figure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat_persona',
        characterName: 'Francisco Villa',
        question: uniqueQuestion
      })
    });
    const res2 = await POST(req2);
    const data2 = await res2.json();
    expect(data2.success).toBe(true);
    expect(data2.cached).toBe(true);
    expect(data2.tokenCost).toBe(0);
    expect(data2.answer).toBe(data1.answer);

    // Limpieza hermética para no alterar el archivo de la Bóveda
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'personajes_historicos', 'francisco_villa.md');
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const pattern = new RegExp(`### Q: \\¿Qué sentías al defender a los campesinos en \\d+\\?\\r?\\nA: [^\\r\\n]+(?:\\r?\\n)+`, 'g');
        content = content.replace(pattern, '');
        fs.writeFileSync(filePath, content, 'utf8');
      }
    } catch {
      // Ignorar en test
    }
  });
});
