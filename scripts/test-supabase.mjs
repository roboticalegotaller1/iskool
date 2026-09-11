import { createClient } from '@supabase/supabase-js';

const url = 'https://dekeyzuqpqxdfnnhohne.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRla2V5enVxcHF4ZGZubmhvaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDQyNzEsImV4cCI6MjEwNDQyMDI3MX0.EItqND-3Vsr1nhV7C-z0jJTTXFpQkpOyDnO-YLJ540o';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing connection to new Supabase project (dekeyzuqpqxdfnnhohne)...');
  
  const tables = [
    'schools',
    'profiles',
    'students',
    'student_stats',
    'student_avatars',
    'subjects',
    'missions',
    'quests',
    'shop_artifacts',
    'community_activities',
    'guild_bosses',
    'portfolio_items'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`Table '${table}': [Restricted/RLS: ${error.message} (Code: ${error.code})]`);
      } else {
        console.log(`Table '${table}': OK (Rows: ${count !== null ? count : 'accessible'})`);
      }
    } catch (e) {
      console.log(`Table '${table}': Exception ${e.message}`);
    }
  }
}

testConnection();
