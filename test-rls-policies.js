// Teste de RLS policies e permissões
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

async function testRLSPolicies() {
  console.log('🔒 TESTE DE POLÍTICAS RLS (Row Level Security)');
  console.log('=' .repeat(60));
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Primeiro, vamos tentar fazer login com um usuário de teste
  console.log('\n🔐 TENTANDO AUTENTICAÇÃO TEMPORÁRIA:');
  console.log('-' .repeat(50));
  
  try {
    // Tentar criar um usuário temporário para teste
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@test.com',
      password: 'test123456'
    });
    
    if (signUpError) {
      console.log(`⚠️ SignUp falhou (normal): ${signUpError.message}`);
    } else {
      console.log(`✅ Usuário criado ou já existe`);
    }
    
    // Tentar fazer login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@test.com', 
      password: 'test123456'
    });
    
    if (signInError) {
      console.log(`⚠️ SignIn falhou: ${signInError.message}`);
    } else {
      console.log(`✅ Login bem-sucedido! User: ${signInData.user?.email}`);
      
      // Agora testar operações com usuário autenticado
      await testOperationsWithAuth(supabase, signInData.user.id);
      
      // Logout
      await supabase.auth.signOut();
      console.log(`🚪 Logout realizado`);
    }
    
  } catch (error) {
    console.log(`❌ Erro na autenticação: ${error.message}`);
  }
  
  // Verificar políticas específicas
  console.log('\n🔍 VERIFICANDO POLÍTICAS RLS:');
  console.log('-' .repeat(50));
  
  const tables = ['water_logs', 'daily_steps', 'user_streaks', 'weight_logs'];
  
  for (const table of tables) {
    try {
      // Tentar SELECT (geralmente permitido)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) throw error;
      console.log(`✅ ${table.padEnd(15)} - SELECT permitido`);
    } catch (error) {
      console.log(`❌ ${table.padEnd(15)} - SELECT negado: ${error.message}`);
    }
  }
}

async function testOperationsWithAuth(supabase, userId) {
  console.log('\n🧪 TESTANDO OPERAÇÕES COM USUÁRIO AUTENTICADO:');
  console.log('-' .repeat(50));
  
  // Teste 1: Inserir em water_logs
  try {
    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: userId,
        amount_ml: 250,
        logged_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    console.log(`✅ water_logs INSERT    - OK (ID: ${data[0]?.id})`);
    
    // Limpar
    if (data[0]?.id) {
      await supabase.from('water_logs').delete().eq('id', data[0].id);
    }
  } catch (error) {
    console.log(`❌ water_logs INSERT    - ERRO: ${error.message}`);
  }
  
  // Teste 2: Inserir em daily_steps
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_steps')
      .upsert({
        user_id: userId,
        step_count: 1000,
        recorded_date: today,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,recorded_date'
      })
      .select();
    
    if (error) throw error;
    console.log(`✅ daily_steps UPSERT   - OK`);
    
    // Limpar
    await supabase
      .from('daily_steps')
      .delete()
      .eq('user_id', userId)
      .eq('recorded_date', today);
      
  } catch (error) {
    console.log(`❌ daily_steps UPSERT   - ERRO: ${error.message}`);
  }
  
  // Teste 3: Inserir em user_streaks
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        streak_type: 'test',
        current_count: 1,
        max_count: 1,
        last_activity_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    console.log(`✅ user_streaks INSERT  - OK (ID: ${data[0]?.id})`);
    
    // Limpar
    if (data[0]?.id) {
      await supabase.from('user_streaks').delete().eq('id', data[0].id);
    }
  } catch (error) {
    console.log(`❌ user_streaks INSERT  - ERRO: ${error.message}`);
  }
}

testRLSPolicies().catch(console.error);
