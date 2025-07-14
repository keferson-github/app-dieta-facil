import { createClient } from '@supabase/supabase-js';

// Detectar ambiente
const isLocal = process.env.USE_LOCAL === 'true' || process.argv.includes('--local');

const SUPABASE_URL = isLocal 
  ? "http://127.0.0.1:54321"
  : "https://vpezrzahyctoeozjqbrd.supabase.co";

const SUPABASE_ANON_KEY = isLocal
  ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyODAwfQ.qQPWo0I-qMjXOlqpLI8KjX-gKGvKPX8xCQH5N0mHdww"
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

async function testConnection() {
  console.log(`🔄 Testando conexão com Supabase ${isLocal ? 'LOCAL' : 'REMOTO'}...`);
  console.log(`📍 URL: ${SUPABASE_URL}`);
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Teste básico - verifica se consegue acessar uma tabela existente
    console.log('📊 Testando acesso às tabelas...');
    
    const { data: tables, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Erro ao acessar user_profiles:', error.message);
    } else {
      console.log('✅ Conexão com user_profiles bem-sucedida!');
      console.log('📄 Dados:', tables);
    }
    
    // Vamos testar outras tabelas que criamos
    console.log('📊 Testando acesso à tabela water_logs...');
    const { data: water, error: waterError } = await supabase
      .from('water_logs')
      .select('*')
      .limit(1);
      
    if (waterError) {
      console.log('⚠️ Erro ao acessar water_logs:', waterError.message);
    } else {
      console.log('✅ Conexão com water_logs bem-sucedida!');
      console.log('📄 Dados:', water);
    }
    
    console.log('📊 Testando acesso à tabela hydration_logs...');
    const { data: hydration, error: hydrationError } = await supabase
      .from('hydration_logs')
      .select('*')
      .limit(1);
      
    if (hydrationError) {
      console.log('⚠️ Erro ao acessar hydration_logs:', hydrationError.message);
    } else {
      console.log('✅ Conexão com hydration_logs bem-sucedida!');
      console.log('📄 Dados:', hydration);
    }
    
    // Testar daily_steps
    console.log('📊 Testando acesso à tabela daily_steps...');
    const { data: steps, error: stepsError } = await supabase
      .from('daily_steps')
      .select('*')
      .limit(1);
      
    if (stepsError) {
      console.log('⚠️ Erro ao acessar daily_steps:', stepsError.message);
    } else {
      console.log('✅ Conexão com daily_steps bem-sucedida!');
      console.log('📄 Dados:', steps);
    }
    
    // Testar user_streaks
    console.log('📊 Testando acesso à tabela user_streaks...');
    const { data: streaks, error: streaksError } = await supabase
      .from('user_streaks')
      .select('*')
      .limit(1);
      
    if (streaksError) {
      console.log('⚠️ Erro ao acessar user_streaks:', streaksError.message);
    } else {
      console.log('✅ Conexão com user_streaks bem-sucedida!');
      console.log('📄 Dados:', streaks);
    }
    
    // Teste de autenticação (opcional)
    console.log('🔐 Testando status de autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️ Nenhum usuário autenticado (normal para teste):', authError.message);
    } else {
      console.log('👤 Usuário autenticado:', user?.email || 'Anônimo');
    }
    
    // Teste RPC se existe
    console.log('🔧 Testando funções RPC...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_dashboard_metrics', { user_id_param: '00000000-0000-0000-0000-000000000000' });
    
    if (rpcError) {
      console.log('⚠️ Função RPC não encontrada ou erro:', rpcError.message);
    } else {
      console.log('✅ Função RPC funcionando!');
      console.log('📊 Dados do dashboard:', rpcData);
    }
    
  } catch (err) {
    console.error('❌ Erro geral na conexão:', err);
  }
}

testConnection();
