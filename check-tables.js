import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

async function checkDatabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Verificar que tabelas existem
    console.log('🔍 Verificando tabelas existentes...');
    
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `
      });
    
    if (error) {
      console.log('⚠️ Erro ao verificar tabelas via RPC:', error.message);
      
      // Tentar verificar algumas tabelas conhecidas
      const tables = ['user_profiles', 'foods', 'meals', 'workouts'];
      
      for (const tableName of tables) {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.log(`❌ Tabela ${tableName}: ${tableError.message}`);
        } else {
          console.log(`✅ Tabela ${tableName}: existe`);
        }
      }
    } else {
      console.log('📋 Tabelas encontradas:', data);
    }
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

checkDatabase();
