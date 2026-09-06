import { createClient } from '@supabase/supabase-js';

const url = 'https://eudcxuxbxgtbnysjrixo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZGN4dXhieGd0Ym55c2pyaXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDAyNDksImV4cCI6MjA5NjYxNjI0OX0.5HMZgwxa4v-tGNYVPJs8HVuf1j8dT1oi7jwBI0cIbAg';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing connection to Supabase project...');
  
  const tables = [
    'users', 
    'students', 
    'teachers', 
    'schools', 
    'campuses', 
    'groups', 
    'subjects', 
    'invoices', 
    'billing_profiles',
    'quests',
    'activities',
    'student_quests',
    'student_portfolios',
    'coop_projects'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`Table '${table}': [Error/Restricted: ${error.message} (Code: ${error.code})]`);
      } else {
        console.log(`Table '${table}': OK (Rows: ${count !== null ? count : 'accessible'})`);
      }
    } catch (e) {
      console.log(`Table '${table}': Exception ${e.message}`);
    }
  }
}

testConnection();
