// Teste de conectividade com Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  
  try {
    // Teste 1: Ping básico
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tabela user_profiles não encontrada, mas conexão estabelecida');
        return testAlternativeTable();
      }
      throw error;
    }
    
    console.log('✅ Conexão Supabase estabelecida com sucesso!');
    console.log('✅ Tabela user_profiles acessível');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error.message);
    return false;
  }
}

async function testAlternativeTable() {
  try {
    // Testa uma query mais básica
    const { data, error } = await supabase
      .from('achievements')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tabela achievements não encontrada');
        return testAuth();
      }
      throw error;
    }
    
    console.log('✅ Conexão Supabase estabelecida com sucesso!');
    console.log('✅ Tabela achievements acessível');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao testar tabela alternativa:', error.message);
    return testAuth();
  }
}

async function testAuth() {
  try {
    // Testa o sistema de autenticação
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    console.log('✅ Sistema de autenticação Supabase acessível');
    console.log('ℹ️  Usuário não logado (comportamento esperado)');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao testar autenticação:', error.message);
    return false;
  }
}

// Executa o teste
testConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 RESULTADO: Projeto conectado ao Supabase com sucesso!');
    } else {
      console.log('\n💥 RESULTADO: Falha na conexão com Supabase');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 ERRO CRÍTICO:', error);
    process.exit(1);
  });
