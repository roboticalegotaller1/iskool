async function test() {
  const payload = {
    text: "Bonjour, je suis Napoléon Bonaparte. J'ai réorganisé l'administration et promulgué le Code Civil des Français.",
    voice: "fr-FR-HenriNeural",
    language: "fr",
    rate: 0.88
  };

  const res = await fetch('http://localhost:3000/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('Content-Type'));
  console.log('X-Voice-Resolved:', res.headers.get('X-Voice-Resolved'));
  const buf = await res.arrayBuffer();
  console.log('Audio bytes received:', buf.byteLength);

  if (res.headers.get('X-Voice-Resolved') === 'fr-FR-HenriNeural' && buf.byteLength > 10000) {
    console.log('✓ PASS: French voice was synthesized natively with fr-FR-HenriNeural!');
  } else {
    console.error('✗ FAIL: Voice was not resolved to fr-FR-HenriNeural');
  }
}

test().catch(console.error);
