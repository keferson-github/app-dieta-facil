import { useState, useEffect } from 'react';
import { supabase, supabaseUntyped } from '@/integrations/supabase/client-flexible';

// Interfaces para os dados do banco
interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

interface DailyStep {
  id: string;
  user_id: string;
  step_count: number;
  recorded_date: string;
  updated_at: string;
}

interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_count: number;
  max_count: number;
  last_activity_date: string;
  updated_at: string;
}

interface MealLog {
  id: string;
  user_id: string;
  meal_date: string;
  meal_type: string;
  food_name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  logged_at: string;
}

interface WorkoutLog {
  id: string;
  user_id: string;
  workout_name: string;
  duration_minutes: number;
  calories_burned: number;
  notes: string;
  logged_at: string;
}

export interface DashboardMetrics {
  user_id: string;
  current_weight: number | null;
  target_weight: number | null;
  height: number | null;
  goal: string | null;
  activity_level: string | null;
  today: string;
  today_water_ml: number;
  water_target_ml: number;
  water_completion_percentage: number;
  today_steps: number;
  steps_target: number;
  steps_completion_percentage: number;
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  today_meals_count: number;
  today_workouts_count: number;
  overall_streak: number;
  workout_streak: number;
  nutrition_streak: number;
  water_streak: number;
  login_streak: number;
  week_active_days: number;
  bmi: number | null;
  bmi_category: string;
  progress_percentage: number;
}

export interface WeeklyStepData {
  user_id: string;
  recorded_date: string;
  step_count: number;
  daily_target: number;
  completion_percentage: number;
  day_of_week: number;
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [weeklySteps, setWeeklySteps] = useState<WeeklyStepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados do perfil do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Buscar dados de peso mais recente
      const { data: weightData } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(2);

      const today = new Date().toISOString().split('T')[0];

      // Calcular dias ativos da semana baseado em dados reais
      let weekActiveDays = 0;
      try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        const weekAgoString = weekAgo.toISOString().split('T')[0];

        // Buscar atividades da semana (água, passos, treinos, refeições)
        const [waterLogs, stepsLogs, workoutLogs, mealLogs] = await Promise.all([
          supabaseUntyped.from('water_logs').select('logged_at').eq('user_id', user.id).gte('logged_at', weekAgoString),
          supabaseUntyped.from('daily_steps').select('recorded_date').eq('user_id', user.id).gte('recorded_date', weekAgoString),
          supabaseUntyped.from('workout_logs').select('logged_at').eq('user_id', user.id).gte('logged_at', weekAgoString),
          supabaseUntyped.from('meal_logs').select('meal_date').eq('user_id', user.id).gte('meal_date', weekAgoString)
        ]);

        const activeDates = new Set<string>();
        
        // Adicionar datas com água
        waterLogs.data?.forEach(log => {
          if (log.logged_at) activeDates.add(log.logged_at.split('T')[0]);
        });
        
        // Adicionar datas com passos
        stepsLogs.data?.forEach(log => {
          if (log.recorded_date) activeDates.add(log.recorded_date);
        });
        
        // Adicionar datas com treinos
        workoutLogs.data?.forEach(log => {
          if (log.logged_at) activeDates.add(log.logged_at.split('T')[0]);
        });
        
        // Adicionar datas com refeições
        mealLogs.data?.forEach(log => {
          if (log.meal_date) activeDates.add(log.meal_date);
        });

