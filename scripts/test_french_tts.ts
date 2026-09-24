import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

async function main() {
  const frenchVoices = [
    'fr-FR-VivienneMultilingualNeural',
    'fr-FR-DeniseNeural',
    'fr-FR-HenriNeural',
    'fr-FR-RemyMultilingualNeural',
    'fr-FR-EloiseNeural'
  ];

  console.log('Testing French neural voices...');
  for (const voice of frenchVoices) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR"><voice name="${voice}"><prosody rate="0%" pitch="0%">Bonjour! Je suis un avatar de français à ISkool.</prosody></voice></speak>`;
      const { audioStream } = tts.rawToStream(ssml);
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        audioStream.on('data', (c: Buffer) => chunks.push(c));
        audioStream.on('end', () => resolve());
        audioStream.on('error', (e) => reject(e));
      });
      const total = Buffer.concat(chunks).length;
      console.log(`✓ Voice ${voice}: OK (${total} bytes)`);
    } catch (e: any) {
      console.error(`✗ Voice ${voice}: Failed:`, e.message);
    }
  }
}

main().catch(console.error);
