import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dekeyzuqpqxdfnnhohne.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRla2V5enVxcHF4ZGZubmhvaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDQyNzEsImV4cCI6MjEwNDQyMDI3MX0.EItqND-3Vsr1nhV7C-z0jJTTXFpQkpOyDnO-YLJ540o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const brainSteps = 'C:/Users/kami-/.gemini/antigravity-ide/brain/9bbaf7a3-7b1e-4080-9897-d70b3a0add02/.system_generated/steps';

function extractJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  const text = parsed.result || content;
  const match = text.match(/<untrusted-data-[^>]+>\r?\n(\[[\s\S]*?\])\r?\n<\/untrusted-data-[^>]+>/);
  return JSON.parse(match[1]);
}

const g5Data = extractJson(path.join(brainSteps, '3200', 'output.txt'))[0].g5;
const allItems = g5Data.portfolio_items || [];

const indices = [30, 31, 35, 38, 39, 40, 41];

async function run() {
  console.log('Total items in source g5:', allItems.length);
  
  for (const idx of indices) {
    const item = allItems[idx];
    if (!item) {
      console.error(`Item at index ${idx} not found!`);
      continue;
    }
    console.log(`Inserting item ${idx} (id: ${item.id}, file_url length: ${item.file_url?.length})...`);
    const { data, error } = await supabase
      .from('portfolio_items')
      .upsert(item, { onConflict: 'id' });
      
    if (error) {
      console.error(`Error inserting item ${idx}:`, error);
    } else {
      console.log(`Successfully inserted item ${idx}!`);
    }
  }
}

run();