        weekActiveDays = activeDates.size;
      } catch (error) {
        console.warn('Erro ao calcular dias ativos da semana:', error);
        weekActiveDays = 0;
      }

      // Buscar dados reais de hidratação de hoje
      let todayWaterMl = 0;
      try {
        const { data: waterData, error: waterError } = await supabaseUntyped
          .from('water_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .gte('logged_at', today)
          .lt('logged_at', `${today}T23:59:59`);

        if (waterError) throw waterError;
        
        if (waterData && Array.isArray(waterData)) {
          todayWaterMl = waterData.reduce((total: number, log: WaterLog) => total + (log.amount_ml || 0), 0);
        }
      } catch (error) {
        console.warn('Erro ao buscar water_logs:', error);
        // Mantém o valor 0 para hidratação se não houver dados
      }

      // Buscar passos de hoje
      let todaySteps = 0;
      try {
        const { data: stepsData, error: stepsError } = await supabaseUntyped
          .from('daily_steps')
          .select('step_count')
          .eq('user_id', user.id)
          .eq('recorded_date', today)
          .single();

        if (stepsError) throw stepsError;

        if (stepsData?.step_count) {
          todaySteps = stepsData.step_count;
        }
      } catch (error) {
        console.warn('Erro ao buscar daily_steps:', error);
        // Mantém o valor 0 para passos se não houver dados
      }

      // Buscar streaks do usuário
      const streaks = {
        overall_streak: 0,
        workout_streak: 0,
        nutrition_streak: 0,
        water_streak: 0,
        login_streak: 0
      };
      try {
        const { data: streaksData, error: streaksError } = await supabaseUntyped
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id);

        if (streaksError) throw streaksError;

        if (streaksData && Array.isArray(streaksData)) {
          // Mapear os tipos de streak para os valores
          streaksData.forEach((streak: UserStreak) => {
            if (streak.streak_type === 'workout') {
              streaks.workout_streak = streak.current_count || 0;
            } else if (streak.streak_type === 'hydration') {
              streaks.water_streak = streak.current_count || 0;
            } else if (streak.streak_type === 'nutrition') {
              streaks.nutrition_streak = streak.current_count || 0;
            } else if (streak.streak_type === 'overall') {
              streaks.overall_streak = streak.current_count || 0;
            } else if (streak.streak_type === 'login') {
              streaks.login_streak = streak.current_count || 0;
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao buscar user_streaks:', error);
        // Mantém todos os streaks em 0 se não houver dados
      }

      // Buscar refeições de hoje
      let mealsToday: MealLog[] = [];
      try {
        const { data: mealsData, error: mealsError } = await supabaseUntyped
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('meal_date', today);

        if (mealsError) throw mealsError;
        mealsToday = mealsData || [];
      } catch (error) {
        console.warn('Erro ao buscar meal_logs:', error);
        // Mantém array vazio se não houver dados de refeições
      }

      // Buscar treinos de hoje
      let workoutsToday: WorkoutLog[] = [];
      try {
        const { data: workoutsData, error: workoutsError } = await supabaseUntyped
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', today)
          .lt('logged_at', `${today}T23:59:59`);

        if (workoutsError) throw workoutsError;
        workoutsToday = workoutsData || [];
      } catch (error) {
        console.warn('Erro ao buscar workout_logs:', error);
        // Mantém array vazio se não houver dados de treinos
      }

      // Construir métricas manualmente
      const currentWeight = weightData?.[0]?.weight_kg || null;
      const targetWeight = profile?.target_weight || null;
      const height = profile?.height || null;
      
      // Calcular BMI
      let bmi = null;
      let bmiCategory = 'Normal';
      if (currentWeight && height) {
        bmi = currentWeight / ((height / 100) ** 2);
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi < 25) bmiCategory = 'Normal';
        else if (bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
      }

      const defaultMetrics: DashboardMetrics = {
        user_id: user.id,
        current_weight: currentWeight,
        target_weight: targetWeight,
        height: height,
        goal: profile?.goal || null,
        activity_level: profile?.activity_level || null,
        today: today,
        today_water_ml: todayWaterMl, // Dados reais
        water_target_ml: 2500,
        water_completion_percentage: Math.round((todayWaterMl / 2500) * 100),
        today_steps: todaySteps, // Dados reais
        steps_target: 10000,
        steps_completion_percentage: Math.round((todaySteps / 10000) * 100),
        calories_target: 2000,
        protein_target: 150,
        carbs_target: 250,
        fat_target: 67,
        today_meals_count: mealsToday.length,
        today_workouts_count: workoutsToday.length,
        overall_streak: streaks.overall_streak,
        workout_streak: streaks.workout_streak,
        nutrition_streak: streaks.nutrition_streak,
        water_streak: streaks.water_streak,
        login_streak: streaks.login_streak,
        week_active_days: weekActiveDays, // Dados reais calculados
        bmi: bmi,
        bmi_category: bmiCategory,
        progress_percentage: targetWeight && currentWeight ? 
          Math.max(0, Math.min(100, ((targetWeight - currentWeight) / targetWeight) * 100)) : 0
      };

      setMetrics(defaultMetrics);

      // Buscar dados de passos da semana (últimos 7 dias)
      try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        const weekAgoString = weekAgo.toISOString().split('T')[0];

        const { data: weeklyStepsRaw, error: weeklyStepsError } = await supabaseUntyped
          .from('daily_steps')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_date', weekAgoString)
          .lte('recorded_date', today)
          .order('recorded_date', { ascending: true });

        if (weeklyStepsError) throw weeklyStepsError;

        if (weeklyStepsRaw && Array.isArray(weeklyStepsRaw)) {
          // Converter dados para o formato esperado
          const weeklyStepsData: WeeklyStepData[] = weeklyStepsRaw.map((step: DailyStep) => ({
            user_id: step.user_id,
            recorded_date: step.recorded_date,
            step_count: step.step_count || 0,
            daily_target: 10000,
            completion_percentage: Math.round(((step.step_count || 0) / 10000) * 100),
            day_of_week: new Date(step.recorded_date).getDay()
          }));

          // Preencher dias faltantes com dados vazios
          const completeWeekData: WeeklyStepData[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const existingData = weeklyStepsData.find(data => data.recorded_date === dateString);
            
            completeWeekData.push(existingData || {
              user_id: user.id,
              recorded_date: dateString,
              step_count: 0,
              daily_target: 10000,
              completion_percentage: 0,
              day_of_week: date.getDay()
            });
          }
          
          setWeeklySteps(completeWeekData);          } else {
            // Usa array vazio se não houver dados da semana
            setWeeklySteps([]);
          }
      } catch (stepsError) {
        console.warn('Erro ao buscar dados de passos da semana:', stepsError);
        // Usa array vazio se não houver dados de passos
        setWeeklySteps([]);
      }

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const logWaterIntake = async (amountMl: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Inserir dados reais na tabela water_logs
      const { error } = await supabaseUntyped
        .from('water_logs')
        .insert({
          user_id: user.id,
          amount_ml: amountMl,
          logged_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao inserir em water_logs:', error);
        throw new Error(`Falha ao registrar água: ${error.message}`);
      } else {
        console.log(`✅ Água registrada: ${amountMl}ml para usuário ${user.id}`);
      }
      
      // Recarregar dados
      await fetchDashboardMetrics();
    } catch (err) {
      console.error('Erro ao registrar água:', err);
      throw err;
    }
  };

  const logDailySteps = async (stepCount: number, date?: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const recordedDate = date || new Date();
      const dateString = recordedDate.toISOString().split('T')[0];

      // Inserir ou atualizar dados reais na tabela daily_steps
      const { error } = await supabaseUntyped
        .from('daily_steps')
        .upsert({
          user_id: user.id,
          step_count: stepCount,
          recorded_date: dateString,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,recorded_date'
        });

      if (error) {
        console.error('Erro ao inserir em daily_steps:', error);
        throw new Error(`Falha ao registrar passos: ${error.message}`);
      } else {
        console.log(`✅ Passos registrados: ${stepCount} para usuário ${user.id} em ${dateString}`);
      }

      // Recarregar dados
      await fetchDashboardMetrics();
    } catch (err) {
      console.error('Erro ao registrar passos:', err);
      throw err;
    }
  };

  const updateActivitySummary = async (activityData: {
    logged_in?: boolean;
    meals_logged?: number;
    workouts_completed?: number;
    water_logged?: boolean;
    weight_logged?: boolean;
    steps_recorded?: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log(`✅ Atividade registrada para usuário ${user.id}:`, activityData);

      // Não há necessidade de uma tabela de resumo separada
      // Os dados são calculados dinamicamente pelas outras tabelas
      
      // Recarregar dados do dashboard para refletir mudanças
      await fetchDashboardMetrics();
    } catch (err) {
      console.error('Erro ao atualizar atividade:', err);
      throw err;
    }
  };

  const logMeal = async (mealData: { 
    meal_type?: string;
    food_name?: string;
    quantity?: number;
    calories?: number; 
    protein?: number; 
    carbs?: number; 
    fat?: number 
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const today = new Date().toISOString().split('T')[0];
      
      // Inserir refeição real no banco
      const { error } = await supabaseUntyped
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_date: today,
          meal_type: mealData.meal_type || 'snack',
          food_name: mealData.food_name || 'Alimento não especificado',
          quantity: mealData.quantity || 1,
          calories: mealData.calories || 0,
          protein: mealData.protein || 0,
          carbohydrates: mealData.carbs || 0,
          fat: mealData.fat || 0,
          logged_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar refeição:', error);
        throw new Error(`Falha ao registrar refeição: ${error.message}`);
      }

      console.log(`✅ Refeição registrada para usuário ${user.id}:`, mealData);
      
      // Recarregar dados
      await fetchDashboardMetrics();

    } catch (err) {
      console.error('Erro ao registrar refeição:', err);
      throw err;
    }
  };

  const logWorkout = async (workoutData: { 
    workout_name?: string;
    duration_minutes?: number; 
    exercise_type?: string;
    calories_burned?: number;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Inserir treino real no banco
      const { error } = await supabaseUntyped
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_name: workoutData.workout_name || workoutData.exercise_type || 'Treino não especificado',
          duration_minutes: workoutData.duration_minutes || 0,
          calories_burned: workoutData.calories_burned || 0,
          notes: workoutData.notes || '',
          logged_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar treino:', error);
        throw new Error(`Falha ao registrar treino: ${error.message}`);
      }

      console.log(`✅ Treino registrado para usuário ${user.id}:`, workoutData);
      
      // Recarregar dados
      await fetchDashboardMetrics();

    } catch (err) {
      console.error('Erro ao registrar treino:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  return {
    metrics,
    weeklySteps,
    loading,
    error,
    refetch: fetchDashboardMetrics,
    logWaterIntake,
    logDailySteps,
    logMeal,
    logWorkout,
    updateActivitySummary
  };
};
