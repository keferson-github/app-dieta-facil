import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

// Vamos criar as tabelas manualmente
const createTablesSQL = `
-- Criar tabela water_intake_logs (usando nome water_logs para compatibilidade)
CREATE TABLE IF NOT EXISTS water_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela daily_steps
CREATE TABLE IF NOT EXISTS daily_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    step_count INTEGER NOT NULL CHECK (step_count >= 0),
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recorded_date)
);

-- Criar tabela user_streaks
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    streak_type VARCHAR(50) NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    best_count INTEGER NOT NULL DEFAULT 0 CHECK (best_count >= 0),
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Criar tabela de hidratação compatível com o useDashboardData
CREATE TABLE IF NOT EXISTS hydration_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO water_logs (user_id, amount_ml, logged_at) VALUES 
('00000000-0000-0000-0000-000000000001', 250, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000001', 500, NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-000000000001', 300, NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

INSERT INTO hydration_logs (user_id, amount_ml, logged_at) VALUES 
('00000000-0000-0000-0000-000000000001', 250, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000001', 500, NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-000000000001', 300, NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

INSERT INTO daily_steps (user_id, step_count, recorded_date) VALUES 
('00000000-0000-0000-0000-000000000001', 8500, CURRENT_DATE),
('00000000-0000-0000-0000-000000000001', 12000, CURRENT_DATE - 1),
('00000000-0000-0000-0000-000000000001', 9500, CURRENT_DATE - 2)
ON CONFLICT (user_id, recorded_date) DO NOTHING;

INSERT INTO user_streaks (user_id, streak_type, current_count, best_count, last_activity_date) VALUES 
('00000000-0000-0000-0000-000000000001', 'workout', 5, 12, CURRENT_DATE),
('00000000-0000-0000-0000-000000000001', 'hydration', 3, 8, CURRENT_DATE),
('00000000-0000-0000-0000-000000000001', 'steps', 7, 15, CURRENT_DATE)
ON CONFLICT (user_id, streak_type) DO UPDATE SET
current_count = EXCLUDED.current_count,
best_count = EXCLUDED.best_count,
last_activity_date = EXCLUDED.last_activity_date;
`;

async function createTables() {
  console.log('🔧 Criando tabelas necessárias...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Note: Como estamos usando a chave anônima, não podemos executar DDL diretamente
    // Vamos apenas testar se as tabelas já existem
    
    const tables = ['water_logs', 'daily_steps', 'user_streaks', 'hydration_logs'];
    
    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Tabela ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${tableName}: existe e acessível`);
      }
    }
    
    console.log('📝 Para criar as tabelas, você precisa executar o SQL DDL no painel do Supabase ou usando uma chave de service_role.');
    console.log('📋 SQL a ser executado:');
    console.log(createTablesSQL);
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

createTables();
