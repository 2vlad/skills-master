/**
 * Скрипт для создания клона голоса в ElevenLabs
 * 
 * Использование:
 * 1. Положите аудио файл(ы) в папку scripts/voice-samples/
 * 2. Запустите: npx ts-node scripts/create-voice.ts
 * 3. Скопируйте полученный voice_id в .env.local
 */

import * as fs from 'fs';
import * as path from 'path';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_NAME = 'My Custom Voice';
const SAMPLES_DIR = path.join(__dirname, 'voice-samples');

async function createVoice() {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not set');
    console.log('Run: export ELEVENLABS_API_KEY=your_key');
    process.exit(1);
  }

  // Find audio files
  if (!fs.existsSync(SAMPLES_DIR)) {
    fs.mkdirSync(SAMPLES_DIR, { recursive: true });
    console.error(`❌ Put audio files in: ${SAMPLES_DIR}`);
    console.log('Supported formats: mp3, wav, m4a');
    process.exit(1);
  }

  const files = fs.readdirSync(SAMPLES_DIR)
    .filter(f => /\.(mp3|wav|m4a)$/i.test(f));

  if (files.length === 0) {
    console.error(`❌ No audio files found in ${SAMPLES_DIR}`);
    process.exit(1);
  }

  console.log(`📁 Found ${files.length} audio file(s):`);
  files.forEach(f => console.log(`   - ${f}`));

  // Create FormData
  const formData = new FormData();
  formData.append('name', VOICE_NAME);
  formData.append('remove_background_noise', 'true');
  
  for (const file of files) {
    const filePath = path.join(SAMPLES_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer]);
    formData.append('files', blob, file);
  }

  console.log('\n🔄 Creating voice clone...');

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ API Error ${response.status}:`, error);
    process.exit(1);
  }

  const result = await response.json();
  
  console.log('\n✅ Voice created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Voice ID: ${result.voice_id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Add to .env.local:');
  console.log(`ELEVENLABS_VOICE_ID=${result.voice_id}`);
}

createVoice().catch(console.error);
