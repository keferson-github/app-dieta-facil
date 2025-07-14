import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vpezrzahyctoeozjqbrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k";

async function insertTestData() {
  console.log('🔧 Inserindo dados de teste...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const testUserId = '00000000-0000-0000-0000-000000000001';
  
  try {
    // Inserir dados de hidratação para hoje
    console.log('💧 Inserindo dados de hidratação...');
    const { error: waterError } = await supabase
      .from('water_logs')
      .insert([
        {
          user_id: testUserId,
          amount_ml: 250,
          logged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
        },
        {
          user_id: testUserId,
          amount_ml: 500,
          logged_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 horas atrás
        },
        {
          user_id: testUserId,
          amount_ml: 300,
          logged_at: new Date().toISOString() // agora
        }
      ]);

    if (waterError) {
      console.log('⚠️ Erro ao inserir water_logs:', waterError.message);
    } else {
      console.log('✅ Dados de hidratação inseridos com sucesso!');
    }

    // Inserir dados de passos para hoje e últimos dias
    console.log('👟 Inserindo dados de passos...');
    const stepsData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      stepsData.push({
        user_id: testUserId,
        step_count: Math.floor(Math.random() * 5000) + 6000,
        recorded_date: dateString
      });
    }

    const { error: stepsError } = await supabase
      .from('daily_steps')
      .upsert(stepsData, { onConflict: 'user_id,recorded_date' });

    if (stepsError) {
      console.log('⚠️ Erro ao inserir daily_steps:', stepsError.message);
    } else {
      console.log('✅ Dados de passos inseridos com sucesso!');
    }

    // Inserir dados de streaks
    console.log('🔥 Inserindo dados de streaks...');
    const { error: streaksError } = await supabase
      .from('user_streaks')
      .upsert([
        {
          user_id: testUserId,
          streak_type: 'workout',
          current_count: 5,
          best_count: 12,
          last_activity_date: new Date().toISOString().split('T')[0]
        },
        {
          user_id: testUserId,
          streak_type: 'hydration',
          current_count: 3,
          best_count: 8,
          last_activity_date: new Date().toISOString().split('T')[0]
        },
        {
          user_id: testUserId,
          streak_type: 'overall',
          current_count: 7,
          best_count: 15,
          last_activity_date: new Date().toISOString().split('T')[0]
        }
      ], { onConflict: 'user_id,streak_type' });

    if (streaksError) {
      console.log('⚠️ Erro ao inserir user_streaks:', streaksError.message);
    } else {
      console.log('✅ Dados de streaks inseridos com sucesso!');
    }

    // Verificar os dados inseridos
    console.log('\n📊 Verificando dados inseridos...');
    
    // Verificar água
    const { data: waterCheck } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', testUserId);
    console.log('💧 Registros de água:', waterCheck?.length || 0);

    // Verificar passos
    const { data: stepsCheck } = await supabase
      .from('daily_steps')
      .select('*')
      .eq('user_id', testUserId);
    console.log('👟 Registros de passos:', stepsCheck?.length || 0);

    // Verificar streaks
    const { data: streaksCheck } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', testUserId);
    console.log('🔥 Registros de streaks:', streaksCheck?.length || 0);

    console.log('\n✅ Dados de teste inseridos com sucesso!');
    console.log('🎯 Agora você pode testar o dashboard com dados reais.');
    
  } catch (err) {
    console.error('❌ Erro ao inserir dados de teste:', err);
  }
}

insertTestData();
