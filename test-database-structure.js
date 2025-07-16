// Verifica estrutura do banco Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tablesToTest = [
  'user_profiles',
  'achievements', 
  'weight_logs',
  'water_logs',
  'foods_free',
  'meals',
  'exercises',
  'workout_sessions',
  'subscription_plans',
  'user_subscriptions'
];

async function testDatabaseStructure() {
  console.log('🔍 Verificando estrutura do banco de dados Supabase...\n');
  
  const results = {
    accessible: [],
    notFound: [],
    errors: []
  };
  
  for (const table of tablesToTest) {
    try {
      console.log(`   Testando tabela: ${table}...`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116') {
          results.notFound.push(table);
          console.log(`   ❌ ${table} - Tabela não encontrada`);
        } else {
          results.errors.push({ table, error: error.message });
          console.log(`   ⚠️  ${table} - Erro: ${error.message}`);
        }
      } else {
        results.accessible.push({ table, count });
        console.log(`   ✅ ${table} - OK (${count || 0} registros)`);
      }
      
    } catch (error) {
      results.errors.push({ table, error: error.message });
      console.log(`   💥 ${table} - Erro crítico: ${error.message}`);
    }
  }
  
  // Resumo
  console.log('\n📊 RESUMO:');
  console.log(`✅ Tabelas acessíveis: ${results.accessible.length}`);
  console.log(`❌ Tabelas não encontradas: ${results.notFound.length}`);
  console.log(`⚠️  Tabelas com erros: ${results.errors.length}`);
  
  if (results.accessible.length > 0) {
    console.log('\n✅ TABELAS FUNCIONAIS:');
    results.accessible.forEach(({ table, count }) => {
      console.log(`   - ${table}: ${count || 0} registros`);
    });
  }
  
  if (results.notFound.length > 0) {
    console.log('\n❌ TABELAS NÃO ENCONTRADAS:');
    results.notFound.forEach(table => {
      console.log(`   - ${table}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  ERROS ENCONTRADOS:');
    results.errors.forEach(({ table, error }) => {
      console.log(`   - ${table}: ${error}`);
    });
  }
  
  return results;
}

// Testa autenticação
async function testAuth() {
  console.log('\n🔐 Testando sistema de autenticação...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`   ❌ Erro na autenticação: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Sistema de autenticação funcionando');
    console.log(`   ℹ️  Sessão atual: ${session ? 'Usuário logado' : 'Não logado'}`);
    return true;
    
  } catch (error) {
    console.log(`   💥 Erro crítico na autenticação: ${error.message}`);
    return false;
  }
}

// Executa todos os testes
async function runAllTests() {
  try {
    const dbResults = await testDatabaseStructure();
    const authWorking = await testAuth();
    
    console.log('\n🎯 CONCLUSÃO FINAL:');
    
    if (dbResults.accessible.length > 0 && authWorking) {
      console.log('✅ O projeto ESTÁ CONECTADO ao Supabase!');
      console.log('✅ Banco de dados acessível');
      console.log('✅ Autenticação funcionando');
      console.log('✅ Pronto para desenvolvimento');
    } else if (dbResults.accessible.length > 0) {
      console.log('⚠️  Conexão parcial com Supabase');
      console.log('✅ Banco de dados acessível');
      console.log('❌ Problemas na autenticação');
    } else {
      console.log('❌ Problemas na conexão com Supabase');
      console.log('❌ Banco de dados não acessível');
    }
    
  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO:', error.message);
  }
}

runAllTests();
