import { supabase } from './src/integrations/supabase/client';

// Script para aplicar migrações manualmente
async function applyMigrationsManually() {
  console.log('🚀 Iniciando aplicação manual de migrações...');
  
  try {
    // Primeiro, vamos verificar se as tabelas básicas existem
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas:', tablesError.message);
      
      // Se não conseguirmos verificar as tabelas, vamos tentar criar as principais
      console.log('🔧 Tentando criar tabelas essenciais...');
      
      // 1. Verificar/criar tabela user_profiles
      await createUserProfilesTable();
      
      // 2. Verificar/criar tabela dashboard_metrics  
      await createDashboardMetricsTable();
      
      // 3. Verificar/criar outras tabelas necessárias
      await createOtherTables();
      
      // 4. Criar views
      await createViews();
      
    } else {
      console.log('✅ Conexão estabelecida, tabelas existentes:', tables);
    }
    
  } catch (error) {
    console.error('❌ Erro durante aplicação de migrações:', error);
  }
}

async function createUserProfilesTable() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name TEXT,
          height_cm INTEGER,
          current_weight_kg DECIMAL(5,2),
          goal_weight_kg DECIMAL(5,2),
          activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
          goal_type TEXT CHECK (goal_type IN ('lose_weight', 'maintain_weight', 'gain_weight', 'gain_muscle')),
          date_of_birth DATE,
          gender TEXT CHECK (gender IN ('male', 'female', 'other')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });
    
    if (error) {
      console.log('⚠️  user_profiles pode já existir:', error.message);
    } else {
      console.log('✅ Tabela user_profiles criada/verificada');
    }
  } catch (e) {
    console.log('⚠️  Erro ao criar user_profiles:', e.message);
  }
}

async function createDashboardMetricsTable() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS dashboard_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          metric_type TEXT NOT NULL,
          metric_value DECIMAL(10,2) NOT NULL,
          metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
          additional_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, metric_type, metric_date)
        );
        
        CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_date 
        ON dashboard_metrics(user_id, metric_date);
        
        CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_type 
        ON dashboard_metrics(metric_type);
      `
    });
    
    if (error) {
      console.log('⚠️  dashboard_metrics pode já existir:', error.message);
    } else {
      console.log('✅ Tabela dashboard_metrics criada/verificada');
    }
  } catch (e) {
    console.log('⚠️  Erro ao criar dashboard_metrics:', e.message);
  }
}

async function createOtherTables() {
  // Criar outras tabelas necessárias
  const tables = [
    {
      name: 'daily_hydration',
      sql: `
        CREATE TABLE IF NOT EXISTS daily_hydration (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          glasses_consumed INTEGER DEFAULT 0,
          target_glasses INTEGER DEFAULT 8,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        );
      `
    },
    {
      name: 'daily_steps',
      sql: `
        CREATE TABLE IF NOT EXISTS daily_steps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          steps_count INTEGER DEFAULT 0,
          target_steps INTEGER DEFAULT 10000,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        );
      `
    },
    {
      name: 'user_streaks',
      sql: `
        CREATE TABLE IF NOT EXISTS user_streaks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          streak_type TEXT NOT NULL,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          last_activity_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, streak_type)
        );
      `
    }
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.log(`⚠️  ${table.name} pode já existir:`, error.message);
      } else {
        console.log(`✅ Tabela ${table.name} criada/verificada`);
      }
    } catch (e) {
      console.log(`⚠️  Erro ao criar ${table.name}:`, e.message);
    }
  }
}

async function createViews() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW dashboard_overview AS
        SELECT 
          up.user_id,
          up.full_name,
          up.current_weight_kg,
          up.goal_weight_kg,
          up.goal_type,
          -- Hidratação hoje
          COALESCE(dh.glasses_consumed, 0) as hydration_glasses,
          COALESCE(dh.target_glasses, 8) as hydration_target,
          -- Passos hoje  
          COALESCE(ds.steps_count, 0) as steps_count,
          COALESCE(ds.target_steps, 10000) as steps_target,
          -- Streak atual
          COALESCE(us.current_streak, 0) as current_streak,
          COALESCE(us.longest_streak, 0) as longest_streak
        FROM user_profiles up
        LEFT JOIN daily_hydration dh ON up.user_id = dh.user_id AND dh.date = CURRENT_DATE
        LEFT JOIN daily_steps ds ON up.user_id = ds.user_id AND ds.date = CURRENT_DATE  
        LEFT JOIN user_streaks us ON up.user_id = us.user_id AND us.streak_type = 'daily_activity';
      `
    });
    
    if (error) {
      console.log('⚠️  Erro ao criar view dashboard_overview:', error.message);
    } else {
      console.log('✅ View dashboard_overview criada/atualizada');
    }
  } catch (e) {
    console.log('⚠️  Erro ao criar views:', e.message);
  }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  applyMigrationsManually();
}

export { applyMigrationsManually };
