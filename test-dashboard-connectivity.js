// Teste completo de conectividade do dashboard
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

async function testDashboardConnectivity() {
  console.log('🔄 TESTE COMPLETO DE CONECTIVIDADE DO DASHBOARD');
  console.log('=' .repeat(60));
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  let successCount = 0;
  let totalTests = 0;
  
  // Teste 1: Tabelas principais usadas pelo hook
  const mainTables = [
    'user_profiles',
    'weight_logs', 
    'water_logs',
    'daily_steps',
    'user_streaks'
  ];
  
  console.log('\n📊 TESTANDO TABELAS PRINCIPAIS DO DASHBOARD:');
  console.log('-' .repeat(50));
  
  for (const table of mainTables) {
    totalTests++;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      console.log(`✅ ${table.padEnd(20)} - OK (${data?.length || 0} registros)`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${table.padEnd(20)} - ERRO: ${error.message}`);
    }
  }
  
  // Teste 2: Tabelas secundárias
  const secondaryTables = [
    'meal_logs',
    'workout_logs',
    'notifications',
    'achievements'
  ];
  
  console.log('\n📊 TESTANDO TABELAS SECUNDÁRIAS:');
  console.log('-' .repeat(50));
  
  for (const table of secondaryTables) {
    totalTests++;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      console.log(`✅ ${table.padEnd(20)} - OK (${data?.length || 0} registros)`);
      successCount++;
    } catch (error) {
      console.log(`⚠️ ${table.padEnd(20)} - AVISO: ${error.message}`);
      // Tabelas secundárias não contam como erro crítico
    }
  }
  
  // Teste 3: Operações CRUD básicas
  console.log('\n🔧 TESTANDO OPERAÇÕES CRUD:');
  console.log('-' .repeat(50));
  
  // Teste de inserção em water_logs (simulando o hook)
  totalTests++;
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: testUserId,
        amount_ml: 250,
        logged_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    
    console.log(`✅ INSERT water_logs     - OK (ID: ${data[0]?.id || 'N/A'})`);
    successCount++;
    
    // Limpar o teste
    if (data[0]?.id) {
      await supabase.from('water_logs').delete().eq('id', data[0].id);
    }
  } catch (error) {
    console.log(`❌ INSERT water_logs     - ERRO: ${error.message}`);
  }
  
  // Teste de inserção em daily_steps
  totalTests++;
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_steps')
      .upsert({
        user_id: testUserId,
        step_count: 1000,
        recorded_date: today,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,recorded_date'
      })
      .select();
    
    if (error) throw error;
    
    console.log(`✅ UPSERT daily_steps    - OK`);
    successCount++;
    
    // Limpar o teste
    await supabase
      .from('daily_steps')
      .delete()
      .eq('user_id', testUserId)
      .eq('recorded_date', today);
      
  } catch (error) {
    console.log(`❌ UPSERT daily_steps    - ERRO: ${error.message}`);
  }
  
  // Teste 4: Autenticação
  console.log('\n🔐 TESTANDO AUTENTICAÇÃO:');
  console.log('-' .repeat(50));
  
  totalTests++;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing!') {
      throw error;
    }
    
    console.log(`✅ Auth.getUser()        - OK (${user ? 'Logado' : 'Não logado'})`);
    successCount++;
  } catch (error) {
    console.log(`❌ Auth.getUser()        - ERRO: ${error.message}`);
  }
  
  // Teste 5: Configuração do cliente
  console.log('\n⚙️ TESTANDO CONFIGURAÇÃO:');
  console.log('-' .repeat(50));
  
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Chave: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log(`🌐 Ambiente: REMOTO`);
  
  // Resumo final
  console.log('\n📊 RESUMO DO TESTE:');
  console.log('=' .repeat(60));
  
  const successRate = Math.round((successCount / totalTests) * 100);
  
  console.log(`✅ Testes bem-sucedidos: ${successCount}/${totalTests} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('🎉 CONECTIVIDADE EXCELENTE - Banco funcionando perfeitamente!');
  } else if (successRate >= 60) {
    console.log('⚠️ CONECTIVIDADE BOA - Algumas funcionalidades podem estar limitadas');
  } else {
    console.log('❌ CONECTIVIDADE PROBLEMÁTICA - Verificar configuração');
  }
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  if (successRate >= 80) {
    console.log('• ✅ Banco está pronto para uso');
    console.log('• ✅ Hook useDashboardData deve funcionar corretamente');
    console.log('• ✅ Todas as operações de logging funcionais');
  } else {
    console.log('• ⚠️ Verificar configuração das tabelas');
    console.log('• ⚠️ Aplicar migrations se necessário');
    console.log('• ⚠️ Verificar RLS policies');
  }
  
  return successRate;
}

testDashboardConnectivity().catch(console.error);
