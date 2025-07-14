import { supabase } from './src/integrations/supabase/client';

// Teste básico de conectividade
async function testBasicConnection() {
  try {
    // Teste simples de conectividade
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao conectar:', error.message);
      return false;
    }
    
    console.log('✅ Conectado com sucesso ao Supabase!');
    return true;
  } catch (err) {
    console.log('❌ Erro de conexão:', err);
    return false;
  }
}

export { testBasicConnection };
