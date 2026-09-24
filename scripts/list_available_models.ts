import fs from 'fs';

const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/MOTOR_IA_API_KEY=(.+)/) || content.match(/AI_API_KEY=(.+)/);
const key = match ? match[1].trim() : '';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  console.log('List models HTTP status:', res.status);
  if (res.ok) {
    const data = await res.json();
    console.log('Supported models count:', data.models?.length);
    const supported = data.models
      ?.filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent'))
      ?.map((m: { name: string; displayName?: string }) => `${m.name} (${m.displayName || ''})`);
    console.log('Models with generateContent:');
    console.log(supported?.join('\n'));
  } else {
    console.log('Error:', await res.text());
  }
}

listModels();
