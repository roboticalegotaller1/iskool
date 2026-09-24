import fs from 'fs';

const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/MOTOR_IA_API_KEY=(.+)/);
const key = match ? match[1].trim() : '';

const models = [
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-pro'
];

async function check() {
  for (const m of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
      });
      console.log(m, 'Status:', res.status);
    } catch (e) {
      console.log(m, 'Error:', e);
    }
  }
}

check();
