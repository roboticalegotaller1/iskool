import fs from 'fs';

const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/MOTOR_IA_API_KEY=(.+)/) || content.match(/AI_API_KEY=(.+)/);
const key = match ? match[1].trim() : '';

async function testWorkingModel(m: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello! Respond with valid JSON: {"status":"ok"}' }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });
    console.log(m, 'Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log(m, 'Output:', data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
      return true;
    } else {
      const err = await res.text();
      console.log(m, 'Error:', err.slice(0, 140));
      return false;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(m, 'Fetch Exception:', msg);
    return false;
  }
}

async function run() {
  console.log('Testing models...');
  await testWorkingModel('models/gemini-2.5-flash');
  await testWorkingModel('models/gemini-3.5-flash');
  await testWorkingModel('models/gemini-flash-latest');
  await testWorkingModel('models/gemini-3.1-flash-lite');
  await testWorkingModel('models/nano-banana-pro-preview');
}

run();
