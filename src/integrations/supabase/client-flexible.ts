// Configuração do cliente Supabase com suporte a ambiente local/remoto
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Configurações de ambiente
const isLocal = import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true'

const SUPABASE_URL = isLocal 
  ? 'http://127.0.0.1:54321'
  : 'https://vpezrzahyctoeozjqbrd.supabase.co'

const SUPABASE_ANON_KEY = isLocal
  ? import.meta.env.VITE_SUPABASE_LOCAL_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyODAwfQ.qQPWo0I-qMjXOlqpLI8KjX-gKGvKPX8xCQH5N0mHdww'
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k'

console.log(`🔗 Conectando ao Supabase: ${isLocal ? 'LOCAL' : 'REMOTO'}`)
console.log(`📍 URL: ${SUPABASE_URL}`)

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Cliente não tipado para tabelas customizadas (sempre usa as mesmas credenciais)
export const supabaseUntyped = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Função para verificar conectividade
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1)
    if (error) throw error
    console.log('✅ Conexão Supabase OK')
    return true
  } catch (error) {
    console.error('❌ Erro conexão Supabase:', error)
    return false
  }
}

// Função para mudar entre local/remoto
export const switchEnvironment = (useLocal: boolean) => {
  localStorage.setItem('useLocalSupabase', useLocal.toString())
  window.location.reload()
}
