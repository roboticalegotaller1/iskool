import fs from 'fs';
import path from 'path';

function loadEnvFile(file: string) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';

async function testReadingGist() {
  console.log('Testing reading_for_gist pattern...');
  const res = await AcademicGenerationGenerator.call({
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'reading',
    topic: 'technology',
    language_function: 'expressing_opinions',
    activity_type: 'reading_for_gist',
    duration_minutes: 20
  });

  console.log('Success:', res.success);
  console.log('Title:', res.activity?.title);
  console.log('Objective:', res.activity?.learning_objective);
  console.log('Steps:', res.activity?.activity_steps?.length);
  res.activity?.activity_steps?.forEach(s => {
    console.log(` - [${s.phase} (${s.duration_minutes} min)] ${s.student_instructions}`);
  });
}

testReadingGist().catch(console.error);
